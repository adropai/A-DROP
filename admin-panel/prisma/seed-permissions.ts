import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// تعریف permissions پایه سیستم
const BASE_PERMISSIONS = [
  // Dashboard Permissions
  { name: 'dashboard.view', module: 'dashboard', action: 'read', description: 'مشاهده داشبورد' },
  { name: 'dashboard.analytics', module: 'dashboard', action: 'analytics', description: 'مشاهده آنالیتیکس پیشرفته' },
  
  // Orders Permissions
  { name: 'orders.view', module: 'orders', action: 'read', description: 'مشاهده سفارشات' },
  { name: 'orders.create', module: 'orders', action: 'write', description: 'ایجاد سفارش جدید' },
  { name: 'orders.update', module: 'orders', action: 'update', description: 'ویرایش سفارش' },
  { name: 'orders.delete', module: 'orders', action: 'delete', description: 'حذف سفارش' },
  { name: 'orders.manage', module: 'orders', action: 'admin', description: 'مدیریت کامل سفارشات' },
  
  // Menu Permissions
  { name: 'menu.view', module: 'menu', action: 'read', description: 'مشاهده منو' },
  { name: 'menu.create', module: 'menu', action: 'write', description: 'اضافه کردن آیتم به منو' },
  { name: 'menu.update', module: 'menu', action: 'update', description: 'ویرایش آیتم منو' },
  { name: 'menu.delete', module: 'menu', action: 'delete', description: 'حذف آیتم از منو' },
  { name: 'menu.manage', module: 'menu', action: 'admin', description: 'مدیریت کامل منو' },
  
  // Staff Permissions
  { name: 'staff.view', module: 'staff', action: 'read', description: 'مشاهده لیست کارکنان' },
  { name: 'staff.create', module: 'staff', action: 'write', description: 'اضافه کردن کارکن جدید' },
  { name: 'staff.update', module: 'staff', action: 'update', description: 'ویرایش اطلاعات کارکن' },
  { name: 'staff.delete', module: 'staff', action: 'delete', description: 'حذف کارکن' },
  { name: 'staff.manage', module: 'staff', action: 'admin', description: 'مدیریت کامل کارکنان' },
  
  // Kitchen Permissions
  { name: 'kitchen.view', module: 'kitchen', action: 'read', description: 'مشاهده آشپزخانه' },
  { name: 'kitchen.orders', module: 'kitchen', action: 'manage', description: 'مدیریت سفارشات آشپزخانه' },
  { name: 'kitchen.status', module: 'kitchen', action: 'update', description: 'تغییر وضعیت سفارشات' },
  
  // Tables Permissions
  { name: 'tables.view', module: 'tables', action: 'read', description: 'مشاهده میزها' },
  { name: 'tables.create', module: 'tables', action: 'write', description: 'اضافه کردن میز جدید' },
  { name: 'tables.update', module: 'tables', action: 'update', description: 'ویرایش اطلاعات میز' },
  { name: 'tables.delete', module: 'tables', action: 'delete', description: 'حذف میز' },
  { name: 'tables.qr', module: 'tables', action: 'generate', description: 'تولید QR Code' },
  
  // Reservations Permissions
  { name: 'reservations.view', module: 'reservations', action: 'read', description: 'مشاهده رزرواسیون‌ها' },
  { name: 'reservations.create', module: 'reservations', action: 'write', description: 'ایجاد رزرواسیون جدید' },
  { name: 'reservations.update', module: 'reservations', action: 'update', description: 'ویرایش رزرواسیون' },
  { name: 'reservations.delete', module: 'reservations', action: 'delete', description: 'لغو رزرواسیون' },
  
  // Cashier Permissions
  { name: 'cashier.view', module: 'cashier', action: 'read', description: 'دسترسی به صندوق' },
  { name: 'cashier.transactions', module: 'cashier', action: 'manage', description: 'مدیریت تراکنش‌ها' },
  { name: 'cashier.reports', module: 'cashier', action: 'read', description: 'مشاهده گزارشات مالی' },
  
  // Customers Permissions
  { name: 'customers.view', module: 'customers', action: 'read', description: 'مشاهده مشتریان' },
  { name: 'customers.create', module: 'customers', action: 'write', description: 'اضافه کردن مشتری جدید' },
  { name: 'customers.update', module: 'customers', action: 'update', description: 'ویرایش اطلاعات مشتری' },
  { name: 'customers.delete', module: 'customers', action: 'delete', description: 'حذف مشتری' },
  
  // Inventory Permissions
  { name: 'inventory.view', module: 'inventory', action: 'read', description: 'مشاهده موجودی' },
  { name: 'inventory.create', module: 'inventory', action: 'write', description: 'اضافه کردن آیتم جدید' },
  { name: 'inventory.update', module: 'inventory', action: 'update', description: 'ویرایش موجودی' },
  { name: 'inventory.delete', module: 'inventory', action: 'delete', description: 'حذف آیتم' },
  
  // Delivery Permissions
  { name: 'delivery.view', module: 'delivery', action: 'read', description: 'مشاهده تحویل' },
  { name: 'delivery.assign', module: 'delivery', action: 'assign', description: 'تخصیص پیک' },
  { name: 'delivery.track', module: 'delivery', action: 'track', description: 'ردیابی سفارش' },
  
  // Analytics Permissions
  { name: 'analytics.view', module: 'analytics', action: 'read', description: 'مشاهده آنالیتیکس' },
  { name: 'analytics.advanced', module: 'analytics', action: 'advanced', description: 'آنالیتیکس پیشرفته' },
  { name: 'analytics.export', module: 'analytics', action: 'export', description: 'صادرات گزارشات' },
  
  // Marketing Permissions
  { name: 'marketing.view', module: 'marketing', action: 'read', description: 'مشاهده بازاریابی' },
  { name: 'marketing.campaigns', module: 'marketing', action: 'manage', description: 'مدیریت کمپین‌ها' },
  { name: 'marketing.coupons', module: 'marketing', action: 'manage', description: 'مدیریت کوپن‌ها' },
  
  // Security & Settings Permissions
  { name: 'security.view', module: 'security', action: 'read', description: 'مشاهده تنظیمات امنیتی' },
  { name: 'security.manage', module: 'security', action: 'admin', description: 'مدیریت امنیت' },
  { name: 'settings.view', module: 'settings', action: 'read', description: 'مشاهده تنظیمات' },
  { name: 'settings.update', module: 'settings', action: 'update', description: 'ویرایش تنظیمات' },
  
  // Roles & Permissions Management
  { name: 'roles.view', module: 'roles', action: 'read', description: 'مشاهده نقش‌ها' },
  { name: 'roles.create', module: 'roles', action: 'write', description: 'ایجاد نقش جدید' },
  { name: 'roles.update', module: 'roles', action: 'update', description: 'ویرایش نقش' },
  { name: 'roles.delete', module: 'roles', action: 'delete', description: 'حذف نقش' },
  { name: 'permissions.assign', module: 'permissions', action: 'assign', description: 'تخصیص دسترسی' },
  { name: 'permissions.revoke', module: 'permissions', action: 'revoke', description: 'لغو دسترسی' },
];

