import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orderId,
      orderNumber,
      tableNumber,
      waiterName,
      items,
      subtotal,
      discount,
      tax,
      total,
      paymentMethods,
      customerInfo,
      cashierName
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

    const receiptNumber = `RCP-${String(Date.now()).slice(-8)}`
    const paymentTime = new Date()

    // اگر orderId معتبر و عددی بود، وضعیت پرداخت سفارش را در DB به‌روزرسانی کن
    let updatedOrder: any = null
    const methodLabel = Array.isArray(paymentMethods) && paymentMethods.length > 0
      ? paymentMethods.map((m: any) => m.type).join('+')
      : undefined

    const numericOrderId = orderId && /^\d+$/.test(String(orderId)) ? Number(orderId) : null
    if (numericOrderId) {
      updatedOrder = await prisma.order.update({
        where: { id: numericOrderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paymentMethod: methodLabel,
          // در صورت نیاز می‌توان status را هم کامل کرد: status: 'COMPLETED' as any
        }
      })
    }

    // TODO: ثبت رکورد پرداخت جداگانه در صورت اضافه‌شدن مدل Payment
    // TODO: کسر موجودی (Inventory) در صورت فعال‌بودن این منطق

    return NextResponse.json({
      success: true,
      data: {
        id: `PAY-${Date.now()}`,
        orderId,
        orderNumber,
        tableNumber,
        waiterName,
        items,
        totalAmount: total,
        discount,
        tax,
        total,
        paymentMethods,
        customerInfo,
        cashierName,
        status: 'COMPLETED',
        paymentTime: paymentTime.toISOString(),
        receiptNumber,
        order: updatedOrder ? { id: String(updatedOrder.id), paymentStatus: updatedOrder.paymentStatus } : null
      },
      message: 'پرداخت با موفقیت ثبت شد'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در پردازش پرداخت',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // تاریخچه پرداخت‌ها از سفارش‌هایی که پرداخت‌شان کامل شده
    const recentPaid = await prisma.order.findMany({
      where: { paymentStatus: PaymentStatus.COMPLETED },
      take: 20,
      orderBy: { updatedAt: 'desc' }
    })

    const payments = recentPaid.map((o) => ({
      id: `PAY-${o.id}`,
      orderId: String(o.id),
      orderNumber: o.orderNumber,
      tableNumber: o.tableNumber ?? null,
      total: o.totalAmount,
      paymentMethod: o.paymentMethod || 'UNKNOWN',
      cashierName: 'سیستم',
      paymentTime: o.updatedAt.toISOString(),
      receiptNumber: `RCP-${String(o.id).padStart(8, '0')}`
    }))

    return NextResponse.json({
      success: true,
      data: payments,
      message: 'تاریخچه پرداخت‌ها دریافت شد'
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت تاریخچه پرداخت‌ها'
      },
      { status: 500 }
    );
  }
}
