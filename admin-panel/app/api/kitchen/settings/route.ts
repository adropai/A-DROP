import { NextRequest, NextResponse } from 'next/server';

// GET - دریافت تنظیمات آشپزخانه
export async function GET(request: NextRequest) {
  try {
    // تنظیمات پیش‌فرض آشپزخانه
    const settings = {
      autoRefreshInterval: 30,
      soundNotifications: true,
      showCustomerInfo: true,
      showTableInfo: true,
      displayMode: 'DETAILED',
      alertDelayThreshold: 15,
      maxOrdersPerView: 20,
      defaultPreparationTimes: {
        APPETIZER: 10,
        MAIN_COURSE: 25,
        DESSERT: 15,
        DRINK: 5,
        SIDE: 8
      },
      priorityColors: {
        LOW: '#52c41a',
        NORMAL: '#1890ff',
        HIGH: '#faad14',
        URGENT: '#ff4d4f'
      },
      statusColors: {
        RECEIVED: '#722ed1',
        PREPARING: '#fa8c16',
        READY: '#52c41a',
        SERVED: '#8c8c8c'
      }
    };

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('خطا در دریافت تنظیمات آشپزخانه:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت تنظیمات' },
      { status: 500 }
    );
  }
}

// PUT - به‌روزرسانی تنظیمات آشپزخانه
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // در اینجا می‌توانید تنظیمات را در دیتابیس ذخیره کنید
    // فعلاً فقط پاسخ موفقیت برمی‌گردانیم

    return NextResponse.json({
      success: true,
      message: 'تنظیمات با موفقیت به‌روزرسانی شد',
      data: body
    });

  } catch (error) {
    console.error('خطا در به‌روزرسانی تنظیمات:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در به‌روزرسانی تنظیمات' },
      { status: 500 }
    );
  }
}
