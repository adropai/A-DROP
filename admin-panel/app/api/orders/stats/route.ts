import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/orders/stats called');

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // دریافت آمار کلی سفارشات
    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      todayRevenue,
      avgOrderValue
    ] = await Promise.all([
      // کل سفارشات
      prisma.order.count(),
      
      // سفارشات امروز
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfToday
          }
        }
      }),
      
      // سفارشات این هفته
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfWeek
          }
        }
      }),
      
      // سفارشات این ماه
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      
      // سفارشات در انتظار
      prisma.order.count({
        where: { status: 'PENDING' }
      }),
      
      // سفارشات در حال پردازش
      prisma.order.count({
        where: { status: 'PREPARING' }
      }),
      
      // سفارشات تکمیل شده
      prisma.order.count({
        where: { status: 'COMPLETED' }
      }),
      
      // سفارشات لغو شده
      prisma.order.count({
        where: { status: 'CANCELLED' }
      }),
      
      // کل درآمد
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      
      // درآمد امروز
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startOfToday
          },
          status: {
            not: 'CANCELLED'
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      
      // میانگین ارزش سفارش
      prisma.order.aggregate({
        _avg: {
          totalAmount: true
        }
      })
    ]);

    // آمار رشد
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    const yesterdayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lt: startOfToday
        }
      }
    });

    const orderGrowthRate = yesterdayOrders > 0 
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100)
      : 0;

    // آمار پرفروش‌ترین آیتم‌ها
    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: {
        quantity: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const stats = {
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: Math.round(totalRevenue._sum.totalAmount || 0),
      todayRevenue: Math.round(todayRevenue._sum?.totalAmount || 0),
      avgOrderValue: Math.round(avgOrderValue._avg.totalAmount || 0),
      orderGrowthRate: Math.round(orderGrowthRate * 100) / 100,
      statusDistribution: {
        pending: pendingOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders
      },
      topItems: topItems.length
    };

    console.log('📊 Order stats:', stats);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching order stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت آمار سفارشات',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
