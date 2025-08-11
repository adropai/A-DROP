import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface PrintJob {
  id: string;
  type: 'KITCHEN_ORDER' | 'RECEIPT' | 'BILL' | 'KITCHEN_SUMMARY';
  orderId: number;
  printer: string;
  station?: string;
  content: any;
  status: 'PENDING' | 'PRINTING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  printedAt?: Date;
  retryCount: number;
}

// GET /api/kitchen/print - دریافت صف چاپ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const printer = searchParams.get('printer');
    const status = searchParams.get('status') || 'ALL';
    const station = searchParams.get('station');

    // شبیه‌سازی صف چاپ (در پروژه واقعی از Redis یا جدول مجزا استفاده کنید)
    const printJobs: PrintJob[] = [];

    // دریافت سفارشات جدید که نیاز به چاپ دارند
    const newOrders = await prisma.order.findMany({
      where: {
        status: 'CONFIRMED'
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
      },
      orderBy: { createdAt: 'asc' },
      take: 20
    });

    // ایجاد job های چاپ
    newOrders.forEach(order => {
      // چاپ کلی آشپزخانه
      if (!station || station === 'general') {
        printJobs.push({
          id: `kitchen-${order.id}-${Date.now()}`,
          type: 'KITCHEN_ORDER',
          orderId: order.id,
          printer: 'kitchen-main',
          content: formatKitchenOrder(order),
          status: 'PENDING',
          createdAt: new Date(),
          retryCount: 0
        });
      }

      // چاپ جداگانه برای هر ایستگاه
      const stationItems = groupItemsByStation(order.items);
      
      Object.entries(stationItems).forEach(([stationName, items]) => {
        if (!station || station === stationName) {
          if (Array.isArray(items)) {
            printJobs.push({
              id: `station-${stationName}-${order.id}-${Date.now()}`,
              type: 'KITCHEN_ORDER',
              orderId: order.id,
              printer: `kitchen-${stationName}`,
              station: stationName,
              content: formatStationOrder(order, items, stationName),
              status: 'PENDING',
              createdAt: new Date(),
              retryCount: 0
            });
          }
        }
      });
    });

    // فیلتر بر اساس وضعیت
    const filteredJobs = status === 'ALL' ? 
      printJobs : 
      printJobs.filter(job => job.status === status);

    // آمار صف چاپ
    const printStats = {
      totalJobs: printJobs.length,
      pending: printJobs.filter(j => j.status === 'PENDING').length,
      failed: printJobs.filter(j => j.status === 'FAILED').length,
      completed: printJobs.filter(j => j.status === 'COMPLETED').length,
      printerStatus: getPrinterStatus()
    };

    return NextResponse.json({
      success: true,
      data: {
        jobs: filteredJobs,
        stats: printStats
      }
    });

  } catch (error) {
    console.error('خطا در دریافت صف چاپ:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت صف چاپ' },
      { status: 500 }
    );
  }
}

// POST /api/kitchen/print - اضافه کردن job چاپ جدید
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, type, station, printer } = body;

    // دریافت سفارش
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
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

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    let content;
    let targetPrinter = printer;

    switch (type) {
      case 'KITCHEN_ORDER':
        if (station) {
          const stationItems = groupItemsByStation(order.items);
          content = formatStationOrder(order, stationItems[station] || [], station);
          targetPrinter = `kitchen-${station}`;
        } else {
          content = formatKitchenOrder(order);
          targetPrinter = 'kitchen-main';
        }
        break;

      case 'KITCHEN_SUMMARY':
        content = formatKitchenSummary(order);
        targetPrinter = 'kitchen-main';
        break;

      case 'RECEIPT':
        content = formatReceipt(order);
        targetPrinter = 'receipt-printer';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'نوع چاپ نامعتبر' },
          { status: 400 }
        );
    }

    // شبیه‌سازی چاپ
    const printResult = await simulatePrint(content, targetPrinter);

    // آپدیت وضعیت چاپ سفارش (موقتاً غیرفعال)
    // if (printResult.success && type === 'KITCHEN_ORDER') {
    //   await prisma.order.update({
    //     where: { id: order.id },
    //     data: { printStatus: 'PRINTED' }
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: 'job چاپ اضافه شد',
      data: {
        jobId: `${type}-${orderId}-${Date.now()}`,
        printer: targetPrinter,
        printResult
      }
    });

  } catch (error) {
    console.error('خطا در اضافه کردن job چاپ:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در اضافه کردن job چاپ' },
      { status: 500 }
    );
  }
}

