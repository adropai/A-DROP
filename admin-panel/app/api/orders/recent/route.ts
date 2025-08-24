import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // پارامترهای اختیاری: take, status
    const { searchParams } = new URL(request.url)
    const take = parseInt(searchParams.get('take') || '10', 10)
    const status = searchParams.get('status') as keyof typeof OrderStatus | null

    const where = status && OrderStatus[status]
      ? { status: status as OrderStatus }
      : undefined

    const recent = await prisma.order.findMany({
      take,
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        status: true,
        type: true,
        estimatedTime: true,
        createdAt: true,
        tableNumber: true,
        items: {
          include: { 
            menuItem: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    const orders = recent.map((o) => ({
      id: String(o.id),
      orderNumber: o.orderNumber,
      customerName: o.customerName ?? undefined,
      customerAvatar: null as null,
      items: o.items.map(i => i.menuItem?.name ?? `Item ${i.menuItemId}`),
      total: o.totalAmount,
      status: o.status, // UPPERCASE per Prisma
      type: o.type,     // UPPERCASE per Prisma
      time: new Date(o.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      estimatedTime: o.estimatedTime ?? null,
      createdAt: o.createdAt.toISOString(),
      tableNumber: o.tableNumber ?? null
    }))

    return NextResponse.json({
      success: true,
      data: {
        orders,
        total: orders.length,
        lastUpdate: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Recent orders error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت سفارشات اخیر',
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'پارامترهای نامعتبر' },
        { status: 400 }
      )
    }

    const normalized = String(status).toUpperCase().trim()
    if (!(normalized in OrderStatus)) {
      return NextResponse.json(
        { success: false, error: 'وضعیت نامعتبر' },
        { status: 400 }
      )
    }

    const updated = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status: normalized as OrderStatus }
    })

    return NextResponse.json({
      success: true,
      message: 'وضعیت سفارش با موفقیت تغییر کرد',
      data: {
        orderId: String(updated.id),
        status: updated.status,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Update order status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در تغییر وضعیت سفارش',
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    )
  }
}
