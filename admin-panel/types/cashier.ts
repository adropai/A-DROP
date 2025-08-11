// ===============================================
// 💰 انواع TypeScript برای پنل صندوق
// ===============================================

// Types for Cashier System - Compatible with Store
export interface CashierTransaction {
  id: string
  type: 'sale' | 'refund' | 'expense' | 'cash_in' | 'cash_out'
  amount: number
  paymentMethod: 'cash' | 'card' | 'online'
  orderId?: string
  description: string
  registerId: string
  cashierId?: string
  receiptNumber?: string
  taxAmount?: number
  discountAmount?: number
  status: 'completed' | 'pending' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CashRegister {
  id: string
  name: string
  location?: string
  status: 'open' | 'closed'
  cashBalance: number
  openedAt?: string
  closedAt?: string
  openedBy?: string
  closedBy?: string
  lastActivity: string
  dailyTransactions?: number
  createdAt: string
  updatedAt: string
}

export interface DailyReport {
  date: string
  registerId?: string
  totalSales: number
  totalRefunds: number
  totalExpenses: number
  netAmount: number
  transactionCount: number
  cashPayments: number
  cardPayments: number
  onlinePayments: number
  openingBalance: number
  closingBalance: number
  cashDeposits: number
  cashWithdrawals: number
  averageTransaction: number
  largestTransaction: number
  smallestTransaction: number
  refundCount: number
  refundAmount: number
  taxTotal: number
  discountTotal: number
  createdAt: string
}

// روش پرداخت
export type PaymentMethod = 
  | 'CASH'           // نقد
  | 'CARD'           // کارت
  | 'ONLINE'         // آنلاین
  | 'CREDIT'         // اعتبار
  | 'VOUCHER'        // کوپن
  | 'INSTALLMENT'    // قسطی

// وضعیت پرداخت
export type PaymentStatus = 
  | 'PENDING'        // در انتظار
  | 'PROCESSING'     // در حال پردازش
  | 'COMPLETED'      // تکمیل شده
  | 'FAILED'         // ناموفق
  | 'REFUNDED'       // بازپرداخت شده
  | 'CANCELLED'      // لغو شده

// نوع تراکنش
export type TransactionType = 
  | 'SALE'           // فروش
  | 'REFUND'         // بازپرداخت
  | 'DISCOUNT'       // تخفیف
  | 'TIP'            // انعام
  | 'TAX'            // مالیات
  | 'VOID'           // باطل

// وضعیت صندوق
export type CashierStatus = 
  | 'OPEN'           // باز
  | 'CLOSED'         // بسته
  | 'SUSPENDED'      // معلق

// معاملات پرداخت
export interface Payment {
  id: string
  orderId: string
  order?: any // Order type
  customerId?: string
  customer?: any // Customer type
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  paidAmount: number
  changeAmount: number
  tip?: number
  discount?: number
  tax?: number
  currency: string
  
  // اطلاعات پرداخت کارتی
  cardNumber?: string // 4 رقم آخر
  cardType?: string // Visa, MasterCard, etc.
  authCode?: string
  terminalId?: string
  
  // اطلاعات پرداخت آنلاین
  gatewayId?: string
  gatewayName?: string
  transactionId?: string
  trackingCode?: string
  
  // اطلاعات کوپن
  voucherCode?: string
  voucherDiscount?: number
  
  // تایید و امضا
  signature?: string
  receiptNumber?: string
  cashierId: string
  cashier?: CashierUser
  
  // زمان‌بندی
  processedAt?: Date
  settledAt?: Date
  
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// تراکنش مالی
export interface Transaction {
  id: string
  paymentId?: string
  payment?: Payment
  orderId?: string
  type: TransactionType
  amount: number
  description: string
  reference?: string
  cashierId: string
  cashier?: CashierUser
  shiftId?: string
  shift?: CashierShift
  createdAt: Date
}

// شیفت صندوق
export interface CashierShift {
  id: string
  cashierId: string
  cashier?: CashierUser
  startTime: Date
  endTime?: Date
  status: CashierStatus
  
  // موجودی ابتدای شیفت
  openingCash: number
  openingCard: number
  openingTotal: number
  
  // موجودی پایان شیفت
  closingCash?: number
  closingCard?: number
  closingTotal?: number
  
  // آمار شیفت
  totalSales: number
  totalRefunds: number
  totalTransactions: number
  totalCash: number
  totalCard: number
  totalOnline: number
  totalTips: number
  totalDiscounts: number
  
  // تطبیق حساب
  expectedCash: number
  actualCash?: number
  cashVariance?: number
  
