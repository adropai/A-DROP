import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - بروزرسانی دسته‌بندی
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // بررسی وجود دسته‌بندی
    const existingCategory = await prisma.inventoryCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      );
    }

    // بروزرسانی دسته‌بندی
    const updatedCategory = await prisma.inventoryCategory.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی با موفقیت بروزرسانی شد',
      data: updatedCategory
    });

  } catch (error) {
    console.error('❌ خطا در بروزرسانی دسته‌بندی:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بروزرسانی دسته‌بندی' },
      { status: 500 }
    );
  }
}

// DELETE - حذف دسته‌بندی
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // بررسی وجود دسته‌بندی
    const existingCategory = await prisma.inventoryCategory.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی اینکه آیا آیتمی در این دسته‌بندی وجود دارد
    if (existingCategory.items && existingCategory.items.length > 0) {
      return NextResponse.json(
        { success: false, error: 'امکان حذف دسته‌بندی وجود ندارد. ابتدا آیتم‌های موجود در این دسته‌بندی را حذف کنید.' },
        { status: 400 }
      );
    }

    // حذف دسته‌بندی
    await prisma.inventoryCategory.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ خطا در حذف دسته‌بندی:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف دسته‌بندی' },
      { status: 500 }
    );
  }
}
