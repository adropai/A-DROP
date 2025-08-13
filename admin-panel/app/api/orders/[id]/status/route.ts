import { NextRequest, NextResponse } from 'next/server'

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
    const orderId = params.id

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'وضعیت نامعتبر است' },
        { status: 400 }
      )
    }

    // Get current order
    const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`)
    if (!orderResponse.ok) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      )
    }

    const order = await orderResponse.json()

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    }

    // Add timestamp based on status
    switch (status) {
      case 'confirmed':
        updateData.confirmedAt = new Date().toISOString()
        break
      case 'preparing':
        updateData.preparingAt = new Date().toISOString()
        break
      case 'ready':
        updateData.readyAt = new Date().toISOString()
        break
      case 'delivered':
        updateData.deliveredAt = new Date().toISOString()
        break
      case 'completed':
        updateData.completedAt = new Date().toISOString()
        break
    }

    if (notes) {
      updateData.statusNotes = notes
    }

    // Update order in database
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error('Failed to update order')
    }

    const updatedOrder = await response.json()

    // Send notification to kitchen if status is preparing
    if (status === 'preparing') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kitchen/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            items: order.items,
            priority: order.priority || 'normal',
            notes: order.notes
          })
        })
      } catch (error) {
        console.error('Failed to send to kitchen:', error)
        // Don't fail the main request
      }
    }

    // Send notification to customer if status is ready or delivered
    if (status === 'ready' || status === 'delivered') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'order_status',
            customerId: order.customerId,
            orderId: orderId,
            status: status,
            message: status === 'ready' ? 
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
      order: updatedOrder,
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
