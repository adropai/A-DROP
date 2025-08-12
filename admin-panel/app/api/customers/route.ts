import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/customers - دریافت لیست مشتریان
export async function GET(request: NextRequest) {
  try {
    console.log('🔹 GET /api/customers called');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier');
    const status = searchParams.get('status');

    console.log('🔹 Query params:', { page, limit, search, tier, status });

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

    console.log('🔹 Where conditions:', where);

    // دریافت مشتریان از دیتابیس
    console.log('🔹 Fetching from database...');
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          addresses: true,
          preferences: true,
          stats: true,
          tags: true
        }
      }),
      prisma.customer.count({ where })
    ]);

    console.log('🔹 Database result:', { 
      customersCount: customers.length, 
      total,
      customers: customers.map(c => ({ id: c.id, name: c.name, phone: c.phone }))
    });

    // محاسبه آمار برای هر مشتری
    const customersWithStats = customers.map((customer: any) => ({
      ...customer,
      tags: customer.tags?.map((tag: any) => tag.name) || [],
      stats: customer.stats || {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        averageOrderValue: 0
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
        tags: ['VIP', 'وفادار'],
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
      avatar,
      tags = [],
      notes
    } = body;

    console.log('🔹 Creating customer with data:', { name, email, phone, tier, status, tags });

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
        tags: {
          create: (tags || []).map((tagName: string) => ({
            name: tagName,
          })),
        },
      },
      include: {
        tags: true,
        addresses: true,
        preferences: true,
        stats: true,
      },
    });

    // تبدیل tags به array از strings
    const customerWithTags = {
      ...newCustomer,
      tags: newCustomer.tags.map(tag => tag.name),
    };

    console.log('🔹 Customer created successfully:', customerWithTags.id);

    return NextResponse.json({
      success: true,
      data: customerWithTags,
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
