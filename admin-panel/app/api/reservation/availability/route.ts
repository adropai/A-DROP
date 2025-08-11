import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

// زمان‌های کاری رستوران
const RESTAURANT_HOURS = {
  start: 10, // 10:00 AM
  end: 23,   // 11:00 PM
  intervalMinutes: 30
}

// تولید زمان‌های موجود
function generateTimeSlots() {
  const slots = []
  for (let hour = RESTAURANT_HOURS.start; hour <= RESTAURANT_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += RESTAURANT_HOURS.intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(time)
    }
  }
  return slots
}

export async function GET(request: NextRequest) {
  try {
    // بررسی احراز هویت
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const partySize = parseInt(url.searchParams.get('partySize') || '1')

    if (!date) {
      return NextResponse.json({ 
        error: 'تاریخ الزامی است' 
      }, { status: 400 })
    }

    // شبیه‌سازی دریافت میزهای فعال از پایگاه داده
    const activeTables = [
      { id: 'T-001', number: 1, capacity: 4, location: 'سالن اصلی', isActive: true },
      { id: 'T-002', number: 2, capacity: 6, location: 'سالن اصلی', isActive: true },
      { id: 'T-003', number: 3, capacity: 2, location: 'تراس', isActive: true },
      { id: 'T-004', number: 4, capacity: 8, location: 'سالن VIP', isActive: true },
      { id: 'T-005', number: 5, capacity: 4, location: 'سالن اصلی', isActive: true },
      { id: 'T-006', number: 6, capacity: 4, location: 'تراس', isActive: false }, // غیرفعال
    ]

    // شبیه‌سازی رزروهای موجود برای این تاریخ
    const existingReservations = [
      { tableId: 'T-001', time: '19:00', duration: 120 },
      { tableId: 'T-002', time: '20:00', duration: 90 },
      { tableId: 'T-003', time: '18:30', duration: 60 },
    ]

    // فیلتر میزهای مناسب بر اساس ظرفیت
    const suitableTables = activeTables.filter(table => 
      table.isActive && table.capacity >= partySize
    )

    // تولید زمان‌های موجود
    const allTimeSlots = generateTimeSlots()
    const availableSlots = []

    for (const time of allTimeSlots) {
      const availableTableIds = []

      for (const table of suitableTables) {
        // بررسی تداخل با رزروهای موجود
        const hasConflict = existingReservations.some(reservation => {
          if (reservation.tableId !== table.id) return false

          const reservationStart = timeToMinutes(reservation.time)
          const reservationEnd = reservationStart + reservation.duration
          const slotStart = timeToMinutes(time)
          const slotEnd = slotStart + 120 // فرض بر اینکه هر رزرو ۲ ساعت طول می‌کشد

          return (slotStart < reservationEnd && slotEnd > reservationStart)
        })

        if (!hasConflict) {
          availableTableIds.push(table.id)
        }
      }

      availableSlots.push({
        time,
        available: availableTableIds.length > 0,
        tableIds: availableTableIds,
        availableTablesCount: availableTableIds.length
      })
    }

    return NextResponse.json({
      success: true,
      data: availableSlots,
      message: 'زمان‌های موجود بازیابی شد'
    })

  } catch (error) {
    console.error('خطا در دریافت زمان‌های موجود:', error)
    return NextResponse.json({ 
      error: 'خطای داخلی سرور' 
    }, { status: 500 })
  }
}

// تبدیل زمان به دقیقه برای محاسبه تداخل
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// دریافت زمان‌های خالی برای میز خاص
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const { date, tableId, duration = 120 } = body

    if (!date || !tableId) {
      return NextResponse.json({ 
        error: 'تاریخ و شناسه میز الزامی است' 
      }, { status: 400 })
    }

    // شبیه‌سازی رزروهای موجود برای میز خاص
    const tableReservations = [
      { time: '19:00', duration: 120 },
      { time: '21:30', duration: 90 },
    ].filter(r => Math.random() > 0.5) // شبیه‌سازی تصادفی

    const allTimeSlots = generateTimeSlots()
    const availableSlots = []

    for (const time of allTimeSlots) {
      const slotStart = timeToMinutes(time)
      const slotEnd = slotStart + duration

      const hasConflict = tableReservations.some(reservation => {
        const reservationStart = timeToMinutes(reservation.time)
        const reservationEnd = reservationStart + reservation.duration
        return (slotStart < reservationEnd && slotEnd > reservationStart)
      })

      if (!hasConflict) {
        availableSlots.push({
          time,
          endTime: minutesToTime(slotEnd),
          duration
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: availableSlots,
      message: 'زمان‌های خالی میز بازیابی شد'
    })

  } catch (error) {
    console.error('خطا در دریافت زمان‌های خالی میز:', error)
    return NextResponse.json({ 
      error: 'خطای داخلی سرور' 
    }, { status: 500 })
  }
}

// تبدیل دقیقه به فرمت زمان
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
