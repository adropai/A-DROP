import { NextRequest, NextResponse } from 'next/server';

// GET /api/kitchen/orders-simple - دریافت سفارشات ساده برای آشپزخانه
export async function GET(request: NextRequest) {
  try {
    // نمونه داده برای آشپزخانه
    const simpleOrders = [
      {
        id: '1001',
        number: 101,
        status: 'pending',
        items: [
          { name: 'پیتزا مارگاریتا', quantity: 2 },
          { name: 'نوشابه کولا', quantity: 1 }
        ],
        priority: 'normal',
        estimatedTime: 15,
        createdAt: new Date().toISOString()
      },
      {
        id: '1002', 
        number: 102,
        status: 'preparing',
        items: [
          { name: 'برگر چیز', quantity: 1 },
          { name: 'سیب زمینی سرخ شده', quantity: 1 }
        ],
        priority: 'high',
        estimatedTime: 10,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: simpleOrders,
      count: simpleOrders.length
    });

  } catch (error) {
    console.error('خطا در دریافت سفارشات آشپزخانه:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در دریافت سفارشات آشپزخانه'
      },
      { status: 500 }
    );
  }
}