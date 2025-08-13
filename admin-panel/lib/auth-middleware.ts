import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

// Permission checking utility
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('*');
}

// JWT verification and user data extraction
export async function verifyAuthToken(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user with role and permissions
    const user = await (prisma as any).user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRole: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.userRole) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.userRole.name as any,
      permissions: user.userRole.rolePermissions.map((rp: any) => rp.permission.name)
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Higher-order function for protecting API routes
export function withAuth(requiredPermission?: string) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return async function(request: AuthenticatedRequest) {
      try {
        // Verify authentication
        const user = await verifyAuthToken(request);
        
        if (!user) {
          return NextResponse.json(
            { success: false, message: 'احراز هویت ناموفق' },
            { status: 401 }
          );
        }

        // Check permission if required
        if (requiredPermission && !hasPermission(user.permissions, requiredPermission)) {
          return NextResponse.json(
            { success: false, message: 'دسترسی غیرمجاز' },
            { status: 403 }
          );
        }

        // Attach user to request
        request.user = user;
        
        // Call the actual handler
        return await handler(request);
      } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.json(
          { success: false, message: 'خطای سرور' },
          { status: 500 }
        );
      }
    };
  };
}

// Permission definitions for different modules
export const PERMISSIONS = {
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
  
  // Kitchen
  KITCHEN_VIEW: 'kitchen.view',
  KITCHEN_MANAGE: 'kitchen.manage',
  KITCHEN_TICKETS: 'kitchen.tickets',
  
  // Tables
  TABLES_VIEW: 'tables.view',
  TABLES_MANAGE: 'tables.manage',
  TABLES_ASSIGN: 'tables.assign',
  
  // Delivery
  DELIVERY_VIEW: 'delivery.view',
  DELIVERY_MANAGE: 'delivery.manage',
  
  // Cashier
  CASHIER_VIEW: 'cashier.view',
  CASHIER_PROCESS: 'cashier.process',
  CASHIER_REFUND: 'cashier.refund',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_ADVANCED: 'analytics.advanced',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  
  // Staff
  STAFF_VIEW: 'staff.view',
  STAFF_MANAGE: 'staff.manage',
  
  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_MANAGE: 'customers.manage',
  
  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_MANAGE: 'inventory.manage',
  
  // Security
  SECURITY_VIEW: 'security.view',
  SECURITY_MANAGE: 'security.manage',
  
  // Roles
  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',
} as const;
