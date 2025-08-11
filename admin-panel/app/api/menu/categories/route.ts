import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - دریافت تمام دسته‌بندی‌ها
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const parentId = searchParams.get('parentId');
    const isActive = searchParams.get('isActive');

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

    if (parentId !== null && parentId !== '') {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    // دریافت دسته‌بندی‌ها با اطلاعات کامل
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
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
              nameEn: true,
              nameAr: true,
              isActive: true
            },
            where: { isActive: true }
          },
          _count: {
            select: {
              menuItems: true,
              children: true
            }
          }
        },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.category.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('خطا در دریافت دسته‌بندی‌ها:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت دسته‌بندی‌ها' },
      { status: 500 }
    );
  }
}

// POST - ایجاد دسته‌بندی جدید
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      nameEn,
      nameAr,
      description,
      image,
      parentId,
      priority,
      isActive
    } = body;

    // اعتبارسنجی داده‌های ورودی
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'نام دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن نام
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { nameEn: nameEn?.trim() },
          { nameAr: nameAr?.trim() }
        ].filter(Boolean)
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'دسته‌بندی با این نام قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // بررسی وجود دسته‌بندی والد
    if (parentId && parentId !== 0 && parentId !== '0') {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId.toString() }
      });

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, message: 'دسته‌بندی والد یافت نشد' },
          { status: 400 }
        );
      }
    }

    // ایجاد دسته‌بندی جدید
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        nameEn: nameEn?.trim(),
        nameAr: nameAr?.trim(),
        description: description?.trim(),
        image,
        parentId: (parentId && parentId !== 0 && parentId !== '0') ? parentId.toString() : null,
        priority: priority || 0,
        isActive: isActive !== false
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
          select: {
            children: true,
            menuItems: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'دسته‌بندی با موفقیت ایجاد شد'
    }, { status: 201 });

  } catch (error) {
    console.error('خطا در ایجاد دسته‌بندی:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد دسته‌بندی' },
      { status: 500 }
    );
  }
}
