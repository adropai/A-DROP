import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let statusFilter = {};
    if (status) {
      const statusArray = status.split(',') as OrderStatus[];
      statusFilter = {
        status: {
          in: statusArray
        }
      };
    }

    const orders = await prisma.order.findMany({
      where: {
        ...statusFilter,
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سفارشات آشپزخانه' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'شناسه سفارش الزامی است' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, estimatedTime } = body;

    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
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

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating kitchen order:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی سفارش' },
      { status: 500 }
    );
  }
}
