import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cashier - دریافت اطلاعات صندوقدار
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    switch (action) {
      case 'dashboard':
        return await getCashierDashboard(date);
      
      case 'orders':
        const status = searchParams.get('status');
        const tableNumber = searchParams.get('table');
        return await getOrders(status, tableNumber, date);
      
      case 'transactions':
        const paymentMethod = searchParams.get('method');
        return await getTransactions(paymentMethod, date);
      
      case 'shift':
        return await getShiftInfo(date);
      
      default:
        return NextResponse.json(
          { success: false, error: 'عمل نامعتبر' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('خطا در دریافت اطلاعات صندوقدار:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات' },
      { status: 500 }
    );
  }
}

// POST /api/cashier - عملیات صندوقدار
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, paymentData, discountData, refundData } = body;

    switch (action) {
      case 'checkout':
        return await processCheckout(orderId, paymentData);
      
      case 'discount':
        return await applyDiscount(orderId, discountData);
      
      case 'refund':
        return await processRefund(orderId, refundData);
      
      case 'split-bill':
        return await splitBill(orderId, body.splitData);
      
      case 'print-receipt':
        return await printReceipt(orderId);
      
      default:
        return NextResponse.json(
          { success: false, error: 'عمل نامعتبر' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('خطا در عملیات صندوقدار:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در انجام عملیات' },
      { status: 500 }
    );
  }
}

// PUT /api/cashier - آپدیت اطلاعات
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, data } = body;

    switch (action) {
      case 'update-payment':
        await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: {
            paymentMethod: data.method,
            paymentStatus: data.status,
            updatedAt: new Date()
          }
        });
        break;

      case 'update-discount':
        await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: {
            discountAmount: data.amount,
            discountReason: data.reason,
            total: data.newTotal
          }
        });
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'اطلاعات آپدیت شد'
    });

  } catch (error) {
    console.error('خطا در آپدیت:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در آپدیت' },
      { status: 500 }
    );
  }
}

// توابع کمکی
async function getCashierDashboard(date: string) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // دریافت آمار روزانه
  const dailyStats = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: 'COMPLETED'
    },
    _sum: {
      total: true,
      tax: true,
      discountAmount: true
    },
    _count: {
      id: true
    }
  });

  // دریافت سفارشات آماده پرداخت
  const pendingOrders = await prisma.order.findMany({
    where: {
      status: 'READY',
      paymentStatus: 'PENDING'
    },
    include: {
      items: {
        include: {
          menuItem: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // دریافت آمار روش‌های پرداخت
  const paymentMethods = await prisma.order.groupBy({
    by: ['paymentMethod'],
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      },
      paymentStatus: 'COMPLETED'
    },
    _sum: {
      total: true
    },
    _count: {
      id: true
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      dailyStats: {
        totalSales: dailyStats._sum.total || 0,
        totalTax: dailyStats._sum.tax || 0,
        totalDiscount: dailyStats._sum.discountAmount || 0,
        orderCount: dailyStats._count.id || 0,
        avgOrderValue: dailyStats._count.id > 0 ? 
          (dailyStats._sum.total || 0) / dailyStats._count.id : 0
      },
      pendingOrders,
      paymentMethods: paymentMethods.map(method => ({
        method: method.paymentMethod,
        amount: method._sum.total || 0,
        count: method._count.id
      }))
    }
  });
}

async function getOrders(status?: string | null, tableNumber?: string | null, date?: string) {
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (tableNumber) {
    where.tableNumber = parseInt(tableNumber);
  }
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay
    };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          menuItem: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({
    success: true,
    data: { orders }
  });
}

async function getTransactions(paymentMethod?: string | null, date?: string) {
  const where: any = {
    paymentStatus: 'COMPLETED'
  };
  
  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay
    };
  }

  const transactions = await prisma.order.findMany({
    where,
    select: {
      id: true,
      orderNumber: true,
      tableNumber: true,
      total: true,
      tax: true,
      discountAmount: true,
      paymentMethod: true,
      createdAt: true,
      completedAt: true
    },
    orderBy: { completedAt: 'desc' }
  });

  return NextResponse.json({
    success: true,
    data: { transactions }
  });
}

