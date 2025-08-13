import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, PERMISSIONS, type AuthenticatedRequest } from '@/lib/auth-middleware';

// DELETE /api/menu - حذف آیتم منو
export const DELETE = withAuth(PERMISSIONS.MENU_DELETE)(async function(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('🍽️ Deleting menu item:', id);
    console.log('🔐 Deleted by user:', request.user?.email);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه آیتم الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود سفارشات فعال برای این آیتم
    const activeOrders = await (prisma as any).orderItem.count({
      where: {
        menuItemId: id,
        order: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'PREPARING']
          }
        }
      }
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        { success: false, error: 'این آیتم در سفارشات فعال استفاده شده و قابل حذف نیست' },
        { status: 400 }
      );
    }

    // حذف آیتم
    await (prisma as any).menuItem.delete({
      where: { id: id }
    });

    console.log('🍽️ Menu item deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'آیتم از منو حذف شد'
    });

  } catch (error: any) {
    console.error('خطا در حذف آیتم منو:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف آیتم' },
      { status: 500 }
    );
  }
});
