import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TableType, TableStatus } from '@prisma/client';

// Helper functions for enum conversion
const mapTypeToDatabase = (type: string): TableType => {
  const mapping: { [key: string]: TableType } = {
    'indoor': TableType.INDOOR,
    'outdoor': TableType.OUTDOOR, 
    'vip': TableType.VIP
  };
  return mapping[type?.toLowerCase()] || TableType.INDOOR;
};

const mapStatusToDatabase = (status: string): TableStatus => {
  const mapping: { [key: string]: TableStatus } = {
    'available': TableStatus.AVAILABLE,
    'occupied': TableStatus.OCCUPIED,
    'reserved': TableStatus.RESERVED,
    'maintenance': TableStatus.MAINTENANCE
  };
  return mapping[status?.toLowerCase()] || TableStatus.AVAILABLE;
};

const mapTypeToFrontend = (type: string): string => {
  const mapping: { [key: string]: string } = {
    'INDOOR': 'indoor',
    'OUTDOOR': 'outdoor',
    'VIP': 'vip'
  };
  return mapping[type] || type.toLowerCase();
};

const mapStatusToFrontend = (status: string): string => {
  const mapping: { [key: string]: string } = {
    'AVAILABLE': 'available',
    'OCCUPIED': 'occupied',
    'RESERVED': 'reserved',
    'MAINTENANCE': 'maintenance'
  };
  return mapping[status] || status.toLowerCase();
};

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Tables GET API called');
    
    const tables = await prisma.table.findMany({
      orderBy: {
        number: 'asc'
      }
    });

    // Convert database enums to frontend format
    const formattedTables = tables.map(table => ({
      ...table,
      type: mapTypeToFrontend(table.type),
      status: mapStatusToFrontend(table.status)
    }));

    console.log(`📋 Found ${tables.length} tables`);
    
    return NextResponse.json({
      success: true,
      data: {
        tables: formattedTables,
        pagination: {
          page: 1,
          limit: 20,
          total: tables.length,
          pages: 1
        }
      }
    });

  } catch (error: any) {
    console.error('Tables GET API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'خطا در دریافت میزها',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📋 Tables POST API called');
    
    const body = await request.json();
    console.log('📋 POST data:', body);
    
    const newTable = await prisma.table.create({
      data: {
        number: String(body.number),
        capacity: parseInt(body.capacity),
        location: body.location || null,
        type: mapTypeToDatabase(body.type),
        status: mapStatusToDatabase(body.status),
        isActive: body.isActive !== undefined ? body.isActive : true,
        description: body.description || null
      }
    });

    // Convert database enums to frontend format
    const formattedTable = {
      ...newTable,
      type: mapTypeToFrontend(newTable.type),
      status: mapStatusToFrontend(newTable.status)
    };

    console.log('📋 New table created:', formattedTable);
    
    return NextResponse.json({
      success: true,
      message: 'میز جدید ایجاد شد',
      data: formattedTable
    }, { status: 201 });

  } catch (error: any) {
    console.error('Tables POST API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'خطا در ایجاد میز',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('📋 Tables PUT API called');
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    // Convert frontend enums to database format
    const processedData: any = { ...updateData };
    
    if (updateData.type) {
      processedData.type = mapTypeToDatabase(updateData.type);
    }
    
    if (updateData.status) {
      processedData.status = mapStatusToDatabase(updateData.status);
    }
    
    if (updateData.number) {
      processedData.number = String(updateData.number);
    }
    
    if (updateData.capacity) {
      processedData.capacity = parseInt(updateData.capacity);
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: processedData
    });

    // Convert database enums to frontend format
    const formattedTable = {
      ...updatedTable,
      type: mapTypeToFrontend(updatedTable.type),
      status: mapStatusToFrontend(updatedTable.status)
    };

    return NextResponse.json({
      success: true,
      message: 'میز به‌روزرسانی شد',
      data: formattedTable
    });

  } catch (error: any) {
    console.error('Tables PUT API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'خطا در به‌روزرسانی میز',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('📋 Tables DELETE API called');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID میز الزامی است' },
        { status: 400 }
      );
    }

    await prisma.table.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'میز حذف شد'
    });

  } catch (error: any) {
    console.error('Tables DELETE API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'خطا در حذف میز',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
