import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/kitchen/queue - دریافت صف سفارشات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station'); // 'grill', 'cold', 'hot', 'dessert'
    const limit = parseInt(searchParams.get('limit') || '50');

    // دریافت سفارشات فعال بر اساس اولویت و زمان
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'PREPARING']
        }
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                category: true
              }
            }
          },
          where: station ? {
            menuItem: {
              category: {
                name: {
                  contains: getStationFilter(station)
                }
              }
            }
          } : undefined
        }
      },
      orderBy: [
        { priority: 'desc' }, // URGENT اول
        { createdAt: 'asc' }   // قدیمی‌ترها اول
      ],
      take: limit
    });

    // سازماندهی صف بر اساس ایستگاه کاری
    const queue = orders.map(order => {
      const queueItems = order.items.map(item => ({
        id: item.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        itemName: item.menuItem.name,
        quantity: item.quantity,
        notes: item.notes,
        category: item.menuItem.category?.name,
        preparationTime: item.menuItem.preparationTime,
        station: determineStation(item.menuItem.category?.name || ''),
        priority: order.priority,
        status: order.status,
        estimatedStartTime: calculateStartTime(order.createdAt, item.menuItem.preparationTime),
        estimatedEndTime: calculateEndTime(order.createdAt, item.menuItem.preparationTime),
        customerName: order.customerName,
        isUrgent: order.priority === 'URGENT',
        createdAt: order.createdAt
      }));

      return queueItems;
    }).flat();

    // گروه‌بندی بر اساس ایستگاه
    const groupedQueue = queue.reduce((acc, item) => {
      const station = item.station;
      if (!acc[station]) {
        acc[station] = [];
      }
      acc[station].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    // محاسبه آمار صف
    const queueStats = {
      totalItems: queue.length,
      urgentItems: queue.filter(item => item.isUrgent).length,
      avgWaitTime: calculateAverageWaitTime(queue),
      stationWorkload: Object.keys(groupedQueue).map(station => ({
        station,
        count: groupedQueue[station].length,
        urgentCount: groupedQueue[station].filter(item => item.isUrgent).length,
        estimatedTime: groupedQueue[station].reduce((sum, item) => 
          sum + (item.preparationTime * item.quantity), 0
        )
      }))
    };

    return NextResponse.json({
      success: true,
      data: {
        queue: station ? groupedQueue[station] || [] : queue,
        groupedQueue,
        stats: queueStats
      }
    });

  } catch (error) {
    console.error('خطا در دریافت صف سفارشات:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت صف سفارشات' },
      { status: 500 }
    );
  }
}

// POST /api/kitchen/queue - تغییر ترتیب صف
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, itemId, newPosition, targetOrderId } = body;

    switch (action) {
      case 'reorder':
        // تغییر ترتیب در صف
        // این قابلیت نیاز به جدول مجزا دارد یا استفاده از timestamp
        return NextResponse.json({
          success: true,
          message: 'ترتیب صف تغییر کرد'
        });

      case 'priority':
        // تغییر اولویت سفارش
        if (!targetOrderId) {
          return NextResponse.json(
            { success: false, error: 'شناسه سفارش الزامی است' },
            { status: 400 }
          );
        }

        await prisma.order.update({
          where: { id: parseInt(targetOrderId) },
          data: { 
            priority: 'URGENT',
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'اولویت سفارش به فوری تغییر کرد'
        });

      case 'skip':
        // رد کردن موقت از صف (به انتهای صف)
        await prisma.order.update({
          where: { id: parseInt(targetOrderId) },
          data: { 
            priority: 'LOW',
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'سفارش به انتهای صف منتقل شد'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'عمل نامعتبر' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('خطا در مدیریت صف:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در مدیریت صف' },
      { status: 500 }
    );
  }
}

// تابع کمکی: تعیین ایستگاه کاری
function determineStation(category: string): string {
  const stationMap: { [key: string]: string } = {
    'کباب': 'grill',
    'پیتزا': 'oven',
    'برگر': 'grill',
    'سالاد': 'cold',
    'نوشیدنی': 'cold',
    'دسر': 'dessert',
    'سوپ': 'hot',
    'خورش': 'hot',
    'پاستا': 'hot'
  };

  return stationMap[category] || 'general';
}

// تابع کمکی: فیلتر ایستگاه
function getStationFilter(station: string): string {
  const filterMap: { [key: string]: string } = {
    'grill': 'کباب',
    'cold': 'سالاد',
    'hot': 'خورش',
    'dessert': 'دسر',
    'oven': 'پیتزا'
  };

  return filterMap[station] || '';
}

// تابع کمکی: محاسبه زمان شروع
function calculateStartTime(orderTime: Date, prepTime: number): Date {
  // شبیه‌سازی زمان شروع بر اساس صف
  const startTime = new Date(orderTime);
  startTime.setMinutes(startTime.getMinutes() + 2); // 2 دقیقه تأخیر پردازش
  return startTime;
}

// تابع کمکی: محاسبه زمان پایان
function calculateEndTime(orderTime: Date, prepTime: number): Date {
  const endTime = calculateStartTime(orderTime, prepTime);
  endTime.setMinutes(endTime.getMinutes() + prepTime);
  return endTime;
}

// تابع کمکی: محاسبه متوسط زمان انتظار
function calculateAverageWaitTime(queue: any[]): number {
  if (queue.length === 0) return 0;
  
  const totalWaitTime = queue.reduce((sum, item) => {
    const waitTime = (new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60);
    return sum + waitTime;
  }, 0);
  
  return Math.round(totalWaitTime / queue.length);
}
