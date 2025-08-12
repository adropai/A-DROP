import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🍽️ Menu items API called');
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('categoryId') || '';
    const isAvailable = url.searchParams.get('isAvailable');
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

    // Get total count
    const total = await prisma.menuItem.count({ where });

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

    // Format data to match frontend expectations
    const formattedItems = menuItems.map(item => ({
      ...item,
      soldCount: item._count.orderItems,
      rating: 4.5 // Default rating - you can calculate from reviews later
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
    console.error('Menu items API error:', error);
    return NextResponse.json({
      success: false,
      data: [],
      message: 'خطا در دریافت آیتم‌های منو'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Menu item POST called');
    const body = await request.json();
    
    const menuItem = await prisma.menuItem.create({
      data: {
        name: body.name,
        nameEn: body.nameEn,
        nameAr: body.nameAr,
        description: body.description,
        price: body.price,
        discountPrice: body.discountPrice,
        categoryId: body.categoryId,
        images: body.images || '[]',
        isAvailable: body.isAvailable ?? true,
        isSpecial: body.isSpecial ?? false,
        preparationTime: body.preparationTime || 15,
        calories: body.calories,
        ingredients: body.ingredients || '[]',
        tags: body.tags || '[]',
        priority: body.priority || 0
      },
      include: {
        category: true,
        _count: {
          select: { orderItems: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'آیتم منو ایجاد شد',
      menuItem: {
        ...menuItem,
        soldCount: menuItem._count.orderItems
      }
    });
  } catch (error) {
    console.error('Menu item POST error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد آیتم منو'
    }, { status: 500 });
  }
}
