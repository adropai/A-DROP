// Payment Gateway Integration System
// سیستم یکپارچه‌سازی درگاه‌های پرداخت

import React from 'react'

export type PaymentGateway = 
  | 'saman'          // درگاه سامان
  | 'pasargad'       // درگاه پاسارگاد
  | 'mellat'         // درگاه ملت
  | 'parsian'        // درگاه پارسیان
  | 'zarinpal'       // زرین‌پال
  | 'nextpay'        // نکست‌پی
  | 'jibit'          // جیبیت
  | 'payping'        // پی‌پینگ

export type PaymentMethod = 
  | 'card'           // کارت بانکی
  | 'cash'           // نقدی
  | 'wallet'         // کیف پول دیجیتال
  | 'credit'         // اعتباری
  | 'installment'    // قسطی
  | 'crypto'         // رمزارز

export type PaymentStatus = 
  | 'pending'        // در انتظار
  | 'processing'     // در حال پردازش
  | 'completed'      // تکمیل شده
  | 'failed'         // ناموفق
  | 'cancelled'      // لغو شده
  | 'refunded'       // بازپرداخت شده
  | 'partially_refunded' // بازپرداخت جزئی

export interface PaymentGatewayConfig {
  gateway: PaymentGateway
  merchantId: string
  terminalId?: string
  userName?: string
  password?: string
  apiKey?: string
  secretKey?: string
  isActive: boolean
  supportedMethods: PaymentMethod[]
  minAmount: number
  maxAmount: number
  feeType: 'fixed' | 'percentage'
  feeAmount: number
  description: string
}

export interface PaymentRequest {
  id: string
  orderId: string
  customerId: string
  gateway: PaymentGateway
  method: PaymentMethod
  amount: number
  currency: string
  description: string
  callbackUrl: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  referenceId?: string
  redirectUrl?: string
  error?: string
  errorCode?: string
  gateway: PaymentGateway
  amount: number
  status: PaymentStatus
  processedAt: Date
}

export interface PaymentTransaction {
  id: string
  orderId: string
  customerId: string
  gateway: PaymentGateway
  method: PaymentMethod
  amount: number
  currency: string
  status: PaymentStatus
  transactionId?: string
  referenceId?: string
  trackingCode?: string
  description: string
  fee: number
  netAmount: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// تنظیمات پیش‌فرض درگاه‌ها
export const DEFAULT_GATEWAY_CONFIGS: PaymentGatewayConfig[] = [
  {
    gateway: 'saman',
    merchantId: '',
    isActive: false,
    supportedMethods: ['card'],
    minAmount: 1000,
    maxAmount: 50000000,
    feeType: 'percentage',
    feeAmount: 1.5,
    description: 'درگاه پرداخت بانک سامان'
  },
  {
    gateway: 'zarinpal',
    merchantId: '',
    isActive: false,
    supportedMethods: ['card', 'wallet'],
    minAmount: 1000,
    maxAmount: 50000000,
    feeType: 'percentage',
    feeAmount: 1.5,
    description: 'درگاه پرداخت زرین‌پال'
  },
  {
    gateway: 'mellat',
    merchantId: '',
    terminalId: '',
    userName: '',
    password: '',
    isActive: false,
    supportedMethods: ['card'],
    minAmount: 1000,
    maxAmount: 50000000,
    feeType: 'percentage',
    feeAmount: 2.0,
    description: 'درگاه پرداخت بانک ملت'
  }
]

// کلاس مدیریت پرداخت
export class PaymentManager {
  private gateways: Map<PaymentGateway, PaymentGatewayConfig> = new Map()

  constructor(configs: PaymentGatewayConfig[]) {
    configs.forEach(config => {
      this.gateways.set(config.gateway, config)
    })
  }

  // انتخاب بهترین درگاه بر اساس مبلغ و روش پرداخت
  selectBestGateway(amount: number, method: PaymentMethod): PaymentGateway | null {
    const availableGateways = Array.from(this.gateways.values())
      .filter(config => 
        config.isActive &&
        config.supportedMethods.includes(method) &&
        amount >= config.minAmount &&
        amount <= config.maxAmount
      )
      .sort((a, b) => {
        // مرتب‌سازی بر اساس کمترین کارمزد
        const feeA = a.feeType === 'fixed' ? a.feeAmount : (amount * a.feeAmount / 100)
        const feeB = b.feeType === 'fixed' ? b.feeAmount : (amount * b.feeAmount / 100)
        return feeA - feeB
      })

    return availableGateways.length > 0 ? availableGateways[0].gateway : null
  }

  // محاسبه کارمزد
  calculateFee(gateway: PaymentGateway, amount: number): number {
    const config = this.gateways.get(gateway)
    if (!config) return 0

    return config.feeType === 'fixed' 
      ? config.feeAmount
      : (amount * config.feeAmount / 100)
  }

  // ایجاد درخواست پرداخت
  async createPaymentRequest(request: Omit<PaymentRequest, 'id' | 'createdAt'>): Promise<PaymentResponse> {
    const config = this.gateways.get(request.gateway)
    if (!config || !config.isActive) {
      return {
        success: false,
        error: 'درگاه پرداخت غیرفعال است',
        gateway: request.gateway,
        amount: request.amount,
        status: 'failed',
        processedAt: new Date()
      }
    }

    try {
      // بر اساس نوع درگاه، API مربوطه را فراخوانی می‌کنیم
      switch (request.gateway) {
        case 'saman':
          return await this.processSamanPayment(request, config)
        case 'zarinpal':
          return await this.processZarinpalPayment(request, config)
        case 'mellat':
          return await this.processMellatPayment(request, config)
        default:
          throw new Error('درگاه پرداخت پشتیبانی نمی‌شود')
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطای ناشناخته',
        gateway: request.gateway,
        amount: request.amount,
        status: 'failed',
        processedAt: new Date()
      }
    }
  }

