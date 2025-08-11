// ===============================================
// 📦 انواع TypeScript برای مدیریت انبار
// ===============================================

// نوع حرکت انبار
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'WASTE' | 'EXPIRED'

// وضعیت موجودی
export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED' | 'DAMAGED'

// واحدهای اندازه‌گیری
export type InventoryUnit = 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'box' | 'pack' | 'dozen'

// دسته‌بندی انبار
export interface InventoryCategory {
  id: string
  name: string
  nameEn?: string
  nameAr?: string
  description?: string
  parentId?: string
  parent?: InventoryCategory
  children?: InventoryCategory[]
  items?: InventoryItem[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// آیتم انبار
export interface InventoryItem {
  id: string
  name: string
  nameEn?: string
  nameAr?: string
  description?: string
  category: InventoryCategory
  categoryId: string
  sku: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  price: number
  averageCost: number
  supplier?: string
  supplierCode?: string
  lastRestockDate?: Date
  expiryDate?: Date
  batchNumber?: string
  barcode?: string
  location?: string
  status: InventoryStatus
  autoReorder: boolean
  isActive: boolean
  movements?: StockMovement[]
  createdAt: Date
  updatedAt: Date
}

// حرکت انبار
export interface StockMovement {
  id: string
  item: InventoryItem
  itemId: string
  type: MovementType
  quantity: number
  previousStock: number
  newStock: number
  unitPrice?: number
  totalValue?: number
  reason?: string
  reference?: string
  batchNumber?: string
  expiryDate?: Date
  supplier?: string
  user: string
  notes?: string
  createdAt: Date
}

// آمار انبار
export interface InventoryStats {
  totalItems: number
  totalCategories: number
  inStockItems: number
  lowStockItems: number
  outOfStockItems: number
  expiredItems: number
  totalValue: number
  lowStockAlerts: number
  expiryAlerts: number
  recentMovements: number
  topCategories: {
    categoryName: string
    itemCount: number
    totalValue: number
  }[]
  stockTrend: {
    date: string
    inStock: number
    lowStock: number
    outOfStock: number
  }[]
  movementsByType: {
    type: MovementType
    count: number
    value: number
  }[]
}

// فیلتر انبار
export interface InventoryFilter {
  search?: string
  categoryId?: string
  status?: InventoryStatus[]
  minStock?: number
  maxStock?: number
  supplier?: string
  location?: string
  expiryDateFrom?: Date
  expiryDateTo?: Date
  autoReorder?: boolean
  isActive?: boolean
}

// فرم ایجاد/ویرایش آیتم انبار
export interface InventoryItemForm {
  name: string
  nameEn?: string
  nameAr?: string
  description?: string
  categoryId: string
  sku: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  price: number
  supplier?: string
  supplierCode?: string
  lastRestockDate?: Date
  expiryDate?: Date
  batchNumber?: string
  barcode?: string
  location?: string
  autoReorder: boolean
  isActive: boolean
}

// فرم حرکت انبار
export interface StockMovementForm {
  itemId: string
  type: MovementType
  quantity: number
  unitPrice?: number
  reason?: string
  reference?: string
  batchNumber?: string
  expiryDate?: Date
  supplier?: string
  notes?: string
}

// گزارش انبار
export interface InventoryReport {
  reportId: string
  title: string
  type: 'stock-levels' | 'movements' | 'expired-items' | 'low-stock' | 'valuation'
  dateRange: {
    from: Date
    to: Date
  }
  filters: InventoryFilter
  data: any[]
  summary: {
    totalItems: number
    totalValue: number
    averageValue: number
  }
  createdAt: Date
}

// نوتیفیکیشن انبار
export interface InventoryNotification {
  id: string
  type: 'low-stock' | 'out-of-stock' | 'expiry-warning' | 'reorder-needed'
  itemId: string
  itemName: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  actionRequired: boolean
  createdAt: Date
}

// تنظیمات انبار
export interface InventorySettings {
  autoReorderEnabled: boolean
  lowStockThreshold: number
  expiryWarningDays: number
  defaultUnit: InventoryUnit
  enableBarcodes: boolean
  enableBatchTracking: boolean
  enableLocationTracking: boolean
  enableSupplierTracking: boolean
  defaultLocation?: string
  currencySymbol: string
  notifications: {
    lowStock: boolean
    outOfStock: boolean
    expiryWarning: boolean
    reorderNeeded: boolean
  }
}
