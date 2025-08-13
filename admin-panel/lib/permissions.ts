import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// کنستانت‌های permissions
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_ANALYTICS: 'dashboard.analytics',
  
  // Orders
  ORDERS_VIEW: 'orders.view',
  ORDERS_CREATE: 'orders.create',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_DELETE: 'orders.delete',
  ORDERS_MANAGE: 'orders.manage',
  
  // Menu
  MENU_VIEW: 'menu.view',
  MENU_CREATE: 'menu.create',
  MENU_UPDATE: 'menu.update',
  MENU_DELETE: 'menu.delete',
  MENU_MANAGE: 'menu.manage',
  
  // Staff
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',
  STAFF_MANAGE: 'staff.manage',
  
  // Kitchen
  KITCHEN_VIEW: 'kitchen.view',
  KITCHEN_ORDERS: 'kitchen.orders',
  KITCHEN_STATUS: 'kitchen.status',
  
  // Tables
  TABLES_VIEW: 'tables.view',
  TABLES_CREATE: 'tables.create',
  TABLES_UPDATE: 'tables.update',
  TABLES_DELETE: 'tables.delete',
  TABLES_QR: 'tables.qr',
  
  // Reservations
  RESERVATIONS_VIEW: 'reservations.view',
  RESERVATIONS_CREATE: 'reservations.create',
  RESERVATIONS_UPDATE: 'reservations.update',
  RESERVATIONS_DELETE: 'reservations.delete',
  
  // Cashier
  CASHIER_VIEW: 'cashier.view',
  CASHIER_TRANSACTIONS: 'cashier.transactions',
  CASHIER_REPORTS: 'cashier.reports',
  
  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_DELETE: 'customers.delete',
  
  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',
  
  // Delivery
  DELIVERY_VIEW: 'delivery.view',
  DELIVERY_ASSIGN: 'delivery.assign',
  DELIVERY_TRACK: 'delivery.track',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_ADVANCED: 'analytics.advanced',
  ANALYTICS_EXPORT: 'analytics.export',
  
  // Marketing
  MARKETING_VIEW: 'marketing.view',
  MARKETING_CAMPAIGNS: 'marketing.campaigns',
  MARKETING_COUPONS: 'marketing.coupons',
  
  // Security & Settings
  SECURITY_VIEW: 'security.view',
  SECURITY_MANAGE: 'security.manage',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  
  // Roles & Permissions
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  PERMISSIONS_ASSIGN: 'permissions.assign',
  PERMISSIONS_REVOKE: 'permissions.revoke',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];

/**
 * بررسی اینکه آیا کاربر دسترسی مشخصی دارد یا نه
 */
export async function hasPermission(
  userId: string, 
  permission: PermissionValue
): Promise<boolean> {
  try {
    // ابتدا از طریق role بررسی کنیم
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return false;
    }

    // بررسی role-based permission
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role: user.role,
        permission: {
          name: permission
        },
        granted: true
      }
    });

    if (rolePermission) {
      // بررسی اینکه آیا user-specific permission وجود دارد که آن را override کند
      const userPermission = await prisma.userPermission.findFirst({
        where: {
          userId,
          permission: {
            name: permission
          }
        }
      });

      // اگر user-specific permission وجود دارد، آن اولویت دارد
      if (userPermission) {
        return userPermission.granted && (
          !userPermission.expiresAt || userPermission.expiresAt > new Date()
        );
      }

      return true;
    }

    // اگر role permission نداشت، فقط user-specific permission بررسی کنیم
    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId,
        permission: {
          name: permission
        },
        granted: true
      }
    });

    return userPermission ? (
      !userPermission.expiresAt || userPermission.expiresAt > new Date()
    ) : false;

  } catch (error) {
    console.error('خطا در بررسی دسترسی:', error);
    return false;
  }
}

