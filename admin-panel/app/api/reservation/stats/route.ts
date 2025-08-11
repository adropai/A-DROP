import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

// آمار رزروها
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    // شبیه‌سازی داده‌های آماری
    const today = new Date().toISOString().split('T')[0]
    
    // آمار کلی
    const totalReservations = 156
    const todayReservations = 12
    const confirmedReservations = 98
    const cancelledReservations = 23
    const pendingReservations = 35
    const completedReservations = 45
    const noShowReservations = 8

    // محاسبه نرخ اشغال (شبیه‌سازی)
    const totalTables = 15
    const reservedTablesCount = 8
    const occupancyRate = Math.round((reservedTablesCount / totalTables) * 100)

    // آمار امروز
    const todayStats = {
      totalReservations: todayReservations,
      pending: 4,
      confirmed: 6,
      completed: 2,
      cancelled: 0,
      noShow: 0
    }

    // آمار هفتگی (۷ روز گذشته)
    const weeklyStats = [
      { date: '2024-03-15', reservations: 18, revenue: 2400000 },
      { date: '2024-03-16', reservations: 22, revenue: 2950000 },
      { date: '2024-03-17', reservations: 15, revenue: 2100000 },
      { date: '2024-03-18', reservations: 28, revenue: 3650000 },
      { date: '2024-03-19', reservations: 25, revenue: 3200000 },
      { date: '2024-03-20', reservations: 19, revenue: 2580000 },
      { date: '2024-03-21', reservations: 12, revenue: 1800000 },
    ]

    // آمار ماهانه
    const monthlyStats = {
      totalReservations: 456,
      totalRevenue: 58750000,
      averagePartySize: 3.2,
      popularTimeSlots: [
        { time: '19:00', count: 45 },
        { time: '20:00', count: 52 },
        { time: '18:30', count: 38 },
        { time: '21:00', count: 28 },
        { time: '19:30', count: 41 }
      ],
      popularTables: [
        { tableNumber: 4, reservations: 23, location: 'سالن VIP' },
        { tableNumber: 1, reservations: 19, location: 'سالن اصلی' },
        { tableNumber: 2, reservations: 18, location: 'سالن اصلی' },
        { tableNumber: 3, reservations: 15, location: 'تراس' }
      ]
    }

    // میانگین زمان انتظار برای تایید رزرو
    const averageConfirmationTime = 24 // دقیقه

    // نرخ عدم حضور
    const noShowRate = Math.round((noShowReservations / totalReservations) * 100)

    // نرخ لغو
    const cancellationRate = Math.round((cancelledReservations / totalReservations) * 100)

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalReservations,
          todayReservations,
          confirmedReservations,
          cancelledReservations,
          pendingReservations,
          completedReservations,
          noShowReservations,
          occupancyRate,
          averageConfirmationTime,
          noShowRate,
          cancellationRate
        },
        today: todayStats,
        weekly: weeklyStats,
        monthly: monthlyStats,
        performance: {
          customerSatisfaction: 4.6,
          averageServiceTime: 95, // دقیقه
          peakHours: ['19:00', '20:00', '20:30'],
          busiestDays: ['جمعه', 'شنبه', 'پنج‌شنبه']
        }
      },
      message: 'آمار رزروها بازیابی شد'
    })

  } catch (error) {
    console.error('خطا در دریافت آمار رزروها:', error)
    return NextResponse.json({ 
      error: 'خطای داخلی سرور' 
    }, { status: 500 })
  }
}

// آمار تفصیلی برای گزارش‌گیری
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const { startDate, endDate, groupBy = 'day' } = body

    if (!startDate || !endDate) {
      return NextResponse.json({ 
        error: 'تاریخ شروع و پایان الزامی است' 
      }, { status: 400 })
    }

    // شبیه‌سازی گزارش تفصیلی
    const detailedStats = {
      period: { startDate, endDate, groupBy },
      summary: {
        totalReservations: 89,
        totalRevenue: 12450000,
        averageReservationValue: 140000,
        uniqueCustomers: 67,
        repeatCustomers: 22,
        repeatCustomerRate: 33
      },
      daily: [
        {
          date: startDate,
          reservations: 12,
          revenue: 1650000,
          averagePartySize: 3.1,
          peakHour: '19:30'
        },
        // ... more daily data
      ],
      customerSegments: [
        { segment: 'مشتریان VIP', count: 15, revenue: 3200000 },
        { segment: 'مشتریان معمولی', count: 52, revenue: 7850000 },
        { segment: 'مشتریان جدید', count: 22, revenue: 1400000 }
      ],
      tableUtilization: [
        { tableNumber: 1, utilizationRate: 78, totalHours: 45 },
        { tableNumber: 2, utilizationRate: 85, totalHours: 52 },
        { tableNumber: 3, utilizationRate: 65, totalHours: 38 }
      ]
    }

    return NextResponse.json({
      success: true,
      data: detailedStats,
      message: 'گزارش تفصیلی تولید شد'
    })

  } catch (error) {
    console.error('خطا در تولید گزارش:', error)
    return NextResponse.json({ 
      error: 'خطای داخلی سرور' 
    }, { status: 500 })
  }
}
