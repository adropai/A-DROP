import { NextRequest, NextResponse } from 'next/server'
import type { CustomerStats } from '@/stores/analytics-store'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // Generate mock customer statistics
    const mockCustomerStats: CustomerStats = {
      totalCustomers: 2847,
      newCustomers: 156,
      activeCustomers: 1923,
      returnRate: 67.5,
      avgLifetimeValue: 485000,
      customerGrowth: 15.8
    }

    return NextResponse.json(mockCustomerStats)
  } catch (error) {
    console.error('Error fetching customer stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer stats' },
      { status: 500 }
    )
  }
}
