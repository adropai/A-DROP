// Role-Based Access Control System
// سیستم کنترل دسترسی بر اساس نقش

import React from 'react'

export type UserRole = 
  | 'superadmin'     // مدیر کل
  | 'admin'          // مدیر شعبه
  | 'manager'        // مدیر بخش
  | 'cashier'        // صندوقدار
  | 'kitchen'        // آشپز
  | 'waiter'         // گارسون
  | 'courier'        // پیک
  | 'support'        // پشتیبانی

export type Permission = 
  // Dashboard permissions
  | 'dashboard.view'
  | 'dashboard.analytics'
  
  // Menu management
  | 'menu.view'
  | 'menu.create'
  | 'menu.edit'
  | 'menu.delete'
  | 'menu.categories.manage'
  
  // Orders management
  | 'orders.view'
  | 'orders.create'
  | 'orders.edit'
  | 'orders.cancel'
  | 'orders.refund'
  | 'orders.status.update'
  
  // Customer management
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'customers.delete'
  | 'customers.loyalty.manage'
  
  // Tables management
  | 'tables.view'
  | 'tables.create'
  | 'tables.edit'
  | 'tables.delete'
  | 'tables.qr.generate'
  
  // Reservations
  | 'reservations.view'
  | 'reservations.create'
  | 'reservations.edit'
  | 'reservations.cancel'
  
  // Kitchen operations
  | 'kitchen.view'
  | 'kitchen.orders.update'
  | 'kitchen.print'
  
  // Delivery management
  | 'delivery.view'
  | 'delivery.assign'
  | 'delivery.track'
  | 'delivery.couriers.manage'
  
  // Marketing
  | 'marketing.view'
  | 'marketing.campaigns.create'
  | 'marketing.campaigns.edit'
  | 'marketing.banners.manage'
  
  // Reports & Analytics
  | 'reports.view'
  | 'reports.export'
  | 'reports.financial'
  | 'reports.customers'
  
  // Settings
  | 'settings.view'
  | 'settings.edit'
  | 'settings.users.manage'
  | 'settings.branches.manage'
  
  // Financial
  | 'financial.view'
  | 'financial.transactions'
  | 'financial.refunds'

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
  description: string
}