  // تایید پرداخت
  async verifyPayment(transactionId: string, gateway: PaymentGateway): Promise<PaymentResponse> {
    const config = this.gateways.get(gateway)
    if (!config) {
      return {
        success: false,
        error: 'درگاه پرداخت یافت نشد',
        gateway,
        amount: 0,
        status: 'failed',
        processedAt: new Date()
      }
    }

    try {
      switch (gateway) {
        case 'saman':
          return await this.verifySamanPayment(transactionId, config)
        case 'zarinpal':
          return await this.verifyZarinpalPayment(transactionId, config)
        case 'mellat':
          return await this.verifyMellatPayment(transactionId, config)
        default:
          throw new Error('درگاه پرداخت پشتیبانی نمی‌شود')
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطای تایید پرداخت',
        gateway,
        amount: 0,
        status: 'failed',
        processedAt: new Date()
      }
    }
  }

  // پیاده‌سازی درگاه سامان
  private async processSamanPayment(
    request: Omit<PaymentRequest, 'id' | 'createdAt'>, 
    config: PaymentGatewayConfig
  ): Promise<PaymentResponse> {
    // TODO: پیاده‌سازی API سامان
    return {
      success: true,
      transactionId: `saman_${Date.now()}`,
      redirectUrl: `https://sep.shaparak.ir/payment?token=sample_token`,
      gateway: request.gateway,
      amount: request.amount,
      status: 'pending',
      processedAt: new Date()
    }
  }

  // پیاده‌سازی درگاه زرین‌پال
  private async processZarinpalPayment(
    request: Omit<PaymentRequest, 'id' | 'createdAt'>, 
    config: PaymentGatewayConfig
  ): Promise<PaymentResponse> {
    // TODO: پیاده‌سازی API زرین‌پال
    return {
      success: true,
      transactionId: `zarinpal_${Date.now()}`,
      redirectUrl: `https://www.zarinpal.com/pg/StartPay/sample_token`,
      gateway: request.gateway,
      amount: request.amount,
      status: 'pending',
      processedAt: new Date()
    }
  }

  // پیاده‌سازی درگاه ملت
  private async processMellatPayment(
    request: Omit<PaymentRequest, 'id' | 'createdAt'>, 
    config: PaymentGatewayConfig
  ): Promise<PaymentResponse> {
    // TODO: پیاده‌سازی API ملت
    return {
      success: true,
      transactionId: `mellat_${Date.now()}`,
      redirectUrl: `https://bpm.shaparak.ir/pgwchannel/startpay.mellat?token=sample_token`,
      gateway: request.gateway,
      amount: request.amount,
      status: 'pending',
      processedAt: new Date()
    }
  }

  // تایید پرداخت سامان
  private async verifySamanPayment(transactionId: string, config: PaymentGatewayConfig): Promise<PaymentResponse> {
    // TODO: پیاده‌سازی verify API سامان
    return {
      success: true,
      transactionId,
      referenceId: `ref_${Date.now()}`,
      gateway: 'saman',
      amount: 0, // باید از API دریافت شود
      status: 'completed',
      processedAt: new Date()
    }
  }

  // تایید پرداخت زرین‌پال
  private async verifyZarinpalPayment(transactionId: string, config: PaymentGatewayConfig): Promise<PaymentResponse> {
    // TODO: پیاده‌سازی verify API زرین‌پال
    return {
      success: true,
      transactionId,
      referenceId: `ref_${Date.now()}`,
      gateway: 'zarinpal',
      amount: 0, // باید از API دریافت شود
      status: 'completed',
      processedAt: new Date()
    }
  }

  // تایید پرداخت ملت
  private async verifyMellatPayment(transactionId: string, config: PaymentGatewayConfig): Promise<PaymentResponse> {
    // TODO: پیاده‌سازی verify API ملت
    return {
      success: true,
      transactionId,
      referenceId: `ref_${Date.now()}`,
      gateway: 'mellat',
      amount: 0, // باید از API دریافت شود
      status: 'completed',
      processedAt: new Date()
    }
  }

  // بازپرداخت
  async refundPayment(transactionId: string, amount: number, reason: string): Promise<PaymentResponse> {
    // TODO: پیاده‌سازی بازپرداخت
    return {
      success: true,
      transactionId: `refund_${Date.now()}`,
      gateway: 'saman', // باید از transaction اصلی گرفته شود
      amount,
      status: 'refunded',
      processedAt: new Date()
    }
  }
}

// کارخانه ایجاد Payment Manager
export function createPaymentManager(configs?: PaymentGatewayConfig[]): PaymentManager {
  return new PaymentManager(configs || DEFAULT_GATEWAY_CONFIGS)
}

// هوک React برای استفاده از Payment Manager
export function usePaymentManager() {
  const [paymentManager] = React.useState(() => createPaymentManager())
  
  const createPayment = React.useCallback(async (request: Omit<PaymentRequest, 'id' | 'createdAt'>) => {
    return await paymentManager.createPaymentRequest(request)
  }, [paymentManager])

  const verifyPayment = React.useCallback(async (transactionId: string, gateway: PaymentGateway) => {
    return await paymentManager.verifyPayment(transactionId, gateway)
  }, [paymentManager])

  const selectGateway = React.useCallback((amount: number, method: PaymentMethod) => {
    return paymentManager.selectBestGateway(amount, method)
  }, [paymentManager])

  const calculateFee = React.useCallback((gateway: PaymentGateway, amount: number) => {
    return paymentManager.calculateFee(gateway, amount)
  }, [paymentManager])

  return {
    createPayment,
    verifyPayment,
    selectGateway,
    calculateFee
  }
}
