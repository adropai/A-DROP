import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

interface UpdateStatusRequest {
  status: string
  notes?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, notes }: UpdateStatusRequest = await request.json()
    const orderId = Number(params.id)

    const normalized = String(status).toUpperCase()
    if (!(normalized in OrderStatus)) {
      return NextResponse.json(
        { error: 'وضعیت نامعتبر است' },
        { status: 400 }
      )
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: normalized as OrderStatus,
        notes: notes ?? undefined,
      },
      include: { items: { include: { menuItem: true } } }
    })

    // Send notification to kitchen if status is preparing
  if (normalized === 'PREPARING') {
      try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kitchen/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
      orderId: String(updated.id),
      items: updated.items,
      priority: (updated as any).priority || 'NORMAL',
      notes: updated.notes
          })
        })
      } catch (error) {
        console.error('Failed to send to kitchen:', error)
        // Don't fail the main request
      }
    }

    // Send notification to customer if status is ready or delivered
    if (normalized === 'READY' || normalized === 'SERVED') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'order_status',
            customerId: (updated as any).customerId,
            orderId: String(updated.id),
            status: normalized,
            message: normalized === 'READY' ? 
              'سفارش شما آماده است' : 
              'سفارش شما تحویل داده شد'
          })
        })
      } catch (error) {
        console.error('Failed to send notification:', error)
        // Don't fail the main request
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: String(updated.id),
        orderNumber: updated.orderNumber,
        status: updated.status,
        updatedAt: updated.updatedAt.toISOString(),
      },
      message: 'وضعیت سفارش با موفقیت بروزرسانی شد'
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'خطا در بروزرسانی وضعیت سفارش' },
      { status: 500 }
    )
  }
}
