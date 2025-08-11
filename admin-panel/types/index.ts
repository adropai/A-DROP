// Type definitions for the project
import type { ReactNode } from 'react'

// Export all types
export * from './delivery'
export * from './customers'
export * from './inventory'
export * from './kitchen'
export * from './orders'
export * from './tables'

// Common component props
export interface BaseComponentProps {
  children?: ReactNode
  className?: string
}

// Form types
export interface FormValues {
  [key: string]: any
}

// Table column types
export interface TableColumn {
  title: string
  dataIndex: string
  key?: string
  render?: (text: any, record: any, index: number) => ReactNode
  width?: number | string
  fixed?: 'left' | 'right'
  sorter?: boolean
  filters?: Array<{ text: string; value: any }>
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  code?: number
}

// Menu Management Types (Enhanced for Restaurant System)
export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  menuItems?: MenuItem[];
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  category: Category;
  categoryId: string;
  price: number;
  discountPrice?: number;
  images: string; // JSON string
  ingredients: string; // JSON string
  allergens: string; // JSON string
  preparationTime: number;
  calories?: number;
  nutritionInfo?: any;
  customizations: string; // JSON string
  availableHours?: any;
  isAvailable: boolean;
  isSpecial: boolean;
  priority: number;
  tags: string; // JSON string
  rating?: number;
  reviewCount: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemFormData {
  name: string;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  categoryId: string;
  price: number;
  discountPrice?: number;
  images?: File[];
  ingredients?: string[];
  allergens?: string[];
  preparationTime: number;
  calories?: number;
  isAvailable: boolean;
  isSpecial: boolean;
  priority: number;
  tags?: string[];
}

export interface CategoryFormData {
  name: string;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  image?: File;
  parentId?: string;
  priority: number;
  isActive: boolean;
}

// User types
export interface User {
  id: string
  username: string
  email: string
  phone?: string
  role: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// Order types (Updated for Restaurant System)
export interface Order {
  id: string
  orderNumber: string
  customerId?: string
  customerName: string
  phone: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  orderType: 'dine-in' | 'takeaway' | 'delivery'
  paymentMethod: 'cash' | 'card' | 'online'
  tableNumber?: number
  notes?: string
  estimatedTime?: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  menuItem: MenuItem
  name: string
  price: number
  quantity: number
  total: number
  customizations?: any[]
  notes?: string
  createdAt: Date
}

// Customer types
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  segment: 'new' | 'regular' | 'vip'
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  createdAt: string
}

// Dashboard Types
export interface DashboardStats {
  dailySales: {
    amount: number;
    change: number;
    trend: 'up' | 'down';
  };
  dailyOrders: {
    count: number;
    change: number;
    trend: 'up' | 'down';
  };
  newCustomers: {
    count: number;
    change: number;
    trend: 'up' | 'down';
  };
  satisfaction: {
    rating: number;
    change: number;
    trend: 'up' | 'down';
  };
  monthlyTarget: {
    current: number;
    target: number;
    percentage: number;
  };
  weeklyTrend: Array<{
    day: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
  hourlySales: Array<{
    hour: string;
    sales: number;
    orders: number;
  }>;
  orderTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}
