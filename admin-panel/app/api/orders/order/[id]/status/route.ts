import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    const order = await prisma.order.update({
      where: { id: parseInt(params.id) },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی وضعیت سفارش' },
      { status: 500 }
    );
  }
}
