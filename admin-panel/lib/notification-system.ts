// SMS & Notification System
// سیستم جامع پیامک و اطلاع‌رسانی

export type NotificationChannel = 
  | 'sms'            // پیامک
  | 'email'          // ایمیل
  | 'push'           // نوتیفیکیشن push
  | 'whatsapp'       // واتساپ
  | 'telegram'       // تلگرام
  | 'webhook'        // webhook

export type NotificationType = 
  | 'order_confirmation'    // تایید سفارش
  | 'order_status'          // وضعیت سفارش
  | 'payment_confirmation' // تایید پرداخت
  | 'delivery_update'      // بروزرسانی تحویل
  | 'reservation_reminder' // یادآوری رزرو
  | 'marketing'            // بازاریابی
  | 'system_alert'         // هشدار سیستم
  | 'birthday'             // تولد
  | 'loyalty_points'       // امتیاز وفاداری
  | 'promotion'            // تخفیف و پیشنهاد

export type TemplateVariable = {
  key: string
  value: string | number
  format?: 'currency' | 'date' | 'time' | 'number'
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  channel: NotificationChannel
  subject?: string  // برای email
  content: string
  variables: string[] // لیست متغیرهای قابل استفاده
  isActive: boolean
  language: 'fa' | 'en' | 'ar'
  createdAt: Date
  updatedAt: Date
}

export interface SMSGatewayConfig {
  provider: 'kavenegar' | 'ippanel' | 'payamak' | 'melipayamak'
  apiKey: string
  username?: string
  password?: string
  lineNumber: string
  isActive: boolean
}

export interface EmailGatewayConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses'
  host?: string
  port?: number
  username?: string
  password?: string
  apiKey?: string
  fromEmail: string
  fromName: string
  isActive: boolean
}

export interface PushNotificationConfig {
  provider: 'firebase' | 'pusher' | 'onesignal'
  serverKey: string
  projectId?: string
  isActive: boolean
}

export interface NotificationRequest {
  id: string
  type: NotificationType
  channel: NotificationChannel[]
  recipient: {
    id: string
    phone?: string
    email?: string
    pushToken?: string
    preferredLanguage?: 'fa' | 'en' | 'ar'
  }
  templateId: string
  variables: TemplateVariable[]
  priority: 'low' | 'normal' | 'high' | 'critical'
  scheduledAt?: Date
  expiresAt?: Date
  metadata?: Record<string, any>
  createdAt: Date
}

export interface NotificationStatus {
  id: string
  requestId: string
  channel: NotificationChannel
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'expired'
  providerId?: string
  error?: string
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  userId: string
  sms: {
    enabled: boolean
    orderUpdates: boolean
    marketing: boolean
    reminders: boolean
  }
  email: {
    enabled: boolean
    orderUpdates: boolean
    marketing: boolean
    newsletters: boolean
    receipts: boolean
  }
  push: {
    enabled: boolean
    orderUpdates: boolean
    marketing: boolean
    reminders: boolean
    sounds: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm
    endTime: string   // HH:mm
  }
  language: 'fa' | 'en' | 'ar'
  updatedAt: Date
}

// کلاس اصلی مدیریت نوتیفیکیشن
export class NotificationManager {
  private smsConfig: SMSGatewayConfig
  private emailConfig: EmailGatewayConfig
  private pushConfig: PushNotificationConfig
  private templates: Map<string, NotificationTemplate> = new Map()

  constructor(
    smsConfig: SMSGatewayConfig,
    emailConfig: EmailGatewayConfig,
    pushConfig: PushNotificationConfig
  ) {
    this.smsConfig = smsConfig
    this.emailConfig = emailConfig
    this.pushConfig = pushConfig
  }

