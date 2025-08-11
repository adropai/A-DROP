import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - دریافت تمام آیتم‌های منو
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const isAvailable = searchParams.get('isAvailable');
    const isSpecial = searchParams.get('isSpecial');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'priority';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const skip = (page - 1) * limit;

    // بناء شرایط فیلتر
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isAvailable !== null && isAvailable !== '') {
      where.isAvailable = isAvailable === 'true';
    }

    if (isSpecial !== null && isSpecial !== '') {
      where.isSpecial = isSpecial === 'true';
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }

    // تنظیم مرتب‌سازی
    const orderBy: any = {};
    
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.priority = sortOrder === 'desc' ? 'desc' : 'asc';
    }

    // دریافت آیتم‌های منو با اطلاعات کامل
    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              nameAr: true
            }
          }
        },
        orderBy
      }),
      prisma.menuItem.count({ where })
    ]);



    return NextResponse.json({
      success: true,
      data: menuItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('خطا در دریافت آیتم‌های منو:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت آیتم‌های منو',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - ایجاد آیتم منو جدید
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      nameEn,
      nameAr,
      description,
      categoryId,
      price,
      discountPrice,
      images,
      ingredients,
      allergens,
      preparationTime,
      calories,
      customizations,
      availableHours,
      isAvailable,
      isSpecial,
      priority,
      tags
    } = body;

    // اعتبارسنجی داده‌های ورودی
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'نام آیتم منو الزامی است' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { success: false, message: 'قیمت باید عددی مثبت باشد' },
        { status: 400 }
      );
    }

    if (!preparationTime || preparationTime <= 0) {
      return NextResponse.json(
        { success: false, message: 'زمان آماده‌سازی الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود دسته‌بندی
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'دسته‌بندی یافت نشد' },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن نام
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { nameEn: nameEn?.trim() },
          { nameAr: nameAr?.trim() }
        ].filter(Boolean)
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: 'آیتم منو با این نام قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی قیمت تخفیف
    if (discountPrice && discountPrice >= price) {
      return NextResponse.json(
        { success: false, message: 'قیمت تخفیف باید کمتر از قیمت اصلی باشد' },
        { status: 400 }
      );
    }

    // ایجاد آیتم منو جدید
    const menuItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        nameEn: nameEn?.trim(),
        nameAr: nameAr?.trim(),
        description: description?.trim(),
        categoryId,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        images: JSON.stringify(images || []),
        ingredients: JSON.stringify(ingredients || []),
        allergens: JSON.stringify(allergens || []),
        preparationTime: parseInt(preparationTime),
        calories: calories ? parseInt(calories) : null,
        customizations: JSON.stringify(customizations || []),
        availableHours: availableHours || null,
        isAvailable: isAvailable !== false,
        isSpecial: isSpecial === true,
        priority: priority || 0,
        tags: JSON.stringify(tags || []),
        reviewCount: 0,
        soldCount: 0
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            nameAr: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: 'آیتم منو با موفقیت ایجاد شد'
    }, { status: 201 });

  } catch (error) {
    console.error('خطا در ایجاد آیتم منو:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد آیتم منو' },
      { status: 500 }
    );
  }
}
