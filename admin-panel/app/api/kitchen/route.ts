import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/kitchen - دریافت سفارشات آشپزخانه
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const tableId = searchParams.get('tableId');
    const category = searchParams.get('category');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('دریافت سفارشات آشپزخانه:', { status, priority, tableId, category });

    // ساخت فیلتر برای سفارشات
    const where: any = {
      status: {
        in: ['CONFIRMED', 'PREPARING', 'READY'] // فقط سفارشات فعال آشپزخانه
      }
    };

    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (tableId) {
      where.tableNumber = parseInt(tableId);
    }

    // دریافت سفارشات با آیتم‌ها
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              menuItem: {
                include: {
                  category: true
                }
              }
            }
          },
          customer: true
        },
        orderBy: [
          { priority: 'desc' }, // URGENT اول
          { createdAt: 'asc' }   // قدیمی‌ترها اول
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    // محاسبه آمار
    const [
      pendingCount,
      preparingCount,
      readyCount,
      urgentCount,
      avgPreparationTime
    ] = await Promise.all([
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.order.count({ where: { status: 'READY' } }),
      prisma.order.count({ where: { priority: 'URGENT' } }),
      prisma.order.aggregate({
        _avg: { totalAmount: true }, // تقریبی برای زمان آماده‌سازی
        where: { status: 'DELIVERED' }
      })
    ]);

    // تبدیل سفارشات برای آشپزخانه
    const kitchenOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || order.customer?.name || 'مشتری ناشناس',
      customerPhone: order.customerPhone || order.customer?.phone,
      tableNumber: order.tableNumber,
      status: order.status,
      priority: order.priority,
      totalAmount: order.totalAmount,
      notes: order.notes,
      items: order.items.map(item => ({
        id: item.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        notes: item.notes,
        category: item.menuItem.category?.name,
        preparationTime: item.menuItem.preparationTime,
        price: item.price
      })),
      estimatedTime: calculateEstimatedTime(order.items),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: kitchenOrders,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        total: totalCount,
        pending: pendingCount,
        preparing: preparingCount,
        ready: readyCount,
        urgent: urgentCount,
        avgPreparationTime: Math.round((avgPreparationTime._avg.totalAmount || 0) / 10) // تقریبی
      }
    });

  } catch (error) {
    console.error('خطا در دریافت سفارشات آشپزخانه:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت سفارشات آشپزخانه' },
      { status: 500 }
    );
  }
}

// PUT /api/kitchen - بروزرسانی وضعیت سفارش
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, estimatedTime, notes, assignedTo } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'شناسه سفارش و وضعیت الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود سفارش
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // بروزرسانی سفارش
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status,
        notes: notes || existingOrder.notes,
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // اگر سفارش آماده شد، اطلاع‌رسانی ارسال کن
    if (status === 'READY') {
      await sendOrderReadyNotification(updatedOrder);
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `وضعیت سفارش به ${getStatusLabel(status)} تغییر کرد`
    });

  } catch (error) {
    console.error('خطا در بروزرسانی سفارش:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بروزرسانی سفارش' },
      { status: 500 }
    );
  }
}

// POST /api/kitchen - عملیات batch (چندین سفارش همزمان)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderIds, status, priority } = body;

    if (!action || !orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { success: false, error: 'عمل و لیست سفارشات الزامی است' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'updateStatus':
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'وضعیت الزامی است' },
            { status: 400 }
          );
        }
        
        result = await prisma.order.updateMany({
          where: { id: { in: orderIds.map(id => parseInt(id)) } },
          data: { status, updatedAt: new Date() }
        });
        break;

      case 'updatePriority':
        if (!priority) {
          return NextResponse.json(
            { success: false, error: 'اولویت الزامی است' },
            { status: 400 }
          );
        }
        
        result = await prisma.order.updateMany({
          where: { id: { in: orderIds.map(id => parseInt(id)) } },
          data: { priority, updatedAt: new Date() }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'عمل نامعتبر' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${result.count} سفارش بروزرسانی شد`
    });

  } catch (error) {
    console.error('خطا در عملیات batch:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در عملیات batch' },
      { status: 500 }
    );
  }
}

// تابع کمکی: محاسبه زمان تخمینی
function calculateEstimatedTime(items: any[]): number {
  if (!items || items.length === 0) return 15; // پیش‌فرض 15 دقیقه
  
  const totalTime = items.reduce((sum, item) => {
    const itemTime = item.menuItem?.preparationTime || 10; // پیش‌فرض 10 دقیقه
    return sum + (itemTime * item.quantity);
  }, 0);
  
  // حداکثر زمان برای آیتم‌های موازی + 5 دقیقه buffer
  const maxTime = Math.max(...items.map(item => 
    (item.menuItem?.preparationTime || 10) * item.quantity
  ));
  
  return Math.min(totalTime, maxTime + 5);
}

// تابع کمکی: ارسال اطلاع‌رسانی
async function sendOrderReadyNotification(order: any) {
  // پیاده‌سازی اطلاع‌رسانی (SMS، Push notification، etc.)
  console.log(`🔔 سفارش ${order.orderNumber} آماده است - میز ${order.tableNumber}`);
  
  // TODO: اتصال به سیستم اطلاع‌رسانی
  // await sendSMS(order.customerPhone, `سفارش شما آماده است`);
  // await sendWebSocketNotification('order_ready', order);
}

// تابع کمکی: برچسب وضعیت
function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'CONFIRMED': 'تأیید شده',
    'PREPARING': 'در حال آماده‌سازی',
    'READY': 'آماده',
    'DELIVERED': 'تحویل داده شده',
    'CANCELLED': 'لغو شده'
  };
  
  return labels[status] || status;
}
