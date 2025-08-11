import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// تعریف دسترسی‌های هر نقش
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'roles.create', 'roles.read', 'roles.update', 'roles.delete',
    'branches.create', 'branches.read', 'branches.update', 'branches.delete',
    'menu.create', 'menu.read', 'menu.update', 'menu.delete',
    'orders.create', 'orders.read', 'orders.update', 'orders.delete',
    'reservations.create', 'reservations.read', 'reservations.update', 'reservations.delete',
    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
    'analytics.read', 'analytics.export',
    'marketing.create', 'marketing.read', 'marketing.update', 'marketing.delete',
    'settings.read', 'settings.update',
    'audit.read', 'system.manage'
  ],
  ADMIN: [
    'users.create', 'users.read', 'users.update',
    'menu.create', 'menu.read', 'menu.update', 'menu.delete',
    'orders.create', 'orders.read', 'orders.update',
    'reservations.create', 'reservations.read', 'reservations.update', 'reservations.delete',
    'inventory.create', 'inventory.read', 'inventory.update',
    'analytics.read',
    'marketing.create', 'marketing.read', 'marketing.update',
    'settings.read', 'settings.update'
  ],
  MANAGER: [
    'users.read',
    'menu.read', 'menu.update',
    'orders.create', 'orders.read', 'orders.update',
    'reservations.create', 'reservations.read', 'reservations.update',
    'inventory.read', 'inventory.update',
    'analytics.read'
  ],
  CASHIER: [
    'orders.create', 'orders.read', 'orders.update',
    'menu.read',
    'customers.create', 'customers.read', 'customers.update',
    'payments.process'
  ],
  KITCHEN_STAFF: [
    'orders.read', 'orders.update',
    'menu.read',
    'inventory.read'
  ],
  WAITER: [
    'orders.create', 'orders.read', 'orders.update',
    'menu.read',
    'tables.read', 'tables.update',
    'reservations.read'
  ],
  DELIVERY: [
    'orders.read', 'orders.update',
    'delivery.read', 'delivery.update'
  ],
  SUPPORT: [
    'orders.read',
    'customers.read', 'customers.update',
    'support.create', 'support.read', 'support.update'
  ],
  STAFF: [
    'orders.read',
    'menu.read'
  ]
};

// GET /api/roles - دریافت لیست نقش‌ها و دسترسی‌ها
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUsers = searchParams.get('includeUsers') === 'true';
    const roleType = searchParams.get('role');

    console.log('دریافت نقش‌ها:', { includeUsers, roleType });

    // اگر نقش خاص درخواست شده
    if (roleType && roleType in ROLE_PERMISSIONS) {
      return NextResponse.json({
        success: true,
        data: {
          role: roleType,
          permissions: ROLE_PERMISSIONS[roleType as keyof typeof ROLE_PERMISSIONS],
          description: getRoleDescription(roleType)
        }
      });
    }

    // دریافت همه نقش‌ها
    const roles = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
      role: role,
      permissions: permissions,
      description: getRoleDescription(role),
      permissionCount: permissions.length
    }));

    // اگر درخواست شامل کاربران باشد
    if (includeUsers) {
      const userCounts = await prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        },
        where: {
          isActive: true
        }
      });

      const rolesWithUsers = roles.map(role => ({
        ...role,
        userCount: userCounts.find(uc => uc.role === role.role)?._count.id || 0
      }));

      return NextResponse.json({
        success: true,
        data: {
          roles: rolesWithUsers,
          totalRoles: roles.length
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        roles: roles,
        totalRoles: roles.length
      }
    });

  } catch (error) {
    console.error('خطا در دریافت نقش‌ها:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت نقش‌ها',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// POST /api/roles - تخصیص نقش به کاربر
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, role, customPermissions = [] } = data;

    console.log('تخصیص نقش:', { userId, role, customPermissions });

    // اعتبارسنجی
    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'شناسه کاربر و نقش اجباری هستند' },
        { status: 400 }
      );
    }

    if (!(role in ROLE_PERMISSIONS)) {
      return NextResponse.json(
        { success: false, error: 'نقش نامعتبر است' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // ترکیب دسترسی‌های پایه نقش با دسترسی‌های سفارشی
    const basePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
    const finalPermissions = [...new Set([...basePermissions, ...customPermissions])];

    // بروزرسانی نقش کاربر
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as any,
        permissions: JSON.stringify(finalPermissions),
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isActive: true
      }
    });

    // ثبت لاگ تغییر نقش
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'ROLE_ASSIGNED',
        details: JSON.stringify({
          oldRole: user.role,
          newRole: role,
          customPermissions: customPermissions
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        permissions: JSON.parse(updatedUser.permissions)
      },
      message: 'نقش کاربر با موفقیت تخصیص داده شد'
    });

  } catch (error) {
    console.error('خطا در تخصیص نقش:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در تخصیص نقش',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// PUT /api/roles - بروزرسانی دسترسی‌های کاربر
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, permissions, addPermissions = [], removePermissions = [] } = data;

    console.log('بروزرسانی دسترسی‌ها:', { userId, permissions, addPermissions, removePermissions });

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'شناسه کاربر اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    let finalPermissions: string[];

    if (permissions) {
      // تنظیم مستقیم دسترسی‌ها
      finalPermissions = permissions;
    } else {
      // بروزرسانی تدریجی دسترسی‌ها
      const currentPermissions = JSON.parse(user.permissions);
      finalPermissions = [...currentPermissions];

      // اضافه کردن دسترسی‌های جدید
      addPermissions.forEach((perm: string) => {
        if (!finalPermissions.includes(perm)) {
          finalPermissions.push(perm);
        }
      });

      // حذف دسترسی‌ها
      removePermissions.forEach((perm: string) => {
        const index = finalPermissions.indexOf(perm);
        if (index > -1) {
          finalPermissions.splice(index, 1);
        }
      });
    }

    // بروزرسانی دسترسی‌های کاربر
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: JSON.stringify(finalPermissions),
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isActive: true
      }
    });

    // ثبت لاگ تغییر دسترسی
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'PERMISSIONS_UPDATED',
        details: JSON.stringify({
          oldPermissions: JSON.parse(user.permissions),
          newPermissions: finalPermissions,
          addedPermissions: addPermissions,
          removedPermissions: removePermissions
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        permissions: JSON.parse(updatedUser.permissions)
      },
      message: 'دسترسی‌های کاربر با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی دسترسی‌ها:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی دسترسی‌ها',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// تابع کمکی برای دریافت توضیح نقش
function getRoleDescription(role: string): string {
  const descriptions: { [key: string]: string } = {
    SUPER_ADMIN: 'مدیر کل سیستم با دسترسی کامل به همه بخش‌ها',
    ADMIN: 'مدیر شعبه با دسترسی گسترده به عملیات روزانه',
    MANAGER: 'مدیر نوبت با دسترسی به مدیریت کارکنان و عملیات',
    CASHIER: 'صندوقدار با دسترسی به ثبت سفارش و پرداخت',
    KITCHEN_STAFF: 'کارمند آشپزخانه با دسترسی به سفارشات و موجودی',
    WAITER: 'گارسون با دسترسی به میزها و سفارشات',
    DELIVERY: 'پیک با دسترسی به تحویل سفارشات',
    SUPPORT: 'پشتیبانی با دسترسی به مدیریت مشتریان',
    STAFF: 'کارمند عادی با دسترسی محدود'
  };
  
  return descriptions[role] || 'نقش نامشخص';
}
