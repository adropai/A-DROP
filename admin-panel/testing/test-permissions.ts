import { PrismaClient } from '@prisma/client';
import permissionUtils from '@/lib/permissions';

const { 
  hasPermission, 
  getUserPermissions, 
  hasRole, 
  isAdmin, 
  PERMISSIONS 
} = permissionUtils;

const prisma = new PrismaClient();

async function testPermissionSystem() {
  console.log('🧪 شروع تست سیستم نقش‌ها و دسترسی‌ها');
  console.log('='.repeat(60));

  try {
    // دریافت کاربران موجود
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });

    console.log(`\n👥 کاربران موجود: ${users.length}`);
    users.forEach(user => {
      console.log(`   📧 ${user.email} - 👤 ${user.role} - ${user.name || 'N/A'}`);
    });

    if (users.length === 0) {
      console.log('❌ هیچ کاربری پیدا نشد!');
      return;
    }

    // انتخاب کاربران برای تست
    const adminUser = users.find(u => u.role === 'ADMIN');
    const staffUser = users.find(u => u.role === 'STAFF');

    console.log('\n' + '='.repeat(60));
    console.log('🔍 تست‌های دسترسی');
    console.log('='.repeat(60));

    // تست 1: Admin permissions
    if (adminUser) {
      console.log(`\n🔧 تست کاربر ADMIN: ${adminUser.email}`);
      
      const adminPermissions = await getUserPermissions(adminUser.id);
      console.log(`   📝 تعداد کل دسترسی‌ها: ${adminPermissions.length}`);
      
      // تست دسترسی‌های مهم
      const testPermissions = [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.ORDERS_MANAGE,
        PERMISSIONS.MENU_MANAGE,
        PERMISSIONS.STAFF_MANAGE,
        PERMISSIONS.ROLES_VIEW,
        PERMISSIONS.SETTINGS_UPDATE
      ];

      console.log('   🧪 تست دسترسی‌های کلیدی:');
      for (const permission of testPermissions) {
        const hasAccess = await hasPermission(adminUser.id, permission);
        console.log(`      ${hasAccess ? '✅' : '❌'} ${permission}`);
      }

      // تست role checking
      const isAdminRole = await hasRole(adminUser.id, 'ADMIN');
      const isAdminFunction = await isAdmin(adminUser.id);
      console.log(`   👤 نقش Admin: ${isAdminRole ? '✅' : '❌'}`);
      console.log(`   🔑 Function isAdmin: ${isAdminFunction ? '✅' : '❌'}`);
    }

    // تست 2: Staff permissions
    if (staffUser) {
      console.log(`\n👨‍💼 تست کاربر STAFF: ${staffUser.email}`);
      
      const staffPermissions = await getUserPermissions(staffUser.id);
      console.log(`   📝 تعداد کل دسترسی‌ها: ${staffPermissions.length}`);
      
      // تست دسترسی‌های محدود
      const testPermissions = [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.MENU_VIEW,
        PERMISSIONS.STAFF_MANAGE, // نباید داشته باشد
        PERMISSIONS.ROLES_VIEW, // نباید داشته باشد
        PERMISSIONS.SETTINGS_UPDATE // نباید داشته باشد
      ];

      console.log('   🧪 تست دسترسی‌های محدود:');
      for (const permission of testPermissions) {
        const hasAccess = await hasPermission(staffUser.id, permission);
        const shouldHave = [
          PERMISSIONS.DASHBOARD_VIEW,
          PERMISSIONS.ORDERS_VIEW,
          PERMISSIONS.MENU_VIEW
        ].includes(permission);
        
        const status = hasAccess === shouldHave ? '✅' : '❌';
        const expected = shouldHave ? '(باید داشته باشد)' : '(نباید داشته باشد)';
        console.log(`      ${status} ${permission} ${expected}`);
      }

      // تست role checking
      const isStaffRole = await hasRole(staffUser.id, 'STAFF');
      const isAdminFunction = await isAdmin(staffUser.id);
      console.log(`   👤 نقش Staff: ${isStaffRole ? '✅' : '❌'}`);
      console.log(`   🔑 Function isAdmin: ${isAdminFunction ? '❌ (باید false باشد)' : '✅'}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 آمار سیستم دسترسی');
    console.log('='.repeat(60));

    // آمار permissions
    const totalPermissions = await prisma.permission.count();
    console.log(`📝 تعداد کل permissions: ${totalPermissions}`);

    // آمار role permissions
    const totalRolePermissions = await prisma.rolePermission.count();
    console.log(`🔗 تعداد role permissions: ${totalRolePermissions}`);

    // آمار user permissions
    const totalUserPermissions = await prisma.userPermission.count();
    console.log(`👤 تعداد user permissions: ${totalUserPermissions}`);

    // آمار به تفکیک نقش
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    console.log('\n📈 آمار کاربران به تفکیک نقش:');
    roleStats.forEach(stat => {
      console.log(`   👥 ${stat.role}: ${stat._count.role} کاربر`);
    });

    // آمار permissions به تفکیک ماژول
    const moduleStats = await prisma.permission.groupBy({
      by: ['module'],
      _count: {
        module: true
      }
    });

    console.log('\n📋 آمار permissions به تفکیک ماژول:');
    moduleStats.forEach(stat => {
      console.log(`   📦 ${stat.module}: ${stat._count.module} permission`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 تست سیستم دسترسی‌ها تکمیل شد!');
    console.log('='.repeat(60));

    // خلاصه نتایج
    const summary = {
      totalUsers: users.length,
      totalPermissions,
      totalRolePermissions,
      totalUserPermissions,
      rolesCount: roleStats.length,
      modulesCount: moduleStats.length
    };

    console.log('\n📋 خلاصه نتایج:');
    console.log(`   👥 کاربران: ${summary.totalUsers}`);
    console.log(`   📝 Permissions: ${summary.totalPermissions}`);
    console.log(`   🔗 Role Permissions: ${summary.totalRolePermissions}`);
    console.log(`   👤 User Permissions: ${summary.totalUserPermissions}`);
    console.log(`   🎭 نقش‌ها: ${summary.rolesCount}`);
    console.log(`   📦 ماژول‌ها: ${summary.modulesCount}`);

    return summary;

  } catch (error) {
    console.error('❌ خطا در تست سیستم دسترسی‌ها:', error);
    throw error;
  }
}

// اجرای تست اگر فایل مستقیماً اجرا شود
if (require.main === module) {
  testPermissionSystem()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { testPermissionSystem };
