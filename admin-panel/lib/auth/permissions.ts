import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * بررسی دسترسی کاربر به یک عملیات خاص
 */
export async function checkPermission(
  userId: string, 
  permission: string
): Promise<{ hasPermission: boolean; reason?: string }> {
  try {
    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true 
      },
      select: {
        role: true,
        permissions: true,
        isActive: true
      }
    });

    if (!user) {
      return {
        hasPermission: false,
        reason: 'کاربر یافت نشد یا غیرفعال است'
      };
    }

    // SUPER_ADMIN همه دسترسی‌ها را دارد
    if (user.role === 'SUPER_ADMIN') {
      return {
        hasPermission: true,
        reason: 'دسترسی مدیر کل'
      };
    }

    // بررسی دسترسی در لیست permissions
    const userPermissions = JSON.parse(user.permissions || '[]');
    const hasPermission = userPermissions.includes(permission);

    return {
      hasPermission,
      reason: hasPermission ? 'دسترسی موجود است' : 'دسترسی کافی نیست'
    };

  } catch (error) {
    console.error('خطا در بررسی دسترسی:', error);
    return {
      hasPermission: false,
      reason: 'خطا در بررسی دسترسی'
    };
  }
}

/**
 * بررسی چندین دسترسی همزمان
 */
export async function checkMultiplePermissions(
  userId: string, 
  permissions: string[],
  requireAll: boolean = false
): Promise<{ hasPermission: boolean; details: any }> {
  try {
    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true 
      },
      select: {
        role: true,
        permissions: true
      }
    });

    if (!user) {
      return {
        hasPermission: false,
        details: { reason: 'کاربر یافت نشد' }
      };
    }

    // SUPER_ADMIN همه دسترسی‌ها را دارد
    if (user.role === 'SUPER_ADMIN') {
      return {
        hasPermission: true,
        details: { 
          reason: 'دسترسی مدیر کل',
          allGranted: true,
          grantedCount: permissions.length
        }
      };
    }

    const userPermissions = JSON.parse(user.permissions || '[]');
    const results = permissions.map(permission => ({
      permission,
      granted: userPermissions.includes(permission)
    }));

    const grantedCount = results.filter(r => r.granted).length;
    const hasPermission = requireAll ? 
      grantedCount === permissions.length : 
      grantedCount > 0;

    return {
      hasPermission,
      details: {
        results,
        grantedCount,
        totalRequested: permissions.length,
        requireAll,
        allGranted: grantedCount === permissions.length
      }
    };

  } catch (error) {
    console.error('خطا در بررسی دسترسی‌ها:', error);
    return {
      hasPermission: false,
      details: { reason: 'خطا در بررسی دسترسی‌ها' }
    };
  }
}

/**
 * استخراج اطلاعات کاربر از token یا session
 */
export async function getCurrentUser(request: NextRequest): Promise<any> {
  try {
    // اینجا باید authentication logic شما قرار گیرد
    // مثال: JWT token, session cookie, etc.
    
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('session');
    
    if (authHeader?.startsWith('Bearer ')) {
      // JWT authentication
      const token = authHeader.substring(7);
      // TODO: Verify JWT and extract user ID
      return null;
    }
    
    if (sessionCookie) {
      // Session-based authentication
      const sessionId = sessionCookie.value;
      
      const session = await prisma.userSession.findUnique({
        where: { 
          token: sessionId,
          expiresAt: { gt: new Date() }
        },
        include: {
          user: {
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
          }
        }
      });

      if (session?.user) {
        return {
          ...session.user,
          permissions: JSON.parse(session.user.permissions || '[]')
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('خطا در دریافت کاربر فعلی:', error);
    return null;
  }
}

/**
 * میدل‌ویر بررسی دسترسی
 */
export function createPermissionMiddleware(requiredPermission: string) {
  return async (request: NextRequest) => {
    try {
      const user = await getCurrentUser(request);
      
      if (!user) {
        return {
          success: false,
          error: 'احراز هویت الزامی است',
          status: 401
        };
      }

      const { hasPermission, reason } = await checkPermission(user.id, requiredPermission);
      
      if (!hasPermission) {
        return {
          success: false,
          error: 'دسترسی کافی نیست',
          details: reason,
          status: 403
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: 'خطا در بررسی دسترسی',
        status: 500
      };
    }
  };
}

/**
 * میدل‌ویر بررسی نقش
 */
export function createRoleMiddleware(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    try {
      const user = await getCurrentUser(request);
      
      if (!user) {
        return {
          success: false,
          error: 'احراز هویت الزامی است',
          status: 401
        };
      }

      if (!allowedRoles.includes(user.role)) {
        return {
          success: false,
          error: 'نقش کاربری مجاز نیست',
          status: 403
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: 'خطا در بررسی نقش',
        status: 500
      };
    }
  };
}

/**
 * دکوریتور برای بررسی دسترسی در API handlers
 */
export function withPermission(permission: string) {
  return function(handler: Function) {
    return async function(request: NextRequest, ...args: any[]) {
      const middleware = createPermissionMiddleware(permission);
      const result = await middleware(request);
      
      if (!result.success) {
        return Response.json(
          { 
            success: false, 
            error: result.error,
            details: result.details 
          },
          { status: result.status }
        );
      }
      
      // اضافه کردن اطلاعات کاربر به request
      (request as any).user = result.user;
      
      return handler(request, ...args);
    };
  };
}

/**
 * دکوریتور برای بررسی نقش در API handlers
 */
export function withRole(allowedRoles: string[]) {
  return function(handler: Function) {
    return async function(request: NextRequest, ...args: any[]) {
      const middleware = createRoleMiddleware(allowedRoles);
      const result = await middleware(request);
      
      if (!result.success) {
        return Response.json(
          { 
            success: false, 
            error: result.error 
          },
          { status: result.status }
        );
      }
      
      (request as any).user = result.user;
      
      return handler(request, ...args);
    };
  };
}