// تعریف دسترسی‌های هر نقش
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'superadmin',
    description: 'دسترسی کامل به تمام بخش‌ها',
    permissions: [
      // همه دسترسی‌ها
      'dashboard.view', 'dashboard.analytics',
      'menu.view', 'menu.create', 'menu.edit', 'menu.delete', 'menu.categories.manage',
      'orders.view', 'orders.create', 'orders.edit', 'orders.cancel', 'orders.refund', 'orders.status.update',
      'customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'customers.loyalty.manage',
      'tables.view', 'tables.create', 'tables.edit', 'tables.delete', 'tables.qr.generate',
      'reservations.view', 'reservations.create', 'reservations.edit', 'reservations.cancel',
      'kitchen.view', 'kitchen.orders.update', 'kitchen.print',
      'delivery.view', 'delivery.assign', 'delivery.track', 'delivery.couriers.manage',
      'marketing.view', 'marketing.campaigns.create', 'marketing.campaigns.edit', 'marketing.banners.manage',
      'reports.view', 'reports.export', 'reports.financial', 'reports.customers',
      'settings.view', 'settings.edit', 'settings.users.manage', 'settings.branches.manage',
      'financial.view', 'financial.transactions', 'financial.refunds'
    ]
  },
  {
    role: 'admin',
    description: 'مدیر شعبه - دسترسی کامل به شعبه',
    permissions: [
      'dashboard.view', 'dashboard.analytics',
      'menu.view', 'menu.create', 'menu.edit', 'menu.categories.manage',
      'orders.view', 'orders.create', 'orders.edit', 'orders.cancel', 'orders.refund', 'orders.status.update',
      'customers.view', 'customers.create', 'customers.edit', 'customers.loyalty.manage',
      'tables.view', 'tables.create', 'tables.edit', 'tables.qr.generate',
      'reservations.view', 'reservations.create', 'reservations.edit', 'reservations.cancel',
      'delivery.view', 'delivery.assign', 'delivery.track',
      'marketing.view', 'marketing.campaigns.create', 'marketing.banners.manage',
      'reports.view', 'reports.export', 'reports.financial', 'reports.customers',
      'settings.view', 'settings.edit',
      'financial.view', 'financial.transactions'
    ]
  },
  {
    role: 'manager',
    description: 'مدیر بخش - دسترسی محدود مدیریتی',
    permissions: [
      'dashboard.view',
      'menu.view', 'menu.edit',
      'orders.view', 'orders.create', 'orders.edit', 'orders.status.update',
      'customers.view', 'customers.create', 'customers.edit',
      'tables.view', 'tables.edit',
      'reservations.view', 'reservations.create', 'reservations.edit',
      'delivery.view', 'delivery.assign',
      'reports.view', 'reports.customers'
    ]
  },
  {
    role: 'cashier',
    description: 'صندوقدار - مدیریت پرداخت‌ها',
    permissions: [
      'dashboard.view',
      'orders.view', 'orders.create', 'orders.status.update',
      'customers.view', 'customers.create',
      'financial.view', 'financial.transactions'
    ]
  },
  {
    role: 'kitchen',
    description: 'آشپز - مدیریت سفارشات آشپزخانه',
    permissions: [
      'kitchen.view', 'kitchen.orders.update', 'kitchen.print',
      'orders.view', 'orders.status.update'
    ]
  },
  {
    role: 'waiter',
    description: 'گارسون - مدیریت میزها و سفارشات',
    permissions: [
      'dashboard.view',
      'orders.view', 'orders.create', 'orders.status.update',
      'tables.view',
      'reservations.view', 'reservations.create',
      'customers.view'
    ]
  },
  {
    role: 'courier',
    description: 'پیک - مدیریت تحویل سفارشات',
    permissions: [
      'delivery.view', 'delivery.track',
      'orders.view', 'orders.status.update'
    ]
  },
  {
    role: 'support',
    description: 'پشتیبانی - مشاهده و راهنمایی',
    permissions: [
      'dashboard.view',
      'orders.view',
      'customers.view',
      'reports.view'
    ]
  }
]

// تابع بررسی دسترسی
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const roleData = ROLE_PERMISSIONS.find(r => r.role === userRole)
  return roleData ? roleData.permissions.includes(permission) : false
}

// تابع بررسی چندین دسترسی
export function hasPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

// تابع گرفتن تمام دسترسی‌های یک نقش
export function getRolePermissions(userRole: UserRole): Permission[] {
  const roleData = ROLE_PERMISSIONS.find(r => r.role === userRole)
  return roleData ? roleData.permissions : []
}

// تابع بررسی سطح دسترسی بالاتر
export function isHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  const roleHierarchy: UserRole[] = [
    'superadmin',
    'admin', 
    'manager',
    'cashier',
    'kitchen',
    'waiter',
    'courier',
    'support'
  ]
  
  const userIndex = roleHierarchy.indexOf(userRole)
  const targetIndex = roleHierarchy.indexOf(targetRole)
  
  return userIndex < targetIndex
}

// Middleware برای بررسی دسترسی
export function requirePermission(permission: Permission) {
  return (userRole: UserRole) => {
    if (!hasPermission(userRole, permission)) {
      throw new Error(`دسترسی مورد نیاز: ${permission}`)
    }
    return true
  }
}

// HOC برای کامپوننت‌های React
export function withPermission(permission: Permission, fallback?: React.ComponentType) {
  return function<T extends {}>(Component: React.ComponentType<T>) {
    return function PermissionWrapper(props: T & { userRole: UserRole }) {
      const { userRole, ...restProps } = props
      
      if (hasPermission(userRole, permission)) {
        return React.createElement(Component, restProps as unknown as T)
      }
      
      if (fallback) {
        return React.createElement(fallback)
      }
      
      return React.createElement('div', {}, 'دسترسی محدود')
    }
  }
}
