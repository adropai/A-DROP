import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - دریافت تمام دسته‌بندی‌های انبار
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const parentId = searchParams.get('parentId');
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // ساخت شرایط جستجو
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (parentId !== null && parentId !== '') {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const [categories, total] = await Promise.all([
      prisma.inventoryCategory.findMany({
        where,
        skip,
        take: limit,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              nameAr: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          },
          _count: {
            select: { items: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.inventoryCategory.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت دسته‌بندی‌های انبار',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - ایجاد دسته‌بندی جدید انبار
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      nameEn,
      nameAr,
      description,
      parentId,
      isActive = true
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'نام دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    const newCategory = await prisma.inventoryCategory.create({
      data: {
        name,
        nameEn,
        nameAr,
        description,
        parentId: parentId || null,
        isActive
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            nameAr: true
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'دسته‌بندی انبار با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('Error creating inventory category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ایجاد دسته‌بندی انبار',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