async function getShiftInfo(date: string) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // آمار شیفت
  const shiftStats = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    _sum: {
      total: true,
      tax: true,
      discountAmount: true
    },
    _count: {
      id: true
    }
  });

  // اولین و آخرین تراکنش
  const firstTransaction = await prisma.order.findFirst({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      },
      paymentStatus: 'COMPLETED'
    },
    orderBy: { completedAt: 'asc' }
  });

  const lastTransaction = await prisma.order.findFirst({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      },
      paymentStatus: 'COMPLETED'
    },
    orderBy: { completedAt: 'desc' }
  });

  return NextResponse.json({
    success: true,
    data: {
      shiftStart: firstTransaction?.completedAt || startOfDay,
      shiftEnd: lastTransaction?.completedAt || endOfDay,
      totalSales: shiftStats._sum.total || 0,
      totalTax: shiftStats._sum.tax || 0,
      totalDiscount: shiftStats._sum.discountAmount || 0,
      orderCount: shiftStats._count.id || 0,
      netSales: (shiftStats._sum.total || 0) - (shiftStats._sum.discountAmount || 0)
    }
  });
}

async function processCheckout(orderId: number, paymentData: any) {
  const { method, amount, tips, cashReceived } = paymentData;

  // آپدیت سفارش
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentMethod: method,
      paymentStatus: 'COMPLETED',
      status: 'COMPLETED',
      tips: tips || 0,
      cashReceived: cashReceived || null,
      completedAt: new Date()
    }
  });

  // ثبت تراکنش
  // در پروژه واقعی جدول Transaction جداگانه داشته باشید

  return NextResponse.json({
    success: true,
    message: 'پرداخت با موفقیت انجام شد',
    data: {
      orderId,
      amount,
      change: cashReceived ? cashReceived - amount : 0,
      receiptNumber: `RCP-${orderId}-${Date.now()}`
    }
  });
}

async function applyDiscount(orderId: number, discountData: any) {
  const { type, value, reason } = discountData;
  
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    throw new Error('سفارش یافت نشد');
  }

  let discountAmount = 0;
  
  if (type === 'PERCENTAGE') {
    discountAmount = (order.subtotal * value) / 100;
  } else {
    discountAmount = value;
  }

  const newTotal = order.subtotal + order.tax - discountAmount;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      discountAmount,
      discountReason: reason,
      total: newTotal
    }
  });

  return NextResponse.json({
    success: true,
    message: 'تخفیف اعمال شد',
    data: {
      discountAmount,
      newTotal
    }
  });
}

async function processRefund(orderId: number, refundData: any) {
  const { amount, reason } = refundData;

  // در پروژه واقعی جدول Refund جداگانه داشته باشید
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'REFUNDED',
      refundAmount: amount,
      refundReason: reason,
      refundedAt: new Date()
    }
  });

  return NextResponse.json({
    success: true,
    message: 'بازگشت وجه انجام شد',
    data: {
      refundAmount: amount,
      refundReason: reason
    }
  });
}

async function splitBill(orderId: number, splitData: any) {
  const { parts } = splitData; // آرایه‌ای از اجزای تقسیم شده

  // در پروژه واقعی منطق پیچیده‌تری برای تقسیم صورتحساب پیاده‌سازی کنید
  
  return NextResponse.json({
    success: true,
    message: 'صورتحساب تقسیم شد',
    data: { parts }
  });
}

async function printReceipt(orderId: number) {
  // ارسال درخواست چاپ به API چاپ
  const printResponse = await fetch('/api/kitchen/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      type: 'RECEIPT'
    })
  });

  return NextResponse.json({
    success: true,
    message: 'رسید چاپ شد'
  });
}