// تعریف دسترسی‌های هر نقش
const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: [
    // همه دسترسی‌ها
    ...BASE_PERMISSIONS.map(p => p.name)
  ],
  
  [UserRole.ADMIN]: [
    // تمام دسترسی‌ها بجز مدیریت سیستم
    'dashboard.view', 'dashboard.analytics',
    'orders.view', 'orders.create', 'orders.update', 'orders.delete', 'orders.manage',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete', 'menu.manage',
    'staff.view', 'staff.create', 'staff.update', 'staff.delete', 'staff.manage',
    'kitchen.view', 'kitchen.orders', 'kitchen.status',
    'tables.view', 'tables.create', 'tables.update', 'tables.delete', 'tables.qr',
    'reservations.view', 'reservations.create', 'reservations.update', 'reservations.delete',
    'cashier.view', 'cashier.transactions', 'cashier.reports',
    'customers.view', 'customers.create', 'customers.update', 'customers.delete',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'delivery.view', 'delivery.assign', 'delivery.track',
    'analytics.view', 'analytics.advanced', 'analytics.export',
    'marketing.view', 'marketing.campaigns', 'marketing.coupons',
    'settings.view', 'settings.update',
    'roles.view', 'roles.create', 'roles.update', 'permissions.assign', 'permissions.revoke'
  ],
  
  [UserRole.MANAGER]: [
    // مدیریت عملیات روزانه
    'dashboard.view', 'dashboard.analytics',
    'orders.view', 'orders.create', 'orders.update', 'orders.manage',
    'menu.view', 'menu.update',
    'staff.view', 'staff.update',
    'kitchen.view', 'kitchen.orders', 'kitchen.status',
    'tables.view', 'tables.update', 'tables.qr',
    'reservations.view', 'reservations.create', 'reservations.update', 'reservations.delete',
    'cashier.view', 'cashier.transactions', 'cashier.reports',
    'customers.view', 'customers.create', 'customers.update',
    'inventory.view', 'inventory.update',
    'delivery.view', 'delivery.assign', 'delivery.track',
    'analytics.view', 'analytics.advanced'
  ],
  
  [UserRole.CASHIER]: [
    // دسترسی‌های صندوقدار
    'dashboard.view',
    'orders.view', 'orders.create', 'orders.update',
    'menu.view',
    'tables.view',
    'reservations.view', 'reservations.create',
    'cashier.view', 'cashier.transactions', 'cashier.reports',
    'customers.view', 'customers.create', 'customers.update'
  ],
  
  [UserRole.KITCHEN_STAFF]: [
    // دسترسی‌های آشپزخانه
    'dashboard.view',
    'orders.view',
    'menu.view',
    'kitchen.view', 'kitchen.orders', 'kitchen.status',
    'inventory.view'
  ],
  
  [UserRole.WAITER]: [
    // دسترسی‌های گارسون
    'dashboard.view',
    'orders.view', 'orders.create', 'orders.update',
    'menu.view',
    'tables.view', 'tables.update',
    'reservations.view', 'reservations.create', 'reservations.update',
    'customers.view', 'customers.create'
  ],
  
  [UserRole.DELIVERY]: [
    // دسترسی‌های تحویل
    'dashboard.view',
    'orders.view',
    'delivery.view', 'delivery.track',
    'customers.view'
  ],
  
  [UserRole.SUPPORT]: [
    // دسترسی‌های پشتیبانی
    'dashboard.view',
    'orders.view', 'orders.update',
    'customers.view', 'customers.create', 'customers.update',
    'reservations.view', 'reservations.update'
  ],
  
  [UserRole.STAFF]: [
    // دسترسی‌های پایه
    'dashboard.view',
    'orders.view',
    'menu.view',
    'tables.view'
  ]
};

