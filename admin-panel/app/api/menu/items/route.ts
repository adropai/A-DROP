import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🍽️ Menu items API called');
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || url.searchParams.get('current') || '1');
    const limit = parseInt(url.searchParams.get('limit') || url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || url.searchParams.get('name') || '';
    const categoryId = url.searchParams.get('categoryId') || '';
    const isAvailable = url.searchParams.get('isAvailable') || url.searchParams.get('available');
    const isSpecial = url.searchParams.get('isSpecial');
    const sortBy = url.searchParams.get('sortBy') || 'priority';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (isAvailable !== null && isAvailable !== undefined && isAvailable !== '') {
      where.isAvailable = isAvailable === 'true';
    }
    
    if (isSpecial !== null && isSpecial !== undefined && isSpecial !== '') {
      where.isSpecial = isSpecial === 'true';
    }

    console.log('🔍 Query where:', where);

    // Get total count
    const total = await prisma.menuItem.count({ where });
    console.log('📊 Total count:', total);

    // Get menu items
    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { orderItems: true }
        }
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc'
      }
    });

    console.log('📋 Found items:', menuItems.length);

    // Format data to match frontend expectations
    const formattedItems = menuItems.map(item => ({
      ...item,
      soldCount: item._count.orderItems || 0,
      rating: item.rating || 0
    }));

    return NextResponse.json({
      success: true,
      data: formattedItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Menu items API error:', error);
    return NextResponse.json({
      success: false,
      data: [],
      message: 'خطا در دریافت آیتم‌های منو: ' + (error instanceof Error ? error.message : 'نامشخص')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Menu item POST called');
    
    const contentType = request.headers.get('content-type');
    let body;
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      throw new Error('Unsupported content type');
    }

    console.log('📝 Request body:', body);
    
    // Validate required fields
    if (!body.name || !body.categoryId || !body.price) {
      return NextResponse.json({
        success: false,
        message: 'نام، دسته‌بندی و قیمت الزامی هستند'
      }, { status: 400 });
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name: String(body.name),
        nameEn: body.nameEn ? String(body.nameEn) : null,
        nameAr: body.nameAr ? String(body.nameAr) : null,
        description: body.description ? String(body.description) : null,
        price: Number(body.price),
        discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
        categoryId: String(body.categoryId),
        images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []),
        isAvailable: body.isAvailable === true || body.isAvailable === 'true',
        isSpecial: body.isSpecial === true || body.isSpecial === 'true',
        preparationTime: body.preparationTime ? Number(body.preparationTime) : 15,
        calories: body.calories ? Number(body.calories) : null,
        ingredients: typeof body.ingredients === 'string' ? body.ingredients : JSON.stringify(body.ingredients || []),
        allergens: typeof body.allergens === 'string' ? body.allergens : JSON.stringify(body.allergens || []),
        customizations: typeof body.customizations === 'string' ? body.customizations : JSON.stringify(body.customizations || []),
        nutritionInfo: typeof body.nutritionInfo === 'string' ? body.nutritionInfo : JSON.stringify(body.nutritionInfo || {}),
        availableHours: typeof body.availableHours === 'string' ? body.availableHours : JSON.stringify(body.availableHours || {}),
        tags: typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags || []),
        priority: body.priority ? Number(body.priority) : 1,
        reviewCount: 0,
        soldCount: 0,
        rating: 0
      },
      include: {
        category: true,
        _count: {
          select: { orderItems: true }
        }
      }
    });

    console.log('✅ Menu item created:', menuItem.id);

    return NextResponse.json({
      success: true,
      message: 'آیتم منو ایجاد شد',
      data: {
        ...menuItem,
        soldCount: menuItem._count.orderItems
      }
    });
  } catch (error) {
    console.error('❌ Menu item POST error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({
          success: false,
          message: 'دسته‌بندی انتخاب شده معتبر نیست'
        }, { status: 400 });
      }
      
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({
          success: false,
          message: 'آیتمی با این نام قبلاً وجود دارد'
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد آیتم منو: ' + (error instanceof Error ? error.message : 'نامشخص')
    }, { status: 500 });
  }
}
