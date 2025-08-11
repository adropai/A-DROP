import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/branches - دریافت شعبه‌ها
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const managerId = searchParams.get('managerId');
    const includeSettings = searchParams.get('includeSettings') === 'true';
    const includeStaff = searchParams.get('includeStaff') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('دریافت شعبه‌ها:', { branchId, status, city, includeSettings, includeStaff });

    // اگر شعبه خاص درخواست شده
    if (branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          settings: includeSettings,
          staff: includeStaff ? {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          } : false,
          _count: includeStats ? {
            select: {
              staff: true,
              orders: true,
              tables: true,
              menuItems: true
            }
          } : false
        }
      });

      if (!branch) {
        return NextResponse.json(
          { success: false, error: 'شعبه یافت نشد' },
          { status: 404 }
        );
      }

      // پردازش داده‌ها
      const branchData = {
        ...branch,
        operatingHours: JSON.parse(branch.operatingHours || '[]'),
        ...(includeStaff && branch.staff && {
          staff: branch.staff.map((staff: any) => ({
            ...staff,
            permissions: JSON.parse(staff.permissions || '[]'),
            schedule: JSON.parse(staff.schedule || '[]')
          }))
        })
      };

      return NextResponse.json({
        success: true,
        data: branchData
      });
    }

    // فیلتر شعبه‌ها
    const where: any = { isActive: true };
    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (managerId) where.managerId = managerId;

    // دریافت شعبه‌ها
    const branches = await prisma.branch.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        settings: includeSettings,
        _count: includeStats ? {
          select: {
            staff: true,
            orders: true,
            tables: true
          }
        } : false
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // شمارش کل
    const total = await prisma.branch.count({ where });

    // پردازش داده‌ها
    const processedBranches = branches.map(branch => ({
      ...branch,
      operatingHours: JSON.parse(branch.operatingHours || '[]')
    }));

    return NextResponse.json({
      success: true,
      data: {
        branches: processedBranches,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('خطا در دریافت شعبه‌ها:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت شعبه‌ها',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// POST /api/branches - ایجاد شعبه جدید
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('ایجاد شعبه جدید:', data);

    // اعتبارسنجی
    if (!data.name || !data.address || !data.managerId) {
      return NextResponse.json(
        { success: false, error: 'نام، آدرس و مدیر شعبه اجباری هستند' },
        { status: 400 }
      );
    }

    // بررسی وجود مدیر
    const manager = await prisma.user.findUnique({
      where: { id: data.managerId }
    });

    if (!manager) {
      return NextResponse.json(
        { success: false, error: 'مدیر یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی تکراری نبودن نام شعبه در شهر
    const existingBranch = await prisma.branch.findFirst({
      where: {
        name: data.name,
        city: data.city || '',
        isActive: true
      }
    });

    if (existingBranch) {
      return NextResponse.json(
        { success: false, error: 'شعبه‌ای با این نام در این شهر موجود است' },
        { status: 400 }
      );
    }

    // ایجاد شعبه جدید
    const branch = await prisma.branch.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        description: data.description,
        address: data.address,
        city: data.city || '',
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'IR',
        phone: data.phone,
        email: data.email,
        website: data.website,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        managerId: data.managerId,
        status: data.status || 'ACTIVE',
        timezone: data.timezone || 'Asia/Tehran',
        currency: data.currency || 'IRR',
        operatingHours: JSON.stringify(data.operatingHours || [])
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // ایجاد تنظیمات پیش‌فرض شعبه
    if (data.createDefaultSettings !== false) {
      await prisma.branchSettings.create({
        data: {
          branchId: branch.id,
          allowOnlineOrders: data.settings?.allowOnlineOrders ?? true,
          allowTableReservations: data.settings?.allowTableReservations ?? true,
          enableDelivery: data.settings?.enableDelivery ?? true,
          enableTakeout: data.settings?.enableTakeout ?? true,
          enableDineIn: data.settings?.enableDineIn ?? true,
          autoAcceptOrders: data.settings?.autoAcceptOrders ?? false,
          taxRate: data.settings?.taxRate ?? 0.09,
          serviceCharge: data.settings?.serviceCharge ?? 0.10,
          deliveryFee: data.settings?.deliveryFee ?? 50000,
          minimumOrderAmount: data.settings?.minimumOrderAmount ?? 100000,
          deliveryRadius: data.settings?.deliveryRadius ?? 10.0,
          avgDeliveryTime: data.settings?.avgDeliveryTime ?? 30,
          maxTablesPerReservation: data.settings?.maxTablesPerReservation ?? 1,
          reservationTimeSlots: data.settings?.reservationTimeSlots ?? 30,
          paymentMethods: JSON.stringify(data.settings?.paymentMethods || ['CASH', 'CARD']),
          printerSettings: JSON.stringify(data.settings?.printerSettings || {}),
          loyaltyProgram: data.settings?.loyaltyProgram ?? false,
          loyaltyPointsRate: data.settings?.loyaltyPointsRate ?? 0.01
        }
      });
    }

    // اضافه کردن مدیر به عنوان staff
    await prisma.branchStaff.create({
      data: {
        branchId: branch.id,
        userId: data.managerId,
        role: 'BRANCH_MANAGER',
        permissions: JSON.stringify([
          'branch.manage', 'staff.manage', 'orders.manage', 
          'menu.manage', 'inventory.manage', 'reports.view'
        ]),
        schedule: JSON.stringify([])
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...branch,
        operatingHours: JSON.parse(branch.operatingHours || '[]')
      },
      message: 'شعبه جدید با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('خطا در ایجاد شعبه:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ایجاد شعبه',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// PUT /api/branches - بروزرسانی شعبه
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    console.log('بروزرسانی شعبه:', { id, updateData });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه شعبه اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود شعبه
    const existingBranch = await prisma.branch.findUnique({
      where: { id }
    });

    if (!existingBranch) {
      return NextResponse.json(
        { success: false, error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی مدیر جدید (در صورت تغییر)
    if (updateData.managerId && updateData.managerId !== existingBranch.managerId) {
      const newManager = await prisma.user.findUnique({
        where: { id: updateData.managerId }
      });

      if (!newManager) {
        return NextResponse.json(
          { success: false, error: 'مدیر جدید یافت نشد' },
          { status: 404 }
        );
      }
    }

    // بروزرسانی شعبه
    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        ...updateData,
        latitude: updateData.latitude ? parseFloat(updateData.latitude) : undefined,
        longitude: updateData.longitude ? parseFloat(updateData.longitude) : undefined,
        operatingHours: updateData.operatingHours ? 
          JSON.stringify(updateData.operatingHours) : undefined,
        updatedAt: new Date()
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        settings: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedBranch,
        operatingHours: JSON.parse(updatedBranch.operatingHours || '[]')
      },
      message: 'شعبه با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی شعبه:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی شعبه',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/branches - غیرفعال کردن شعبه
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('غیرفعال کردن شعبه:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه شعبه اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود شعبه
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] }
          }
        }
      }
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی امکان غیرفعال کردن (سفارشات فعال نداشته باشد)
    if (branch.orders.length > 0) {
      return NextResponse.json(
        { success: false, error: 'شعبه دارای سفارشات فعال است و قابل غیرفعال کردن نیست' },
        { status: 400 }
      );
    }

    // غیرفعال کردن شعبه
    const deactivatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        isActive: false,
        status: 'INACTIVE',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: deactivatedBranch,
      message: 'شعبه با موفقیت غیرفعال شد'
    });

  } catch (error) {
    console.error('خطا در غیرفعال کردن شعبه:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در غیرفعال کردن شعبه',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
