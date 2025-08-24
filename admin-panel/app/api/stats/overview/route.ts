import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

function getDateRange(start?: string | null, end?: string | null) {
  if (start && end) {
    const s = new Date(start)
    const e = new Date(end)
    return { gte: s, lt: e }
  }
  const now = new Date()
  const s = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const e = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
  return { gte: s, lt: e }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const range = getDateRange(start, end)

    // Aggregations for today (or provided range)
    const [sumAgg, countToday, byStatus] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: range } }),
      prisma.order.count({ where: { createdAt: range } }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { createdAt: range }
      })
    ])

    const statusCounts: Record<string, number> = {}
    Object.values(OrderStatus).forEach(s => { statusCounts[s] = 0 })
    byStatus.forEach(row => { statusCounts[row.status] = row._count._all })

    return NextResponse.json({
      success: true,
      data: {
        todayRevenue: Math.round(sumAgg._sum.totalAmount || 0),
        todayOrders: countToday,
        byStatus: statusCounts,
        lastUpdate: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Stats overview error:', error)
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
