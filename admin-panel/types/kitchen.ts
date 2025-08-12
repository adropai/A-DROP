// ===============================================
// 🧑‍🍳 انواع TypeScript جدید برای سیستم آشپزخانه
// ===============================================

// Kitchen Types - Enhanced for Multi-Department Workflow

// Define enums locally since they may not be exported from Prisma client yet
export enum Department {
  KITCHEN = 'KITCHEN',
  COFFEE_SHOP = 'COFFEE_SHOP',
  GRILL = 'GRILL',
  DESSERT = 'DESSERT',
  HOOKAH = 'HOOKAH',
  BAKERY = 'BAKERY',
  SALAD_BAR = 'SALAD_BAR'
}

export enum KitchenStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
}

export enum KitchenItemStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
}

export enum OrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY'
}

// Department Types
export { Department, KitchenStatus, KitchenItemStatus, OrderPriority, OrderStatus, OrderType };

// آیتم منو برای آشپزخانه
export interface KitchenMenuItem {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  price: number;
  preparationTime: number;
  department: Department;
  image?: string;
  ingredients: string[];
  allergens: string[];
  category: {
    id: string;
    name: string;
  };
}

// آیتم سفارش برای آشپزخانه
export interface KitchenOrderItem {
  id: number;
  quantity: number;
  notes?: string;
  customizations?: string;
  preparationTime?: number;
  menuItem: KitchenMenuItem;
}

// فیش آشپزخانه
export interface KitchenTicket {
  id: string;
  ticketNumber: string;
  orderId: number;
  department: Department;
  status: KitchenStatus;
  priority: OrderPriority;
  assignedChef?: string;
  tableNumber?: number;
  notes?: string;
  estimatedTime?: number;
  startedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  order: {
    orderNumber: string;
    customerName?: string;
    type: OrderType;
    totalAmount: number;
  };
  items: KitchenTicketItemWithDetails[];
}

// آیتم فیش آشپزخانه با جزئیات
export interface KitchenTicketItemWithDetails {
  id: string;
  quantity: number;
  notes?: string;
  status: KitchenItemStatus;
  preparationTime?: number;
  startedAt?: Date;
  completedAt?: Date;
  orderItem: {
    id: number;
    price: number;
    customizations?: string;
    menuItem: KitchenMenuItem;
  };
}

// آمار آشپزخانه
export interface KitchenStats {
  overview: {
    pendingTickets: number;
    preparingTickets: number;
    readyTickets: number;
    servedTickets: number;
    totalTickets: number;
    averagePreparationTime: number;
  };
  byDepartment: {
    [key in Department]: {
      pending: number;
      preparing: number;
      ready: number;
      served: number;
      total: number;
    };
  };
  performance: {
    ticketsCompletedToday: number;
    averageCompletionTime: number;
    delayedTickets: number;
    onTimeTickets: number;
  };
  chefs: Array<{
    name: string;
    assignedTickets: number;
    completedTickets: number;
    averageTime: number;
  }>;
}

// فیلتر آشپزخانه
export interface KitchenFilter {
  department?: Department;
  status?: KitchenStatus;
  priority?: OrderPriority;
  assignedChef?: string;
  tableNumber?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// فرم ایجاد فیش آشپزخانه
export interface CreateKitchenTicketForm {
  orderId: number;
  department: Department;
  priority?: OrderPriority;
  assignedChef?: string;
  notes?: string;
  estimatedTime?: number;
  itemIds: number[]; // IDs of OrderItems
}

// فرم به‌روزرسانی وضعیت فیش
export interface UpdateKitchenTicketForm {
  status?: KitchenStatus;
  assignedChef?: string;
  notes?: string;
  estimatedTime?: number;
}

// فرم به‌روزرسانی آیتم فیش
export interface UpdateKitchenTicketItemForm {
  status?: KitchenItemStatus;
  notes?: string;
  preparationTime?: number;
}

// تایمر آشپزخانه
export interface KitchenTimer {
  ticketId: string;
  startTime: Date;
  estimatedTime: number;
  elapsedTime: number;
  isOverdue: boolean;
}

// اعلان آشپزخانه
export interface KitchenNotification {
  id: string;
  type: 'NEW_ORDER' | 'ORDER_READY' | 'ORDER_DELAYED' | 'PRIORITY_ORDER';
  title: string;
  message: string;
  ticketId?: string;
  department: Department;
  isRead: boolean;
  createdAt: Date;
}

// تنظیمات آشپزخانه
export interface KitchenSettings {
  departments: {
    [key in Department]: {
      enabled: boolean;
      defaultPreparationTime: number;
      maxConcurrentTickets: number;
      workingHours: {
        start: string;
        end: string;
      };
      chefs: string[];
    };
  };
  notifications: {
    newOrder: boolean;
    orderReady: boolean;
    orderDelayed: boolean;
    soundEnabled: boolean;
  };
  display: {
    ticketsPerPage: number;
    autoRefresh: boolean;
    refreshInterval: number; // seconds
    showCustomerInfo: boolean;
    showEstimatedTime: boolean;
  };
}

// صف آشپزخانه
export interface KitchenQueue {
  department: Department;
  tickets: KitchenTicket[];
  totalEstimatedTime: number;
  averageWaitTime: number;
}

// گزارش عملکرد آشپزخانه
export interface KitchenPerformanceReport {
  date: string;
  department: Department;
  totalTickets: number;
  completedTickets: number;
  averagePreparationTime: number;
  delayedTickets: number;
  customerSatisfaction: number;
  topMenuItems: Array<{
    itemName: string;
    quantity: number;
    preparationTime: number;
  }>;
}

// Response Types
export interface KitchenApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedKitchenResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
