import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // Generate receipt data
    const receipt = {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      items: order.items.map(item => ({
        name: item.menuItem?.name || 'آیتم ناشناخته',
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      subtotal: order.subtotal,
      tax: order.tax || 0,
      total: order.total,
      paymentMethod: order.paymentMethod || 'نقدی',
      status: order.status
    };

    return NextResponse.json({
      success: true,
      receipt
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'خطا در تولید رسید' },
      { status: 500 }
    );
  }
}
