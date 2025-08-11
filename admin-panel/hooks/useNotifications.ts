import { useState, useCallback } from 'react'
import { message } from 'antd'

// Types for hooks
interface NotificationHookOptions {
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
}

interface OrderConfirmationData {
  orderId: string
  customerId: string
  customerPhone: string
  customerName?: string
  orderNumber: string
  totalAmount: number
  estimatedTime?: number
}

interface BirthdayNotificationData {
  customerId: string
  customerName?: string
  customerPhone: string
  discountPercent?: number
  discountCode: string
}

interface MarketingCampaignData {
  customerIds: string[]
  templateId: string
  variables: Record<string, any>
  channels: string[]
  scheduledAt?: Date
}

// Hook اصلی برای مدیریت نوتیفیکیشن‌ها
export function useNotifications(options: NotificationHookOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ارسال تایید سفارش
  const sendOrderConfirmation = useCallback(async (data: OrderConfirmationData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/notifications/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'خطا در ارسال تایید سفارش')
      }

      message.success('پیام تایید سفارش ارسال شد')
      options.onSuccess?.(result.data)
      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته'
      setError(errorMessage)
      message.error(errorMessage)
      options.onError?.(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options])

  // ارسال تبریک تولد
  const sendBirthdayGreeting = useCallback(async (data: BirthdayNotificationData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/notifications/birthday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'خطا در ارسال تبریک تولد')
      }

      message.success('پیام تبریک تولد ارسال شد')
      options.onSuccess?.(result.data)
      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته'
      setError(errorMessage)
      message.error(errorMessage)
      options.onError?.(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options])

  // ارسال کمپین بازاریابی
  const sendMarketingCampaign = useCallback(async (data: MarketingCampaignData) => {
    try {
      setLoading(true)
      setError(null)

      const promises = data.customerIds.map(customerId => 
        fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'marketing',
            channels: data.channels,
            recipient: { id: customerId },
            templateId: data.templateId,
            variables: Object.entries(data.variables).map(([key, value]) => ({ key, value })),
            priority: 'normal',
            scheduledAt: data.scheduledAt?.toISOString()
          })
        })
      )

      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))

      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      message.success(`${successCount} پیام ارسال شد${failCount > 0 ? ` - ${failCount} ناموفق` : ''}`)
      options.onSuccess?.(results)
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته'
      setError(errorMessage)
      message.error(errorMessage)
      options.onError?.(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options])

  // ارسال نوتیفیکیشن سفارشی
  const sendCustomNotification = useCallback(async (notificationData: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'خطا در ارسال نوتیفیکیشن')
      }

      message.success('نوتیفیکیشن ارسال شد')
      options.onSuccess?.(result.data)
      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته'
      setError(errorMessage)
      message.error(errorMessage)
      options.onError?.(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options])

  return {
    loading,
    error,
    sendOrderConfirmation,
    sendBirthdayGreeting,
    sendMarketingCampaign,
    sendCustomNotification
  }
}

// Hook برای مدیریت قالب‌ها
export function useNotificationTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // دریافت قالب‌ها
  const fetchTemplates = useCallback(async (filters: { type?: string, channel?: string, language?: string } = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.channel) params.append('channel', filters.channel)
      if (filters.language) params.append('language', filters.language)

      const response = await fetch(`/api/notifications?${params.toString()}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'خطا در دریافت قالب‌ها')
      }

      setTemplates(result.data)
      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته'
      setError(errorMessage)
      message.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // ذخیره قالب
  const saveTemplate = useCallback(async (template: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'خطا در ذخیره قالب')
      }

      message.success('قالب با موفقیت ذخیره شد')
      
      // بروزرسانی لیست قالب‌ها
      setTemplates(prev => {
        const index = prev.findIndex(t => t.id === result.data.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = result.data
          return updated
        } else {
          return [...prev, result.data]
        }
      })

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته'
      setError(errorMessage)
      message.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    saveTemplate
  }
}

// Hook برای نوتیفیکیشن‌های سریع مشتریان
export function useCustomerNotifications() {
  const { sendCustomNotification, loading, error } = useNotifications()

  // اطلاع‌رسانی وضعیت سفارش
  const notifyOrderStatus = useCallback(async (
    customerId: string,
    orderNumber: string,
    status: 'preparing' | 'ready' | 'delivered',
    customerPhone?: string
  ) => {
    const statusMessages = {
      preparing: 'در حال آماده‌سازی',
      ready: 'آماده تحویل',
      delivered: 'تحویل داده شده'
    }

    return sendCustomNotification({
      type: 'order_status',
      channels: ['sms', 'push'],
      recipient: {
        id: customerId,
        phone: customerPhone
      },
      templateId: 'order_ready_push',
      variables: [
        { key: 'order_number', value: orderNumber },
        { key: 'status', value: statusMessages[status] }
      ],
      priority: 'high'
    })
  }, [sendCustomNotification])

  // یادآوری رزرو
  const notifyReservationReminder = useCallback(async (
    customerId: string,
    reservationTime: Date,
    tableNumber: string,
    customerPhone?: string
  ) => {
    return sendCustomNotification({
      type: 'reservation_reminder',
      channels: ['sms', 'push'],
      recipient: {
        id: customerId,
        phone: customerPhone
      },
      templateId: 'reservation_reminder',
      variables: [
        { key: 'reservation_time', value: reservationTime, format: 'time' },
        { key: 'table_number', value: tableNumber }
      ],
      priority: 'normal',
      scheduledAt: new Date(reservationTime.getTime() - 30 * 60 * 1000) // 30 دقیقه قبل
    })
  }, [sendCustomNotification])

  return {
    loading,
    error,
    notifyOrderStatus,
    notifyReservationReminder
  }
}

// Hook برای آمار نوتیفیکیشن‌ها
export function useNotificationStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async (dateRange?: { from: Date, to: Date }) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (dateRange) {
        params.append('from', dateRange.from.toISOString())
        params.append('to', dateRange.to.toISOString())
      }

      const response = await fetch(`/api/notifications/stats?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      }

      return result.data
    } catch (error) {
      console.error('خطا در دریافت آمار:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    loading,
    fetchStats
  }
}
