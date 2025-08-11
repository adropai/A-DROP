import { NextRequest, NextResponse } from 'next/server'
import { createNotificationManager } from '@/lib/notification-system'

// تنظیمات درگاه‌ها
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

// POST /api/notifications/birthday - تبریک تولد
export async function POST(request: NextRequest) {
  try {
    const { customerId, customerName, customerPhone, discountPercent, discountCode } = await request.json()

    if (!customerId || !customerPhone) {
      return NextResponse.json({
        success: false,
        error: 'اطلاعات مشتری ناقص است'
      }, { status: 400 })
    }

    const result = await notificationManager.sendNotification({
      id: `birthday_${customerId}_${Date.now()}`,
      type: 'birthday',
      channel: ['sms', 'email'],
      recipient: {
        id: customerId,
        phone: customerPhone
      },
      templateId: 'birthday_sms',
      variables: [
        { key: 'customer_name', value: customerName || 'مشتری گرامی' },
        { key: 'discount_percent', value: discountPercent || 20 },
        { key: 'discount_code', value: discountCode }
      ],
      priority: 'normal',
      metadata: { customerId, source: 'birthday_campaign' },
      createdAt: new Date()
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'پیام تبریک تولد ارسال شد'
    })
  } catch (error) {
    console.error('خطا در ارسال تبریک تولد:', error)
    return NextResponse.json({
      success: false,
      error: 'خطا در ارسال تبریک تولد'
    }, { status: 500 })
  }
}
