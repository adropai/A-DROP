import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // شبیه‌سازی تأخیر API
    await new Promise(resolve => setTimeout(resolve, 150))

    const orders = [
      {
        id: '1',
        orderNumber: '#1234',
        customerName: 'احمد محمدی',
        customerAvatar: null,
        items: ['چلو کباب کوبیده', 'نوشابه', 'سالاد شیرازی'],
        total: 485000,
        status: 'preparing',
        type: 'dine-in',
        time: '14:30',
        estimatedTime: 15,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        orderNumber: '#1235',
        customerName: 'فاطمه احمدی',
        customerAvatar: null,
        items: ['پیتزا مخصوص', 'آبمیوه'],
        total: 320000,
        status: 'confirmed',
        type: 'delivery',
        time: '14:25',
        estimatedTime: 25,
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        orderNumber: '#1236',
        customerName: 'علی رضایی',
        customerAvatar: null,
        items: ['برگر مخصوص', 'سیب زمینی', 'کوکاکولا'],
        total: 280000,
        status: 'ready',
        type: 'takeaway',
        time: '14:20',
        estimatedTime: null,
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        orderNumber: '#1237',
        customerName: 'مریم کریمی',
        customerAvatar: null,
        items: ['جوجه کباب', 'برنج زعفرانی'],
        total: 420000,
        status: 'pending',
        type: 'dine-in',
        time: '14:35',
        estimatedTime: 20,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        orderNumber: '#1238',
        customerName: 'محسن نوری',
        customerAvatar: null,
        items: ['قرمه سبزی', 'برنج', 'دوغ'],
        total: 180000,
        status: 'preparing',
        type: 'delivery',
        time: '14:15',
        estimatedTime: 30,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        orderNumber: '#1239',
        customerName: 'زهرا امینی',
        customerAvatar: null,
        items: ['کباب برگ', 'برنج', 'سالاد'],
        total: 550000,
        status: 'confirmed',
        type: 'dine-in',
        time: '14:40',
        estimatedTime: 18,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        orders,
        total: orders.length,
        lastUpdate: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت سفارشات اخیر',
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status } = await request.json()
    
    // شبیه‌سازی تأخیر API
    await new Promise(resolve => setTimeout(resolve, 200))

    // شبیه‌سازی تغییر وضعیت سفارش
    console.log(`تغییر وضعیت سفارش ${orderId} به ${status}`)

    return NextResponse.json({
      success: true,
      message: 'وضعیت سفارش با موفقیت تغییر کرد',
      data: {
        orderId,
        status,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در تغییر وضعیت سفارش',
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    )
  }
}
