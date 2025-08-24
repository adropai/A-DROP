const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create some menu categories
    const mainCategory = await prisma.menuCategory.upsert({
      where: { name: 'غذاهای اصلی' },
      update: {},
      create: {
        name: 'غذاهای اصلی',
        description: 'انواع غذاهای اصلی و سنتی',
        isActive: true,
        sortOrder: 1
      }
    });

    const drinkCategory = await prisma.menuCategory.upsert({
      where: { name: 'نوشیدنی' },
      update: {},
      create: {
        name: 'نوشیدنی',
        description: 'انواع نوشیدنی‌ها',
        isActive: true,
        sortOrder: 2
      }
    });

    // Create menu items
    const menuItem1 = await prisma.menuItem.upsert({
      where: { name: 'چلو کباب کوبیده' },
      update: {},
      create: {
        name: 'چلو کباب کوبیده',
        description: 'کباب کوبیده با برنج و سالاد',
        price: 250000,
        categoryId: mainCategory.id,
        isAvailable: true,
        preparationTime: 20,
        ingredients: ['گوشت چرخ کرده', 'برنج', 'سالاد'],
        allergens: [],
        nutritionalInfo: '{}',
        sortOrder: 1
      }
    });

    const menuItem2 = await prisma.menuItem.upsert({
      where: { name: 'نوشابه' },
      update: {},
      create: {
        name: 'نوشابه',
        description: 'نوشابه سرد',
        price: 25000,
        categoryId: drinkCategory.id,
        isAvailable: true,
        preparationTime: 2,
        ingredients: ['نوشابه'],
        allergens: [],
        nutritionalInfo: '{}',
        sortOrder: 1
      }
    });

    // Create a test customer
    const customer = await prisma.customer.upsert({
      where: { phone: '09123456789' },
      update: {},
      create: {
        firstName: 'علی',
        lastName: 'احمدی',
        phone: '09123456789',
        email: 'ali@test.com',
        isActive: true
      }
    });

    // Create a test table
    const table = await prisma.table.upsert({
      where: { number: 1 },
      update: {},
      create: {
        number: 1,
        capacity: 4,
        status: 'AVAILABLE',
        location: 'Main Hall'
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log('📊 Created:');
    console.log(`- Menu Categories: ${mainCategory.name}, ${drinkCategory.name}`);
    console.log(`- Menu Items: ${menuItem1.name}, ${menuItem2.name}`);
    console.log(`- Customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`- Table: ${table.number}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
