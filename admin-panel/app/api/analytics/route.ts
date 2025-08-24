import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';

// GET /api/analytics - دریافت آنالیتیکس کامل
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Analytics API called');
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || dayjs().subtract(7, 'days').format('YYYY-MM-DD');
    const endDate = searchParams.get('endDate') || dayjs().format('YYYY-MM-DD');
    const type = searchParams.get('type') || 'overview'; // overview, sales, customers, menu

    const start = new Date(startDate);
    const end = new Date(endDate + 'T23:59:59');

    if (type === 'overview') {
      // آمار کلی
      const [
        totalOrders,
        totalRevenue,
        totalCustomers,
        avgOrderValue,
        salesData,
        popularItems,
        customerStats
      ] = await Promise.all([
        // تعداد کل سفارشات
        prisma.order.count({
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        }),
        
        // مجموع درآمد
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: start,
              lte: end
            },
            status: { in: ['COMPLETED', 'SERVED'] }
          },
          _sum: {
            totalAmount: true
          }
        }),
        
        // تعداد مشتریان منحصر به فرد
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          },
          select: {
            customerPhone: true
          },
          distinct: ['customerPhone']
        }),
        
        // میانگین ارزش سفارش
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          },
          _avg: {
            totalAmount: true
          }
        }),
        
        // داده‌های فروش روزانه
        getSalesData(start, end),
        
        // محبوب‌ترین محصولات
        getPopularItems(start, end),
        
        // آمار مشتریان
        getCustomerStats(start, end)
      ]);

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalCustomers: totalCustomers.length,
            avgOrderValue: avgOrderValue._avg.totalAmount || 0,
            revenueGrowth: await getGrowthRate('revenue', start, end),
            ordersGrowth: await getGrowthRate('orders', start, end)
          },
          salesData,
          popularItems,
          customerStats
        }
      });
    }

    if (type === 'sales') {
      const salesData = await getSalesData(start, end);
      return NextResponse.json({
        success: true,
        data: salesData
      });
    }

    if (type === 'customers') {
      const customerStats = await getCustomerStats(start, end);
      return NextResponse.json({
        success: true,
        data: customerStats
      });
    }

    if (type === 'menu') {
      const menuAnalytics = await getMenuAnalytics(start, end);
      return NextResponse.json({
        success: true,
        data: menuAnalytics
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid analytics type'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Analytics API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت آنالیتیکس'
    }, { status: 500 });
  }
}

// Helper Functions

async function getSalesData(start: Date, end: Date) {
  const orders = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: start,
        lte: end
      },
      status: { in: ['COMPLETED', 'SERVED'] }
    },
    _sum: {
      totalAmount: true
    },
    _count: {
      id: true
    }
  });

  // گروه‌بندی بر اساس روز
  const dailyData = new Map();
  
  orders.forEach(order => {
    const date = dayjs(order.createdAt).format('YYYY-MM-DD');
    if (dailyData.has(date)) {
      const existing = dailyData.get(date);
      dailyData.set(date, {
        date,
        amount: existing.amount + (order._sum.totalAmount || 0),
        orders: existing.orders + order._count.id,
        revenue: existing.amount + (order._sum.totalAmount || 0)
      });
    } else {
      dailyData.set(date, {
        date,
        amount: order._sum.totalAmount || 0,
        orders: order._count.id,
        revenue: order._sum.totalAmount || 0
      });
    }
  });

  return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
}

async function getPopularItems(start: Date, end: Date) {
  const popularItems = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: {
      order: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    },
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
    take: 10
  });

  // دریافت اطلاعات محصولات
  const itemsWithDetails = await Promise.all(
    popularItems.map(async (item) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });
      
      return {
        name: menuItem?.name || 'نامشخص',
        count: item._sum.quantity || 0,
        percentage: 0 // محاسبه درصد در frontend
      };
    })
  );

  // محاسبه درصد
  const totalCount = itemsWithDetails.reduce((sum, item) => sum + item.count, 0);
  return itemsWithDetails.map(item => ({
    ...item,
    percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0
  }));
}

async function getCustomerStats(start: Date, end: Date) {
  const [totalCustomers, newCustomers, activeCustomers] = await Promise.all([
    // تعداد کل مشتریان
    prisma.order.findMany({
      select: {
        customerPhone: true
      },
      distinct: ['customerPhone']
    }),
    
    // مشتریان جدید (اولین سفارش در این بازه)
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        customerPhone: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    }),
    
    // مشتریان فعال (سفارش در این بازه)
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        customerPhone: true
      },
      distinct: ['customerPhone']
    })
  ]);

  return {
    totalCustomers: totalCustomers.length,
    newCustomers: newCustomers.length,
    activeCustomers: activeCustomers.length,
    returnRate: activeCustomers.length > 0 ? 
      ((activeCustomers.length - newCustomers.length) / activeCustomers.length) * 100 : 0
  };
}

async function getMenuAnalytics(start: Date, end: Date) {
  const categoryPerformance = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: {
      order: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    },
    _sum: {
      quantity: true,
      price: true
    }
  });

  // گروه‌بندی بر اساس دسته‌بندی
  const categoryMap = new Map();
  
  for (const item of categoryPerformance) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId },
      include: { category: true }
    });
    
    if (menuItem && menuItem.category) {
      const categoryName = menuItem.category.name;
      if (categoryMap.has(categoryName)) {
        const existing = categoryMap.get(categoryName);
        categoryMap.set(categoryName, {
          category: categoryName,
          quantity: existing.quantity + (item._sum.quantity || 0),
          revenue: existing.revenue + (item._sum.price || 0)
        });
      } else {
        categoryMap.set(categoryName, {
          category: categoryName,
          quantity: item._sum.quantity || 0,
          revenue: item._sum.price || 0
        });
      }
    }
  }

  return Array.from(categoryMap.values());
}

async function getGrowthRate(type: 'revenue' | 'orders', start: Date, end: Date) {
  const currentPeriodDays = dayjs(end).diff(dayjs(start), 'day');
  const previousStart = dayjs(start).subtract(currentPeriodDays, 'day').toDate();
  const previousEnd = start;

  if (type === 'revenue') {
    const [currentRevenue, previousRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: { in: ['COMPLETED', 'SERVED'] }
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStart, lte: previousEnd },
          status: { in: ['COMPLETED', 'SERVED'] }
        },
        _sum: { totalAmount: true }
      })
    ]);

    const current = currentRevenue._sum.totalAmount || 0;
    const previous = previousRevenue._sum.totalAmount || 0;
    
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }

  if (type === 'orders') {
    const [currentOrders, previousOrders] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: previousStart, lte: previousEnd }
        }
      })
    ]);

    return previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;
  }

  return 0;
}
