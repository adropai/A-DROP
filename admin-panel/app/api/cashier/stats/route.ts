import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'

function todayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
  return { gte: start, lt: end }
}

export async function GET(request: NextRequest) {
  try {
    const range = todayRange()

    const [sumAgg, countAll, sumPaid] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: range } }),
      prisma.order.count({ where: { createdAt: range } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: range, paymentStatus: PaymentStatus.COMPLETED } })
    ])

    const totalSales = Math.round(sumAgg._sum.totalAmount || 0)
    const totalOrders = countAll
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0
    const cashInRegister = Math.round(sumPaid._sum.totalAmount || 0)

    return NextResponse.json({
      success: true,
      data: { totalOrders, totalSales, avgOrderValue, cashInRegister },
      message: 'آمار صندوق با موفقیت دریافت شد'
    })
  } catch (error) {
    console.error('Error in cashier stats API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت آمار صندوق',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock response - در پروژه واقعی آپدیت دیتابیس انجام دهید
    return NextResponse.json({
      success: true,
      message: 'آمار صندوق بروزرسانی شد'
    });
  } catch (error) {
    console.error('Error updating cashier stats:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی آمار'
      },
      { status: 500 }
    );
  }
}
