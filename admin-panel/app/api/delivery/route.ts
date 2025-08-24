import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/delivery - دریافت تحویل‌ها
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const courierId = searchParams.get('courierId');
    const orderId = searchParams.get('orderId');
    const date = searchParams.get('date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('دریافت تحویل‌ها با فیلترها:', { status, courierId, orderId, date });

    // ساخت شرط‌های جستجو
    const where: any = {};
    
    if (status) where.status = status;
    if (courierId) where.courierId = courierId;
    if (orderId) where.orderId = parseInt(orderId);
    
    // فیلتر تاریخ
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    // دریافت تحویل‌ها از دیتابیس
    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            items: {
              include: {
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
        },
        courier: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            vehicleDetails: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // شمارش کل تحویل‌ها
    const total = await prisma.delivery.count({ where });

    // محاسبه آمار
    const stats = await prisma.delivery.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        deliveries: deliveries.map(delivery => ({
          id: delivery.id,
          orderId: delivery.orderId.toString(),
          order: {
            id: delivery.order.id.toString(),
            orderNumber: delivery.order.orderNumber,
            totalAmount: delivery.order.totalAmount,
            status: delivery.order.status,
            customerName: delivery.order.customerName,
            customerPhone: delivery.order.customerPhone,
            customerAddress: delivery.order.customerAddress,
            notes: delivery.order.notes,
            items: delivery.order.items.map(item => ({
              id: item.id.toString(),
              name: item.menuItem.name,
              quantity: item.quantity,
              price: item.price,
              menuItem: {
                id: item.menuItem.id,
                name: item.menuItem.name
              }
            }))
          },
          courier: delivery.courier ? {
            id: delivery.courier.id,
            name: delivery.courier.name,
            phone: delivery.courier.phone,
            vehicleType: delivery.courier.vehicleType,
            vehicleDetails: delivery.courier.vehicleDetails,
            status: delivery.courier.status
          } : null,
          status: delivery.status,
          deliveryAddress: delivery.deliveryAddress,
          customerName: delivery.customerName,
          customerPhone: delivery.customerPhone,
          pickupAddress: delivery.pickupAddress,
          customerNotes: delivery.customerNotes,
          totalAmount: delivery.order.totalAmount,
          deliveryFee: delivery.deliveryFee,
          assignedAt: delivery.assignedAt,
          pickedUpAt: delivery.pickedUpAt,
          deliveredAt: delivery.deliveredAt,
          createdAt: delivery.createdAt,
          updatedAt: delivery.updatedAt,
          // Customer object for UI compatibility
          customer: {
            id: `temp_${delivery.order.id}`,
            name: delivery.customerName || delivery.order.customerName || 'مشتری ناشناس',
            phone: delivery.customerPhone || delivery.order.customerPhone || '',
            address: delivery.deliveryAddress || delivery.order.customerAddress || ''
          }
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('خطا در دریافت تحویل‌ها:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت تحویل‌ها',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// POST /api/delivery - ایجاد تحویل جدید
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('ایجاد تحویل جدید:', data);

    // اعتبارسنجی داده‌ها
    if (!data.orderId || !data.customerId || !data.pickupAddressId || !data.deliveryFee) {
      return NextResponse.json(
        { success: false, error: 'فیلدهای سفارش، مشتری، آدرس تحویل و هزینه اجباری هستند' },
        { status: 400 }
      );
    }

    // بررسی وجود سفارش
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { customer: true }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // تولید کد ردیابی یکتا
    const trackingCode = `ADR-${Date.now().toString().slice(-6)}`;

    // ایجاد تحویل جدید
    const delivery = await prisma.delivery.create({
      data: {
        orderId: data.orderId,
        customerId: data.customerId,
        courierId: data.courierId || null,
        type: data.type || 'DELIVERY',
        status: 'PENDING',
        pickupAddressId: data.pickupAddressId,
        deliveryAddressId: data.deliveryAddressId || null,
        distance: data.distance || null,
        estimatedTime: data.estimatedTime || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        deliveryFee: parseFloat(data.deliveryFee),
        tip: parseFloat(data.tip || '0'),
        totalAmount: parseFloat(data.totalAmount || data.deliveryFee),
        instructions: data.instructions || null,
        notes: data.notes || null,
        priority: parseInt(data.priority || '1'),
        trackingCode: trackingCode
      },
      include: {
        order: true,
        customer: true,
        courier: true,
        pickupAddress: true,
        deliveryAddress: true
      }
    });

    return NextResponse.json({
      success: true,
      data: delivery,
      message: 'تحویل با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('خطا در ایجاد تحویل:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ایجاد تحویل',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// PUT /api/delivery - بروزرسانی تحویل
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    console.log('بروزرسانی تحویل:', { id, updateData });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه تحویل اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود تحویل
    const existingDelivery = await prisma.delivery.findUnique({
      where: { id: id }
    });

    if (!existingDelivery) {
      return NextResponse.json(
        { success: false, error: 'تحویل یافت نشد' },
        { status: 404 }
      );
    }

    // آپدیت زمان‌های خاص بر اساس تغییر وضعیت
    const timeUpdates: any = {};
    
    if (updateData.status === 'ASSIGNED' && !existingDelivery.assignedAt) {
      timeUpdates.assignedAt = new Date();
    } else if (updateData.status === 'PICKED_UP' && !existingDelivery.pickedUpAt) {
      timeUpdates.pickedUpAt = new Date();
    } else if (updateData.status === 'DELIVERED' && !existingDelivery.deliveredAt) {
      timeUpdates.deliveredAt = new Date();
    }

    // بروزرسانی تحویل
    const updatedDelivery = await prisma.delivery.update({
      where: { id: id },
      data: {
        ...updateData,
        ...timeUpdates,
        deliveryFee: updateData.deliveryFee ? parseFloat(updateData.deliveryFee) : undefined,
        tip: updateData.tip ? parseFloat(updateData.tip) : undefined,
        totalAmount: updateData.totalAmount ? parseFloat(updateData.totalAmount) : undefined,
        scheduledAt: updateData.scheduledAt ? new Date(updateData.scheduledAt) : undefined,
        updatedAt: new Date()
      },
      include: {
        order: true,
        customer: true,
        courier: true,
        pickupAddress: true,
        deliveryAddress: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedDelivery,
      message: 'تحویل با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی تحویل:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی تحویل',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/delivery - لغو تحویل
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('لغو تحویل:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه تحویل اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود تحویل
    const existingDelivery = await prisma.delivery.findUnique({
      where: { id: id }
    });

    if (!existingDelivery) {
      return NextResponse.json(
        { success: false, error: 'تحویل یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی امکان لغو
    if (existingDelivery.status === 'DELIVERED') {
      return NextResponse.json(
        { success: false, error: 'تحویل انجام شده قابل لغو نیست' },
        { status: 400 }
      );
    }

    // به جای حذف، وضعیت را به لغو شده تغییر می‌دهیم
    const cancelledDelivery = await prisma.delivery.update({
      where: { id: id },
      data: {
        status: 'CANCELLED',
        notes: existingDelivery.notes ? 
          `${existingDelivery.notes}\n\nلغو شده در: ${new Date().toLocaleString('fa-IR')}` : 
          `لغو شده در: ${new Date().toLocaleString('fa-IR')}`,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: cancelledDelivery,
      message: 'تحویل با موفقیت لغو شد'
    });

  } catch (error) {
    console.error('خطا در لغو تحویل:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در لغو تحویل',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
