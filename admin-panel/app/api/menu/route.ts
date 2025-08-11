import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/menu - دریافت آیتم‌های منو
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const skip = (page - 1) * limit;

    // بناء شرایط فیلتر
    const where: any = {};
    
    if (category) where.category = category;
    if (available !== null) where.isAvailable = available === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ingredients: { hasSome: [search] } }
      ];
    }

    // دریافت آیتم‌های منو
    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          category: true,
          orderItems: {
            where: {
              order: {
                createdAt: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
              }
            }
          }
        }
      }),
      prisma.menuItem.count({ where })
    ]);

    // محاسبه آمار
    const stats = {
      total,
      available: await prisma.menuItem.count({
        where: { ...where, isAvailable: true }
      }),
      categories: await prisma.menuItem.groupBy({
        by: ['categoryId'],
        _count: true
      }),
      popular: menuItems
        .map(item => ({
          ...item,
          orderCount: item.orderItems.length
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)
    };

    return NextResponse.json({
      success: true,
      data: menuItems,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('خطا در دریافت منو:', error);
    
    // داده‌های fallback
    const fallbackMenu = [
      {
        id: 1,
        name: 'کباب کوبیده',
        description: 'کباب کوبیده تازه با گوشت گوسفندی درجه یک',
        price: 120000,
        category: 'گریل',
        image: '/images/kabab-koobideh.jpg',
        isAvailable: true,
        preparationTime: 20,
        ingredients: ['گوشت گوسفندی', 'پیاز', 'ادویه خاص'],
        allergens: [],
        calories: 450,
        orderItems: []
      },
      {
        id: 2,
        name: 'جوجه کباب',
        description: 'جوجه کباب زعفرانی با مرغ تازه',
        price: 95000,
        category: 'گریل',
        image: '/images/jooje-kabab.jpg',
        isAvailable: true,
        preparationTime: 25,
        ingredients: ['مرغ', 'زعفران', 'لیمو', 'ادویه'],
        allergens: [],
        calories: 380,
        orderItems: []
      },
      {
        id: 3,
        name: 'قورمه سبزی',
        description: 'قورمه سبزی اصیل شمالی با لوبیا قرمز',
        price: 85000,
        category: 'خورش',
        image: '/images/ghormeh-sabzi.jpg',
        isAvailable: true,
        preparationTime: 15,
        ingredients: ['گوشت', 'سبزی قورمه', 'لوبیا قرمز', 'آلو'],
        allergens: [],
        calories: 320,
        orderItems: []
      }
    ];

    return NextResponse.json({
      success: true,
      data: fallbackMenu,
      pagination: {
        total: 3,
        page: 1,
        limit: 50,
        pages: 1
      },
      stats: {
        total: 3,
        available: 3,
        categories: [
          { category: 'گریل', _count: 2 },
          { category: 'خورش', _count: 1 }
        ],
        popular: fallbackMenu
      }
    });
  }
}

// POST /api/menu - اضافه کردن آیتم جدید به منو
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      image,
      preparationTime,
      ingredients = [],
      allergens = [],
      calories,
      isAvailable = true
    } = body;

    // بررسی اعتبار داده‌ها
    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'نام، قیمت و دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    // ایجاد آیتم جدید
    const newMenuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        images: JSON.stringify(image ? [image] : []),
        preparationTime: parseInt(preparationTime) || 15,
        ingredients,
        allergens,
        calories: parseInt(calories) || null,
        isAvailable
      }
    });

    return NextResponse.json({
      success: true,
      data: newMenuItem,
      message: 'آیتم جدید به منو اضافه شد'
    });

  } catch (error) {
    console.error('خطا در ایجاد آیتم منو:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد آیتم جدید' },
      { status: 500 }
    );
  }
}

// PUT /api/menu - بروزرسانی آیتم منو
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه آیتم الزامی است' },
        { status: 400 }
      );
    }

    // بروزرسانی آیتم
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: id },
      data: {
        ...updateData,
        price: updateData.price ? parseFloat(updateData.price) : undefined,
        preparationTime: updateData.preparationTime ? parseInt(updateData.preparationTime) : undefined,
        calories: updateData.calories ? parseInt(updateData.calories) : undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedMenuItem,
      message: 'آیتم منو بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی آیتم منو:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بروزرسانی آیتم' },
      { status: 500 }
    );
  }
}
