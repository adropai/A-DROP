// ===============================================
// 🧑‍🍳 انواع TypeScript برای پنل آشپزخانه
// ===============================================

// واردات از فایل‌های types موجود
export interface MenuItem {
  id: string
  name: string
  nameEn?: string
  nameAr?: string
  category: {
    id: string
    name: string
  }
  price: number
  preparationTime: number
  image?: string
}

export interface Customer {
  id: string
  name: string
  phone?: string
}

// وضعیت‌های آشپزخانه
export type KitchenStatus = 
  | 'RECEIVED'     // دریافت شد
  | 'PREPARING'    // در حال آماده‌سازی
  | 'READY'        // آماده
  | 'SERVED'       // سرو شد

// اولویت سفارش
export type OrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

// دسته‌بندی غذا برای آشپزخانه
export type FoodCategory = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'DRINK' | 'SIDE'

// آیتم سفارش برای آشپزخانه
export interface KitchenOrderItem {
  id: string
  menuItem: MenuItem
  menuItemId: string
  quantity: number
  notes?: string
  status: KitchenStatus
  preparationTime: number // به دقیقه
  category: FoodCategory
  customizations?: string[]
  allergens?: string[]
  startedAt?: Date
  completedAt?: Date
}

// سفارش آشپزخانه
export interface KitchenOrder {
  id: string
  orderNumber: string
  customer?: {
    id: string
    name: string
    phone?: string
  }
  table?: {
    id: string
    number: string
  }
  items: KitchenOrderItem[]
  status: KitchenStatus
  priority: OrderPriority
  totalPreparationTime: number // مجموع زمان آماده‌سازی
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  orderTime: Date
  expectedReadyTime?: Date
  actualReadyTime?: Date
  notes?: string
  tags?: string[]
  estimatedDelay?: number // تاخیر تخمینی (دقیقه)
}

// فیلترهای آشپزخانه
export interface KitchenFilters {
  status?: KitchenStatus[]
  priority?: OrderPriority[]
  category?: FoodCategory[]
  orderType?: ('DINE_IN' | 'TAKEAWAY' | 'DELIVERY')[]
  timeRange?: 'LAST_1H' | 'LAST_3H' | 'TODAY' | 'CUSTOM'
  customTimeFrom?: Date
  customTimeTo?: Date
  tableNumber?: string
  customerPhone?: string
}

// آمار آشپزخانه
export interface KitchenStats {
  totalOrders: number
  pendingOrders: number
  preparingOrders: number
  readyOrders: number
  completedToday: number
  averagePreparationTime: number // دقیقه
  delayedOrders: number
  rushHourOrders: number
  popularItems: {
    itemName: string
    quantity: number
    averageTime: number
  }[]
  performanceMetrics: {
    onTimeDelivery: number // درصد
    customerSatisfaction: number // درصد
    kitchenEfficiency: number // درصد
  }
}

// تنظیمات آشپزخانه
export interface KitchenSettings {
  autoRefreshInterval: number // ثانیه
  soundNotifications: boolean
  showCustomerInfo: boolean
  showTableInfo: boolean
  displayMode: 'COMPACT' | 'DETAILED' | 'KIOSK'
  alertDelayThreshold: number // دقیقه
  maxOrdersPerView: number
  defaultPreparationTimes: Record<FoodCategory, number>
  priorityColors: Record<OrderPriority, string>
  statusColors: Record<KitchenStatus, string>
}

// اقدامات آشپزخانه
export interface KitchenActions {
  updateOrderStatus: (orderId: string, status: KitchenStatus) => Promise<void>
  updateItemStatus: (orderId: string, itemId: string, status: KitchenStatus) => Promise<void>
  setPriority: (orderId: string, priority: OrderPriority) => Promise<void>
  addNote: (orderId: string, note: string) => Promise<void>
  markDelay: (orderId: string, delayMinutes: number, reason: string) => Promise<void>
  printOrder: (orderId: string) => Promise<void>
  bulkUpdateStatus: (orderIds: string[], status: KitchenStatus) => Promise<void>
}

// Form برای به‌روزرسانی وضعیت
export interface UpdateStatusForm {
  status: KitchenStatus
  notes?: string
  estimatedDelay?: number
  delayReason?: string
}

// Form برای اولویت‌بندی
export interface SetPriorityForm {
  priority: OrderPriority
  reason?: string
}

// رویداد real-time
export interface KitchenEvent {
  type: 'NEW_ORDER' | 'STATUS_UPDATE' | 'PRIORITY_CHANGE' | 'ORDER_CANCELLED'
  orderId: string
  data: any
  timestamp: Date
}

// صف آشپزخانه
export interface KitchenQueue {
  appetizers: KitchenOrder[]
  mainCourses: KitchenOrder[]
  desserts: KitchenOrder[]
  drinks: KitchenOrder[]
  sides: KitchenOrder[]
}

// گزارش عملکرد آشپزخانه
export interface KitchenPerformanceReport {
  date: string
  totalOrders: number
  completedOrders: number
  averagePreparationTime: number
  onTimeDeliveryRate: number
  peakHours: {
    hour: number
    orderCount: number
  }[]
  slowestItems: {
    itemName: string
    averageTime: number
    count: number
  }[]
  fastestItems: {
    itemName: string
    averageTime: number
    count: number
  }[]
  delayReasons: {
    reason: string
    count: number
  }[]
}

// نوتیفیکیشن آشپزخانه
export interface KitchenNotification {
  id: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  title: string
  message: string
  orderId?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  timestamp: Date
  read: boolean
  autoHide?: boolean
  duration?: number // میلی‌ثانیه
}
