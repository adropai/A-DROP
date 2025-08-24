import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, category, unit, minStock, maxStock, cost, sellingPrice } = body;
    const itemId = params.id;

    console.log(`🔧 Updating inventory item ${itemId}:`, body);

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'آیتم یافت نشد' },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(unit && { unit }),
        ...(minStock !== undefined && { minStock: parseInt(minStock) }),
        ...(maxStock !== undefined && { maxStock: parseInt(maxStock) }),
        ...(cost !== undefined && { cost: parseFloat(cost) }),
        ...(sellingPrice !== undefined && { sellingPrice: parseFloat(sellingPrice) })
      },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    console.log('✅ Inventory item updated:', updatedItem);

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'آیتم با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('❌ Inventory item update error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در به‌روزرسانی آیتم' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;

    console.log(`🗑️ Deleting inventory item ${itemId}`);

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'آیتم یافت نشد' },
        { status: 404 }
      );
    }

    // Delete related movements first
    await prisma.stockMovement.deleteMany({
      where: { itemId: itemId }
    });

    // Delete the item
    await prisma.inventoryItem.delete({
      where: { id: itemId }
    });

    console.log('✅ Inventory item deleted');

    return NextResponse.json({
      success: true,
      message: 'آیتم با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ Inventory item delete error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف آیتم' },
      { status: 500 }
    );
  }
}
