import { prisma } from '../lib/prisma';
import { TableType, TableStatus } from '@prisma/client';

async function seedTables() {
  console.log('🌱 Seeding tables...');

  const tables = [
    {
      number: '1',
      capacity: 2,
      location: 'سالن اصلی - کنار پنجره',
      type: TableType.INDOOR,
      status: TableStatus.AVAILABLE,
      isActive: true,
      description: 'میز دو نفره کنار پنجره'
    },
    {
      number: '2',
      capacity: 4,
      location: 'سالن اصلی - وسط سالن',
      type: TableType.INDOOR,
      status: TableStatus.AVAILABLE,
      isActive: true,
      description: 'میز چهار نفره'
    },
    {
      number: '3',
      capacity: 6,
      location: 'سالن اصلی - کنار دیوار',
      type: TableType.INDOOR,
      status: TableStatus.OCCUPIED,
      isActive: true,
      description: 'میز شش نفره خانوادگی'
    },
    {
      number: '4',
      capacity: 2,
      location: 'تراس - بیرونی',
      type: TableType.OUTDOOR,
      status: TableStatus.AVAILABLE,
      isActive: true,
      description: 'میز دو نفره تراس'
    },
    {
      number: '5',
      capacity: 4,
      location: 'تراس - گوشه',
      type: TableType.OUTDOOR,
      status: TableStatus.RESERVED,
      isActive: true,
      description: 'میز چهار نفره تراس'
    },
    {
      number: 'VIP1',
      capacity: 8,
      location: 'سالن VIP - اتاق خصوصی',
      type: TableType.VIP,
      status: TableStatus.AVAILABLE,
      isActive: true,
      description: 'میز هشت نفره VIP با امکانات خاص'
    },
    {
      number: '6',
      capacity: 4,
      location: 'سالن اصلی - نزدیک آشپزخانه',
      type: TableType.INDOOR,
      status: TableStatus.MAINTENANCE,
      isActive: false,
      description: 'در حال تعمیر'
    }
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { number: table.number },
      update: table,
      create: table,
    });
  }

  console.log('✅ Tables seeded successfully');
}

seedTables()
  .catch((e) => {
    console.error('❌ Error seeding tables:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
