import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import moment from 'moment-jalaali';

// تنظیم moment-jalaali
moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });

function convertPersianToGregorian(persianDate: string, time: string = '00:00'): Date {
  try {
    const [hour, minute] = time.split(':').map(Number);
    const m = moment(persianDate + ' ' + time, 'jYYYY/jMM/jDD HH:mm');
    return m.toDate();
  } catch (error) {
    console.error('خطا در تبدیل تاریخ:', error);
    // بازگشت به روش قدیمی در صورت خطا
    const [year, month, day] = persianDate.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const adjustedYear = year > 1400 ? year - 621 : year;
    return new Date(adjustedYear, month - 1, day, hour, minute);
  }
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function convertGregorianToPersian(gregorianDate: Date): string {
  try {
    return moment(gregorianDate).format('jYYYY/jMM/jDD');
  } catch (error) {
    console.error('خطا در تبدیل تاریخ میلادی:', error);
    // بازگشت به روش قدیمی در صورت خطا
    const year = gregorianDate.getFullYear() + 621;
    const month = (gregorianDate.getMonth() + 1).toString().padStart(2, '0');
    const day = gregorianDate.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
}

// GET /api/reservations/check-availability - دریافت میزهای موجود بر اساس تاریخ و ساعت
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const persianDate = searchParams.get('date'); // فرمت: 1403/05/15
    const time = searchParams.get('time'); // فرمت: 19:30
    const partySize = parseInt(searchParams.get('partySize') || '1');
    const duration = parseInt(searchParams.get('duration') || '120'); // دقیقه

    console.log('🔍 چک دسترسی میزها:', { persianDate, time, partySize, duration });

    if (!persianDate || !time) {
      return NextResponse.json(
        { success: false, error: 'تاریخ و ساعت اجباری هستند' },
        { status: 400 }
      );
    }

    // تبدیل تاریخ و ساعت به میلادی
    const requestedDateTime = convertPersianToGregorian(persianDate, time);
    const endDateTime = new Date(requestedDateTime.getTime() + duration * 60 * 1000);

    // بررسی که تاریخ در گذشته نباشد
    if (requestedDateTime < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'نمی‌توان برای گذشته رزرو ثبت کرد',
        availableTables: []
      });
    }

    // بررسی ساعات کاری رستوران
    const hour = requestedDateTime.getHours();
    if (hour < 11 || hour > 23) {
      return NextResponse.json({
        success: false,
        error: 'ساعات کاری رستوران از 11:00 تا 23:00 است',
        availableTables: []
      });
    }

    // دریافت تمام میزهای فعال
    const allTables = await prisma.table.findMany({
      where: {
        isActive: true,
        capacity: {
          gte: partySize // میزهایی که ظرفیت کافی دارند
        }
      },
      orderBy: [
        { capacity: 'asc' }, // اول میزهای کوچک‌تر
        { number: 'asc' }
      ]
    });

    // بررسی رزروهای موجود برای همین بازه زمانی
    const bufferTime = 30 * 60 * 1000; // 30 دقیقه بافر
    const checkStartTime = new Date(requestedDateTime.getTime() - bufferTime);
    const checkEndTime = new Date(endDateTime.getTime() + bufferTime);

    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [
          {
            startTime: {
              lt: checkEndTime
            }
          },
          {
            endTime: {
              gte: checkStartTime
            }
          }
        ]
      },
      select: {
        tableId: true,
        reservationDate: true,
        customerName: true
      }
    });

    // میزهای اشغال شده در این بازه زمانی
    const occupiedTableIds = new Set(conflictingReservations.map(r => r.tableId));

    // فیلتر میزهای موجود
    const availableTables = allTables
      .filter(table => !occupiedTableIds.has(table.id))
      .map(table => ({
        ...table,
        type: table.type.toLowerCase(),
        status: table.status.toLowerCase(),
        isRecommended: table.capacity >= partySize && table.capacity <= partySize + 2, // میزهای مناسب
        spareCapacity: table.capacity - partySize
      }));

    // میزهای اشغال شده با جزئیات
    const occupiedTables = allTables
      .filter(table => occupiedTableIds.has(table.id))
      .map(table => {
        const conflict = conflictingReservations.find(r => r.tableId === table.id);
        const conflictEndTime = conflict ? new Date(conflict.reservationDate.getTime() + 120 * 60 * 1000) : null;
        
        return {
          ...table,
          type: table.type.toLowerCase(),
          status: 'reserved',
          conflictingReservation: conflict ? {
            customerName: conflict.customerName,
            startTime: formatTime(conflict.reservationDate),
            endTime: conflictEndTime ? formatTime(conflictEndTime) : null,
            persianDate: convertGregorianToPersian(conflict.reservationDate)
          } : null
        };
      });

    // آمارها
    const stats = {
      totalTables: allTables.length,
      availableTables: availableTables.length,
      occupiedTables: occupiedTables.length,
      recommendedTables: availableTables.filter(t => t.isRecommended).length,
      suitableCapacity: availableTables.filter(t => t.capacity >= partySize).length
    };

    // پیشنهادات جایگزین در صورت عدم وجود میز
    let suggestions = [];
    if (availableTables.length === 0) {
      // پیشنهاد ساعت‌های جایگزین
      const alternativeHours = [-1, 1, -2, 2]; // 1 و 2 ساعت قبل/بعد
      
      for (const hourOffset of alternativeHours) {
        const altDateTime = new Date(requestedDateTime.getTime() + hourOffset * 60 * 60 * 1000);
        const altHour = altDateTime.getHours();
        
        if (altHour >= 11 && altHour <= 23) {
          const altEndTime = new Date(altDateTime.getTime() + duration * 60 * 1000);
          
          // بررسی میزهای موجود در ساعت جایگزین
          const altConflicts = await prisma.reservation.findMany({
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] },
              AND: [
                {
                  reservationDate: {
                    lt: new Date(altEndTime.getTime() + bufferTime)
                  }
                },
                {
                  reservationDate: {
                    gte: new Date(altDateTime.getTime() - bufferTime)
                  }
                }
              ]
            },
            select: { tableId: true }
          });
          
          const altOccupiedIds = new Set(altConflicts.map(r => r.tableId));
          const altAvailable = allTables.filter(t => !altOccupiedIds.has(t.id) && t.capacity >= partySize);
          
          if (altAvailable.length > 0) {
            suggestions.push({
              time: formatTime(altDateTime),
              availableCount: altAvailable.length,
              tables: altAvailable.slice(0, 3).map(t => ({
                id: t.id,
                number: t.number,
                capacity: t.capacity,
                location: t.location
              }))
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        requestedDateTime: {
          persianDate,
          time,
          partySize,
          duration
        },
        availableTables,
        occupiedTables,
        stats,
        suggestions: suggestions.slice(0, 4), // حداکثر 4 پیشنهاد
        message: availableTables.length > 0 
          ? `${availableTables.length} میز برای ${partySize} نفر موجود است`
          : 'هیچ میزی در این زمان موجود نیست'
      }
    });

  } catch (error) {
    console.error('❌ خطا در چک دسترسی میزها:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بررسی دسترسی میزها',
        details: error instanceof Error ? error.message : 'خطای نامشخص',
        availableTables: []
      },
      { status: 500 }
    );
  }
}
