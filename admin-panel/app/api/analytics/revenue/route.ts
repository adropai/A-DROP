import { NextRequest, NextResponse } from 'next/server'
import type { RevenueDataPoint } from '@/stores/analytics-store'

// Generate mock revenue data
const generateRevenueData = (startDate: string, endDate: string, period: string): RevenueDataPoint[] => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const data: RevenueDataPoint[] = []
  
  let current = new Date(start)
  let dayIncrement = 1
  
  if (period === 'weekly') dayIncrement = 7
  else if (period === 'monthly') dayIncrement = 30
  
  while (current <= end) {
    const baseRevenue = 1800000 + Math.random() * 600000
    const baseOrders = 45 + Math.floor(Math.random() * 20)
    const weekday = current.getDay()
    const weekendMultiplier = (weekday === 5 || weekday === 6) ? 1.4 : 1.0
    
    data.push({
      date: current.toISOString().split('T')[0],
      revenue: Math.floor(baseRevenue * weekendMultiplier),
      orders: Math.floor(baseOrders * weekendMultiplier)
    })
    
    current.setDate(current.getDate() + dayIncrement)
  }
  
  return data
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate') || '2024-01-01'
    const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const period = url.searchParams.get('period') || 'daily'

    const revenueData = generateRevenueData(startDate, endDate, period)

    return NextResponse.json(revenueData)
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}
