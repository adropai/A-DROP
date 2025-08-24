import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items, specialInstructions, priority = 'NORMAL' } = body;

    // Mock response - در پروژه واقعی از دیتابیس استفاده کنید
    const ticket = {
      id: Date.now(),
      orderId,
      items,
      specialInstructions,
      priority,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error creating kitchen ticket:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد تیکت آشپزخانه' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock data - در پروژه واقعی از دیتابیس استفاده کنید
    const tickets = [
      {
        id: 1,
        orderId: 1,
        items: [
          { name: 'کباب کوبیده', quantity: 2 },
          { name: 'چلو', quantity: 2 }
        ],
        specialInstructions: 'بدون پیاز',
        priority: 'HIGH',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(tickets.filter(t => t.status === status).slice(0, limit));
  } catch (error) {
    console.error('Error fetching kitchen tickets:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تیکت‌های آشپزخانه' },
      { status: 500 }
    );
  }
}