  transactions: Transaction[]
  payments: Payment[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// کاربر صندوق
export interface CashierUser {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  pin: string // PIN کد برای ورود سریع
  role: string
  permissions: string[]
  
  // آمار کارکرد
  totalShifts: number
  totalSales: number
  avgSalesPerShift: number
  accuracy: number // درصد دقت
  
  shifts: CashierShift[]
  payments: Payment[]
  transactions: Transaction[]
  
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

// آمار صندوق
export interface CashierStats {
  // آمار امروز
  todayStats: {
    totalSales: number
    totalTransactions: number
    totalCash: number
    totalCard: number
    totalOnline: number
    totalRefunds: number
    totalTips: number
    avgTransactionValue: number
    peakHour: string
    activeShifts: number
  }
  
  // آمار هفتگی
  weeklyStats: {
    totalSales: number
    dailyAverage: number
    growthRate: number
    topPaymentMethod: PaymentMethod
    busyDays: string[]
  }
  
  // آمار عملکرد
  performanceStats: {
    avgProcessingTime: number // ثانیه
    successRate: number // درصد
    errorRate: number // درصد
    refundRate: number // درصد
    cashAccuracy: number // درصد
  }
  
  // آمار روش‌های پرداخت
  paymentMethodStats: Array<{
    method: PaymentMethod
    count: number
    amount: number
    percentage: number
  }>
}

// فیلتر تراکنش‌ها
export interface CashierFilter {
  dateFrom?: Date
  dateTo?: Date
  paymentMethod?: PaymentMethod[]
  status?: PaymentStatus[]
  cashierId?: string
  shiftId?: string
  minAmount?: number
  maxAmount?: number
  transactionType?: TransactionType[]
}

// فرم پرداخت
export interface PaymentForm {
  orderId: string
  method: PaymentMethod
  amount: number
  paidAmount: number
  tip?: number
  discount?: number
  notes?: string
  
  // اطلاعات کارت
  cardNumber?: string
  cardType?: string
  
  // اطلاعات آنلاین
  gatewayId?: string
  
  // کوپن
  voucherCode?: string
}

// فرم باز کردن شیفت
export interface OpenShiftForm {
  cashierId: string
  openingCash: number
  openingCard: number
  notes?: string
}

// فرم بستن شیفت
export interface CloseShiftForm {
  actualCash: number
  notes?: string
}

// فرم بازپرداخت
export interface RefundForm {
  paymentId: string
  amount: number
  reason: string
  method?: PaymentMethod
}

// گزارش صندوق
export interface CashierReport {
  period: 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'
  dateFrom: Date
  dateTo: Date
  
  summary: {
    totalSales: number
    totalTransactions: number
    totalRefunds: number
    netSales: number
    avgTransactionValue: number
  }
  
  paymentBreakdown: Array<{
    method: PaymentMethod
    amount: number
    count: number
    percentage: number
  }>
  
  hourlyBreakdown: Array<{
    hour: string
    sales: number
    transactions: number
  }>
  
  cashierPerformance: Array<{
    cashier: CashierUser
    sales: number
    transactions: number
    accuracy: number
    shifts: number
  }>
  
  topItems: Array<{
    item: string
    quantity: number
    revenue: number
  }>
}

// دریافت‌کننده صندوق
export interface CashDrawer {
  id: string
  terminalId: string
  status: 'OPEN' | 'CLOSED'
  currentCash: number
  expectedCash: number
  lastOpenedAt: Date
  lastClosedAt?: Date
  cashierId?: string
}

// تنظیمات صندوق
export interface CashierSettings {
  id: string
  
  // تنظیمات عمومی
  currency: string
  taxRate: number
  autoOpenDrawer: boolean
  requirePinForRefund: boolean
  maxRefundAmount: number
  
  // تنظیمات دریافت
  receiptHeader: string
  receiptFooter: string
  printCustomerReceipt: boolean
  printMerchantReceipt: boolean
  
  // تنظیمات پرداخت
  allowedPaymentMethods: PaymentMethod[]
  cardReaderEnabled: boolean
  onlineGateway?: string
  
  // تنظیمات شیفت
  requireShiftOpen: boolean
  maxShiftDuration: number // ساعت
  autoCloseShift: boolean
  
  createdAt: Date
  updatedAt: Date
}

// توابع کمکی
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    CASH: 'نقد',
    CARD: 'کارت',
    ONLINE: 'آنلاین',
    CREDIT: 'اعتبار',
    VOUCHER: 'کوپن',
    INSTALLMENT: 'قسطی'
  }
  return labels[method] || 'نامشخص'
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    PENDING: 'در انتظار',
    PROCESSING: 'در حال پردازش',
    COMPLETED: 'تکمیل شده',
    FAILED: 'ناموفق',
    REFUNDED: 'بازپرداخت شده',
    CANCELLED: 'لغو شده'
  }
  return labels[status] || 'نامشخص'
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    PENDING: 'orange',
    PROCESSING: 'blue',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'warning',
    CANCELLED: 'default'
  }
  return colors[status] || 'default'
}

export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    SALE: 'فروش',
    REFUND: 'بازپرداخت',
    DISCOUNT: 'تخفیف',
    TIP: 'انعام',
    TAX: 'مالیات',
    VOID: 'باطل'
  }
  return labels[type] || 'نامشخص'
}

// محاسبه تغییرات پول
export function calculateChange(totalAmount: number, paidAmount: number): number {
  return Math.max(0, paidAmount - totalAmount)
}

// فرمت مبلغ
export function formatCurrency(amount: number, currency = 'تومان'): string {
  return `${amount.toLocaleString('fa-IR')} ${currency}`
}

// اعتبارسنجی PIN
export function validatePin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin)
}

// اعتبارسنجی شماره کارت
export function validateCardNumber(cardNumber: string): boolean {
  return /^\d{4}$/.test(cardNumber) // فقط 4 رقم آخر
}
