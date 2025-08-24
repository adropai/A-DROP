import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Public Tables GET API called');
    
    const tables = await prisma.table.findMany({
      orderBy: [
        { number: 'asc' }
      ]
    });

    console.log(`✅ Found ${tables.length} tables`);

    return NextResponse.json({
      success: true,
      tables: tables.map(table => ({
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        type: table.type?.toLowerCase() || 'indoor',
        status: table.status?.toLowerCase() || 'available',
        isActive: table.isActive,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      }))
    });

  } catch (error) {
    console.error('❌ Tables API error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات میزها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, capacity, location, type, status, isActive } = body;

    console.log('🔨 Creating new table:', { number, capacity, location, type, status, isActive });

    // Convert frontend values to database enums
    const dbType = type?.toUpperCase() || 'INDOOR';
    const dbStatus = status?.toUpperCase() || 'AVAILABLE';

    // Check if table number already exists
    const existingTable = await prisma.table.findFirst({
      where: { number: number.toString() }
    });

    if (existingTable) {
      return NextResponse.json(
        { success: false, error: 'میز با این شماره از قبل موجود است' },
        { status: 400 }
      );
    }

    const newTable = await prisma.table.create({
      data: {
        number: number.toString(),
        capacity: parseInt(capacity),
        location: location || null,
        type: dbType,
        status: dbStatus,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    console.log('✅ Table created:', newTable);

    return NextResponse.json({
      success: true,
      table: {
        ...newTable,
        location: newTable.location,
        type: newTable.type?.toLowerCase() || 'indoor',
        status: newTable.status?.toLowerCase() || 'available',
        isActive: newTable.isActive
      },
      message: 'میز با موفقیت اضافه شد'
    });

  } catch (error) {
    console.error('❌ Table creation error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد میز' },
      { status: 500 }
    );
  }
}
