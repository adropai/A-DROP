import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/branches/staff - دریافت کارکنان شعبه
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('دریافت کارکنان شعبه:', { branchId, userId, role });

    // ساخت شرط‌های جستجو
    const where: any = {};
    
    if (branchId) where.branchId = branchId;
    if (userId) where.userId = userId;
    if (role) where.role = role;
    if (isActive !== null) where.isActive = isActive === 'true';

    // دریافت کارکنان
    const staff = await prisma.branchStaff.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            role: true,
            isActive: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { user: { firstName: 'asc' } }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // شمارش کل
    const total = await prisma.branchStaff.count({ where });

    // پردازش داده‌ها
    const processedStaff = staff.map(staffMember => ({
      id: staffMember.id,
      branchId: staffMember.branchId,
      branch: staffMember.branch,
      userId: staffMember.userId,
      user: staffMember.user,
      role: staffMember.role,
      permissions: JSON.parse(staffMember.permissions || '[]'),
      schedule: JSON.parse(staffMember.schedule || '[]'),
      isActive: staffMember.isActive,
      startDate: staffMember.startDate,
      endDate: staffMember.endDate,
      createdAt: staffMember.createdAt,
      updatedAt: staffMember.updatedAt
    }));

    // آمار کارکنان
    const staffStats = await prisma.branchStaff.groupBy({
      by: ['role'],
      _count: {
        id: true
      },
      where: branchId ? { branchId, isActive: true } : { isActive: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        staff: processedStaff,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: staffStats.map(stat => ({
          role: stat.role,
          count: stat._count.id
        }))
      }
    });

  } catch (error) {
    console.error('خطا در دریافت کارکنان:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت کارکنان',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// POST /api/branches/staff - اضافه کردن کارمند به شعبه
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('اضافه کردن کارمند به شعبه:', data);

    // اعتبارسنجی
    if (!data.branchId || !data.userId || !data.role) {
      return NextResponse.json(
        { success: false, error: 'شناسه شعبه، کاربر و نقش اجباری هستند' },
        { status: 400 }
      );
    }

    // بررسی وجود شعبه
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId }
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی عدم تکرار
    const existingStaff = await prisma.branchStaff.findUnique({
      where: {
        branchId_userId: {
          branchId: data.branchId,
          userId: data.userId
        }
      }
    });

    if (existingStaff) {
      return NextResponse.json(
        { success: false, error: 'این کاربر قبلاً در این شعبه فعال است' },
        { status: 400 }
      );
    }

    // تعریف دسترسی‌های پیش‌فرض بر اساس نقش
    const defaultPermissions = getDefaultPermissions(data.role);

    // اضافه کردن کارمند
    const staffMember = await prisma.branchStaff.create({
      data: {
        branchId: data.branchId,
        userId: data.userId,
        role: data.role,
        permissions: JSON.stringify(data.permissions || defaultPermissions),
        schedule: JSON.stringify(data.schedule || []),
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...staffMember,
        permissions: JSON.parse(staffMember.permissions || '[]'),
        schedule: JSON.parse(staffMember.schedule || '[]')
      },
      message: 'کارمند با موفقیت به شعبه اضافه شد'
    });

  } catch (error) {
    console.error('خطا در اضافه کردن کارمند:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در اضافه کردن کارمند',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// PUT /api/branches/staff - بروزرسانی کارمند شعبه
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    console.log('بروزرسانی کارمند شعبه:', { id, updateData });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه رابطه کارمند-شعبه اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود کارمند
    const existingStaff = await prisma.branchStaff.findUnique({
      where: { id }
    });

    if (!existingStaff) {
      return NextResponse.json(
        { success: false, error: 'کارمند در این شعبه یافت نشد' },
        { status: 404 }
      );
    }

    // بروزرسانی کارمند
    const updatedStaff = await prisma.branchStaff.update({
      where: { id },
      data: {
        ...updateData,
        permissions: updateData.permissions ? 
          JSON.stringify(updateData.permissions) : undefined,
        schedule: updateData.schedule ? 
          JSON.stringify(updateData.schedule) : undefined,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedStaff,
        permissions: JSON.parse(updatedStaff.permissions || '[]'),
        schedule: JSON.parse(updatedStaff.schedule || '[]')
      },
      message: 'اطلاعات کارمند با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی کارمند:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی کارمند',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/branches/staff - حذف کارمند از شعبه
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const branchId = searchParams.get('branchId');
    const userId = searchParams.get('userId');

    console.log('حذف کارمند از شعبه:', { id, branchId, userId });

    let whereCondition: any;

    if (id) {
      whereCondition = { id };
    } else if (branchId && userId) {
      whereCondition = {
        branchId_userId: {
          branchId,
          userId
        }
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'شناسه یا ترکیب شعبه و کاربر اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود کارمند
    const existingStaff = await prisma.branchStaff.findUnique({
      where: whereCondition,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        branch: {
          select: {
            name: true
          }
        }
      }
    });

    if (!existingStaff) {
      return NextResponse.json(
        { success: false, error: 'کارمند در این شعبه یافت نشد' },
        { status: 404 }
      );
    }

    // حذف کارمند
    const deletedStaff = await prisma.branchStaff.delete({
      where: whereCondition
    });

    return NextResponse.json({
      success: true,
      data: deletedStaff,
      message: `${existingStaff.user?.firstName} ${existingStaff.user?.lastName} از شعبه ${existingStaff.branch?.name} حذف شد`
    });

  } catch (error) {
    console.error('خطا در حذف کارمند:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در حذف کارمند',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// تابع کمکی برای دسترسی‌های پیش‌فرض
function getDefaultPermissions(role: string): string[] {
  const permissionMap: { [key: string]: string[] } = {
    BRANCH_MANAGER: [
      'branch.manage', 'staff.manage', 'orders.manage', 
      'menu.manage', 'inventory.manage', 'reports.view',
      'settings.update', 'tables.manage'
    ],
    SHIFT_MANAGER: [
      'orders.manage', 'staff.view', 'inventory.update',
      'reports.view', 'tables.manage'
    ],
    CASHIER: [
      'orders.create', 'orders.update', 'payments.process',
      'customers.manage', 'menu.view'
    ],
    CHEF: [
      'orders.view', 'orders.update', 'menu.view',
      'inventory.view'
    ],
    KITCHEN_STAFF: [
      'orders.view', 'orders.update', 'menu.view'
    ],
    WAITER: [
      'orders.create', 'orders.view', 'orders.update',
      'tables.manage', 'menu.view', 'customers.view'
    ],
    DELIVERY_STAFF: [
      'orders.view', 'orders.update', 'delivery.manage'
    ],
    CLEANER: [
      'tables.clean'
    ],
    SECURITY: [
      'branch.security'
    ],
    STAFF: [
      'orders.view', 'menu.view'
    ]
  };

  return permissionMap[role] || ['menu.view'];
}
