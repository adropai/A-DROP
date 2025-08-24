import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 پاک‌سازی دیتابیس...')
  
  // پاک کردن تمام داده‌های موجود
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  
  console.log('📂 ایجاد دسته‌بندی‌ها...')
  
  // ایجاد دسته‌بندی‌های اصلی
  const restaurant = await prisma.category.create({
    data: {
      name: 'رستوران',
      nameEn: 'Restaurant',
      description: 'دسته‌بندی اصلی رستوران',
      priority: 10,
      isActive: true
    }
  })

  const fastFood = await prisma.category.create({
    data: {
      name: 'فست فود',
      nameEn: 'Fast Food',
      description: 'دسته‌بندی فست فود',
      priority: 9,
      isActive: true
    }
  })

  // زیردسته‌بندی‌های رستوران
  const breakfast = await prisma.category.create({
    data: {
      name: 'صبحانه',
      nameEn: 'Breakfast',
      description: 'انواع صبحانه',
      parentId: restaurant.id,
      priority: 8,
      isActive: true
    }
  })

  const lunch = await prisma.category.create({
    data: {
      name: 'ناهار',
      nameEn: 'Lunch',
      description: 'انواع ناهار',
      parentId: restaurant.id,
      priority: 7,
      isActive: true
    }
  })

  const dinner = await prisma.category.create({
    data: {
      name: 'شام',
      nameEn: 'Dinner',
      description: 'انواع شام',
      parentId: restaurant.id,
      priority: 6,
      isActive: true
    }
  })

  // زیردسته‌بندی‌های صبحانه
  const iranianBreakfast = await prisma.category.create({
    data: {
      name: 'صبحانه ایرانی',
      nameEn: 'Iranian Breakfast',
      description: 'انواع صبحانه ایرانی',
      parentId: breakfast.id,
      priority: 5,
      isActive: true
    }
  })

  const continentalBreakfast = await prisma.category.create({
    data: {
      name: 'صبحانه فرنگی',
      nameEn: 'Continental Breakfast',
      description: 'انواع صبحانه فرنگی',
      parentId: breakfast.id,
      priority: 4,
      isActive: true
    }
  })

  // زیردسته‌بندی‌های ناهار
  const iranianFood = await prisma.category.create({
    data: {
      name: 'غذای ایرانی',
      nameEn: 'Iranian Food',
      description: 'انواع غذای ایرانی',
      parentId: lunch.id,
      priority: 3,
      isActive: true
    }
  })

  const internationalFood = await prisma.category.create({
    data: {
      name: 'غذای بین‌المللی',
      nameEn: 'International Food',
      description: 'انواع غذای بین‌المللی',
      parentId: lunch.id,
      priority: 2,
      isActive: true
    }
  })

  // زیردسته‌بندی‌های فست فود
  const burgers = await prisma.category.create({
    data: {
      name: 'برگر',
      nameEn: 'Burgers',
      description: 'انواع برگر',
      parentId: fastFood.id,
      priority: 1,
      isActive: true
    }
  })

  const pizza = await prisma.category.create({
    data: {
      name: 'پیتزا',
      nameEn: 'Pizza',
      description: 'انواع پیتزا',
      parentId: fastFood.id,
      priority: 1,
      isActive: true
    }
  })

  console.log('🍽️ ایجاد نمونه آیتم‌های منو...')

  // نمونه آیتم‌های منو
  await prisma.menuItem.create({
    data: {
      name: 'املت ایرانی',
      nameEn: 'Persian Omelet',
      description: 'املت با سبزیجات ایرانی',
      categoryId: iranianBreakfast.id,
      price: 45000,
      preparationTime: 15,
      isAvailable: true,
      isSpecial: false,
      priority: 1
    }
  })

  await prisma.menuItem.create({
    data: {
      name: 'کشک و بادمجان',
      nameEn: 'Kashk Bademjan',
      description: 'بادمجان سرخ شده با کشک',
      categoryId: iranianBreakfast.id,
      price: 65000,
      preparationTime: 20,
      isAvailable: true,
      isSpecial: true,
      priority: 2
    }
  })

  await prisma.menuItem.create({
    data: {
      name: 'املت فرانسوی',
      nameEn: 'French Omelet',
      description: 'املت کلاسیک فرانسوی',
      categoryId: continentalBreakfast.id,
      price: 55000,
      preparationTime: 12,
      isAvailable: true,
      isSpecial: false,
      priority: 1
    }
  })

  await prisma.menuItem.create({
    data: {
      name: 'برگر کلاسیک',
      nameEn: 'Classic Burger',
      description: 'برگر با گوشت، پنیر و سبزیجات',
      categoryId: burgers.id,
      price: 85000,
      preparationTime: 18,
      isAvailable: true,
      isSpecial: false,
      priority: 1
    }
  })

  await prisma.menuItem.create({
    data: {
      name: 'پیتزا مارگاریتا',
      nameEn: 'Pizza Margherita',
      description: 'پیتزا کلاسیک با ریحان و موتزارلا',
      categoryId: pizza.id,
      price: 120000,
      preparationTime: 25,
      isAvailable: true,
      isSpecial: true,
      priority: 2
    }
  })

  // چندین آیتم دیگر برای پرکردن منو
  await prisma.menuItem.create({
    data: {
      name: 'قورمه سبزی',
      nameEn: 'Ghormeh Sabzi',
      description: 'خورش ایرانی با سبزیجات معطر',
      categoryId: iranianFood.id,
      price: 95000,
      preparationTime: 30,
      isAvailable: true,
      isSpecial: true,
      priority: 1
    }
  })

  await prisma.menuItem.create({
    data: {
      name: 'فیله مرغ گریل',
      nameEn: 'Grilled Chicken Fillet',
      description: 'فیله مرغ گریل شده با سبزیجات',
      categoryId: internationalFood.id,
      price: 75000,
      preparationTime: 20,
      isAvailable: true,
      isSpecial: false,
      priority: 2
    }
  })

  console.log('✅ دیتابیس با موفقیت مقداردهی شد!')
  
  // نمایش نتیجه
  const categoryCount = await prisma.category.count()
  const itemCount = await prisma.menuItem.count()
  
  console.log(`📊 تعداد دسته‌بندی‌ها: ${categoryCount}`)
  console.log(`📊 تعداد آیتم‌های منو: ${itemCount}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
