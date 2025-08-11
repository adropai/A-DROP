import { NextRequest, NextResponse } from 'next/server'
import { 
  NotificationManager, 
  NotificationRequest, 
  NotificationTemplate,
  SMSGatewayConfig,
  EmailGatewayConfig,
  PushNotificationConfig,
  createNotificationManager,
  DEFAULT_TEMPLATES 
} from '@/lib/notification-system'

// تنظیمات پیش‌فرض درگاه‌ها
const defaultSMSConfig: SMSGatewayConfig = {
  provider: 'kavenegar',
  apiKey: process.env.KAVENEGAR_API_KEY || '',
  lineNumber: process.env.SMS_LINE_NUMBER || '1000596446',
  isActive: !!process.env.KAVENEGAR_API_KEY
}

const defaultEmailConfig: EmailGatewayConfig = {
  provider: 'smtp',
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT) || 587,
  username: process.env.SMTP_USERNAME || '',
  password: process.env.SMTP_PASSWORD || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@adrop.restaurant',
  fromName: process.env.FROM_NAME || 'A-DROP Restaurant',
  isActive: !!process.env.SMTP_HOST
}

const defaultPushConfig: PushNotificationConfig = {
  provider: 'firebase',
  serverKey: process.env.FIREBASE_SERVER_KEY || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  isActive: !!process.env.FIREBASE_SERVER_KEY
}

// ایجاد instance مدیر نوتیفیکیشن
const notificationManager = createNotificationManager(
  defaultSMSConfig,
  defaultEmailConfig,
  defaultPushConfig
)

// GET /api/notifications/templates - دریافت قالب‌ها
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const channel = searchParams.get('channel')
    const language = searchParams.get('language') || 'fa'

    let templates = DEFAULT_TEMPLATES

    // فیلتر بر اساس نوع
    if (type) {
      templates = templates.filter(t => t.type === type)
    }

    // فیلتر بر اساس کانال
    if (channel) {
      templates = templates.filter(t => t.channel === channel)
    }

    // فیلتر بر اساس زبان
    templates = templates.filter(t => t.language === language)

    return NextResponse.json({
      success: true,
      data: templates,
      message: 'قالب‌ها با موفقیت دریافت شد'
    })
  } catch (error) {
    console.error('خطا در دریافت قالب‌ها:', error)
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت قالب‌ها'
    }, { status: 500 })
  }
}

// POST /api/notifications/send - ارسال نوتیفیکیشن
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // اعتبارسنجی داده‌های ورودی
    const {
      type,
      channels,
      recipient,
      templateId,
      variables,
      priority = 'normal',
      scheduledAt,
      metadata
    } = body

    if (!type || !channels || !recipient || !templateId) {
      return NextResponse.json({
        success: false,
        error: 'اطلاعات الزامی ناقص است'
      }, { status: 400 })
    }

    // ایجاد درخواست نوتیفیکیشن
    const notificationRequest: NotificationRequest = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2)}`,
      type,
      channel: channels,
      recipient,
      templateId,
      variables: variables || [],
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      metadata,
      createdAt: new Date()
    }

    // ارسال نوتیفیکیشن
    const results = await notificationManager.sendNotification(notificationRequest)

    // بررسی نتایج
    const successCount = results.filter(r => r.status === 'sent').length
    const failCount = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
      success: successCount > 0,
      data: {
        requestId: notificationRequest.id,
        results,
        summary: {
          total: results.length,
          sent: successCount,
          failed: failCount
        }
      },
      message: successCount > 0 
        ? `${successCount} نوتیفیکیشن ارسال شد` 
        : 'هیچ نوتیفیکیشنی ارسال نشد'
    })
  } catch (error) {
    console.error('خطا در ارسال نوتیفیکیشن:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطا در ارسال نوتیفیکیشن'
    }, { status: 500 })
  }
}

// PUT /api/notifications/templates - ایجاد یا ویرایش قالب
export async function PUT(request: NextRequest) {
  try {
    const template: NotificationTemplate = await request.json()

    // اعتبارسنجی
    if (!template.name || !template.type || !template.channel || !template.content) {
      return NextResponse.json({
        success: false,
        error: 'اطلاعات قالب ناقص است'
      }, { status: 400 })
    }

    // تنظیم ID در صورت عدم وجود
    if (!template.id) {
      template.id = `template_${Date.now()}_${Math.random().toString(36).substr(2)}`
    }

    template.updatedAt = new Date()
    if (!template.createdAt) {
      template.createdAt = new Date()
    }

    // اضافه کردن قالب
    notificationManager.addTemplate(template)

    return NextResponse.json({
      success: true,
      data: template,
      message: 'قالب با موفقیت ذخیره شد'
    })
  } catch (error) {
    console.error('خطا در ذخیره قالب:', error)
    return NextResponse.json({
      success: false,
      error: 'خطا در ذخیره قالب'
    }, { status: 500 })
  }
}
