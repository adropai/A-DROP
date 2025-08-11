import { NextRequest, NextResponse } from 'next/server'
import type { OrderStats } from '@/stores/analytics-store'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // Generate mock order statistics
    const mockOrderStats: OrderStats = {
      totalRevenue: 15750000,
      totalOrders: 456,
      averageOrderValue: 34540,
      completedOrders: 432,
      cancelledOrders: 24,
      successRate: 94.7,
      avgPreparationTime: 18,
      netRevenue: 14175000,
      totalDiscounts: 850000,
      totalTax: 1575000,
      profitMargin: 67.5,
      revenueGrowth: 12.3,
      ordersGrowth: 8.7,
      avgOrderGrowth: 3.2
    }

    return NextResponse.json(mockOrderStats)
  } catch (error) {
    console.error('Error fetching order stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order stats' },
      { status: 500 }
    )
  }
}
