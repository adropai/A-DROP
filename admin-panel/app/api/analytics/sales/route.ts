import { NextRequest, NextResponse } from 'next/server'
import type { SalesDataPoint } from '@/stores/analytics-store'

// Generate mock sales data
const generateSalesData = (startDate: string, endDate: string, period: string): SalesDataPoint[] => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const data: SalesDataPoint[] = []
  
  let current = new Date(start)
  let dayIncrement = 1
  
  if (period === 'weekly') dayIncrement = 7
  else if (period === 'monthly') dayIncrement = 30
  
  while (current <= end) {
    const baseAmount = 1500000 + Math.random() * 500000
    const weekday = current.getDay()
    const weekendMultiplier = (weekday === 5 || weekday === 6) ? 1.3 : 1.0
    
    data.push({
      date: current.toISOString().split('T')[0],
      amount: Math.floor(baseAmount * weekendMultiplier)
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

    const salesData = generateSalesData(startDate, endDate, period)

    return NextResponse.json(salesData)
  } catch (error) {
    console.error('Error fetching sales data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    )
  }
}
