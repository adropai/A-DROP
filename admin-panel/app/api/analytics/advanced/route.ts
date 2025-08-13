import { NextRequest, NextResponse } from 'next/server'

// Advanced Analytics API for Phase 4
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const period = searchParams.get('period') || 'day'

    // Mock advanced analytics data for Phase 4
    const mockData = {
      revenue: generateRevenueAnalytics(period),
      customers: generateCustomerAnalytics(period),
      products: generateProductAnalytics(period),
      realtime: generateRealtimeAnalytics()
    }

    if (type && mockData[type as keyof typeof mockData]) {
      return NextResponse.json({
        success: true,
        data: mockData[type as keyof typeof mockData],
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Advanced Analytics API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت اطلاعات آنالیتیک پیشرفته' 
      },
      { status: 500 }
    )
  }
}

// Revenue Analytics Generator
function generateRevenueAnalytics(period: string) {
  const now = new Date()
  const days = period === 'hour' ? 24 : 30
  
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    if (period === 'hour') {
      date.setHours(date.getHours() - i)
    } else {
      date.setDate(date.getDate() - i)
    }
    
    const revenue = Math.floor(Math.random() * 2000000) + 500000
    const orders = Math.floor(Math.random() * 200) + 50
    
    data.push({
      period: formatPeriod(date, period),
      revenue,
      orders,
      avgOrderValue: revenue / orders,
      growth: (Math.random() - 0.5) * 40
    })
  }
  
  return {
    timeline: data,
    summary: {
      totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
      totalOrders: data.reduce((sum, item) => sum + item.orders, 0),
      avgGrowthRate: data.reduce((sum, item) => sum + item.growth, 0) / data.length,
      peakRevenue: Math.max(...data.map(item => item.revenue))
    }
  }
}

// Customer Analytics Generator
function generateCustomerAnalytics(period: string) {
  return {
    acquisition: {
      newCustomers: Math.floor(Math.random() * 100) + 50,
      acquisitionCost: Math.floor(Math.random() * 50000) + 25000,
      conversionRate: (Math.random() * 15) + 10,
      channels: [
        { name: 'اپلیکیشن موبایل', customers: 450, percentage: 45 },
        { name: 'وبسایت', customers: 280, percentage: 28 },
        { name: 'رسانه‌های اجتماعی', customers: 150, percentage: 15 },
        { name: 'ارجاع', customers: 120, percentage: 12 }
      ]
    }
  }
}

// Product Analytics Generator
function generateProductAnalytics(period: string) {
  return {
    performance: [
      {
        id: '1',
        name: 'پیتزا مارگاریتا',
        category: 'پیتزا',
        sales: 156,
        revenue: 936000,
        growth: 12.5,
        rating: 4.7,
        margin: 65.2
      }
    ]
  }
}

// Realtime Analytics Generator
function generateRealtimeAnalytics() {
  return {
    live: {
      activeOrders: Math.floor(Math.random() * 25) + 15,
      onlineCustomers: Math.floor(Math.random() * 150) + 80,
      todayRevenue: Math.floor(Math.random() * 500000) + 1200000,
      todayOrders: Math.floor(Math.random() * 50) + 120
    }
  }
}

// Helper function to format period
function formatPeriod(date: Date, period: string): string {
  switch (period) {
    case 'hour':
      return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    case 'day':
      return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
    default:
      return date.toLocaleDateString('fa-IR')
  }
}
