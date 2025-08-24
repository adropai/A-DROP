import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data - در پروژه واقعی از دیتابیس استفاده کنید
    const orders = [
      {
        id: '1',
        orderNumber: 'CSH-2024-001',
        items: [
          { name: 'برگر کلاسیک', quantity: 2, price: 85000 },
          { name: 'سیب زمینی', quantity: 1, price: 35000 }
        ],
        subtotal: 205000,
        discount: 10250,
        tax: 17527.5,
        total: 212277.5,
        paymentMethod: 'card',
        customer: 'احمد محمدی',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        orderNumber: 'CSH-2024-002',
        items: [
          { name: 'پیتزا مارگاریتا', quantity: 1, price: 120000 }
        ],
        subtotal: 120000,
        discount: 0,
        tax: 10800,
        total: 130800,
        paymentMethod: 'cash',
        customer: 'فاطمه احمدی',
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: orders,
      message: 'سفارشات صندوق با موفقیت دریافت شد'
    });
  } catch (error) {
    console.error('Error in cashier orders API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت سفارشات صندوق',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      items, 
      customer, 
      paymentMethod, 
      discount, 
      subtotal, 
      tax, 
      total 
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'آیتم‌های سفارش الزامی است'
        },
        { status: 400 }
      );
    }

    // Mock order creation - در پروژه واقعی در دیتابیس ذخیره کنید
    const newOrder = {
      id: Date.now().toString(),
      orderNumber: `CSH-2024-${String(Date.now()).slice(-6)}`,
      items,
      customer: customer || 'مشتری عمومی',
      paymentMethod: paymentMethod || 'cash',
      discount: discount || 0,
      totalAmount: total,
      tax,
      total,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newOrder,
      message: 'سفارش با موفقیت ثبت شد'
    });
  } catch (error) {
    console.error('Error creating cashier order:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ثبت سفارش'
      },
      { status: 500 }
    );
  }
}
