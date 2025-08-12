import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - دریافت یک دسته‌بندی خاص
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`📂 GET request for category ID: ${id}`);
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    });
    
    if (!category) {
      return NextResponse.json({
        success: false,
        message: 'دسته‌بندی پیدا نشد'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        itemCount: category._count.menuItems
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching category:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت دسته‌بندی',
      error: error.message
    }, { status: 500 });
  }
}

// PUT - به‌روزرسانی دسته‌بندی
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log(`🔄 PUT request for category ID: ${id}`, body);
    
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        nameEn: body.nameEn,
        nameAr: body.nameAr,
        description: body.description,
        parentId: body.parentId,
        priority: body.priority,
        isActive: body.isActive,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی با موفقیت به‌روزرسانی شد',
      category: {
        ...updatedCategory,
        itemCount: updatedCategory._count.menuItems
      }
    });

  } catch (error: any) {
    console.error('❌ Error updating category:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در به‌روزرسانی دسته‌بندی',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - حذف دسته‌بندی
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`🗑️ DELETE request for category ID: ${id}`);
    
    // Check if category exists first
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'دسته‌بندی پیدا نشد'
      }, { status: 404 });
    }
    
    // Check if category has menu items
    const itemCount = await prisma.menuItem.count({
      where: { categoryId: id }
    });
    
    if (itemCount > 0) {
      return NextResponse.json({
        success: false,
        message: `نمی‌توان دسته‌بندی را حذف کرد. ${itemCount} آیتم منو به این دسته‌بندی وابسته است.`
      }, { status: 400 });
    }
    
    await prisma.category.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی با موفقیت حذف شد'
    });

  } catch (error: any) {
    console.error('❌ Error deleting category:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در حذف دسته‌بندی',
      error: error.message
    }, { status: 500 });
  }
}
