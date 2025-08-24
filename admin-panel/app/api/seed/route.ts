import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting seed process...');

    // Check if categories already exist
    const existingMainCategory = await prisma.category.findFirst({
      where: { name: 'غذاهای اصلی' }
    });

    const existingDrinkCategory = await prisma.category.findFirst({
      where: { name: 'نوشیدنی' }
    });

    // Create categories if they don't exist
    const mainCategory = existingMainCategory || await prisma.category.create({
      data: {
        name: 'غذاهای اصلی',
        description: 'غذاهای اصلی رستوران',
        isActive: true
      }
    });

    const drinkCategory = existingDrinkCategory || await prisma.category.create({
      data: {
        name: 'نوشیدنی',
        description: 'نوشیدنی‌های گرم و سرد',
        isActive: true
      }
    });

    console.log('✅ Categories created');

    // Create menu items
    const items = [
      {
        name: 'چلو کباب کوبیده',
        price: 250000,
        categoryId: mainCategory.id,
        description: 'کباب کوبیده با برنج و سالاد'
      },
      {
        name: 'چلو جوجه کباب',
        price: 320000,
        categoryId: mainCategory.id,
        description: 'جوجه کباب با برنج و سالاد'
      },
      {
        name: 'قرمه سبزی',
        price: 180000,
        categoryId: mainCategory.id,
        description: 'خورش قرمه سبزی با برنج'
      },
      {
        name: 'نوشابه',
        price: 15000,
        categoryId: drinkCategory.id,
        description: 'نوشابه سرد'
      },
      {
        name: 'چای',
        price: 8000,
        categoryId: drinkCategory.id,
        description: 'چای داغ'
      }
    ];

    for (const item of items) {
      const existingItem = await prisma.menuItem.findFirst({
        where: { name: item.name }
      });

      if (!existingItem) {
        await prisma.menuItem.create({
          data: {
            ...item,
            isAvailable: true,
            preparationTime: 15
          }
        });
      }
    }

    console.log('✅ Menu items created');

    const menuCount = await prisma.menuItem.count();
    const categoryCount = await prisma.category.count();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        menuItems: menuCount,
        categories: categoryCount
      }
    });

  } catch (error) {
    console.error('❌ Seed error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return seedDatabase();
}

export async function POST() {
  return seedDatabase();
}