  // ارسال نوتیفیکیشن
  async sendNotification(request: NotificationRequest): Promise<NotificationStatus[]> {
    const results: NotificationStatus[] = []
    
    // بررسی تنظیمات کاربر
    const preferences = await this.getUserPreferences(request.recipient.id)
    
    // فیلتر کردن کانال‌ها بر اساس تنظیمات کاربر
    const allowedChannels = this.filterChannelsByPreferences(request.channel, request.type, preferences)
    
    // بررسی ساعات سکوت
    if (this.isQuietHours(preferences)) {
      // اگر پیام فوری نباشد، برای بعد برنامه‌ریزی کن
      if (request.priority !== 'critical') {
        return this.scheduleForLater(request)
      }
    }

    // ارسال به هر کانال
    for (const channel of allowedChannels) {
      try {
        const status = await this.sendToChannel(request, channel)
        results.push(status)
      } catch (error) {
        results.push({
          id: this.generateId(),
          requestId: request.id,
          channel,
          status: 'failed',
          error: error instanceof Error ? error.message : 'خطای ناشناخته',
          sentAt: new Date()
        })
      }
    }

    return results
  }

  // ارسال به کانال خاص
  private async sendToChannel(
    request: NotificationRequest, 
    channel: NotificationChannel
  ): Promise<NotificationStatus> {
    const template = this.templates.get(request.templateId)
    if (!template) {
      throw new Error('قالب یافت نشد')
    }

    const content = this.processTemplate(template.content, request.variables)
    const subject = template.subject ? this.processTemplate(template.subject, request.variables) : undefined

    switch (channel) {
      case 'sms':
        return await this.sendSMS(request.recipient.phone!, content, request.id)
      
      case 'email':
        return await this.sendEmail(
          request.recipient.email!, 
          subject || template.name, 
          content, 
          request.id
        )
      
      case 'push':
        return await this.sendPushNotification(
          request.recipient.pushToken!, 
          subject || template.name, 
          content, 
          request.id,
          request.metadata
        )
      
      case 'whatsapp':
        return await this.sendWhatsApp(request.recipient.phone!, content, request.id)
      
      default:
        throw new Error(`کانال ${channel} پشتیبانی نمی‌شود`)
    }
  }

  // ارسال پیامک
  private async sendSMS(phone: string, message: string, requestId: string): Promise<NotificationStatus> {
    if (!this.smsConfig.isActive) {
      throw new Error('سرویس پیامک غیرفعال است')
    }

    try {
      let result: any

      switch (this.smsConfig.provider) {
        case 'kavenegar':
          result = await this.sendKavenegarSMS(phone, message)
          break
        case 'ippanel':
          result = await this.sendIPPanelSMS(phone, message)
          break
        case 'payamak':
          result = await this.sendPayamakSMS(phone, message)
          break
        default:
          throw new Error('ارائه‌دهنده پیامک پشتیبانی نمی‌شود')
      }

      return {
        id: this.generateId(),
        requestId,
        channel: 'sms',
        status: 'sent',
        providerId: result.messageId,
        sentAt: new Date()
      }
    } catch (error) {
      throw new Error(`خطا در ارسال پیامک: ${error}`)
    }
  }

  // ارسال ایمیل
  private async sendEmail(
    email: string, 
    subject: string, 
    content: string, 
    requestId: string
  ): Promise<NotificationStatus> {
    if (!this.emailConfig.isActive) {
      throw new Error('سرویس ایمیل غیرفعال است')
    }

    try {
      let result: any

      switch (this.emailConfig.provider) {
        case 'smtp':
          result = await this.sendSMTPEmail(email, subject, content)
          break
        case 'sendgrid':
          result = await this.sendSendGridEmail(email, subject, content)
          break
        default:
          throw new Error('ارائه‌دهنده ایمیل پشتیبانی نمی‌شود')
      }

      return {
        id: this.generateId(),
        requestId,
        channel: 'email',
        status: 'sent',
        providerId: result.messageId,
        sentAt: new Date()
      }
    } catch (error) {
      throw new Error(`خطا در ارسال ایمیل: ${error}`)
    }
  }

