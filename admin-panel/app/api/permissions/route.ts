import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { hasPermission, PERMISSIONS, grantPermission, revokePermission } from '@/lib/permissions';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// GET /api/permissions - دریافت لیست permissions
export async function GET(request: NextRequest) {
  try {
    // اعتبارسنجی token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // بررسی دسترسی
    const canViewPermissions = await hasPermission(decoded.userId, PERMISSIONS.ROLES_VIEW);
    if (!canViewPermissions) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (userId) {
      // دریافت permissions یک کاربر مشخص
      const userPermissions = await prisma.userPermission.findMany({
        where: { userId },
        include: {
          permission: true
        }
      });

      return NextResponse.json({
        success: true,
        permissions: userPermissions
      });
    }

    if (role) {
      // دریافت permissions یک نقش مشخص
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { role: role as any },
        include: {
          permission: true
        }
      });

      return NextResponse.json({
        success: true,
        permissions: rolePermissions
      });
    }

    // دریافت همه permissions
    const whereClause = module ? { module } : {};
    const permissions = await prisma.permission.findMany({
      where: whereClause,
      orderBy: [
        { module: 'asc' },
        { action: 'asc' }
      ]
    });

    // گروه‌بندی بر اساس module
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return NextResponse.json({
      success: true,
      permissions: groupedPermissions,
      total: permissions.length
    });

  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

// POST /api/permissions - تخصیص permission به کاربر
export async function POST(request: NextRequest) {
  try {
    // اعتبارسنجی token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // بررسی دسترسی
    const canAssignPermissions = await hasPermission(decoded.userId, PERMISSIONS.PERMISSIONS_ASSIGN);
    if (!canAssignPermissions) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, permissionName, granted = true, expiresAt } = body;

    if (!userId || !permissionName) {
      return NextResponse.json(
        { error: 'User ID and permission name are required' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // تخصیص یا لغو permission
    const result = granted 
      ? await grantPermission(userId, permissionName, expiresAt ? new Date(expiresAt) : undefined)
      : await revokePermission(userId, permissionName);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update permission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: granted ? 'دسترسی با موفقیت تخصیص یافت' : 'دسترسی با موفقیت لغو شد'
    });

  } catch (error) {
    console.error('Error updating permission:', error);
    return NextResponse.json(
      { error: 'Failed to update permission' },
      { status: 500 }
    );
  }
}

// DELETE /api/permissions - حذف permission از کاربر
export async function DELETE(request: NextRequest) {
  try {
    // اعتبارسنجی token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // بررسی دسترسی
    const canRevokePermissions = await hasPermission(decoded.userId, PERMISSIONS.PERMISSIONS_REVOKE);
    if (!canRevokePermissions) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const permissionName = searchParams.get('permission');

    if (!userId || !permissionName) {
      return NextResponse.json(
        { error: 'User ID and permission name are required' },
        { status: 400 }
      );
    }

    // حذف user permission
    const permission = await prisma.permission.findUnique({
      where: { name: permissionName }
    });

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      );
    }

    await prisma.userPermission.deleteMany({
      where: {
        userId,
        permissionId: permission.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'دسترسی با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Error deleting permission:', error);
    return NextResponse.json(
      { error: 'Failed to delete permission' },
      { status: 500 }
    );
  }
}
