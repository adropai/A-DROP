// ===============================================
// 🚚 انواع TypeScript برای مدیریت تحویل
// ===============================================

// وضعیت تحویل
export type DeliveryStatus = 
  | 'PENDING'        // در انتظار تحویل
  | 'ASSIGNED'       // تخصیص داده شده
  | 'PICKED_UP'      // برداشته شده
  | 'IN_TRANSIT'     // در حال حمل
  | 'DELIVERED'      // تحویل داده شده
  | 'FAILED'         // ناموفق
  | 'RETURNED'       // بازگشتی
  | 'CANCELLED'      // لغو شده

// نوع تحویل
export type DeliveryType = 'DELIVERY' | 'PICKUP' | 'DINE_IN'

// وضعیت پیک
export type CourierStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_BREAK'

// نوع وسیله نقلیه
export type VehicleType = 'BIKE' | 'MOTORCYCLE' | 'CAR' | 'WALKING'

// اطلاعات آدرس
export interface Address {
  id: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
  landmarks?: string
  instructions?: string
  customerId: string
  customer?: any // از Customer type استفاده می‌کنیم
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// پیک
export interface Courier {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  vehicleType: VehicleType
  vehicleNumber?: string
  licenseNumber?: string
  status: CourierStatus
  rating: number
  totalDeliveries: number
  activeDelivery?: Delivery
  currentLocation?: {
    latitude: number
    longitude: number
    lastUpdated: Date
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// تحویل
export interface Delivery {
  id: string
  orderId: string
  order?: any // از Order type استفاده می‌کنیم
  customerId: string
  customer?: any // از Customer type استفاده می‌کنیم
  courierId?: string
  courier?: Courier
  type: DeliveryType
  status: DeliveryStatus
  
  // آدرس و مسافت
  pickupAddress: Address
  deliveryAddress?: Address
  distance?: number // کیلومتر
  estimatedTime?: number // دقیقه
  
  // زمان‌بندی
  scheduledAt?: Date
  assignedAt?: Date
  pickedUpAt?: Date
  deliveredAt?: Date
  
  // هزینه
  deliveryFee: number
  tip?: number
  totalAmount: number
  
  // اطلاعات تکمیلی
  instructions?: string
  notes?: string
  priority: number // 1: عادی، 2: سریع، 3: فوری
  
  // ردیابی
  trackingCode: string
  signature?: string
  proofOfDelivery?: string[] // آرایه تصاویر
  
  // امتیاز
  customerRating?: number
  courierRating?: number
  feedback?: string
  
  createdAt: Date
  updatedAt: Date
}

// آمار تحویل
export interface DeliveryStats {
  total: number
  pending: number
  assigned: number
  inTransit: number
  delivered: number
  failed: number
  returned: number
  cancelled: number
  
  // آمار مالی
  totalRevenue: number
  avgDeliveryFee: number
  totalTips: number
  
  // آمار عملکرد
  avgDeliveryTime: number // دقیقه
  onTimeDeliveryRate: number // درصد
  customerSatisfaction: number // از 5
  
  // آمار پیک‌ها
  activeCouriers: number
  totalCouriers: number
  avgCourierRating: number
}

// فیلتر تحویلات
export interface DeliveryFilter {
  status?: DeliveryStatus[]
  type?: DeliveryType[]
  courierId?: string
  customerId?: string
  dateFrom?: Date
  dateTo?: Date
  city?: string
  minAmount?: number
  maxAmount?: number
  priority?: number[]
  rating?: number
  limit?: number
}

// فرم ایجاد تحویل
export interface DeliveryForm {
  orderId: string
  customerId: string
  type: DeliveryType
  deliveryAddress?: Partial<Address>
  scheduledAt?: Date
  instructions?: string
  priority: number
  deliveryFee: number
}

// فرم ویرایش تحویل
export interface DeliveryUpdateForm {
  status?: DeliveryStatus
  courierId?: string
  scheduledAt?: Date
  instructions?: string
  notes?: string
  priority?: number
  deliveryFee?: number
}

// فرم پیک
export interface CourierForm {
  name: string
  phone: string
  email?: string
  vehicleType: VehicleType
  vehicleNumber?: string
  licenseNumber?: string
  status?: CourierStatus
}

// فرم آدرس
export interface AddressForm {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
  landmarks?: string
  instructions?: string
  isDefault?: boolean
}

// درخواست تخصیص پیک
export interface AssignCourierRequest {
  deliveryId: string
  courierId: string
  estimatedDeliveryTime?: Date
  notes?: string
}

// گزارش تحویل
export interface DeliveryReport {
  period: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM'
  dateFrom: Date
  dateTo: Date
  stats: DeliveryStats
  topCouriers: Array<{
    courier: Courier
    deliveries: number
    rating: number
    revenue: number
  }>
  deliveryTrends: Array<{
    date: string
    delivered: number
    failed: number
    revenue: number
  }>
  areaStats: Array<{
    area: string
    deliveries: number
    avgTime: number
    revenue: number
  }>
}

// بررسی وضعیت تحویل
export function getDeliveryStatusLabel(status: DeliveryStatus): string {
  const labels: Record<DeliveryStatus, string> = {
    PENDING: 'در انتظار تحویل',
    ASSIGNED: 'تخصیص داده شده',
    PICKED_UP: 'برداشته شده',
    IN_TRANSIT: 'در حال حمل',
    DELIVERED: 'تحویل داده شده',
    FAILED: 'ناموفق',
    RETURNED: 'بازگشتی',
    CANCELLED: 'لغو شده'
  }
  return labels[status] || 'نامشخص'
}

// بررسی رنگ وضعیت
export function getDeliveryStatusColor(status: DeliveryStatus): string {
  const colors: Record<DeliveryStatus, string> = {
    PENDING: 'orange',
    ASSIGNED: 'blue',
    PICKED_UP: 'cyan',
    IN_TRANSIT: 'processing',
    DELIVERED: 'success',
    FAILED: 'error',
    RETURNED: 'warning',
    CANCELLED: 'default'
  }
  return colors[status] || 'default'
}

// بررسی وضعیت پیک
export function getCourierStatusLabel(status: CourierStatus): string {
  const labels: Record<CourierStatus, string> = {
    AVAILABLE: 'آماده',
    BUSY: 'مشغول',
    OFFLINE: 'آفلاین',
    ON_BREAK: 'استراحت'
  }
  return labels[status] || 'نامشخص'
}

// بررسی رنگ وضعیت پیک
export function getCourierStatusColor(status: CourierStatus): string {
  const colors: Record<CourierStatus, string> = {
    AVAILABLE: 'success',
    BUSY: 'processing',
    OFFLINE: 'default',
    ON_BREAK: 'warning'
  }
  return colors[status] || 'default'
}