  // ارسال پوش نوتیفیکیشن
  private async sendPushNotification(
    token: string, 
    title: string, 
    body: string, 
    requestId: string,
    data?: Record<string, any>
  ): Promise<NotificationStatus> {
    if (!this.pushConfig.isActive) {
      throw new Error('سرویس پوش نوتیفیکیشن غیرفعال است')
    }

    try {
      let result: any

      switch (this.pushConfig.provider) {
        case 'firebase':
          result = await this.sendFirebasePush(token, title, body, data)
          break
        case 'onesignal':
          result = await this.sendOneSignalPush(token, title, body, data)
          break
        default:
          throw new Error('ارائه‌دهنده پوش نوتیفیکیشن پشتیبانی نمی‌شود')
      }

      return {
        id: this.generateId(),
        requestId,
        channel: 'push',
        status: 'sent',
        providerId: result.messageId,
        sentAt: new Date()
      }
    } catch (error) {
      throw new Error(`خطا در ارسال پوش نوتیفیکیشن: ${error}`)
    }
  }

  // پردازش قالب پیام
  private processTemplate(template: string, variables: TemplateVariable[]): string {
    let processed = template

    variables.forEach(variable => {
      const placeholder = `{${variable.key}}`
      let value = variable.value.toString()

      // اعمال فرمت
      if (variable.format) {
        switch (variable.format) {
          case 'currency':
            value = Number(variable.value).toLocaleString('fa-IR') + ' تومان'
            break
          case 'date':
            value = new Date(variable.value).toLocaleDateString('fa-IR')
            break
          case 'time':
            value = new Date(variable.value).toLocaleTimeString('fa-IR')
            break
          case 'number':
            value = Number(variable.value).toLocaleString('fa-IR')
            break
        }
      }

      processed = processed.replace(new RegExp(placeholder, 'g'), value)
    })

    return processed
  }

  // پیاده‌سازی ارسال کاوه‌نگار
  private async sendKavenegarSMS(phone: string, message: string): Promise<any> {
    const response = await fetch('https://api.kavenegar.com/v1/' + this.smsConfig.apiKey + '/sms/send.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        receptor: phone,
        message: message,
        sender: this.smsConfig.lineNumber
      })
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.entries?.[0]?.message || 'خطا در ارسال پیامک')
    }

    return { messageId: result.entries[0].messageid }
  }

  // پیاده‌سازی Firebase Push
  private async sendFirebasePush(
    token: string, 
    title: string, 
    body: string, 
    data?: Record<string, any>
  ): Promise<any> {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${this.pushConfig.serverKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body },
        data: data || {}
      })
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'خطا در ارسال پوش نوتیفیکیشن')
    }

    return { messageId: result.message_id }
  }

  // مدیریت قالب‌ها
  addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template)
  }

  getTemplate(id: string): NotificationTemplate | undefined {
    return this.templates.get(id)
  }

  // تولید ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // بررسی تنظیمات کاربر
  private async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    // TODO: دریافت از دیتابیس
    return {
      userId,
      sms: { enabled: true, orderUpdates: true, marketing: false, reminders: true },
      email: { enabled: true, orderUpdates: true, marketing: true, newsletters: false, receipts: true },
      push: { enabled: true, orderUpdates: true, marketing: false, reminders: true, sounds: true },
      quietHours: { enabled: true, startTime: '22:00', endTime: '08:00' },
      language: 'fa',
      updatedAt: new Date()
    }
  }

  // فیلتر کردن کانال‌ها
  private filterChannelsByPreferences(
    channels: NotificationChannel[], 
    type: NotificationType, 
    preferences: NotificationPreferences
  ): NotificationChannel[] {
    return channels.filter(channel => {
      switch (channel) {
        case 'sms':
          return preferences.sms.enabled && this.checkSMSType(type, preferences)
        case 'email':
          return preferences.email.enabled && this.checkEmailType(type, preferences)
        case 'push':
          return preferences.push.enabled && this.checkPushType(type, preferences)
        default:
          return true
      }
    })
  }

  private checkSMSType(type: NotificationType, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'marketing':
      case 'promotion':
        return preferences.sms.marketing
      case 'reservation_reminder':
        return preferences.sms.reminders
      default:
        return preferences.sms.orderUpdates
    }
  }

  private checkEmailType(type: NotificationType, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'marketing':
      case 'promotion':
        return preferences.email.marketing
      default:
        return preferences.email.orderUpdates
    }
  }

  private checkPushType(type: NotificationType, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'marketing':
      case 'promotion':
        return preferences.push.marketing
      case 'reservation_reminder':
        return preferences.push.reminders
      default:
        return preferences.push.orderUpdates
    }
  }

  // بررسی ساعات سکوت
  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = preferences.quietHours.startTime.split(':').map(Number)
    const [endHour, endMin] = preferences.quietHours.endTime.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  // برنامه‌ریزی برای بعد
  private async scheduleForLater(request: NotificationRequest): Promise<NotificationStatus[]> {
    // TODO: پیاده‌سازی scheduler
    return [{
      id: this.generateId(),
      requestId: request.id,
      channel: request.channel[0],
      status: 'pending',
      sentAt: new Date()
    }]
  }

  // سایر پیاده‌سازی‌های SMS و Email...
  private async sendIPPanelSMS(phone: string, message: string): Promise<any> {
    // TODO: پیاده‌سازی IP Panel
    return { messageId: 'ippanel_' + Date.now() }
  }

  private async sendPayamakSMS(phone: string, message: string): Promise<any> {
    // TODO: پیاده‌سازی پیامک
    return { messageId: 'payamak_' + Date.now() }
  }

  private async sendSMTPEmail(email: string, subject: string, content: string): Promise<any> {
    // TODO: پیاده‌سازی SMTP
    return { messageId: 'smtp_' + Date.now() }
  }

  private async sendSendGridEmail(email: string, subject: string, content: string): Promise<any> {
    // TODO: پیاده‌سازی SendGrid
    return { messageId: 'sendgrid_' + Date.now() }
  }

  private async sendOneSignalPush(token: string, title: string, body: string, data?: Record<string, any>): Promise<any> {
    // TODO: پیاده‌سازی OneSignal
    return { messageId: 'onesignal_' + Date.now() }
  }

  private async sendWhatsApp(phone: string, message: string, requestId: string): Promise<NotificationStatus> {
    // TODO: پیاده‌سازی WhatsApp API
    return {
      id: this.generateId(),
      requestId,
      channel: 'whatsapp',
      status: 'sent',
      sentAt: new Date()
    }
  }
}

