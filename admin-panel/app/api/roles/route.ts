import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// GET /api/roles - دریافت لیست نقش‌ها
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
    const canViewRoles = await hasPermission(decoded.userId, PERMISSIONS.ROLES_VIEW);
    if (!canViewRoles) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // دریافت آمار نقش‌ها
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    // دریافت تمام permissions برای هر نقش
    const rolePermissions = await prisma.rolePermission.groupBy({
      by: ['role'],
      _count: {
        permissionId: true
      },
      where: {
        granted: true
      }
    });

    // ترکیب داده‌ها
    const roles = roleStats.map(stat => {
      const permissionCount = rolePermissions.find(rp => rp.role === stat.role)?._count.permissionId || 0;
      return {
        role: stat.role,
        userCount: stat._count.role,
        permissionCount
      };
    });

    return NextResponse.json({ 
      success: true, 
      roles 
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/roles - ایجاد تخصیص نقش جدید
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
    const canCreateRoles = await hasPermission(decoded.userId, PERMISSIONS.ROLES_UPDATE);
    if (!canCreateRoles) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
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

    // به‌روزرسانی نقش کاربر
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: 'نقش کاربر با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
