import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12);
  const managerPassword = await bcrypt.hash('manager123', 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adrop.com' },
    update: {},
    create: {
      email: 'admin@adrop.com',
      password: adminPassword,
      name: 'مدیر سیستم',
      firstName: 'مدیر',
      lastName: 'سیستم',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@adrop.com' },
    update: {},
    create: {
      email: 'manager@adrop.com',
      password: managerPassword,
      name: 'مدیر رستوران',
      firstName: 'مدیر',
      lastName: 'رستوران',
      role: 'MANAGER',
      status: 'ACTIVE',
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@adrop.com' },
    update: {},
    create: {
      email: 'staff@adrop.com',
      password: staffPassword,
      name: 'کارمند',
      firstName: 'کارمند',
      lastName: 'رستوران',
      role: 'STAFF',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin User:', { email: admin.email, role: admin.role });
  console.log('👤 Manager User:', { email: manager.email, role: manager.role });
  console.log('👤 Staff User:', { email: staff.email, role: staff.role });
  console.log('\n🔐 Default Passwords:');
  console.log('Admin: admin123');
  console.log('Manager: manager123');
  console.log('Staff: staff123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
