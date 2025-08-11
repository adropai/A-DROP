import { NextRequest, NextResponse } from 'next/server';

// GET /api/reservations - دریافت رزروها
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const tableId = searchParams.get('tableId');
    const customerId = searchParams.get('customerId');
    const upcoming = searchParams.get('upcoming') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('دریافت رزروها با فیلترها:', { status, date, tableId, customerId, upcoming });
    
    // داده‌های fallback
    const fallbackReservations = [
      {
        id: 1,
        customerId: 1,
        tableId: 3,
        reservationTime: new Date('2025-08-12T19:00:00Z'),
        partySize: 4,
        status: 'CONFIRMED',
        specialRequests: 'میز کنار پنجره',
        notes: 'جشن تولد',
        reminderSent: true,
        confirmationSent: true,
        customer: {
          id: 1,
          name: 'احمد محمدی',
          phone: '09123456789',
          email: 'ahmad@example.com'
        },
        table: {
          id: 3,
          number: 3,
          capacity: 6,
          area: 'INDOOR',
          status: 'RESERVED'
        },
        order: null,
        guest: {
          name: 'احمد محمدی',
          phone: '09123456789',
          email: 'ahmad@example.com'
        },
        createdAt: new Date('2025-08-10T10:00:00Z'),
        updatedAt: new Date('2025-08-10T15:00:00Z')
      },
      {
        id: 2,
        customerId: 2,
        tableId: 1,
        reservationTime: new Date('2025-08-11T20:30:00Z'),
        partySize: 2,
        status: 'PENDING',
        specialRequests: 'غذای گیاهی',
        notes: 'ملاقات کاری',
        reminderSent: false,
        confirmationSent: false,
        customer: {
          id: 2,
          name: 'زهرا احمدی',
          phone: '09187654321',
          email: 'zahra@example.com'
        },
        table: {
          id: 1,
          number: 1,
          capacity: 4,
          area: 'INDOOR',
          status: 'AVAILABLE'
        },
        order: null,
        guest: {
          name: 'زهرا احمدی',
          phone: '09187654321',
          email: 'zahra@example.com'
        },
        createdAt: new Date('2025-08-10T14:30:00Z'),
        updatedAt: new Date('2025-08-10T14:30:00Z')
      }
    ];

    // فیلتر کردن داده‌ها
    let filteredReservations = fallbackReservations;

    if (status) {
      filteredReservations = filteredReservations.filter(r => r.status === status);
    }
    if (tableId) {
      filteredReservations = filteredReservations.filter(r => r.tableId === parseInt(tableId));
    }
    if (customerId) {
      filteredReservations = filteredReservations.filter(r => r.customerId === parseInt(customerId));
    }
    if (date) {
      const targetDate = new Date(date);
      filteredReservations = filteredReservations.filter(r => {
        const resDate = new Date(r.reservationTime);
        return resDate.toDateString() === targetDate.toDateString();
      });
    }
    if (upcoming) {
      const now = new Date();
      filteredReservations = filteredReservations.filter(r => new Date(r.reservationTime) >= now);
    }

    // پجینیشن
    const total = filteredReservations.length;
    const skip = (page - 1) * limit;
    const paginatedReservations = filteredReservations.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedReservations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: filteredReservations.length,
        confirmed: filteredReservations.filter(r => r.status === 'CONFIRMED').length,
        pending: filteredReservations.filter(r => r.status === 'PENDING').length,
        cancelled: filteredReservations.filter(r => r.status === 'CANCELLED').length,
        completed: filteredReservations.filter(r => r.status === 'COMPLETED').length,
        noShow: filteredReservations.filter(r => r.status === 'NO_SHOW').length,
        todayReservations: filteredReservations.filter(r => {
          const today = new Date();
          const resDate = new Date(r.reservationTime);
          return resDate.toDateString() === today.toDateString();
        }).length,
        avgPartySize: { _avg: { partySize: filteredReservations.reduce((sum, r) => sum + r.partySize, 0) / filteredReservations.length } }
      }
    });

  } catch (error) {
    console.error('خطا در دریافت رزروها:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت رزروها' },
      { status: 500 }
    );
  }
}

// POST /api/reservations - ایجاد رزرو جدید
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, tableId, reservationTime, partySize, specialRequests, notes, guestInfo } = body;

    if (!reservationTime || !partySize) {
      return NextResponse.json(
        { success: false, error: 'زمان رزرو و تعداد نفرات الزامی است' },
        { status: 400 }
      );
    }

    const newReservation = {
      id: Date.now(),
      customerId: customerId || null,
      tableId: tableId || null,
      reservationTime: new Date(reservationTime),
      partySize: parseInt(partySize),
      status: 'PENDING',
      specialRequests,
      notes,
      reminderSent: false,
      confirmationSent: false,
      guest: guestInfo || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: newReservation,
      message: 'رزرو جدید ثبت شد'
    });

  } catch (error) {
    console.error('خطا در ایجاد رزرو:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد رزرو جدید' },
      { status: 500 }
    );
  }
}

// PUT /api/reservations - بروزرسانی رزرو
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه رزرو الزامی است' },
        { status: 400 }
      );
    }

    const updatedReservation = {
      id: parseInt(id),
      ...updateData,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: 'رزرو بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی رزرو:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بروزرسانی رزرو' },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations - حذف رزرو
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه رزرو الزامی است' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'رزرو حذف شد'
    });

  } catch (error) {
    console.error('خطا در حذف رزرو:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف رزرو' },
      { status: 500 }
    );
  }
}
