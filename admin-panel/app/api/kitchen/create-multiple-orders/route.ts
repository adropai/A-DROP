import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🏗️ Creating 3 additional test orders with different items...');

    // 1. Create categories if not exist
    const mainCategory = await prisma.category.upsert({
      where: { id: 'main-dishes' },
      update: {},
      create: {
        id: 'main-dishes',
        name: 'غذاهای اصلی',
        nameEn: 'Main Dishes',
        description: 'غذاهای اصلی رستوران',
        priority: 1,
        isActive: true
      }
    });

    const drinkCategory = await prisma.category.upsert({
      where: { id: 'drinks' },
      update: {},
      create: {
        id: 'drinks',
        name: 'نوشیدنی',
        nameEn: 'Drinks',
        description: 'نوشیدنی‌ها',
        priority: 2,
        isActive: true
      }
    });

    const appetizerCategory = await prisma.category.upsert({
      where: { id: 'appetizers' },
      update: {},
      create: {
        id: 'appetizers',
        name: 'پیش غذا',
        nameEn: 'Appetizers',
        description: 'پیش غذاها',
        priority: 3,
        isActive: true
      }
    });

    // 2. Create menu items
    const menuItems = [
      // Main dishes
      {
        id: 'kebab-chenjeh',
        name: 'کباب چنجه',
        nameEn: 'Chenjeh Kebab',
        description: 'کباب چنجه مخصوص',
        categoryId: mainCategory.id,
        price: 220000,
        preparationTime: 25,
      },
      {
        id: 'kabab-barg',
        name: 'کباب برگ',
        nameEn: 'Barg Kebab',
        description: 'کباب برگ',
        categoryId: mainCategory.id,
        price: 280000,
        preparationTime: 30,
      },
      {
        id: 'ghormeh-sabzi',
        name: 'قورمه سبزی',
        nameEn: 'Ghormeh Sabzi',
        description: 'قورمه سبزی خانگی',
        categoryId: mainCategory.id,
        price: 150000,
        preparationTime: 15,
      },
      {
        id: 'zereshk-polo',
        name: 'زرشک پلو',
        nameEn: 'Zereshk Polo',
        description: 'زرشک پلو با مرغ',
        categoryId: mainCategory.id,
        price: 180000,
        preparationTime: 20,
      },
      {
        id: 'fesenjan',
        name: 'فسنجان',
        nameEn: 'Fesenjan',
        description: 'خورش فسنجان',
        categoryId: mainCategory.id,
        price: 200000,
        preparationTime: 18,
      },
      // Drinks
      {
        id: 'doogh',
        name: 'دوغ',
        nameEn: 'Doogh',
        description: 'دوغ محلی',
        categoryId: drinkCategory.id,
        price: 15000,
        preparationTime: 2,
      },
      {
        id: 'cola',
        name: 'نوشابه',
        nameEn: 'Cola',
        description: 'نوشابه سرد',
        categoryId: drinkCategory.id,
        price: 20000,
        preparationTime: 1,
      },
      {
        id: 'tea',
        name: 'چای',
        nameEn: 'Tea',
        description: 'چای سنتی',
        categoryId: drinkCategory.id,
        price: 12000,
        preparationTime: 3,
      },
      // Appetizers
      {
        id: 'salad-shirazi',
        name: 'سالاد شیرازی',
        nameEn: 'Shirazi Salad',
        description: 'سالاد شیرازی تازه',
        categoryId: appetizerCategory.id,
        price: 35000,
        preparationTime: 5,
      },
      {
        id: 'kashk-bademjan',
        name: 'کشک بادمجان',
        nameEn: 'Kashk Bademjan',
        description: 'کشک بادمجان',
        categoryId: appetizerCategory.id,
        price: 45000,
        preparationTime: 8,
      },
    ];

    // Create all menu items
    for (const item of menuItems) {
      await prisma.menuItem.upsert({
        where: { id: item.id },
        update: {},
        create: {
          ...item,
          isAvailable: true,
          isSpecial: false,
          priority: 1,
          tags: '',
          soldCount: 0
        }
      });
    }

    // 3. Create test orders with different item counts

    // Order 1: 3 items (Small family)
    const order1 = await prisma.order.create({
      data: {
        orderNumber: `ORDER-${Date.now()}-1`,
        customerName: 'احمد رضایی',
        customerPhone: '09121234567',
        status: 'RECEIVED',
        totalAmount: 485000, // 280000 + 150000 + 35000 + 20000
        notes: 'سفارش برای 2 نفر',
        items: {
          create: [
            {
              menuItemId: 'kabab-barg',
              quantity: 1,
              price: 280000,
              notes: 'بدون پیاز'
            },
            {
              menuItemId: 'ghormeh-sabzi',
              quantity: 1,
              price: 150000,
              notes: ''
            },
            {
              menuItemId: 'salad-shirazi',
              quantity: 1,
              price: 35000,
              notes: ''
            },
            {
              menuItemId: 'cola',
              quantity: 1,
              price: 20000,
              notes: ''
            }
          ]
        }
      }
    });

    // Order 2: 4 items (Medium family)
    const order2 = await prisma.order.create({
      data: {
        orderNumber: `ORDER-${Date.now()}-2`,
        customerName: 'فاطمه حسینی',
        customerPhone: '09129876543',
        status: 'RECEIVED',
        totalAmount: 750000, // 220000*2 + 180000 + 45000 + 15000*4
        notes: 'سفارش برای 3 نفر - بدون تند',
        items: {
          create: [
            {
              menuItemId: 'kebab-chenjeh',
              quantity: 2,
              price: 220000,
              notes: 'متوسط پخت'
            },
            {
              menuItemId: 'zereshk-polo',
              quantity: 1,
              price: 180000,
              notes: 'کم شیرین'
            },
            {
              menuItemId: 'kashk-bademjan',
              quantity: 1,
              price: 45000,
              notes: ''
            },
            {
              menuItemId: 'doogh',
              quantity: 4,
              price: 15000,
              notes: 'خیلی سرد'
            }
          ]
        }
      }
    });

    // Order 3: 5 items (Large family)
    const order3 = await prisma.order.create({
      data: {
        orderNumber: `ORDER-${Date.now()}-3`,
        customerName: 'محمد کریمی',
        customerPhone: '09137654321',
        status: 'RECEIVED',
        totalAmount: 1015000, // 280000*2 + 200000*2 + 35000*2 + 12000*5
        notes: 'سفارش گروهی - میز بزرگ',
        items: {
          create: [
            {
              menuItemId: 'kabab-barg',
              quantity: 2,
              price: 280000,
              notes: 'کاملاً پخته'
            },
            {
              menuItemId: 'fesenjan',
              quantity: 2,
              price: 200000,
              notes: 'کم ترش'
            },
            {
              menuItemId: 'salad-shirazi',
              quantity: 2,
              price: 35000,
              notes: 'بدون خیار'
            },
            {
              menuItemId: 'tea',
              quantity: 5,
              price: 12000,
              notes: 'پررنگ'
            }
          ]
        }
      }
    });

    // 4. Check final count
    const orderCount = await prisma.order.count();

    return NextResponse.json({
      success: true,
      message: '3 additional test orders created successfully',
      data: {
        orders: [
          {
            id: order1.id,
            orderNumber: order1.orderNumber,
            customer: order1.customerName,
            items: 4,
            total: order1.totalAmount
          },
          {
            id: order2.id,
            orderNumber: order2.orderNumber,
            customer: order2.customerName,
            items: 4,
            total: order2.totalAmount
          },
          {
            id: order3.id,
            orderNumber: order3.orderNumber,
            customer: order3.customerName,
            items: 4,
            total: order3.totalAmount
          }
        ],
        totalOrders: orderCount
      }
    });

  } catch (error) {
    console.error('❌ Error creating test orders:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
