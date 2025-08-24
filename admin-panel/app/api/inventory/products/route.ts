import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock products data - در پروژه واقعی از دیتابیس موجودی
    const products = [
      {
        id: '1',
        name: 'برگر کلاسیک',
        price: 85000,
        barcode: '1234567890',
        category: 'برگر',
        stock: 45, // کاهش یافته بعد از فروش
        isAvailable: true,
        lastUpdated: new Date().toISOString(),
        image: '🍔'
      },
      {
        id: '2',
        name: 'پیتزا مارگاریتا',
        price: 120000,
        barcode: '1234567891',
        category: 'پیتزا',
        stock: 28,
        isAvailable: true,
        lastUpdated: new Date().toISOString(),
        image: '🍕'
      },
      {
        id: '3',
        name: 'سیب زمینی سرخ',
        price: 35000,
        barcode: '1234567892',
        category: 'سایدها',
        stock: 95,
        isAvailable: true,
        lastUpdated: new Date().toISOString(),
        image: '🍟'
      },
      {
        id: '4',
        name: 'نوشابه کولا',
        price: 25000,
        barcode: '1234567893',
        category: 'نوشیدنی',
        stock: 75,
        isAvailable: true,
        lastUpdated: new Date().toISOString(),
        image: '🥤'
      },
      {
        id: '5',
        name: 'ساندویچ مرغ',
        price: 65000,
        barcode: '1234567894',
        category: 'ساندویچ',
        stock: 0, // ناموجود
        isAvailable: false,
        lastUpdated: new Date().toISOString(),
        image: '🥪'
      },
      {
        id: '6',
        name: 'سالاد سزار',
        price: 55000,
        barcode: '1234567895',
        category: 'سالاد',
        stock: 20,
        isAvailable: true,
        lastUpdated: new Date().toISOString(),
        image: '🥗'
      }
    ];

    return NextResponse.json({
      success: true,
      data: products,
      message: 'محصولات موجودی دریافت شد'
    });
  } catch (error) {
    console.error('Error fetching inventory products:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت محصولات موجودی',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, operation } = body;

    if (!productId || !quantity || !operation) {
      return NextResponse.json(
        {
          success: false,
          error: 'شناسه محصول، تعداد و نوع عملیات الزامی است'
        },
        { status: 400 }
      );
    }

    // Mock inventory update - در پروژه واقعی موجودی را در دیتابیس آپدیت کنید
    const updatedProduct = {
      productId,
      previousStock: operation === 'decrease' ? quantity + 10 : 10 - quantity,
      newStock: operation === 'decrease' ? 10 : 10 + quantity,
      operation,
      quantity,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: `موجودی محصول ${operation === 'decrease' ? 'کاهش' : 'افزایش'} یافت`
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی موجودی'
      },
      { status: 500 }
    );
  }
}