// PUT /api/kitchen/print - آپدیت وضعیت چاپ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, status, error: printError } = body;

    // در پروژه واقعی، وضعیت job در دیتابیس آپدیت می‌شود
    console.log(`Print job ${jobId} updated to ${status}`);

    if (printError) {
      console.error(`Print error for job ${jobId}:`, printError);
    }

    return NextResponse.json({
      success: true,
      message: 'وضعیت چاپ آپدیت شد',
      data: { jobId, status }
    });

  } catch (error) {
    console.error('خطا در آپدیت وضعیت چاپ:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در آپدیت وضعیت چاپ' },
      { status: 500 }
    );
  }
}

// DELETE /api/kitchen/print - حذف job چاپ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      // پاک کردن تمام job های تکمیل شده
      console.log('Clearing all completed print jobs');
      return NextResponse.json({
        success: true,
        message: 'تمام job های تکمیل شده پاک شدند'
      });
    }

    if (jobId) {
      console.log(`Deleting print job: ${jobId}`);
      return NextResponse.json({
        success: true,
        message: 'job چاپ حذف شد'
      });
    }

    return NextResponse.json(
      { success: false, error: 'شناسه job الزامی است' },
      { status: 400 }
    );

  } catch (error) {
    console.error('خطا در حذف job چاپ:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف job چاپ' },
      { status: 500 }
    );
  }
}

// توابع کمکی
function groupItemsByStation(items: any[]) {
  return items.reduce((acc, item) => {
    const station = determineStation(item.menuItem.category?.name || '');
    if (!acc[station]) {
      acc[station] = [];
    }
    acc[station].push(item);
    return acc;
  }, {} as Record<string, any[]>);
}

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

function formatKitchenOrder(order: any) {
  return {
    type: 'kitchen_order',
    orderNumber: order.orderNumber,
    tableNumber: order.tableNumber,
    customerName: order.customerName,
    items: order.items.map((item: any) => ({
      name: item.menuItem.name,
      quantity: item.quantity,
      notes: item.notes,
      category: item.menuItem.category?.name
    })),
    specialRequests: order.specialRequests,
    priority: order.priority,
    timestamp: new Date().toLocaleString('fa-IR')
  };
}

function formatStationOrder(order: any, items: any[], station: string) {
  return {
    type: 'station_order',
    station,
    orderNumber: order.orderNumber,
    tableNumber: order.tableNumber,
    items: items.map(item => ({
      name: item.menuItem.name,
      quantity: item.quantity,
      notes: item.notes,
      preparationTime: item.menuItem.preparationTime
    })),
    priority: order.priority,
    timestamp: new Date().toLocaleString('fa-IR')
  };
}

function formatKitchenSummary(order: any) {
  return {
    type: 'kitchen_summary',
    orderNumber: order.orderNumber,
    status: order.status,
    totalItems: order.items.length,
    completedItems: order.items.filter((item: any) => item.status === 'COMPLETED').length,
    timestamp: new Date().toLocaleString('fa-IR')
  };
}

function formatReceipt(order: any) {
  return {
    type: 'receipt',
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    items: order.items.map((item: any) => ({
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    })),
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    timestamp: new Date().toLocaleString('fa-IR')
  };
}

async function simulatePrint(content: any, printer: string) {
  // شبیه‌سازی چاپ
  console.log(`Printing to ${printer}:`, content);
  
  // شبیه‌سازی تأخیر چاپ
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // شبیه‌سازی نتیجه چاپ
  const success = Math.random() > 0.1; // 90% موفقیت
  
  return {
    success,
    printer,
    timestamp: new Date(),
    error: success ? null : 'Printer offline'
  };
}

function getPrinterStatus() {
  return {
    'kitchen-main': { status: 'online', queue: 0 },
    'kitchen-grill': { status: 'online', queue: 2 },
    'kitchen-cold': { status: 'online', queue: 1 },
    'kitchen-hot': { status: 'offline', queue: 0 },
    'kitchen-dessert': { status: 'online', queue: 0 },
    'receipt-printer': { status: 'online', queue: 3 }
  };
}
