import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { InventoryStatus } from '@prisma/client'; // Commented out for now

// GET - دریافت تمام آیتم‌های انبار
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // پارامترهای جستجو و فیلتر
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';
    const location = searchParams.get('location') || '';
    const supplier = searchParams.get('supplier') || '';
    const minStock = searchParams.get('minStock');
    const maxStock = searchParams.get('maxStock');
    const autoReorder = searchParams.get('autoReorder');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // محاسبه offset
    const skip = (page - 1) * limit;

    // ساخت شرایط جستجو
    const where: any = {};

    // جستجو در نام
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // فیلتر بر اساس دسته‌بندی
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    // فیلتر بر اساس وضعیت
    if (status && status !== 'all') {
      where.status = status;
    }

    // فیلتر بر اساس موقعیت
    if (location && location !== 'all') {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // فیلتر بر اساس تامین کننده
    if (supplier && supplier !== 'all') {
      where.supplier = { contains: supplier, mode: 'insensitive' };
    }

    // فیلتر موجودی
    if (minStock !== null && minStock !== '') {
      where.currentStock = { ...where.currentStock, gte: parseFloat(minStock) };
    }
    if (maxStock !== null && maxStock !== '') {
      where.currentStock = { ...where.currentStock, lte: parseFloat(maxStock) };
    }

    // فیلتر سفارش خودکار
    if (autoReorder !== null && autoReorder !== '') {
      where.autoReorder = autoReorder === 'true';
    }

    // فیلتر فعال/غیرفعال
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    // تنظیم مرتب‌سازی
    const orderBy: any = {};
    
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'currentStock') {
      orderBy.currentStock = sortOrder;
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.name = 'asc';
    }

    // دریافت آیتم‌های انبار با اطلاعات کامل
    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
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
      prisma.inventoryItem.count({ where })
    ]);

    // محاسبه آمار صفحه‌بندی
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });

  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت آیتم‌های انبار',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - ایجاد آیتم جدید انبار
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      nameEn,
      nameAr,
      description,
      categoryId,
      sku,
      unit,
      currentStock,
      minStock,
      maxStock,
      reorderPoint,
      price,
      supplier,
      supplierCode,
      lastRestockDate,
      expiryDate,
      batchNumber,
      barcode,
      location,
      autoReorder = false,
      isActive = true
    } = body;

    // اعتبارسنجی فیلدهای الزامی
    if (!name || !categoryId || !sku || !unit) {
      return NextResponse.json(
        { success: false, error: 'فیلدهای الزامی را پر کنید' },
        { status: 400 }
      );
    }

    // بررسی یکتا بودن SKU
    const existingSku = await prisma.inventoryItem.findUnique({
      where: { sku }
    });

    if (existingSku) {
      return NextResponse.json(
        { success: false, error: 'کد کالا قبلاً استفاده شده است' },
        { status: 400 }
      );
    }

    // تعیین وضعیت بر اساس موجودی
    let status: string = 'IN_STOCK';
    if (currentStock <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (currentStock <= minStock) {
      status = 'LOW_STOCK';
    }

    // بررسی انقضا
    if (expiryDate && new Date(expiryDate) <= new Date()) {
      status = 'EXPIRED';
    }

    // ایجاد آیتم جدید
    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        nameEn,
        nameAr,
        description,
        categoryId,
        sku,
        unit,
        currentStock: parseFloat(currentStock) || 0,
        minStock: parseFloat(minStock) || 0,
        maxStock: parseFloat(maxStock) || 0,
        reorderPoint: parseFloat(reorderPoint) || 0,
        price: parseFloat(price) || 0,
        averageCost: parseFloat(price) || 0,
        supplier,
        supplierCode,
        lastRestockDate: lastRestockDate ? new Date(lastRestockDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        batchNumber,
        barcode,
        location,
        status,
        autoReorder,
        isActive
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

    // ثبت حرکت ورودی اولیه
    if (currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          itemId: newItem.id,
          type: 'IN',
          quantity: parseFloat(currentStock),
          previousStock: 0,
          newStock: parseFloat(currentStock),
          unitPrice: parseFloat(price) || 0,
          totalValue: parseFloat(currentStock) * (parseFloat(price) || 0),
          reason: 'موجودی اولیه',
          user: 'System', // در آینده از JWT گرفته شود
          batchNumber,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          supplier
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'آیتم انبار با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ایجاد آیتم انبار',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
