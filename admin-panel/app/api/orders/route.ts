import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    console.log('📦 Orders API called - fetching from database');

    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')
    const limitParam = url.searchParams.get('limit')

    const where: any = {}
    if (statusParam) {
      const list = statusParam.split(',').map(s => s.trim().toUpperCase())
      const valid = list.filter(s => s in OrderStatus)
      if (valid.length > 0) where.status = { in: valid as OrderStatus[] }
    }

    const take = limitParam ? Math.max(1, Math.min(parseInt(limitParam, 10) || 20, 100)) : undefined

    const orders = await prisma.order.findMany({
      where: Object.keys(where).length ? where : undefined,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        customerId: true,
        customerAddress: true,
        status: true,
        type: true,
        totalAmount: true,
        paymentMethod: true,
        notes: true,
        tableNumber: true,
        estimatedTime: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            notes: true,
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take
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
      type: order.type || 'DINE_IN',
      tableNumber: order.tableNumber,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    console.log(`📦 Found ${orders.length} orders in database`);
    
    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      total: orders.length,
      page: 1,
      limit: take || 20
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
    
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: body.orderNumber || `ORD-${Date.now()}`,
        customerName: body.customer.name,
        customerPhone: body.customer.phone,
        customerId: body.customer.id || null,
        customerAddress: body.customer.address || null,
        status: body.status || 'PENDING',
        type: body.type === 'dine-in' ? 'DINE_IN' : body.type === 'takeaway' ? 'TAKEAWAY' : body.type === 'delivery' ? 'DELIVERY' : 'DINE_IN',
        totalAmount: body.totalAmount,
        paymentMethod: body.paymentMethod || null,
        notes: body.notes || null,
        tableNumber: body.tableNumber || null,
        estimatedTime: body.estimatedTime || null,
        items: {
          create: body.items.map((item: any) => ({
            menuItemId: item.menuItemId || item.id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || null
          }))
        }
      } as any,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        customerId: true,
        status: true,
        type: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            notes: true,
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
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
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, notes } = body;
    
    console.log('📦 Updating order status:', { orderId, status });

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: 'شناسه سفارش و وضعیت الزامی است' },
        { status: 400 }
      );
    }

  const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED', 'COMPLETED', 'REFUNDED'];
    
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
      select: {
        id: true,
        orderNumber: true,
        status: true,
        updatedAt: true
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
}
