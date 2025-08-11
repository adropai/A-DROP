import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reservations/available-tables - دریافت میزهای در دسترس
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const partySize = searchParams.get('partySize');

    if (!date || !startTime) {
      return NextResponse.json(
        { success: false, error: 'تاریخ و زمان شروع الزامی است' },
        { status: 400 }
      );
    }

    // دریافت همه میزهای فعال
    let availableTables = await prisma.table.findMany({
      where: {
        isActive: true,
        status: { not: 'MAINTENANCE' },
        ...(partySize && { capacity: { gte: parseInt(partySize) } })
      },
      orderBy: [
        { capacity: 'asc' },
        { number: 'asc' }
      ]
    });

    // بررسی رزروهای موجود برای این تاریخ و زمان
    const reservedTables = await prisma.reservation.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        reservationDate: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
        },
        OR: [
          {
            // رزرو که با زمان درخواستی تداخل دارد
            AND: [
              { startTime: { lte: new Date(`${date}T${startTime}`) } },
              {
                OR: [
                  { endTime: { gte: new Date(`${date}T${startTime}`) } },
                  { endTime: null }
                ]
              }
            ]
          },
          ...(endTime ? [{
            AND: [
              { startTime: { gte: new Date(`${date}T${startTime}`) } },
              { startTime: { lte: new Date(`${date}T${endTime}`) } }
            ]
          }] : [])
        ]
      },
      select: { tableId: true }
    });

    const reservedTableIds = reservedTables.map(r => r.tableId);

    // فیلتر میزهای در دسترس
    const finalAvailableTables = availableTables.filter(
      table => !reservedTableIds.includes(table.id)
    );

    // گروه‌بندی بر اساس نوع میز
    const groupedTables = finalAvailableTables.reduce((acc, table) => {
      if (!acc[table.type]) {
        acc[table.type] = [];
      }
      acc[table.type].push(table);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      data: {
        tables: finalAvailableTables,
        groupedTables,
        summary: {
          totalAvailable: finalAvailableTables.length,
          totalTables: availableTables.length,
          reservedCount: reservedTableIds.length,
          byType: Object.keys(groupedTables).map(type => ({
            type,
            count: groupedTables[type].length,
            tables: groupedTables[type]
          }))
        }
      }
    });

  } catch (error) {
    console.error('خطا در دریافت میزهای در دسترس:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت میزهای در دسترس' },
      { status: 500 }
    );
  }
}
