import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/delivery/couriers - دریافت لیست پیک‌ها
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vehicleType = searchParams.get('vehicleType');
    const available = searchParams.get('available');

    // ساخت فیلتر برای جستجو
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (vehicleType && vehicleType !== 'all') {
      where.vehicleType = vehicleType;
    }
    
    if (available === 'true') {
      where.status = 'AVAILABLE';
    }

    // دریافت لیست پیک‌ها از دیتابیس
    const couriers = await prisma.courier.findMany({
      where,
      include: {
        deliveries: {
          where: {
            status: {
              in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT']
            }
          },
          include: {
            order: {
              select: {
                id: true,
                customerName: true,
                totalAmount: true,
                customerAddress: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { name: 'asc' }
      ]
    });

    // محاسبه آمار برای هر پیک
    const couriersWithStats = couriers.map(courier => {
      // Type assertion برای دسترسی به deliveries
      const courierWithDeliveries = courier as typeof courier & { deliveries: any[] };
      
      // تعداد سفارشات در انتظار
      const pendingOrders = courierWithDeliveries.deliveries?.filter(delivery => 
        delivery.status === 'ASSIGNED'
      ).length || 0;
      
      // تعداد سفارشات در حال تحویل
      const activeOrders = courierWithDeliveries.deliveries?.filter(delivery => 
        ['PICKED_UP', 'IN_TRANSIT'].includes(delivery.status)
      ).length || 0;

      return {
        ...courier,
        stats: {
          pendingOrders,
          activeOrders,
          totalActiveOrders: courierWithDeliveries.deliveries?.length || 0
        }
      };
    });

    return NextResponse.json({
      couriers: couriersWithStats,
      total: couriersWithStats.length,
      byStatus: {
        available: couriersWithStats.filter(c => c.status === 'AVAILABLE').length,
        busy: couriersWithStats.filter(c => c.status === 'BUSY').length,
        offline: couriersWithStats.filter(c => c.status === 'OFFLINE').length,
        suspended: couriersWithStats.filter(c => c.status === 'ON_BREAK').length
      }
    });

  } catch (error) {
    console.error('❌ خطا در دریافت لیست پیک‌ها:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست پیک‌ها' },
      { status: 500 }
    );
  }
}

// POST /api/delivery/couriers - ایجاد پیک جدید
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      licenseNumber,
      vehicleType,
      vehicleNumber,
      status = 'AVAILABLE'
    } = body;

    // بررسی وجود فیلدهای الزامی
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'نام و شماره تلفن الزامی است' },
        { status: 400 }
      );
    }

    // بررسی عدم تکراری بودن شماره تلفن
    const existingCourier = await prisma.courier.findFirst({
      where: {
        phone: phone
      }
    });

    if (existingCourier) {
      return NextResponse.json(
        { error: 'پیکی با این شماره تلفن قبلاً ثبت شده است' },
        { status: 409 }
      );
    }

    // ایجاد پیک جدید
    const courier = await prisma.courier.create({
      data: {
        name,
        phone,
        email: email || undefined,
        vehicleType: vehicleType || 'MOTORCYCLE',
        status
      }
    });

    return NextResponse.json({
      success: true,
      message: 'پیک با موفقیت ایجاد شد',
      courier
    }, { status: 201 });

  } catch (error) {
    console.error('❌ خطا در ایجاد پیک:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد پیک' },
      { status: 500 }
    );
  }
}
