import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, OrderType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    console.log('🚚 Delivery API called - fetching delivery orders');

    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')
    const limitParam = url.searchParams.get('limit')

    const take = limitParam ? Math.max(1, Math.min(parseInt(limitParam, 10) || 20, 100)) : undefined

    // اول سفارشات delivery را از جدول Order بگیریم
    const deliveryOrders = await prisma.order.findMany({
      where: {
        type: 'DELIVERY', // تصحیح: uppercase
        // همه سفارشات delivery شامل تحویل شده و لغو شده
        status: {
          in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] 
        }
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
      take
    });

    console.log(`🚚 Found ${deliveryOrders.length} delivery orders in database`);

    // تبدیل سفارشات برای نمایش در صفحه delivery
    const transformedDeliveries = await Promise.all(deliveryOrders.map(async order => {
      // Check if this order has an actual delivery record
      const existingDelivery = await prisma.delivery.findFirst({
        where: { orderId: order.id },
        include: { courier: true }
      });

      return {
        id: order.id.toString(),
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
        courierId: existingDelivery?.courierId || null,
        courier: existingDelivery?.courier ? {
          id: existingDelivery.courier.id,
          name: existingDelivery.courier.name,
          phone: existingDelivery.courier.phone,
          vehicleType: existingDelivery.courier.vehicleType,
          status: existingDelivery.courier.status
        } : null,
        customer: {
          id: order.customerId || `temp_${order.id}`,
          name: order.customerName || 'مشتری ناشناس',
          phone: order.customerPhone || ''
        },
        status: existingDelivery?.status || (() => {
          switch (order.status) {
            case 'COMPLETED': return 'DELIVERED';
            case 'CANCELLED': return 'CANCELLED';
            case 'READY': return 'PENDING';
            default: return order.status.toLowerCase();
          }
        })(),
        deliveryAddress: order.customerAddress || 'آدرس نامشخص',
        estimatedDeliveryTime: existingDelivery?.estimatedDeliveryTime?.toISOString() || null,
        actualDeliveryTime: existingDelivery?.actualDeliveryTime?.toISOString() || null,
        totalAmount: order.totalAmount,
        deliveryFee: existingDelivery?.deliveryFee || 0,
        notes: existingDelivery?.notes || order.notes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        order: {
          id: order.id.toString(),
          orderNumber: order.orderNumber,
          type: order.type,
          status: order.status,
          items: order.items.map(item => ({
            id: item.id.toString(),
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.price,
            menuItemId: item.menuItemId
          }))
        }
      };
    }));

    console.log(`🚚 Found ${transformedDeliveries.length} delivery orders in database`);

    return NextResponse.json({
      success: true,
      message: 'Deliveries retrieved successfully',
      deliveries: transformedDeliveries,
      data: transformedDeliveries,
      count: transformedDeliveries.length
    });

  } catch (error) {
    console.error('❌ Delivery API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🚚 Creating delivery assignment:', body);

    const { orderId, courierId, estimatedDeliveryTime, notes } = body;

    // Validate orderId format and convert
    let orderIdNum: number;
    if (typeof orderId === 'string') {
      orderIdNum = parseInt(orderId, 10);
      if (isNaN(orderIdNum)) {
        return NextResponse.json(
          { success: false, error: 'Invalid order ID format' },
          { status: 400 }
        );
      }
    } else if (typeof orderId === 'number') {
      orderIdNum = orderId;
    } else {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderIdNum },
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
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if courier exists (if provided)
    if (courierId) {
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
    }

    // Check if delivery already exists for this order
    const existingDelivery = await prisma.delivery.findFirst({
      where: { orderId: orderIdNum }
    });

    if (existingDelivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery already exists for this order' },
        { status: 400 }
      );
    }

    // Create delivery
    const delivery = await prisma.delivery.create({
      data: {
        orderId: orderIdNum,
        courierId: courierId || null,
        status: courierId ? 'ASSIGNED' : 'PENDING',
        deliveryAddress: order.customerAddress || 'آدرس نامشخص',
        estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null,
        notes: notes || null,
        deliveryFee: 0 // Default delivery fee
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

    // Update courier status if assigned
    if (courierId) {
      await prisma.courier.update({
        where: { id: courierId },
        data: { status: 'BUSY' }
      });
    }

    // Update order status to indicate it's assigned for delivery
    await prisma.order.update({
      where: { id: orderIdNum },
      data: { status: 'PREPARING' }
    });

    console.log('✅ Delivery created successfully:', delivery.id);

    return NextResponse.json({
      success: true,
      message: 'Delivery created successfully',
      delivery: {
        id: delivery.id,
        orderId: delivery.orderId.toString(),
        courierId: delivery.courierId,
        status: delivery.status,
        deliveryAddress: delivery.deliveryAddress,
        estimatedDeliveryTime: delivery.estimatedDeliveryTime?.toISOString(),
        notes: delivery.notes,
        createdAt: delivery.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error creating delivery:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create delivery' },
      { status: 500 }
    );
  }
}
