import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - دریافت تمام دسته‌بندی‌های انبار
export async function GET(request: NextRequest) {
  try {
    console.log('📂 Inventory Categories GET API called');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const categories = await prisma.inventoryCategory.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            name: true,
            currentStock: true,
            status: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📂 Found ${categories.length} inventory categories`);

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('❌ Inventory Categories GET error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت دسته‌بندی‌های انبار',
      data: []
    }, { status: 500 });
  }
}

// POST - اضافه کردن دسته‌بندی جدید
export async function POST(request: NextRequest) {
  try {
    console.log('📂 Inventory Categories POST API called');
    const body = await request.json();
    console.log('📂 Request body:', body);

    const newCategory = await prisma.inventoryCategory.create({
      data: {
        name: body.name,
        description: body.description,
        color: body.color || '#1890ff',
        isActive: body.isActive ?? true
      }
    });

    console.log('📂 Created inventory category:', newCategory.id);

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی انبار با موفقیت ایجاد شد',
      data: newCategory
    });

  } catch (error) {
    console.error('❌ Inventory Categories POST error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد دسته‌بندی انبار'
    }, { status: 500 });
  }
}

// PUT - به‌روزرسانی دسته‌بندی انبار
export async function PUT(request: NextRequest) {
  try {
    console.log('📂 Inventory Categories PUT API called');
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'شناسه دسته‌بندی الزامی است'
      }, { status: 400 });
    }

    const updatedCategory = await prisma.inventoryCategory.update({
      where: { id },
      data: updateData
    });

    console.log('📂 Updated inventory category:', updatedCategory.id);

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی انبار با موفقیت به‌روزرسانی شد',
      data: updatedCategory
    });

  } catch (error) {
    console.error('❌ Inventory Categories PUT error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در به‌روزرسانی دسته‌بندی انبار'
    }, { status: 500 });
  }
}

// DELETE - حذف دسته‌بندی انبار
export async function DELETE(request: NextRequest) {
  try {
    console.log('📂 Inventory Categories DELETE API called');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'شناسه دسته‌بندی الزامی است'
      }, { status: 400 });
    }

    // بررسی اینکه آیا آیتمی در این دسته‌بندی وجود دارد یا نه
    const itemsCount = await prisma.inventoryItem.count({
      where: { categoryId: id }
    });

    if (itemsCount > 0) {
      return NextResponse.json({
        success: false,
        message: `نمی‌توان این دسته‌بندی را حذف کرد. ${itemsCount} آیتم در این دسته‌بندی وجود دارد.`
      }, { status: 400 });
    }

    await prisma.inventoryCategory.delete({
      where: { id }
    });

    console.log('📂 Deleted inventory category:', id);

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی انبار با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ Inventory Categories DELETE error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در حذف دسته‌بندی انبار'
    }, { status: 500 });
  }
}
