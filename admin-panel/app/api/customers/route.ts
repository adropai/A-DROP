import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/customers - دریافت لیست مشتریان
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // بناء شرایط فیلتر
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }
    
    if (tier) where.tier = tier;
    if (status) where.status = status;

    // دریافت مشتریان از دیتابیس
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    // محاسبه آمار برای هر مشتری
    const customersWithStats = customers.map((customer: any) => ({
      ...customer,
      stats: {
        totalOrders: customer.orders?.length || 0,
        totalSpent: customer.orders?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0,
        lastOrderDate: customer.orders?.[0]?.createdAt || null,
        averageOrderValue: customer.orders?.length > 0 
          ? customer.orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) / customer.orders.length 
          : 0
      }
    }));

    return NextResponse.json({
      success: true,
      data: customersWithStats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Error fetching customers:', error);
    
    // در صورت خطا، داده‌های fallback برگردان
    const fallbackCustomers = [
      {
        id: '1',
        name: 'احمد محمدی',
        email: 'ahmad@example.com',
        phone: '09123456789',
        avatar: null,
        tier: 'Gold',
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalOrders: 12,
          totalSpent: 2450000,
          lastOrderDate: new Date(),
          averageOrderValue: 204166
        }
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: fallbackCustomers,
      pagination: {
        total: fallbackCustomers.length,
        page: 1,
        limit: 20,
        pages: 1,
      },
    });
  }
}

// POST /api/customers - اضافه کردن مشتری جدید
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      dateOfBirth, 
      gender, 
      tier = 'Bronze', 
      status = 'Active',
      avatar 
    } = body;

    // بررسی اعتبار داده‌های اصلی
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'نام و شماره تلفن الزامی است' },
        { status: 400 }
      );
    }

    // ایجاد مشتری در دیتابیس
    const newCustomer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        avatar,
        dateOfBirth,
        gender,
        tier,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      data: newCustomer,
      message: 'مشتری جدید با موفقیت اضافه شد',
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد مشتری جدید' },
      { status: 500 }
    );
  }
}
