import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - دریافت آمار آشپزخانه
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // آمار کلی امروز
    const [
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedOrders
    ] = await Promise.all([
      // کل سفارشات امروز
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // سفارشات در انتظار
      prisma.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // سفارشات در حال آماده‌سازی
      prisma.order.count({
        where: {
          status: 'PREPARING',
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // سفارشات آماده
      prisma.order.count({
        where: {
          status: 'READY',
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // سفارشات تکمیل شده
      prisma.order.count({
        where: {
          status: { in: ['DELIVERED', 'COMPLETED'] },
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ]);

    // محاسبه میانگین زمان آماده‌سازی
    const ordersWithItems = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    const totalPreparationTime = ordersWithItems.reduce((total, order) => {
      const orderTime = order.items.reduce((orderTotal, item) => {
        return orderTotal + (item.menuItem.preparationTime * item.quantity);
      }, 0);
      return total + orderTime;
    }, 0);

    const averagePreparationTime = ordersWithItems.length > 0 
      ? Math.round(totalPreparationTime / ordersWithItems.length)
      : 0;

    // آیتم‌های محبوب
    const popularItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      },
      _sum: {
        quantity: true
      },
      _avg: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // دریافت اطلاعات آیتم‌های محبوب
    const popularItemsWithDetails = await Promise.all(
      popularItems.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        });
        return {
          itemName: menuItem?.name || 'نامشخص',
          quantity: item._sum.quantity || 0,
          averageTime: menuItem?.preparationTime || 0
        };
      })
    );

    // آمار عملکرد (فعلاً مقادیر نمونه)
    const performanceMetrics = {
      onTimeDelivery: 85, // درصد
      customerSatisfaction: 92, // درصد  
      kitchenEfficiency: 78 // درصد
    };

    const stats = {
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedToday: completedOrders,
      averagePreparationTime,
      delayedOrders: 0, // فعلاً صفر
      rushHourOrders: Math.floor(totalOrders * 0.3), // تخمین
      popularItems: popularItemsWithDetails,
      performanceMetrics
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('خطا در دریافت آمار آشپزخانه:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت آمار' },
      { status: 500 }
    );
  }
}
