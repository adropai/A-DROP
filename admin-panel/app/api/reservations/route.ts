import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reservations - دریافت رزروها
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const tableId = searchParams.get('tableId');
    const customerPhone = searchParams.get('customerPhone');
    const upcoming = searchParams.get('upcoming') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('دریافت رزروها با فیلترها:', { status, date, tableId, customerPhone, upcoming });
    
    // ساخت شرط‌های جستجو
    const where: any = {};
    
    if (status) where.status = status;
    if (tableId) where.tableId = tableId;
    if (customerPhone) where.customerPhone = { contains: customerPhone };
    
    // فیلتر تاریخ
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.reservationDate = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    
    // فیلتر رزروهای آینده
    if (upcoming) {
      where.reservationDate = {
        gte: new Date()
      };
    }

    // دریافت رزروها از دیتابیس
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
            location: true,
            type: true
          }
        }
      },
      orderBy: {
        reservationDate: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // شمارش کل رزروها
    const total = await prisma.reservation.count({ where });

    // محاسبه آمار
    const stats = await prisma.reservation.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        reservationDate: {
          gte: new Date()
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        reservations,
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
    console.error('خطا در دریافت رزروها:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت رزروها',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// POST /api/reservations - ایجاد رزرو جدید
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('ایجاد رزرو جدید:', data);

    // اعتبارسنجی داده‌ها
    if (!data.tableId || !data.customerName || !data.customerPhone || !data.reservationDate || !data.partySize) {
      return NextResponse.json(
        { success: false, error: 'فیلدهای میز، نام مشتری، تلفن، تاریخ و تعداد نفرات اجباری هستند' },
        { status: 400 }
      );
    }

    // بررسی ظرفیت میز
    const table = await prisma.table.findUnique({
      where: { id: data.tableId }
    });

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'میز یافت نشد' },
        { status: 404 }
      );
    }

    if (data.partySize > table.capacity) {
      return NextResponse.json(
        { success: false, error: `ظرفیت میز ${table.capacity} نفر است` },
        { status: 400 }
      );
    }

    // بررسی تداخل رزرو
    const reservationDate = new Date(data.reservationDate);
    const startTime = new Date(data.startTime || data.reservationDate);
    const endTime = new Date(data.endTime || new Date(startTime.getTime() + 2 * 60 * 60 * 1000)); // 2 ساعت پیش‌فرض

    const conflictingReservation = await prisma.reservation.findFirst({
      where: {
        tableId: data.tableId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [
          {
            startTime: {
              lt: endTime
            }
          },
          {
            endTime: {
              gt: startTime
            }
          }
        ]
      }
    });

    if (conflictingReservation) {
      return NextResponse.json(
        { success: false, error: 'میز در این زمان قبلاً رزرو شده است' },
        { status: 400 }
      );
    }

    // ایجاد رزرو جدید
    const reservation = await prisma.reservation.create({
      data: {
        tableId: data.tableId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        partySize: parseInt(data.partySize),
        reservationDate: reservationDate,
        startTime: startTime,
        endTime: endTime,
        status: data.status || 'PENDING',
        notes: data.notes || null
      },
      include: {
        table: {
          select: {
            number: true,
            capacity: true,
            location: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: reservation,
      message: 'رزرو با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('خطا در ایجاد رزرو:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ایجاد رزرو',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// PUT /api/reservations - بروزرسانی رزرو
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    console.log('بروزرسانی رزرو:', { id, updateData });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه رزرو اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود رزرو
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: id },
      include: { table: true }
    });

    if (!existingReservation) {
      return NextResponse.json(
        { success: false, error: 'رزرو یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی امکان تغییر (رزروهای گذشته قابل تغییر نیستند)
    if (existingReservation.reservationDate < new Date() && updateData.reservationDate) {
      return NextResponse.json(
        { success: false, error: 'رزروهای گذشته قابل تغییر نیستند' },
        { status: 400 }
      );
    }

    // بروزرسانی رزرو
    const updatedReservation = await prisma.reservation.update({
      where: { id: id },
      data: {
        ...updateData,
        reservationDate: updateData.reservationDate ? new Date(updateData.reservationDate) : undefined,
        startTime: updateData.startTime ? new Date(updateData.startTime) : undefined,
        endTime: updateData.endTime ? new Date(updateData.endTime) : undefined,
        partySize: updateData.partySize ? parseInt(updateData.partySize) : undefined,
        updatedAt: new Date()
      },
      include: {
        table: {
          select: {
            number: true,
            capacity: true,
            location: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: 'رزرو با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی رزرو:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی رزرو',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations - حذف رزرو
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('حذف رزرو:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه رزرو اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود رزرو
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: id }
    });

    if (!existingReservation) {
      return NextResponse.json(
        { success: false, error: 'رزرو یافت نشد' },
        { status: 404 }
      );
    }

    // به جای حذف، وضعیت را تغییر می‌دهیم
    const updatedReservation = await prisma.reservation.update({
      where: { id: id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: 'رزرو با موفقیت لغو شد'
    });

  } catch (error) {
    console.error('خطا در لغو رزرو:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در لغو رزرو',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
