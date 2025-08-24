import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InventoryStatus } from '@prisma/client';

// GET - دریافت تمام آیتم‌های انبار
export async function GET(request: NextRequest) {
  try {
    console.log('📦 Inventory GET API called');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    // دریافت آیتم‌ها از دیتابیس
    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          category: true,
          movements: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.inventoryItem.count({ where })
    ]);

    console.log(`📦 Found ${items.length} inventory items`);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Inventory GET error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت آیتم‌های انبار',
      data: []
    }, { status: 500 });
  }
}

// POST - اضافه کردن آیتم جدید به انبار
export async function POST(request: NextRequest) {
  try {
    console.log('📦 Inventory POST API called');
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    // بررسی فیلدهای الزامی
    if (!body.name) {
      console.log('❌ Missing name field');
      return NextResponse.json({
        success: false,
        message: 'نام آیتم الزامی است'
      }, { status: 400 });
    }

    if (!body.categoryId) {
      console.log('❌ Missing categoryId field');
      return NextResponse.json({
        success: false,
        message: 'دسته‌بندی الزامی است'
      }, { status: 400 });
    }

    // بررسی وجود category
    const category = await prisma.inventoryCategory.findUnique({
      where: { id: body.categoryId }
    });

    if (!category) {
      console.log('❌ Category not found:', body.categoryId);
      return NextResponse.json({
        success: false,
        message: 'دسته‌بندی انتخابی موجود نیست'
      }, { status: 400 });
    }

    console.log('✅ Category found:', category.name);

    // Parse expiry date safely
    let parsedExpiryDate: Date | null = null;
    if (body.expiryDate) {
      try {
        const tempDate = new Date(body.expiryDate);
        // اگر تاریخ Invalid باشد
        if (isNaN(tempDate.getTime())) {
          console.log('❌ Invalid expiry date format:', body.expiryDate);
          return NextResponse.json({
            success: false,
            message: 'فرمت تاریخ انقضا صحیح نیست'
          }, { status: 400 });
        }
        parsedExpiryDate = tempDate;
        console.log('✅ Parsed expiry date:', parsedExpiryDate);
      } catch (error) {
        console.log('❌ Error parsing expiry date:', error);
        return NextResponse.json({
          success: false,
          message: 'خطا در پردازش تاریخ انقضا'
        }, { status: 400 });
      }
    }

    const itemData = {
      name: body.name,
      description: body.description || null,
      categoryId: body.categoryId,
      sku: body.sku || null,
      unit: body.unit || 'piece',
      currentStock: parseInt(body.currentStock) || 0,
      minStock: parseInt(body.minStock) || 0,
      maxStock: body.maxStock ? parseInt(body.maxStock) : null,
      unitPrice: parseFloat(body.unitPrice) || 0,
      supplierName: body.supplierName || null,
      expiryDate: parsedExpiryDate,
      status: body.status || 'IN_STOCK',
      location: body.location || null,
      notes: body.notes || null,
      isActive: body.isActive ?? true
    };

    console.log('📦 Creating item with data:', JSON.stringify(itemData, null, 2));

    // ابتدا تست کنیم که prisma کار می‌کند
    console.log('Testing prisma connection...');
    const testConnection = await prisma.inventoryCategory.findMany();
    console.log('Categories count:', testConnection.length);

    const newItem = await prisma.inventoryItem.create({
      data: itemData,
      include: {
        category: true
      }
    });

    console.log('✅ Created inventory item:', newItem.id);

    return NextResponse.json({
      success: true,
      message: 'آیتم انبار با موفقیت ایجاد شد',
      data: newItem
    });

  } catch (error) {
    console.error('❌ Inventory POST error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد آیتم انبار',
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - به‌روزرسانی آیتم انبار
export async function PUT(request: NextRequest) {
  try {
    console.log('📦 Inventory PUT API called');
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'شناسه آیتم الزامی است'
      }, { status: 400 });
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...updateData,
        expiryDate: updateData.expiryDate ? new Date(updateData.expiryDate) : null
      },
      include: {
        category: true
      }
    });

    console.log('📦 Updated inventory item:', updatedItem.id);

    return NextResponse.json({
      success: true,
      message: 'آیتم انبار با موفقیت به‌روزرسانی شد',
      data: updatedItem
    });

  } catch (error) {
    console.error('❌ Inventory PUT error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در به‌روزرسانی آیتم انبار'
    }, { status: 500 });
  }
}

// DELETE - حذف آیتم انبار
export async function DELETE(request: NextRequest) {
  try {
    console.log('📦 Inventory DELETE API called');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'شناسه آیتم الزامی است'
      }, { status: 400 });
    }

    await prisma.inventoryItem.delete({
      where: { id }
    });

    console.log('📦 Deleted inventory item:', id);

    return NextResponse.json({
      success: true,
      message: 'آیتم انبار با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ Inventory DELETE error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در حذف آیتم انبار'
    }, { status: 500 });
  }
}
