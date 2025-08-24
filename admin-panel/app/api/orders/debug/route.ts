import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Orders DEBUG API called');
    
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // مستقیماً بدون transformation بفرست
    const simpleOrders = orders.map(order => ({
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      customer: {
        name: order.customerName || 'Unknown',
        phone: order.customerPhone || ''
      },
      items: order.items || [],
      totalAmount: order.totalAmount,
      status: order.status,
      type: order.type,
      createdAt: order.createdAt.toISOString(),
    }));

    console.log('🔍 Sample simple order:', simpleOrders[0]);
    
    return NextResponse.json({
      success: true,
      orders: simpleOrders,
      total: orders.length
    });

  } catch (error: any) {
    console.error('🔍 DEBUG API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
