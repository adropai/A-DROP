const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional)
    console.log('🧹 Clearing existing data...');
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
    await prisma.customer.deleteMany();

    // Create menu categories
    console.log('📂 Creating menu categories...');
    
    const mainCategory = await prisma.category.create({
      data: {
        name: 'غذاهای اصلی',
        description: 'انواع غذاهای اصلی رستوران',
        isActive: true,
        priority: 1
      }
    });

    const drinkCategory = await prisma.category.create({
      data: {
        name: 'نوشیدنی‌ها',
        description: 'انواع نوشیدنی‌های سرد و گرم',
        isActive: true,
        priority: 2
      }
    });

    const dessertCategory = await prisma.category.create({
      data: {
        name: 'دسرها',
        description: 'انواع دسرهای خوشمزه',
        isActive: true,
        priority: 3
      }
    });

    // Create menu items
    console.log('🍽️ Creating menu items...');
    
    // Main dishes
    await prisma.menuItem.create({
      data: {
        name: 'چلو کباب کوبیده',
        description: 'کباب کوبیده مخصوص با برنج ایرانی',
        price: 180000,
        categoryId: mainCategory.id,
        isAvailable: true,
        preparationTime: 25,
        ingredients: '["گوشت چرخ کرده", "برنج", "سبزی خورشت"]',
        allergens: '[]',
        nutritionInfo: null,
        priority: 1
      }
    });

    await prisma.menuItem.create({
      data: {
        name: 'چلو جوجه کباب',
        description: 'جوجه کباب زعفرانی با برنج',
        price: 220000,
        categoryId: mainCategory.id,
        isAvailable: true,
        preparationTime: 30,
        ingredients: '["مرغ", "برنج", "زعفران"]',
        allergens: '[]',
        nutritionInfo: null,
        priority: 2
      }
    });

    await prisma.menuItem.create({
      data: {
        name: 'قورمه سبزی',
        description: 'خورشت قورمه سبزی با گوشت و لوبیا',
        price: 150000,
        categoryId: mainCategory.id,
        isAvailable: true,
        preparationTime: 45,
        ingredients: '["گوشت", "سبزی قورمه", "لوبیا قرمز"]',
        allergens: '[]',
        nutritionInfo: null,
        priority: 3
      }
    });

    // Drinks
    await prisma.menuItem.create({
      data: {
        name: 'دوغ',
        description: 'دوغ طبیعی با نعنا',
        price: 15000,
        categoryId: drinkCategory.id,
        isAvailable: true,
        preparationTime: 2,
        ingredients: '["ماست", "نعنا", "نمک"]',
        allergens: '["لبنیات"]',
        nutritionInfo: null,
        priority: 1
      }
    });

    await prisma.menuItem.create({
      data: {
        name: 'چای',
        description: 'چای ایرانی معطر',
        price: 12000,
        categoryId: drinkCategory.id,
        isAvailable: true,
        preparationTime: 3,
        ingredients: '["چای", "شکر"]',
        allergens: '[]',
        nutritionInfo: null,
        priority: 2
      }
    });

    // Desserts
    await prisma.menuItem.create({
      data: {
        name: 'بستنی زعفرانی',
        description: 'بستنی خانگی با طعم زعفران',
        price: 45000,
        categoryId: dessertCategory.id,
        isAvailable: true,
        preparationTime: 3,
        ingredients: '["شیر", "زعفران", "پسته"]',
        allergens: '["لبنیات", "آجیل"]',
        nutritionInfo: null,
        priority: 1
      }
    });

    // Create sample customers
    console.log('👥 Creating sample customers...');
    
    await prisma.customer.create({
      data: {
        name: 'علی احمدی',
        email: 'ali@example.com',
        phone: '09123456789',
        tier: 'Gold',
        status: 'Active'
      }
    });

    await prisma.customer.create({
      data: {
        name: 'فاطمه محمدی',
        email: 'fateme@example.com',
        phone: '09123456788',
        tier: 'Silver',
        status: 'Active'
      }
    });

    await prisma.customer.create({
      data: {
        name: 'حسین رضایی',
        email: 'hossein@example.com',
        phone: '09123456787',
        tier: 'Bronze',
        status: 'Active'
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created:`);
    console.log(`   - 3 categories`);
    console.log(`   - 6 menu items`);
    console.log(`   - 3 customers`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
