import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;
    const orderId = params.id; // This is actually order ID from frontend

    console.log(`🚚 Updating delivery status for order: ${orderId} -> ${status}`);

    // Validate status
    const validStatuses = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED', 'RETURNED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'وضعیت نامعتبر است' },
        { status: 400 }
      );
    }

    // Parse order ID
    const orderIdNum = parseInt(orderId, 10);
    if (isNaN(orderIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Find order and its delivery
    const order = await prisma.order.findUnique({
      where: { id: orderIdNum },
      include: { deliveries: true }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.type !== 'DELIVERY') {
      return NextResponse.json(
        { success: false, error: 'Order is not a delivery order' },
        { status: 400 }
      );
    }

    // Find or create delivery record
    let delivery = order.deliveries[0];
    if (!delivery) {
      delivery = await prisma.delivery.create({
        data: {
          orderId: orderIdNum,
          status: 'PENDING',
          deliveryAddress: order.customerAddress || 'آدرس نامشخص',
          deliveryFee: 0
        },
        include: { courier: true, order: true }
      });
    }

    // Update delivery status
    const updatedDelivery = await prisma.delivery.update({
      where: { id: delivery.id },
      data: { 
        status,
        // Update timestamps based on status
        ...(status === 'PICKED_UP' && { pickedUpAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
      },
      include: {
        courier: true,
        order: {
          include: {
            items: {
              include: {
                menuItem: true
              }
            }
          }
        }
      }
    });

    // Update courier status if delivery is completed or cancelled
    if ((status === 'DELIVERED' || status === 'CANCELLED' || status === 'FAILED') && delivery.courierId) {
      await prisma.courier.update({
        where: { id: delivery.courierId },
        data: { status: 'AVAILABLE' }
      });
      console.log(`📱 Courier ${delivery.courierId} set back to AVAILABLE`);
    }

    // Update order status if needed
    if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'COMPLETED' }
      });
      console.log(`📦 Order ${delivery.orderId} marked as COMPLETED`);
    } else if (status === 'CANCELLED') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'CANCELLED' }
      });
      console.log(`📦 Order ${delivery.orderId} marked as CANCELLED`);
    }

    return NextResponse.json({
      success: true,
      message: 'وضعیت با موفقیت بروزرسانی شد',
      delivery: updatedDelivery
    });

  } catch (error) {
    console.error('❌ Error updating delivery status:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'خطا در بروزرسانی وضعیت' },
      { status: 500 }
    );
  }
}
