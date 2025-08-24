import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { number, capacity, location, type, status, isActive } = body;
    const tableId = params.id;

    console.log(`🔧 Updating table ${tableId}:`, { number, capacity, location, type, status, isActive });

    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: tableId }
    });

    if (!existingTable) {
      return NextResponse.json(
        { success: false, error: 'میز یافت نشد' },
        { status: 404 }
      );
    }

    // Check if number is being changed and conflicts with another table
    if (number && number.toString() !== existingTable.number) {
      const conflictTable = await prisma.table.findFirst({
        where: { 
          number: number.toString(),
          id: { not: tableId }
        }
      });

      if (conflictTable) {
        return NextResponse.json(
          { success: false, error: 'میز با این شماره از قبل موجود است' },
          { status: 400 }
        );
      }
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        ...(number && { number: number.toString() }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(location !== undefined && { location: location }),
        ...(type && { type: type.toUpperCase() }),
        ...(status && { status: status.toUpperCase() }),
        ...(isActive !== undefined && { isActive: isActive })
      }
    });

    console.log('✅ Table updated:', updatedTable);

    return NextResponse.json({
      success: true,
      table: {
        ...updatedTable,
        location: updatedTable.location,
        type: updatedTable.type?.toLowerCase() || 'indoor',
        status: updatedTable.status?.toLowerCase() || 'available',
        isActive: updatedTable.isActive
      },
      message: 'میز با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('❌ Table update error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در به‌روزرسانی میز' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = params.id;

    console.log(`🗑️ Deleting table ${tableId}`);

    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: tableId }
    });

    if (!existingTable) {
      return NextResponse.json(
        { success: false, error: 'میز یافت نشد' },
        { status: 404 }
      );
    }

    await prisma.table.delete({
      where: { id: tableId }
    });

    console.log('✅ Table deleted');

    return NextResponse.json({
      success: true,
      message: 'میز با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ Table deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف میز' },
      { status: 500 }
    );
  }
}
