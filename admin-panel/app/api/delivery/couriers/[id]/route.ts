import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/delivery/couriers/[id] - ویرایش پیک
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, phone, email, vehicleType, vehicleNumber, status, licenseNumber } = body;

    console.log(`🔄 Updating courier ${id}:`, body);

    // بررسی وجود پیک
    const existingCourier = await prisma.courier.findUnique({
      where: { id }
    });

    if (!existingCourier) {
      return NextResponse.json(
        { success: false, error: 'پیک یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی عدم تکراری بودن شماره تلفن (اگر تغییر کرده باشد)
    if (phone && phone !== existingCourier.phone) {
      const phoneExists = await prisma.courier.findFirst({
        where: {
          phone: phone,
          id: { not: id }
        }
      });

      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: 'پیکی با این شماره تلفن قبلاً ثبت شده است' },
          { status: 409 }
        );
      }
    }

    // آپدیت پیک
    const updatedCourier = await prisma.courier.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email !== undefined && { email: email || null }),
        ...(vehicleType && { vehicleType }),
        ...(status && { status }),
        updatedAt: new Date()
      }
    });

    console.log('✅ Courier updated successfully:', updatedCourier.id);

    return NextResponse.json({
      success: true,
      data: updatedCourier,
      message: 'پیک با موفقیت ویرایش شد'
    });

  } catch (error) {
    console.error('❌ خطا در ویرایش پیک:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ویرایش پیک' },
      { status: 500 }
    );
  }
}

// DELETE /api/delivery/couriers/[id] - حذف پیک
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`🗑️ Deleting courier ${id}`);

    // بررسی وجود پیک
    const existingCourier = await prisma.courier.findUnique({
      where: { id },
      include: {
        deliveries: {
          where: {
            status: {
              in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT']
            }
          }
        }
      }
    });

    if (!existingCourier) {
      return NextResponse.json(
        { success: false, error: 'پیک یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی اینکه پیک سفارش فعال ندارد
    if (existingCourier.deliveries && existingCourier.deliveries.length > 0) {
      return NextResponse.json(
        { success: false, error: 'نمی‌توان پیکی را که سفارش فعال دارد حذف کرد' },
        { status: 400 }
      );
    }

    // حذف پیک
    await prisma.courier.delete({
      where: { id }
    });

    console.log('✅ Courier deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'پیک با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ خطا در حذف پیک:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف پیک' },
      { status: 500 }
    );
  }
}

// GET /api/delivery/couriers/[id] - دریافت جزئیات پیک
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const courier = await prisma.courier.findUnique({
      where: { id },
      include: {
        deliveries: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                customerName: true,
                totalAmount: true,
                customerAddress: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!courier) {
      return NextResponse.json(
        { success: false, error: 'پیک یافت نشد' },
        { status: 404 }
      );
    }

    // محاسبه آمار
    const stats = {
      totalDeliveries: courier.deliveries?.length || 0,
      activeDeliveries: courier.deliveries?.filter(d => 
        ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
      ).length || 0,
      completedDeliveries: courier.deliveries?.filter(d => 
        d.status === 'DELIVERED'
      ).length || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        ...courier,
        stats
      }
    });

  } catch (error) {
    console.error('❌ خطا در دریافت جزئیات پیک:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت جزئیات پیک' },
      { status: 500 }
    );
  }
}
