import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, PERMISSIONS, type AuthenticatedRequest } from '@/lib/auth-middleware';

export const GET = withAuth(PERMISSIONS.ORDERS_VIEW)(async function(request: AuthenticatedRequest) {
  try {
    console.log('📦 Orders API called - fetching from database');
    console.log('🔐 User permissions:', request.user?.permissions);
    
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

    const transformedOrders = orders.map(order => ({
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      customer: {
        id: order.customerId || `temp_${order.id}`,
        name: order.customerName || 'مشتری ناشناس',
        phone: order.customerPhone || ''
      },
      items: order.items.map(item => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      type: (order as any).type || 'Dine-in',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    console.log(`📦 Found ${orders.length} orders in database`);
    
    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      total: orders.length,
      page: 1,
      limit: 20
    });

  } catch (error: any) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'خطای سرور', 
        orders: [],
        error: error.message 
      },
      { status: 500 }
    );
  }
});

export const POST = withAuth(PERMISSIONS.ORDERS_CREATE)(async function(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    console.log('📦 Creating new order:', body);
    console.log('🔐 Created by user:', request.user?.email);
    
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: body.orderNumber || `ORD-${Date.now()}`,
        customerName: body.customer.name,
        customerPhone: body.customer.phone,
        customerId: body.customer.id || null,
        customerAddress: body.customer.address || null,
        status: body.status || 'PENDING',
        type: body.type || 'Dine-in',
        totalAmount: body.totalAmount,
        paymentMethod: body.paymentMethod || null,
        notes: body.notes || null,
        items: {
          create: body.items.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || null
          }))
        }
      } as any,
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    console.log('📦 Order created successfully:', newOrder.id);
    
    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      order: {
        id: newOrder.id.toString(),
        orderNumber: newOrder.orderNumber,
        customer: {
          id: newOrder.customerId || `temp_${newOrder.id}`,
          name: newOrder.customerName || 'مشتری ناشناس',
          phone: newOrder.customerPhone || ''
        },
        items: newOrder.items.map(item => ({
          id: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        type: (newOrder as any).type || 'Dine-in',
        createdAt: newOrder.createdAt.toISOString(),
        updatedAt: newOrder.updatedAt.toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Orders creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'خطا در ثبت سفارش',
        error: error.message 
      },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(PERMISSIONS.ORDERS_UPDATE)(async function(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { orderId, status, notes } = body;
    
    console.log('📦 Updating order status:', { orderId, status });
    console.log('🔐 Updated by user:', request.user?.email);

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: 'شناسه سفارش و وضعیت الزامی است' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'وضعیت نامعتبر' },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status,
        notes: notes || undefined,
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    console.log('📦 Order status updated successfully:', updatedOrder.id);

    return NextResponse.json({
      success: true,
      message: 'وضعیت سفارش به‌روزرسانی شد',
      order: {
        id: updatedOrder.id.toString(),
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt.toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'خطا در به‌روزرسانی وضعیت سفارش',
        error: error.message 
      },
      { status: 500 }
    );
  }
});
