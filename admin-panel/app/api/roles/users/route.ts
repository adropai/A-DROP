import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/roles/users - دریافت کاربران بر اساس نقش
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    console.log('دریافت کاربران بر اساس نقش:', { role, includeInactive, search });

    // ساخت شرط‌های جستجو
    const where: any = {};
    
    if (role) where.role = role;
    if (!includeInactive) where.isActive = true;
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // دریافت کاربران
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        role: true,
        permissions: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // شمارش کل کاربران
    const total = await prisma.user.count({ where });

    // تبدیل permissions از JSON به array
    const usersWithPermissions = users.map(user => ({
      ...user,
      permissions: JSON.parse(user.permissions || '[]'),
      fullName: `${user.firstName} ${user.lastName}`
    }));

    // آمار نقش‌ها
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithPermissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        roleStats: roleStats.map(stat => ({
          role: stat.role,
          count: stat._count.id
        }))
      }
    });

  } catch (error) {
    console.error('خطا در دریافت کاربران:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت کاربران',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// POST /api/roles/users - تغییر دسته‌ای نقش کاربران
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userIds, role, action = 'assign' } = data;

    console.log('تغییر دسته‌ای نقش:', { userIds, role, action });

    // اعتبارسنجی
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لیست شناسه کاربران اجباری است' },
        { status: 400 }
      );
    }

    // بررسی صحت action
    if (!['assign', 'activate', 'deactivate', 'reset_permissions'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'عملیات نامعتبر است' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let logAction = '';
    let successMessage = '';

    switch (action) {
      case 'assign':
        if (!role) {
          return NextResponse.json(
            { success: false, error: 'نقش برای تخصیص اجباری است' },
            { status: 400 }
          );
        }
        updateData = { role: role };
        logAction = 'BULK_ROLE_ASSIGNMENT';
        successMessage = `نقش ${role} به ${userIds.length} کاربر تخصیص داده شد`;
        break;

      case 'activate':
        updateData = { isActive: true };
        logAction = 'BULK_USER_ACTIVATION';
        successMessage = `${userIds.length} کاربر فعال شدند`;
        break;

      case 'deactivate':
        updateData = { isActive: false };
        logAction = 'BULK_USER_DEACTIVATION';
        successMessage = `${userIds.length} کاربر غیرفعال شدند`;
        break;

      case 'reset_permissions':
        updateData = { permissions: '[]' };
        logAction = 'BULK_PERMISSIONS_RESET';
        successMessage = `دسترسی‌های ${userIds.length} کاربر بازنشانی شد`;
        break;
    }

    // بروزرسانی کاربران
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    // ثبت لاگ برای هر کاربر
    const auditLogs = userIds.map(userId => ({
      userId: userId,
      action: logAction,
      details: JSON.stringify({
        action,
        newRole: role,
        affectedUsers: userIds.length
      }),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }));

    await prisma.auditLog.createMany({
      data: auditLogs
    });

    // دریافت کاربران بروزرسانی شده
    const updatedUsers = await prisma.user.findMany({
      where: {
        id: { in: userIds }
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

    return NextResponse.json({
      success: true,
      data: {
        affectedCount: result.count,
        updatedUsers: updatedUsers.map(user => ({
          ...user,
          permissions: JSON.parse(user.permissions || '[]')
        }))
      },
      message: successMessage
    });

  } catch (error) {
    console.error('خطا در تغییر دسته‌ای کاربران:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در تغییر دسته‌ای کاربران',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// PUT /api/roles/users - کپی دسترسی‌ها بین کاربران
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { sourceUserId, targetUserIds } = data;

    console.log('کپی دسترسی‌ها:', { sourceUserId, targetUserIds });

    // اعتبارسنجی
    if (!sourceUserId || !targetUserIds || !Array.isArray(targetUserIds)) {
      return NextResponse.json(
        { success: false, error: 'شناسه کاربر مبدأ و لیست کاربران مقصد اجباری هستند' },
        { status: 400 }
      );
    }

    // دریافت دسترسی‌های کاربر مبدأ
    const sourceUser = await prisma.user.findUnique({
      where: { id: sourceUserId },
      select: {
        role: true,
        permissions: true
      }
    });

    if (!sourceUser) {
      return NextResponse.json(
        { success: false, error: 'کاربر مبدأ یافت نشد' },
        { status: 404 }
      );
    }

    // بروزرسانی کاربران مقصد
    const result = await prisma.user.updateMany({
      where: {
        id: { in: targetUserIds }
      },
      data: {
        role: sourceUser.role,
        permissions: sourceUser.permissions,
        updatedAt: new Date()
      }
    });

    // ثبت لاگ
    const auditLogs = targetUserIds.map(userId => ({
      userId: userId,
      action: 'PERMISSIONS_COPIED',
      details: JSON.stringify({
        sourceUserId,
        copiedRole: sourceUser.role,
        copiedPermissions: JSON.parse(sourceUser.permissions || '[]')
      }),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }));

    await prisma.auditLog.createMany({
      data: auditLogs
    });

    return NextResponse.json({
      success: true,
      data: {
        affectedCount: result.count,
        sourceUser: {
          id: sourceUserId,
          role: sourceUser.role,
          permissions: JSON.parse(sourceUser.permissions || '[]')
        }
      },
      message: `دسترسی‌های کاربر به ${result.count} کاربر دیگر کپی شد`
    });

  } catch (error) {
    console.error('خطا در کپی دسترسی‌ها:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در کپی دسترسی‌ها',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
