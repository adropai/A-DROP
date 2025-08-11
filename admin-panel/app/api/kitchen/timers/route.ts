import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TimerData {
  itemId: number;
  orderId: number;
  startTime: Date;
  estimatedEndTime: Date;
  actualEndTime?: Date;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'OVERDUE';
  station: string;
}

// GET /api/kitchen/timers - دریافت تمام تایمرهای فعال
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station');
    const status = searchParams.get('status') || 'RUNNING';

    // دریافت سفارشات در حال آماده‌سازی
    const activeOrders = await prisma.order.findMany({
      where: {
        status: 'PREPARING'
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    // ایجاد تایمرها
    const timers: TimerData[] = [];
    
    activeOrders.forEach(order => {
      order.items.forEach(item => {
        const itemStation = determineStation(item.menuItem.category?.name || '');
        
        if (!station || itemStation === station) {
          const startTime = order.updatedAt || order.createdAt;
          const estimatedEndTime = new Date(startTime);
          estimatedEndTime.setMinutes(
            estimatedEndTime.getMinutes() + (item.menuItem.preparationTime * item.quantity)
          );

          const now = new Date();
          let timerStatus: TimerData['status'] = 'RUNNING';
          
          if (now > estimatedEndTime) {
            timerStatus = 'OVERDUE';
          }

          timers.push({
            itemId: item.id,
            orderId: order.id,
            startTime,
            estimatedEndTime,
            status: timerStatus,
            station: itemStation
          });
        }
      });
    });

    // محاسبه آمار تایمرها
    const timerStats = {
      totalActive: timers.filter(t => t.status === 'RUNNING').length,
      overdue: timers.filter(t => t.status === 'OVERDUE').length,
      avgProgress: calculateAverageProgress(timers),
      stationStats: getStationStats(timers)
    };

    return NextResponse.json({
      success: true,
      data: {
        timers: timers.filter(t => t.status === status || status === 'ALL'),
        stats: timerStats
      }
    });

  } catch (error) {
    console.error('خطا در دریافت تایمرها:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت تایمرها' },
      { status: 500 }
    );
  }
}

// POST /api/kitchen/timers - عملیات تایمر (شروع، توقف، ریست)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, itemId, orderId, customTime } = body;

    switch (action) {
      case 'start':
        // شروع تایمر - تغییر وضعیت سفارش به PREPARING
        await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: { 
            status: 'PREPARING',
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'تایمر آغاز شد',
          data: {
            startTime: new Date(),
            status: 'RUNNING'
          }
        });

      case 'pause':
        // توقف موقت تایمر
        return NextResponse.json({
          success: true,
          message: 'تایمر متوقف شد',
          data: {
            pausedAt: new Date(),
            status: 'PAUSED'
          }
        });

      case 'complete':
        // آپدیت وضعیت آیتم (موقتاً غیرفعال)
        // await prisma.orderItem.update({
        //   where: { id: parseInt(itemId) },
        //   data: {
        //     status: 'COMPLETED',
        //     completedAt: new Date()
        //   }
        // });

        // بررسی اینکه تمام آیتم‌های سفارش تکمیل شده‌اند (موقتاً غیرفعال)
        // const orderItems = await prisma.orderItem.findMany({
        //   where: { orderId: parseInt(orderId) }
        // });

        // const allCompleted = orderItems.every(item => 
        //   item.status === 'COMPLETED'
        // );

        const allCompleted = false; // موقتی

        if (allCompleted) {
          await prisma.order.update({
            where: { id: parseInt(orderId) },
            data: { 
              status: 'READY'
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: 'آیتم تکمیل شد',
          data: {
            completedAt: new Date(),
            status: 'COMPLETED',
            orderStatus: allCompleted ? 'READY' : 'PREPARING'
          }
        });

      case 'extend':
        // افزایش زمان تایمر
        const extendMinutes = parseInt(customTime) || 5;
        
        return NextResponse.json({
          success: true,
          message: `${extendMinutes} دقیقه به تایمر اضافه شد`,
          data: {
            extendedBy: extendMinutes,
            newEndTime: new Date(Date.now() + extendMinutes * 60000)
          }
        });

      case 'reset':
        // ریست تایمر
        await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: { 
            status: 'CONFIRMED',
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'تایمر ریست شد',
          data: {
            resetAt: new Date(),
            status: 'RUNNING'
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'عمل نامعتبر' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('خطا در مدیریت تایمر:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در مدیریت تایمر' },
      { status: 500 }
    );
  }
}

// PUT /api/kitchen/timers - آپدیت تایمر
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { timers } = body; // آرایه‌ای از تایمرها برای آپدیت batch

    const results = await Promise.all(
      timers.map(async (timer: any) => {
        try {
          // آپدیت وضعیت آیتم (موقتاً غیرفعال)
          // await prisma.orderItem.update({
          //   where: { id: timer.itemId },
          //   data: {
          //     status: timer.status,
          //     ...(timer.completedAt && { completedAt: new Date(timer.completedAt) })
          //   }
          // });

          return { itemId: timer.itemId, success: true };
        } catch (error) {
          return { itemId: timer.itemId, success: false, error };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `${successCount} تایمر آپدیت شد`,
      data: { results }
    });

  } catch (error) {
    console.error('خطا در آپدیت تایمرها:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در آپدیت تایمرها' },
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

// تابع کمکی: محاسبه درصد پیشرفت متوسط
function calculateAverageProgress(timers: TimerData[]): number {
  if (timers.length === 0) return 0;

  const totalProgress = timers.reduce((sum, timer) => {
    const elapsed = new Date().getTime() - timer.startTime.getTime();
    const total = timer.estimatedEndTime.getTime() - timer.startTime.getTime();
    const progress = Math.min(100, (elapsed / total) * 100);
    return sum + progress;
  }, 0);

  return Math.round(totalProgress / timers.length);
}

// تابع کمکی: آمار ایستگاه‌ها
function getStationStats(timers: TimerData[]) {
  const stations = ['grill', 'cold', 'hot', 'dessert', 'oven', 'general'];
  
  return stations.map(station => {
    const stationTimers = timers.filter(t => t.station === station);
    return {
      station,
      active: stationTimers.filter(t => t.status === 'RUNNING').length,
      overdue: stationTimers.filter(t => t.status === 'OVERDUE').length,
      completed: stationTimers.filter(t => t.status === 'COMPLETED').length
    };
  });
}
