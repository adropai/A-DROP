import { NextRequest, NextResponse } from 'next/server'
import { createNotificationManager } from '@/lib/notification-system'

// تنظیمات درگاه‌ها (مشابه فایل قبلی)
const notificationManager = createNotificationManager(
  {
    provider: 'kavenegar',
    apiKey: process.env.KAVENEGAR_API_KEY || '',
    lineNumber: process.env.SMS_LINE_NUMBER || '1000596446',
    isActive: !!process.env.KAVENEGAR_API_KEY
  },
  {
    provider: 'smtp',
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@adrop.restaurant',
    fromName: process.env.FROM_NAME || 'A-DROP Restaurant',
    isActive: !!process.env.SMTP_HOST
  },
  {
    provider: 'firebase',
    serverKey: process.env.FIREBASE_SERVER_KEY || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    isActive: !!process.env.FIREBASE_SERVER_KEY
  }
)

// POST /api/notifications/order-confirmation - تایید سفارش
export async function POST(request: NextRequest) {
  try {
    const { orderId, customerId, customerPhone, customerName, orderNumber, totalAmount, estimatedTime } = await request.json()

    if (!orderId || !customerId || !customerPhone) {
      return NextResponse.json({
        success: false,
        error: 'اطلاعات سفارش ناقص است'
      }, { status: 400 })
    }

    const result = await notificationManager.sendNotification({
      id: `order_confirm_${orderId}`,
      type: 'order_confirmation',
      channel: ['sms', 'push'],
      recipient: {
        id: customerId,
        phone: customerPhone
      },
      templateId: 'order_confirmation_sms',
      variables: [
        { key: 'customer_name', value: customerName || 'مشتری گرامی' },
        { key: 'order_number', value: orderNumber },
        { key: 'total_amount', value: totalAmount, format: 'currency' },
        { key: 'estimated_time', value: estimatedTime || 30 }
      ],
      priority: 'high',
      metadata: { orderId, source: 'order_confirmation' },
      createdAt: new Date()
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'پیام تایید سفارش ارسال شد'
    })
  } catch (error) {
    console.error('خطا در ارسال تایید سفارش:', error)
    return NextResponse.json({
      success: false,
      error: 'خطا در ارسال تایید سفارش'
    }, { status: 500 })
  }
}
