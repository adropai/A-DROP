import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // شبیه‌سازی تأخیر API
    await new Promise(resolve => setTimeout(resolve, 100))

    const stats = {
      dailySales: {
        amount: 12580000,
        change: +15.3,
        trend: 'up'
      },
      dailyOrders: {
        count: 85,
        change: +8.2,
        trend: 'up'
      },
      newCustomers: {
        count: 23,
        change: +12.5,
        trend: 'up'
      },
      satisfaction: {
        rating: 4.8,
        change: +0.2,
        trend: 'up'
      },
      monthlyTarget: {
        current: 75000000,
        target: 100000000,
        percentage: 75
      },
      weeklyTrend: [
        { day: 'شنبه', sales: 12500000, orders: 85, customers: 45 },
        { day: 'یکشنبه', sales: 8900000, orders: 62, customers: 38 },
        { day: 'دوشنبه', sales: 15200000, orders: 95, customers: 52 },
        { day: 'سه‌شنبه', sales: 18700000, orders: 118, customers: 67 },
        { day: 'چهارشنبه', sales: 22100000, orders: 142, customers: 78 },
        { day: 'پنج‌شنبه', sales: 26800000, orders: 168, customers: 89 },
        { day: 'جمعه', sales: 31200000, orders: 195, customers: 102 }
      ],
      hourlySales: [
        { hour: '09:00', sales: 850000, orders: 5 },
        { hour: '10:00', sales: 1200000, orders: 8 },
        { hour: '11:00', sales: 1800000, orders: 12 },
        { hour: '12:00', sales: 3200000, orders: 22 },
        { hour: '13:00', sales: 4100000, orders: 28 },
        { hour: '14:00', sales: 2800000, orders: 18 },
        { hour: '15:00', sales: 1500000, orders: 10 },
        { hour: '16:00', sales: 900000, orders: 6 },
        { hour: '17:00', sales: 1100000, orders: 7 },
        { hour: '18:00', sales: 2200000, orders: 15 },
        { hour: '19:00', sales: 3800000, orders: 25 },
        { hour: '20:00', sales: 4500000, orders: 30 },
        { hour: '21:00', sales: 3600000, orders: 24 },
        { hour: '22:00', sales: 2100000, orders: 14 }
      ],
      orderTypes: [
        { type: 'حضوری', value: 45 },
        { type: 'آنلاین', value: 30 },
        { type: 'تلفنی', value: 15 },
        { type: 'پیک', value: 10 }
      ],
      lastUpdate: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت آمار داشبورد',
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    )
  }
}