/**
 * دریافت تمام دسترسی‌های کاربر
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return [];
    }

    // دریافت role-based permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: user.role,
        granted: true
      },
      include: {
        permission: true
      }
    });

    // دریافت user-specific permissions
    const userPermissions = await prisma.userPermission.findMany({
      where: {
        userId,
        granted: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        permission: true
      }
    });

    // ترکیب permissions
    const allPermissions = new Set<string>();

    // اضافه کردن role permissions
    rolePermissions.forEach(rp => {
      allPermissions.add(rp.permission.name);
    });

    // اضافه/حذف user-specific permissions
    userPermissions.forEach(up => {
      if (up.granted) {
        allPermissions.add(up.permission.name);
      } else {
        allPermissions.delete(up.permission.name);
      }
    });

    return Array.from(allPermissions);

  } catch (error) {
    console.error('خطا در دریافت دسترسی‌های کاربر:', error);
    return [];
  }
}

/**
 * بررسی اینکه آیا کاربر نقش مشخصی دارد یا نه
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    return user?.role === role;
  } catch (error) {
    console.error('خطا در بررسی نقش:', error);
    return false;
  }
}

/**
 * بررسی اینکه آیا کاربر یکی از نقش‌های مشخص شده را دارد یا نه
 */
export async function hasAnyRole(userId: string, roles: UserRole[]): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    return user ? roles.includes(user.role) : false;
  } catch (error) {
    console.error('خطا در بررسی نقش‌ها:', error);
    return false;
  }
}

/**
 * تخصیص دسترسی مشخص به کاربر
 */
export async function grantPermission(
  userId: string, 
  permission: PermissionValue,
  expiresAt?: Date
): Promise<boolean> {
  try {
    const permissionRecord = await prisma.permission.findUnique({
      where: { name: permission }
    });

    if (!permissionRecord) {
      console.error(`Permission '${permission}' not found`);
      return false;
    }

    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permissionRecord.id
        }
      },
      create: {
        userId,
        permissionId: permissionRecord.id,
        granted: true,
        expiresAt
      },
      update: {
        granted: true,
        expiresAt
      }
    });

    return true;
  } catch (error) {
    console.error('خطا در تخصیص دسترسی:', error);
    return false;
  }
}

/**
 * لغو دسترسی مشخص از کاربر
 */
export async function revokePermission(
  userId: string, 
  permission: PermissionValue
): Promise<boolean> {
  try {
    const permissionRecord = await prisma.permission.findUnique({
      where: { name: permission }
    });

    if (!permissionRecord) {
      console.error(`Permission '${permission}' not found`);
      return false;
    }

    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permissionRecord.id
        }
      },
      create: {
        userId,
        permissionId: permissionRecord.id,
        granted: false
      },
      update: {
        granted: false
      }
    });

    return true;
  } catch (error) {
    console.error('خطا در لغو دسترسی:', error);
    return false;
  }
}

/**
 * دریافت تمام permissions موجود در سیستم
 */
export async function getAllPermissions() {
  try {
    return await prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { action: 'asc' }
      ]
    });
  } catch (error) {
    console.error('خطا در دریافت permissions:', error);
    return [];
  }
}

/**
 * دریافت permissions یک نقش مشخص
 */
export async function getRolePermissions(role: UserRole) {
  try {
    return await prisma.rolePermission.findMany({
      where: { 
        role,
        granted: true 
      },
      include: {
        permission: true
      }
    });
  } catch (error) {
    console.error('خطا در دریافت permissions نقش:', error);
    return [];
  }
}

/**
 * بررسی اینکه آیا کاربر admin است یا نه
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasAnyRole(userId, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
}

/**
 * بررسی اینکه آیا کاربر manager یا بالاتر است
 */
export async function isManagerOrAbove(userId: string): Promise<boolean> {
  return hasAnyRole(userId, [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER]);
}

/**
 * Helper برای بررسی multiple permissions
 */
export async function hasAllPermissions(
  userId: string, 
  permissions: PermissionValue[]
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(permission => hasPermission(userId, permission))
  );
  return results.every(result => result);
}

/**
 * Helper برای بررسی اینکه آیا کاربر حداقل یکی از permissions را دارد
 */
export async function hasAnyPermission(
  userId: string, 
  permissions: PermissionValue[]
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(permission => hasPermission(userId, permission))
  );
  return results.some(result => result);
}

export default {
  hasPermission,
  getUserPermissions,
  hasRole,
  hasAnyRole,
  grantPermission,
  revokePermission,
  getAllPermissions,
  getRolePermissions,
  isAdmin,
  isManagerOrAbove,
  hasAllPermissions,
  hasAnyPermission,
  PERMISSIONS
};