async function seedPermissions() {
  console.log('🔐 شروع seed کردن permissions...');
  
  try {
    // حذف permissions موجود
    await prisma.rolePermission.deleteMany();
    await prisma.userPermission.deleteMany();
    await prisma.permission.deleteMany();
    
    console.log('✅ پاک کردن permissions قبلی');
    
    // اضافه کردن permissions پایه
    const createdPermissions = [];
    for (const permission of BASE_PERMISSIONS) {
      const created = await prisma.permission.create({
        data: permission
      });
      createdPermissions.push(created);
      console.log(`➕ Permission ایجاد شد: ${permission.name}`);
    }
    
    console.log(`✅ ${createdPermissions.length} permission ایجاد شد`);
    
    // تخصیص permissions به نقش‌ها
    for (const [role, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
      for (const permissionName of permissionNames) {
        const permission = createdPermissions.find(p => p.name === permissionName);
        if (permission) {
          await prisma.rolePermission.create({
            data: {
              role: role as UserRole,
              permissionId: permission.id,
              granted: true
            }
          });
        }
      }
      console.log(`✅ نقش ${role}: ${permissionNames.length} دسترسی تخصیص یافت`);
    }
    
    console.log('🎉 همه permissions با موفقیت seed شدند!');
    
    // آمار نهایی
    const totalPermissions = await prisma.permission.count();
    const totalRolePermissions = await prisma.rolePermission.count();
    
    console.log('\n📊 آمار نهایی:');
    console.log(`📝 تعداد permissions: ${totalPermissions}`);
    console.log(`🔗 تعداد role permissions: ${totalRolePermissions}`);
    
  } catch (error) {
    console.error('❌ خطا در seed کردن permissions:', error);
    throw error;
  }
}

// اجرای seed اگر فایل مستقیماً اجرا شود
if (require.main === module) {
  seedPermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedPermissions };
