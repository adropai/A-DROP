import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/roles/check - بررسی دسترسی کاربر
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, permission, permissions = [] } = data;

    console.log('بررسی دسترسی:', { userId, permission, permissions });

    // اعتبارسنجی
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'شناسه کاربر اجباری است' },
        { status: 400 }
      );
    }

    if (!permission && permissions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'حداقل یک دسترسی برای بررسی الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          hasPermission: false,
          reason: 'کاربر یافت نشد یا غیرفعال است'
        }
      });
    }

    // دریافت دسترسی‌های کاربر
    const userPermissions = JSON.parse(user.permissions || '[]');
    
    // بررسی دسترسی واحد
    if (permission) {
      const hasPermission = userPermissions.includes(permission) || 
                           user.role === 'SUPER_ADMIN'; // SUPER_ADMIN همه دسترسی‌ها را دارد

      return NextResponse.json({
        success: true,
        data: {
          hasPermission,
          permission,
          userRole: user.role,
          reason: hasPermission ? 'دسترسی موجود است' : 'دسترسی موجود نیست'
        }
      });
    }

    // بررسی چندین دسترسی
    if (permissions.length > 0) {
      const permissionResults = permissions.map((perm: string) => ({
        permission: perm,
        hasPermission: userPermissions.includes(perm) || user.role === 'SUPER_ADMIN'
      }));

      const allGranted = permissionResults.every(result => result.hasPermission);
      const anyGranted = permissionResults.some(result => result.hasPermission);

      return NextResponse.json({
        success: true,
        data: {
          allPermissionsGranted: allGranted,
          anyPermissionGranted: anyGranted,
          userRole: user.role,
          permissionResults,
          totalRequested: permissions.length,
          totalGranted: permissionResults.filter(r => r.hasPermission).length
        }
      });
    }

  } catch (error) {
    console.error('خطا در بررسی دسترسی:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بررسی دسترسی',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// GET /api/roles/check - دریافت تمام دسترسی‌های کاربر
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('دریافت دسترسی‌های کاربر:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'شناسه کاربر اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'کاربر یافت نشد یا غیرفعال است' },
        { status: 404 }
      );
    }

    // دریافت دسترسی‌های کاربر
    const userPermissions = JSON.parse(user.permissions || '[]');

    // تجمیع اطلاعات دسترسی
    const permissionCategories = categorizePermissions(userPermissions);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: `${user.firstName} ${user.lastName}`,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt
        },
        permissions: {
          raw: userPermissions,
          categorized: permissionCategories,
          total: userPermissions.length
        },
        roleInfo: {
          name: user.role,
          description: getRoleDescription(user.role),
          isSuperAdmin: user.role === 'SUPER_ADMIN'
        }
      }
    });

  } catch (error) {
    console.error('خطا در دریافت دسترسی‌های کاربر:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت دسترسی‌های کاربر',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// تابع کمکی برای دسته‌بندی دسترسی‌ها
function categorizePermissions(permissions: string[]) {
  const categories: { [key: string]: string[] } = {
    users: [],
    roles: [],
    menu: [],
    orders: [],
    reservations: [],
    inventory: [],
    analytics: [],
    marketing: [],
    settings: [],
    system: [],
    other: []
  };

  permissions.forEach(permission => {
    const [category] = permission.split('.');
    if (categories[category]) {
      categories[category].push(permission);
    } else {
      categories.other.push(permission);
    }
  });

  // حذف دسته‌های خالی
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });

  return categories;
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
