import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/customers/stats called');

    // دریافت آمار کلی مشتریان
    const [
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      vipCustomers,
      totalOrders,
      avgOrderValue
    ] = await Promise.all([
      // کل مشتریان
      prisma.customer.count(),
      
      // مشتریان جدید این ماه
      prisma.customer.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // مشتریان فعال (که در 30 روز گذشته سفارش داده‌اند)
      prisma.customer.count({
        where: {
          id: {
            in: (await prisma.order.findMany({
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                },
                customerId: {
                  not: null
                }
              },
              select: {
                customerId: true
              }
            })).map(order => order.customerId).filter(Boolean) as string[]
          }
        }
      }),
      
      // مشتریان VIP
      prisma.customer.count({
        where: {
          tier: 'VIP'
        }
      }),
      
      // کل سفارشات
      prisma.order.count(),
      
      // میانگین ارزش سفارش
      prisma.order.aggregate({
        _avg: {
          totalAmount: true
        }
      })
    ]);

    // آمار رشد ماهانه
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    const growthRate = lastMonthCustomers > 0 
      ? ((newCustomersThisMonth - lastMonthCustomers) / lastMonthCustomers * 100)
      : 0;

    const stats = {
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      vipCustomers,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue._avg.totalAmount || 0),
      growthRate: Math.round(growthRate * 100) / 100,
      loyaltyStats: {
        bronze: await prisma.customer.count({ where: { tier: 'Bronze' } }),
        silver: await prisma.customer.count({ where: { tier: 'Silver' } }),
        gold: await prisma.customer.count({ where: { tier: 'Gold' } }),
        vip: vipCustomers
      }
    };

    console.log('📊 Customer stats:', stats);

    return NextResponse.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Error fetching customer stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت آمار مشتریان',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
