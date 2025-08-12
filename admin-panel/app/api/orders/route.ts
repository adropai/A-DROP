import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📦 Orders API called - fetching from database');
    
    // Get orders from database with related data
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

    // Transform orders to match frontend expected format
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
      type: (order as any).type || 'Dine-in', // Use type from database
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📦 Creating new order:', body);
    
    // Create order with items in database
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

    console.log('📦 New order created with ID:', newOrder.id);
    
    // Transform to match frontend format
    const transformedOrder = {
      id: newOrder.id.toString(),
      orderNumber: newOrder.orderNumber,
      customer: {
        id: newOrder.customerId || `temp_${newOrder.id}`,
        name: newOrder.customerName || '',
        phone: newOrder.customerPhone || ''
      },
      items: (newOrder as any).items?.map((item: any) => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.price
      })) || [],
      totalAmount: newOrder.totalAmount,
      status: newOrder.status,
      type: (newOrder as any).type || 'Dine-in',
      createdAt: newOrder.createdAt.toISOString(),
      updatedAt: newOrder.updatedAt.toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'سفارش جدید ایجاد شد',
      order: transformedOrder
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'خطا در ایجاد سفارش',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