// قالب‌های پیش‌فرض
export const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'order_confirmation_sms',
    name: 'تایید سفارش - پیامک',
    type: 'order_confirmation',
    channel: 'sms',
    content: 'سلام {customer_name}، سفارش شما با شماره {order_number} ثبت شد. مبلغ: {total_amount}. زمان تقریبی آماده‌سازی: {estimated_time} دقیقه.',
    variables: ['customer_name', 'order_number', 'total_amount', 'estimated_time'],
    isActive: true,
    language: 'fa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'order_ready_push',
    name: 'آماده‌سازی سفارش - پوش',
    type: 'order_status',
    channel: 'push',
    subject: 'سفارش آماده است!',
    content: 'سفارش شما #{order_number} آماده تحویل است.',
    variables: ['order_number'],
    isActive: true,
    language: 'fa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'birthday_sms',
    name: 'تولد مبارک - پیامک',
    type: 'birthday',
    channel: 'sms',
    content: 'تولدت مبارک {customer_name}! برای جشن این روز خاص {discount_percent}% تخفیف برای شما در نظر گرفتیم. کد: {discount_code}',
    variables: ['customer_name', 'discount_percent', 'discount_code'],
    isActive: true,
    language: 'fa',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// تابع کمکی برای ایجاد Notification Manager
export function createNotificationManager(
  smsConfig: SMSGatewayConfig,
  emailConfig: EmailGatewayConfig,
  pushConfig: PushNotificationConfig
): NotificationManager {
  const manager = new NotificationManager(smsConfig, emailConfig, pushConfig)
  
  // اضافه کردن قالب‌های پیش‌فرض
  DEFAULT_TEMPLATES.forEach(template => {
    manager.addTemplate(template)
  })
  
  return manager
}
