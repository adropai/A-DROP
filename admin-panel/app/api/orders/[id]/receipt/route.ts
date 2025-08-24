import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Get order data
    const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`)
    if (!orderResponse.ok) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      )
    }

    const order = await orderResponse.json()

    // Create PDF
    const doc = new PDFDocument()
    const buffers: Buffer[] = []

    doc.on('data', (buffer) => buffers.push(buffer))
    
    return new Promise<NextResponse>((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        
        resolve(new NextResponse(pdfData, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="receipt-${order.orderNumber}.pdf"`,
          },
        }))
      })

      // Add content to PDF
      doc.fontSize(16).text('رستوران A-DROP', { align: 'center' })
      doc.fontSize(14).text('رسید سفارش', { align: 'center' })
      doc.moveDown()

      // Order info
      doc.fontSize(12)
      doc.text(`شماره سفارش: ${order.orderNumber}`)
      doc.text(`تاریخ: ${new Date(order.createdAt).toLocaleDateString('fa-IR')}`)
      doc.text(`نوع سفارش: ${getOrderTypeText(order.type)}`)
      if (order.tableNumber) {
        doc.text(`شماره میز: ${order.tableNumber}`)
      }
      doc.moveDown()

      // Customer info
      doc.text('اطلاعات مشتری:')
      doc.text(`نام: ${order.customer?.name || 'نامشخص'}`)
      doc.text(`تلفن: ${order.customer?.phone || '-'}`)
      if (order.customer?.address) {
        doc.text(`آدرس: ${order.customer.address}`)
      }
      doc.moveDown()

      // Items
      doc.text('آیتم‌های سفارش:')
      doc.moveDown(0.5)
      
      order.items?.forEach((item: any) => {
        doc.text(`${item.name} x ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} ﷼`)
        if (item.notes) {
          doc.fontSize(10).text(`یادداشت: ${item.notes}`)
          doc.fontSize(12)
        }
      })
      
      doc.moveDown()

      // Totals
      doc.text(`جمع آیتم‌ها: ${order.totalAmount?.toLocaleString()} ﷼`)
      
      if (order.discount > 0) {
        doc.text(`تخفیف: -${order.discount.toLocaleString()} ﷼`)
      }
      
      if (order.tax > 0) {
        doc.text(`مالیات: ${order.tax.toLocaleString()} ﷼`)
      }
      
      if (order.deliveryFee > 0) {
        doc.text(`هزینه ارسال: ${order.deliveryFee.toLocaleString()} ﷼`)
      }
      
      doc.fontSize(14).text(`مبلغ نهایی: ${order.totalAmount.toLocaleString()} ﷼`)
      
      doc.moveDown()
      doc.fontSize(12).text(`روش پرداخت: ${getPaymentMethodText(order.paymentMethod)}`)
      
      if (order.notes) {
        doc.moveDown()
        doc.text(`یادداشت: ${order.notes}`)
      }

      doc.moveDown(2)
      doc.fontSize(10).text('از خرید شما متشکریم', { align: 'center' })
      doc.text(`تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')} ${new Date().toLocaleTimeString('fa-IR')}`, { align: 'center' })

      doc.end()
    })

  } catch (error) {
    console.error('Error generating receipt:', error)
    return NextResponse.json(
      { error: 'خطا در تولید رسید' },
      { status: 500 }
    )
  }
}

function getOrderTypeText(type: string): string {
  switch (type) {
    case 'dine-in': return 'حضوری'
    case 'takeaway': return 'بیرون‌بر'
    case 'delivery': return 'ارسالی'
    default: return type
  }
}

function getPaymentMethodText(method: string): string {
  switch (method) {
    case 'cash': return 'نقدی'
    case 'card': return 'کارتی'
    case 'online': return 'آنلاین'
    default: return method
  }
}
