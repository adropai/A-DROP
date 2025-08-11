import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

// شبیه‌سازی پایگاه داده رزروها
let reservations = [
  {
    id: 'RES-001',
    customerName: 'احمد محمدی',
    customerPhone: '09123456789',
    customerEmail: 'ahmad@email.com',
    tableId: 'T-004',
    tableNumber: 4,
    date: '2024-03-20',
    time: '19:30',
    duration: 120,
    partySize: 6,
    status: 'confirmed',
    specialRequests: 'کیک تولد',
    notes: 'مشتری VIP - توجه ویژه',
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-18')
  },
  {
    id: 'RES-002',
    customerName: 'فاطمه رضایی',
    customerPhone: '09123456788',
    customerEmail: 'fateme@email.com',
    tableId: 'T-001',
    tableNumber: 1,
    date: '2024-03-21',
    time: '20:00',
    duration: 90,
    partySize: 4,
    status: 'pending',
    specialRequests: '',
    notes: '',
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-19')
  },
  {
    id: 'RES-003',
    customerName: 'علی حسینی',
    customerPhone: '09123456787',
    tableId: 'T-003',
    tableNumber: 3,
    date: '2024-03-19',
    time: '18:00',
    duration: 60,
    partySize: 2,
    status: 'completed',
    createdAt: new Date('2024-03-17'),
    updatedAt: new Date('2024-03-19')
  }
]

// دریافت لیست رزروها
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const status = url.searchParams.get('status')
    const tableId = url.searchParams.get('tableId')

    let filteredReservations = [...reservations]

    // فیلتر بر اساس تاریخ
    if (date) {
      filteredReservations = filteredReservations.filter(r => r.date === date)
    }

    // فیلتر بر اساس وضعیت
    if (status) {
      filteredReservations = filteredReservations.filter(r => r.status === status)
    }

    // فیلتر بر اساس میز
    if (tableId) {
      filteredReservations = filteredReservations.filter(r => r.tableId === tableId)
    }

    // مرتب‌سازی بر اساس تاریخ و زمان
    filteredReservations.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })

    return NextResponse.json({
      success: true,
      data: filteredReservations,
      total: filteredReservations.length,
      message: 'رزروها با موفقیت بازیابی شد'
    })

  } catch (error) {
    console.error('خطا در دریافت رزروها:', error)
    return NextResponse.json({ 
      error: 'خطای داخلی سرور' 
    }, { status: 500 })
  }
}

// ایجاد رزرو جدید
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerEmail,
      tableId,
      date,
      time,
      duration,
      partySize,
      specialRequests,
      notes
    } = body

    // اعتبارسنجی داده‌ها
    if (!customerName || !customerPhone || !tableId || !date || !time || !partySize) {
      return NextResponse.json({ 
        error: 'فیلدهای اجباری کامل نیست' 
      }, { status: 400 })
    }

    // بررسی تداخل زمانی
    const conflictingReservation = reservations.find(r => {
      if (r.tableId !== tableId || r.date !== date) return false
      
      const existingStart = timeToMinutes(r.time)
      const existingEnd = existingStart + r.duration
      const newStart = timeToMinutes(time)
      const newEnd = newStart + duration

      return (newStart < existingEnd && newEnd > existingStart)
    })

    if (conflictingReservation) {
      return NextResponse.json({ 
        error: 'این میز در زمان انتخابی رزرو شده است' 
      }, { status: 409 })
    }

    // شبیه‌سازی دریافت اطلاعات میز
    const tables = [
      { id: 'T-001', number: 1, capacity: 4, location: 'سالن اصلی', isActive: true },
      { id: 'T-002', number: 2, capacity: 6, location: 'سالن اصلی', isActive: true },
      { id: 'T-003', number: 3, capacity: 2, location: 'تراس', isActive: true },
      { id: 'T-004', number: 4, capacity: 8, location: 'سالن VIP', isActive: true },
      { id: 'T-005', number: 5, capacity: 4, location: 'سالن اصلی', isActive: true },
    ]

    const table = tables.find(t => t.id === tableId)
    if (!table || !table.isActive) {
      return NextResponse.json({ 
        error: 'میز انتخابی موجود نیست یا غیرفعال است' 
      }, { status: 404 })
    }

    if (table.capacity < partySize) {
      return NextResponse.json({ 
        error: 'ظرفیت میز برای تعداد نفرات کافی نیست' 
      }, { status: 400 })
    }

    // ایجاد رزرو جدید
    const newReservation = {
      id: `RES-${Date.now()}`,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      tableId,
      tableNumber: table.number,
      date,
      time,
      duration: duration || 120,
      partySize,
      status: 'pending' as const,
      specialRequests: specialRequests || '',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    reservations.push(newReservation)

    return NextResponse.json({
      success: true,
      data: newReservation,
      message: 'رزرو جدید با موفقیت ایجاد شد'
    }, { status: 201 })

  } catch (error) {
    console.error('خطا در ایجاد رزرو:', error)
    return NextResponse.json({ 
      error: 'خطای داخلی سرور' 
    }, { status: 500 })
  }
}

// ویرایش رزرو
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ 
        error: 'شناسه رزرو الزامی است' 
      }, { status: 400 })
    }

    const reservationIndex = reservations.findIndex(r => r.id === id)
    if (reservationIndex === -1) {
      return NextResponse.json({ 
        error: 'رزرو یافت نشد' 
      }, { status: 404 })
    }

    // بررسی تداخل زمانی (در صورت تغییر زمان)
    if (updateData.date || updateData.time || updateData.tableId) {
      const existingReservation = reservations[reservationIndex]
      const newDate = updateData.date || existingReservation.date
      const newTime = updateData.time || existingReservation.time
      const newTableId = updateData.tableId || existingReservation.tableId
      const newDuration = updateData.duration || existingReservation.duration

      const conflictingReservation = reservations.find((r, index) => {
        if (index === reservationIndex) return false // نادیده گرفتن رزرو فعلی
        if (r.tableId !== newTableId || r.date !== newDate) return false
        
        const existingStart = timeToMinutes(r.time)
        const existingEnd = existingStart + r.duration
        const newStart = timeToMinutes(newTime)
        const newEnd = newStart + newDuration

        return (newStart < existingEnd && newEnd > existingStart)
      })

      if (conflictingReservation) {
        return NextResponse.json({ 
          error: 'این میز در زمان انتخابی رزرو شده است' 
        }, { status: 409 })
      }
    }

    // به‌روزرسانی رزرو
    reservations[reservationIndex] = {
      ...reservations[reservationIndex],
      ...updateData,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      data: reservations[reservationIndex],
      message: 'رزرو با موفقیت به‌روزرسانی شد'
    })

  } catch (error) {
    console.error('خطا در ویرایش رزرو:', error)
    return NextResponse.json({ 
      error: 'خطای داخلی سرور' 
    }, { status: 500 })
  }
}

// تبدیل زمان به دقیقه
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
