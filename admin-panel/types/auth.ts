// Types for Authentication & Authorization
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: Date;
  phoneNumber?: string;
  department?: string;
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  level: number; // 1: Super Admin, 2: Admin, 3: Manager, 4: Staff
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string; // 'menu', 'orders', 'customers', etc.
  action: PermissionAction; // 'create', 'read', 'update', 'delete'
  description: string;
  category: PermissionCategory;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export type PermissionCategory = 
  | 'menu_management'
  | 'order_management' 
  | 'customer_management'
  | 'staff_management'
  | 'inventory_management'
  | 'analytics'
  | 'marketing'
  | 'settings'
  | 'system_admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions: Permission[];
    avatar?: string;
  };
  expires: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  department?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper function to create permissions with IDs
const createPermissionsWithIds = (): Permission[] => {
  const basePermissions: Omit<Permission, 'id'>[] = [
    // Menu Management
    { name: 'menu:create', resource: 'menu', action: 'create', description: 'ایجاد آیتم منو', category: 'menu_management' },
    { name: 'menu:read', resource: 'menu', action: 'read', description: 'مشاهده منو', category: 'menu_management' },
    { name: 'menu:update', resource: 'menu', action: 'update', description: 'ویرایش منو', category: 'menu_management' },
    { name: 'menu:delete', resource: 'menu', action: 'delete', description: 'حذف آیتم منو', category: 'menu_management' },
    
    // Order Management
    { name: 'orders:create', resource: 'orders', action: 'create', description: 'ثبت سفارش', category: 'order_management' },
    { name: 'orders:read', resource: 'orders', action: 'read', description: 'مشاهده سفارشات', category: 'order_management' },
    { name: 'orders:update', resource: 'orders', action: 'update', description: 'ویرایش سفارش', category: 'order_management' },
    { name: 'orders:delete', resource: 'orders', action: 'delete', description: 'حذف سفارش', category: 'order_management' },
    
    // Customer Management
    { name: 'customers:create', resource: 'customers', action: 'create', description: 'ثبت مشتری', category: 'customer_management' },
    { name: 'customers:read', resource: 'customers', action: 'read', description: 'مشاهده مشتریان', category: 'customer_management' },
    { name: 'customers:update', resource: 'customers', action: 'update', description: 'ویرایش مشتری', category: 'customer_management' },
    { name: 'customers:delete', resource: 'customers', action: 'delete', description: 'حذف مشتری', category: 'customer_management' },
    
    // Staff Management
    { name: 'staff:create', resource: 'staff', action: 'create', description: 'ثبت کارمند', category: 'staff_management' },
    { name: 'staff:read', resource: 'staff', action: 'read', description: 'مشاهده کارکنان', category: 'staff_management' },
    { name: 'staff:update', resource: 'staff', action: 'update', description: 'ویرایش کارمند', category: 'staff_management' },
    { name: 'staff:delete', resource: 'staff', action: 'delete', description: 'حذف کارمند', category: 'staff_management' },
    
    // Analytics
    { name: 'analytics:read', resource: 'analytics', action: 'read', description: 'مشاهده گزارشات', category: 'analytics' },
    
    // System Administration
    { name: 'system:manage', resource: 'system', action: 'manage', description: 'مدیریت سیستم', category: 'system_admin' },
    { name: 'roles:manage', resource: 'roles', action: 'manage', description: 'مدیریت نقش‌ها', category: 'system_admin' },
    { name: 'settings:manage', resource: 'settings', action: 'manage', description: 'مدیریت تنظیمات', category: 'system_admin' },
  ];
  
  return basePermissions.map((permission, index) => ({
    ...permission,
    id: String(index + 1),
  }));
};

// Pre-defined Permissions with IDs
export const DEFAULT_PERMISSIONS: Permission[] = createPermissionsWithIds();

// Helper function to create roles with proper structure
const createRolesWithStructure = (): UserRole[] => {
  const baseRoles: Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'super_admin',
      displayName: 'مدیر کل',
      description: 'دسترسی کامل به تمام بخش‌ها',
      permissions: DEFAULT_PERMISSIONS,
      level: 1,
      isActive: true,
    },
    {
      name: 'admin',
      displayName: 'مدیر',
      description: 'دسترسی به اکثر بخش‌ها',
      permissions: DEFAULT_PERMISSIONS.filter(p => p.category !== 'system_admin'),
      level: 2,
      isActive: true,
    },
    {
      name: 'manager',
      displayName: 'سرپرست',
      description: 'مدیریت عملیات روزانه',
      permissions: DEFAULT_PERMISSIONS.filter(p => 
        ['menu_management', 'order_management', 'customer_management', 'staff_management', 'analytics'].includes(p.category)
      ),
      level: 3,
      isActive: true,
    },
    {
      name: 'cashier',
      displayName: 'صندوقدار',
      description: 'مدیریت فروش و پرداخت',
      permissions: DEFAULT_PERMISSIONS.filter(p => 
        ['order_management', 'customer_management'].includes(p.category)
      ),
      level: 4,
      isActive: true,
    },
    {
      name: 'chef',
      displayName: 'سرآشپز',
      description: 'مدیریت آشپزخانه و منو',
      permissions: DEFAULT_PERMISSIONS.filter(p => 
        p.category === 'menu_management' || (p.category === 'order_management' && p.action === 'read')
      ),
      level: 4,
      isActive: true,
    },
    {
      name: 'waiter',
      displayName: 'پیشخدمت',
      description: 'مدیریت سفارشات و سرویس',
      permissions: DEFAULT_PERMISSIONS.filter(p => 
        p.category === 'order_management' || (p.category === 'customer_management' && p.action === 'read')
      ),
      level: 4,
      isActive: true,
    },
    {
      name: 'delivery',
      displayName: 'پیک',
      description: 'مدیریت تحویل سفارشات',
      permissions: DEFAULT_PERMISSIONS.filter(p => 
        p.category === 'order_management' && ['read', 'update'].includes(p.action)
      ),
      level: 4,
      isActive: true,
    },
  ];
  
  return baseRoles.map((role, index) => ({
    ...role,
    id: String(index + 1),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }));
};

// Pre-defined Roles with full structure
export const DEFAULT_ROLES: UserRole[] = createRolesWithStructure();
