import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id; // This is actually order ID from frontend
    const body = await request.json();
    const { courierId } = body;

    console.log('🚚 Assigning courier to order:', { orderId, courierId });

    // Validate inputs
    if (!courierId) {
      return NextResponse.json(
        { success: false, error: 'Courier ID is required' },
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

    // Check if order exists
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
        include: { 
          order: true,
          courier: true
        }
      });
    } else {
      const existingDelivery = await prisma.delivery.findUnique({
        where: { id: delivery.id },
        include: { 
          order: true,
          courier: true
        }
      });
      if (!existingDelivery) {
        return NextResponse.json(
          { success: false, error: 'Delivery record corrupted' },
          { status: 500 }
        );
      }
      delivery = existingDelivery;
    }

    // Check if courier exists and is available
    const courier = await prisma.courier.findUnique({
      where: { id: courierId }
    });

    if (!courier) {
      return NextResponse.json(
        { success: false, error: 'Courier not found' },
        { status: 404 }
      );
    }

    if (courier.status !== 'AVAILABLE') {
      return NextResponse.json(
        { success: false, error: 'Courier is not available' },
        { status: 400 }
      );
    }

    // Update delivery with courier assignment
    const updatedDelivery = await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        courierId: courierId,
        status: 'ASSIGNED',
        assignedAt: new Date()
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

    // Update courier status to BUSY
    await prisma.courier.update({
      where: { id: courierId },
      data: { status: 'BUSY' }
    });

    console.log('✅ Courier assigned successfully');

    return NextResponse.json({
      success: true,
      message: 'Courier assigned successfully',
      delivery: {
        id: updatedDelivery.id,
        orderId: updatedDelivery.orderId.toString(),
        courierId: updatedDelivery.courierId,
        status: updatedDelivery.status,
        assignedAt: updatedDelivery.assignedAt?.toISOString(),
        courier: updatedDelivery.courier ? {
          id: updatedDelivery.courier.id,
          name: updatedDelivery.courier.name,
          phone: updatedDelivery.courier.phone,
          vehicleType: updatedDelivery.courier.vehicleType
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Error assigning courier:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to assign courier' },
      { status: 500 }
    );
  }
}
