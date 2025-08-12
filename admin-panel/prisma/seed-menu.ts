import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedMenuData() {
  console.log('🌱 Seeding menu data...')

  // Create categories
  const appetizers = await prisma.category.create({
    data: {
      name: 'پیش غذا',
      nameEn: 'Appetizers',
      nameAr: 'المقبلات',
      description: 'انواع پیش غذاهای خوشمزه',
      priority: 1,
      isActive: true
    }
  })

  const mainCourses = await prisma.category.create({
    data: {
      name: 'غذای اصلی',
      nameEn: 'Main Courses',
      nameAr: 'الأطباق الرئيسية',
      description: 'غذاهای اصلی و سیركننده',
      priority: 2,
      isActive: true
    }
  })

  const desserts = await prisma.category.create({
    data: {
      name: 'دسر',
      nameEn: 'Desserts',
      nameAr: 'الحلويات',
      description: 'انواع دسرهای خوشمزه',
      priority: 3,
      isActive: true
    }
  })

  const beverages = await prisma.category.create({
    data: {
      name: 'نوشیدنی',
      nameEn: 'Beverages',
      nameAr: 'المشروبات',
      description: 'انواع نوشیدنی‌های گرم و سرد',
      priority: 4,
      isActive: true
    }
  })

  // Create menu items
  const menuItems = [
    // Appetizers
    {
      name: 'کاسه سوپ جو',
      nameEn: 'Barley Soup',
      description: 'سوپ گرم و مغذی با جو و سبزیجات',
      categoryId: appetizers.id,
      price: 45000,
      preparationTime: 15,
      calories: 180,
      isAvailable: true,
      isSpecial: false,
      priority: 1,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['جو', 'هویج', 'سلری', 'پیاز']),
      allergens: JSON.stringify(['گلوتن'])
    },
    {
      name: 'سالاد سزار',
      nameEn: 'Caesar Salad',
      description: 'سالاد تازه با سس سزار و پارمزان',
      categoryId: appetizers.id,
      price: 65000,
      preparationTime: 10,
      calories: 220,
      isAvailable: true,
      isSpecial: true,
      priority: 2,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['کاهو', 'پنیر پارمزان', 'نان تست', 'سس سزار']),
      allergens: JSON.stringify(['لبنیات', 'گلوتن'])
    },

    // Main Courses
    {
      name: 'کباب کوبیده',
      nameEn: 'Koobideh Kebab',
      description: 'کباب کوبیده سنتی با برنج زعفرانی',
      categoryId: mainCourses.id,
      price: 220000,
      discountPrice: 190000,
      preparationTime: 25,
      calories: 450,
      isAvailable: true,
      isSpecial: true,
      priority: 1,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['گوشت گاو', 'برنج', 'زعفران', 'پیاز']),
      allergens: JSON.stringify([])
    },
    {
      name: 'پیتزا مارگاریتا',
      nameEn: 'Margherita Pizza',
      description: 'پیتزا کلاسیک با گوجه و موزارلا',
      categoryId: mainCourses.id,
      price: 185000,
      preparationTime: 20,
      calories: 320,
      isAvailable: true,
      isSpecial: false,
      priority: 2,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['خمیر پیتزا', 'سس گوجه', 'پنیر موزارلا', 'ریحان']),
      allergens: JSON.stringify(['گلوتن', 'لبنیات'])
    },
    {
      name: 'برگر کلاسیک',
      nameEn: 'Classic Burger',
      description: 'برگر گوشت با کاهو و گوجه',
      categoryId: mainCourses.id,
      price: 145000,
      preparationTime: 15,
      calories: 520,
      isAvailable: true,
      isSpecial: false,
      priority: 3,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['نان برگر', 'گوشت گاو', 'کاهو', 'گوجه', 'پنیر']),
      allergens: JSON.stringify(['گلوتن', 'لبنیات'])
    },

    // Desserts
    {
      name: 'بستنی وانیلی',
      nameEn: 'Vanilla Ice Cream',
      description: 'بستنی خانگی با طعم وانیل',
      categoryId: desserts.id,
      price: 35000,
      preparationTime: 5,
      calories: 180,
      isAvailable: true,
      isSpecial: false,
      priority: 1,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['شیر', 'خامه', 'وانیل', 'شکر']),
      allergens: JSON.stringify(['لبنیات'])
    },
    {
      name: 'کیک شکلاتی',
      nameEn: 'Chocolate Cake',
      description: 'کیک شکلاتی غنی و خوشمزه',
      categoryId: desserts.id,
      price: 55000,
      preparationTime: 8,
      calories: 380,
      isAvailable: true,
      isSpecial: true,
      priority: 2,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['آرد', 'شکلات', 'تخم مرغ', 'شکر', 'کره']),
      allergens: JSON.stringify(['گلوتن', 'تخم مرغ', 'لبنیات'])
    },

    // Beverages
    {
      name: 'چای سنتی',
      nameEn: 'Traditional Tea',
      description: 'چای ایرانی معطر',
      categoryId: beverages.id,
      price: 15000,
      preparationTime: 5,
      calories: 5,
      isAvailable: true,
      isSpecial: false,
      priority: 1,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['چای', 'آب']),
      allergens: JSON.stringify([])
    },
    {
      name: 'لاته',
      nameEn: 'Latte',
      description: 'قهوه اسپرسو با شیر فوم شده',
      categoryId: beverages.id,
      price: 45000,
      preparationTime: 8,
      calories: 120,
      isAvailable: true,
      isSpecial: false,
      priority: 2,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['اسپرسو', 'شیر']),
      allergens: JSON.stringify(['لبنیات'])
    },
    {
      name: 'آب انار تازه',
      nameEn: 'Fresh Pomegranate Juice',
      description: 'آب انار طبیعی و تازه',
      categoryId: beverages.id,
      price: 35000,
      preparationTime: 3,
      calories: 95,
      isAvailable: true,
      isSpecial: true,
      priority: 3,
      images: JSON.stringify(['/placeholder-food.jpg']),
      ingredients: JSON.stringify(['انار تازه']),
      allergens: JSON.stringify([])
    }
  ]

  // Insert menu items
  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item })
  }

  console.log('✅ Menu data seeded successfully!')
  console.log(`📂 Created ${await prisma.category.count()} categories`)
  console.log(`🍽️ Created ${await prisma.menuItem.count()} menu items`)
}

async function main() {
  try {
    await seedMenuData()
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
