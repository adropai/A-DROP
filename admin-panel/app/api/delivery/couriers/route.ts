import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/delivery/couriers - دریافت لیست پیک‌ها
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vehicleType = searchParams.get('vehicleType');
    const available = searchParams.get('available');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('دریافت پیک‌ها با فیلترها:', { status, vehicleType, available });

    // ساخت شرط‌های جستجو
    const where: any = {
      isActive: true
    };
    
    if (status) where.status = status;
    if (vehicleType) where.vehicleType = vehicleType;
    if (available === 'true') where.status = 'AVAILABLE';

    // دریافت پیک‌ها از دیتابیس
    const couriers = await prisma.courier.findMany({
      where,
      include: {
        deliveries: {
          where: {
            status: { in: ['PENDING', 'ASSIGNED', 'PICKED_UP'] }
          },
          include: {
            order: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // شمارش کل پیک‌ها
    const total = await prisma.courier.count({ where });

    // محاسبه آمار برای هر پیک
    const couriersWithStats = await Promise.all(couriers.map(async (courier) => {
      // آمار تحویل‌های امروز
      const todayDeliveries = await prisma.delivery.count({
        where: {
          courierId: courier.id,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });

      // آمار تحویل‌های تکمیل شده
      const completedDeliveries = await prisma.delivery.count({
        where: {
          courierId: courier.id,
          status: 'DELIVERED'
        }
      });

      return {
        ...courier,
        stats: {
          todayDeliveries,
          completedDeliveries,
          activeDeliveries: courier.deliveries.length
        }
      };
    }));

    return NextResponse.json({
      success: true,
      data: {
        couriers: couriersWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('خطا در دریافت پیک‌ها:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت پیک‌ها',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// POST /api/delivery/couriers - اضافه کردن پیک جدید
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('اضافه کردن پیک جدید:', data);

    // اعتبارسنجی داده‌ها
    if (!data.name || !data.phone || !data.vehicleType) {
      return NextResponse.json(
        { success: false, error: 'فیلدهای نام، تلفن و نوع وسیله نقلیه اجباری هستند' },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن شماره تلفن
    const existingCourier = await prisma.courier.findFirst({
      where: { phone: data.phone }
    });

    if (existingCourier) {
      return NextResponse.json(
        { success: false, error: 'پیک با این شماره تلفن قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // ایجاد پیک جدید
    const courier = await prisma.courier.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        avatar: data.avatar || null,
        vehicleType: data.vehicleType,
        vehicleNumber: data.vehicleNumber || null,
        licenseNumber: data.licenseNumber || null,
        status: data.status || 'OFFLINE',
        rating: parseFloat(data.rating || '5.0'),
        isActive: data.isActive !== false
      }
    });

    return NextResponse.json({
      success: true,
      data: courier,
      message: 'پیک با موفقیت اضافه شد'
    });

  } catch (error) {
    console.error('خطا در اضافه کردن پیک:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در اضافه کردن پیک',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// PUT /api/delivery/couriers - بروزرسانی اطلاعات پیک
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    console.log('بروزرسانی پیک:', { id, updateData });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه پیک اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود پیک
    const existingCourier = await prisma.courier.findUnique({
      where: { id: id }
    });

    if (!existingCourier) {
      return NextResponse.json(
        { success: false, error: 'پیک یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی تکراری نبودن شماره تلفن (در صورت تغییر)
    if (updateData.phone && updateData.phone !== existingCourier.phone) {
      const duplicateCourier = await prisma.courier.findFirst({
        where: { 
          phone: updateData.phone,
          id: { not: id }
        }
      });

      if (duplicateCourier) {
        return NextResponse.json(
          { success: false, error: 'پیک با این شماره تلفن قبلاً موجود است' },
          { status: 400 }
        );
      }
    }

    // بروزرسانی پیک
    const updatedCourier = await prisma.courier.update({
      where: { id: id },
      data: {
        ...updateData,
        rating: updateData.rating ? parseFloat(updateData.rating) : undefined,
        currentLat: updateData.currentLat ? parseFloat(updateData.currentLat) : undefined,
        currentLng: updateData.currentLng ? parseFloat(updateData.currentLng) : undefined,
        locationUpdated: updateData.currentLat || updateData.currentLng ? new Date() : undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCourier,
      message: 'اطلاعات پیک با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی پیک:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی پیک',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/delivery/couriers - غیرفعال کردن پیک
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('غیرفعال کردن پیک:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه پیک اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود پیک
    const existingCourier = await prisma.courier.findUnique({
      where: { id: id },
      include: {
        deliveries: {
          where: {
            status: { in: ['PENDING', 'ASSIGNED', 'PICKED_UP'] }
          }
        }
      }
    });

    if (!existingCourier) {
      return NextResponse.json(
        { success: false, error: 'پیک یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی امکان حذف (تحویل‌های فعال نداشته باشد)
    if (existingCourier.deliveries.length > 0) {
      return NextResponse.json(
        { success: false, error: 'پیک دارای تحویل‌های فعال است و قابل حذف نیست' },
        { status: 400 }
      );
    }

    // به جای حذف، غیرفعال می‌کنیم
    const deactivatedCourier = await prisma.courier.update({
      where: { id: id },
      data: {
        isActive: false,
        status: 'OFFLINE',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: deactivatedCourier,
      message: 'پیک با موفقیت غیرفعال شد'
    });

  } catch (error) {
    console.error('خطا در غیرفعال کردن پیک:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در غیرفعال کردن پیک',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
