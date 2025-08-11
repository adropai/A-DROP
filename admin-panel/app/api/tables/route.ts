import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const available = searchParams.get('available');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('دریافت میزها با فیلترها:', { status, type, available });

    // ساخت شرط‌های جستجو
    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (available !== null) where.isActive = available === 'true';

    // دریافت میزها از دیتابیس
    const tables = await prisma.table.findMany({
      where,
      include: {
        reservations: {
          where: {
            reservationDate: {
              gte: new Date(),
            },
            status: 'CONFIRMED'
          }
        }
      },
      orderBy: {
        number: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // شمارش کل میزها
    const total = await prisma.table.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        tables,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('خطا در دریافت میزها:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت میزها',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('ایجاد میز جدید:', data);

    // اعتبارسنجی داده‌ها
    if (!data.number || !data.capacity) {
      return NextResponse.json(
        { success: false, error: 'فیلدهای شماره و ظرفیت اجباری هستند' },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن شماره میز
    const existingTable = await prisma.table.findFirst({
      where: { number: data.number }
    });

    if (existingTable) {
      return NextResponse.json(
        { success: false, error: 'میز با این شماره قبلاً موجود است' },
        { status: 400 }
      );
    }

    // ایجاد میز جدید
    const table = await prisma.table.create({
      data: {
        number: data.number,
        capacity: parseInt(data.capacity),
        location: data.location || '',
        type: data.type || 'INDOOR',
        status: data.status || 'AVAILABLE',
        isActive: data.isActive !== false,
        description: data.description || '',
        qrCode: data.qrCode || null
      }
    });

    return NextResponse.json({
      success: true,
      data: table,
      message: 'میز با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('خطا در ایجاد میز:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ایجاد میز',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    console.log('بروزرسانی میز:', { id, updateData });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه میز اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود میز
    const existingTable = await prisma.table.findUnique({
      where: { id: id }
    });

    if (!existingTable) {
      return NextResponse.json(
        { success: false, error: 'میز یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی تکراری نبودن شماره میز (در صورت تغییر)
    if (updateData.number && updateData.number !== existingTable.number) {
      const duplicateTable = await prisma.table.findFirst({
        where: { 
          number: updateData.number,
          id: { not: id }
        }
      });

      if (duplicateTable) {
        return NextResponse.json(
          { success: false, error: 'میز با این شماره قبلاً موجود است' },
          { status: 400 }
        );
      }
    }

    // بروزرسانی میز
    const updatedTable = await prisma.table.update({
      where: { id: id },
      data: {
        ...updateData,
        capacity: updateData.capacity ? parseInt(updateData.capacity) : undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedTable,
      message: 'میز با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی میز:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی میز',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('حذف میز:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه میز اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود میز
    const existingTable = await prisma.table.findUnique({
      where: { id: id },
      include: {
        reservations: {
          where: {
            reservationDate: { gte: new Date() },
            status: 'CONFIRMED'
          }
        }
      }
    });

    if (!existingTable) {
      return NextResponse.json(
        { success: false, error: 'میز یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی امکان حذف (رزرو آینده نداشته باشد)
    if (existingTable.reservations.length > 0) {
      return NextResponse.json(
        { success: false, error: 'میز دارای رزروهای آینده است و قابل حذف نیست' },
        { status: 400 }
      );
    }

    // حذف میز
    await prisma.table.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'میز با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('خطا در حذف میز:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در حذف میز',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
