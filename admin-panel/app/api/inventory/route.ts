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
    console.log('📦 Request body:', body);

    const newItem = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        description: body.description,
        categoryId: body.categoryId,
        sku: body.sku,
        unit: body.unit || 'piece',
        currentStock: body.currentStock || 0,
        minStock: body.minStock || 0,
        maxStock: body.maxStock,
        unitPrice: body.unitPrice || 0,
        supplierName: body.supplierName,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        status: body.status || 'IN_STOCK',
        location: body.location,
        notes: body.notes,
        isActive: body.isActive ?? true
      },
      include: {
        category: true
      }
    });

    console.log('📦 Created inventory item:', newItem.id);

    return NextResponse.json({
      success: true,
      message: 'آیتم انبار با موفقیت ایجاد شد',
      data: newItem
    });

  } catch (error) {
    console.error('❌ Inventory POST error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد آیتم انبار'
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
