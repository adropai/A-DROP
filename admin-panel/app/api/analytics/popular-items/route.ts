import { NextRequest, NextResponse } from 'next/server'
import type { PopularItem } from '@/stores/analytics-store'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // Generate mock popular items data
    const mockPopularItems: PopularItem[] = [
      { name: 'پیتزا مارگاریتا', count: 148, percentage: 18.5 },
      { name: 'برگر کلاسیک', count: 127, percentage: 15.9 },
      { name: 'پاستا آلفردو', count: 95, percentage: 11.9 },
      { name: 'سالاد سزار', count: 78, percentage: 9.8 },
      { name: 'چیزبرگر', count: 67, percentage: 8.4 },
      { name: 'پیتزا پپرونی', count: 54, percentage: 6.8 },
      { name: 'سوپ جو', count: 43, percentage: 5.4 },
      { name: 'کباب کوبیده', count: 38, percentage: 4.8 },
      { name: 'جوجه کباب', count: 35, percentage: 4.4 },
      { name: 'لازانیا', count: 32, percentage: 4.0 }
    ]

    return NextResponse.json(mockPopularItems)
  } catch (error) {
    console.error('Error fetching popular items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular items' },
      { status: 500 }
    )
  }
}
