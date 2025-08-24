import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('👥 Couriers API called - fetching all couriers');

    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')
    const limitParam = url.searchParams.get('limit')

    const where: any = {}

    // فیلتر وضعیت پیک
    if (statusParam) {
      where.status = statusParam.toUpperCase()
    }

    const take = limitParam ? Math.max(1, Math.min(parseInt(limitParam, 10) || 20, 100)) : undefined

    const partners = await prisma.deliveryPartner.findMany({
      where,
      orderBy: {
        name: 'asc'
      },
      take
    });

    console.log(`👥 Found ${partners.length} couriers in database`);

    return NextResponse.json({
      success: true,
      data: partners,
      count: partners.length
    });

  } catch (error) {
    console.error('❌ Couriers API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('👥 Creating new courier:', body);

    const { name, phone, email, vehicleType, vehicleNumber, licenseNumber } = body;

    // Create new courier
    const courier = await prisma.deliveryPartner.create({
      data: {
        name,
        phone,
        email,
        vehicleType,
        vehicleNumber,
        licenseNumber,
        status: 'AVAILABLE',
        rating: 5.0,
        totalDeliveries: 0,
        isActive: true
      }
    });

    console.log('✅ Courier created:', courier.id);

    return NextResponse.json({
      success: true,
      data: courier,
      message: 'پیک جدید با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('❌ Courier creation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
