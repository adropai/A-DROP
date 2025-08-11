import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/marketing - دریافت کمپین‌های بازاریابی
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('دریافت کمپین‌های بازاریابی با فیلترها:', { type, status, category, active });
    
    // ساخت شرط‌های جستجو
    const where: any = {};
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (category) where.category = category;
    if (active !== null) where.isActive = active === 'true';

    // دریافت کمپین‌ها از دیتابیس
    const campaigns = await prisma.marketingCampaign.findMany({
      where,
      include: {
        coupons: {
          include: {
            usageHistory: {
              include: {
                customer: {
                  select: { id: true, firstName: true, lastName: true }
                },
                order: {
                  select: { id: true, total: true, orderDate: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // شمارش کل کمپین‌ها
    const total = await prisma.marketingCampaign.count({ where });

    // محاسبه آمار هر کمپین
    const campaignsWithStats = await Promise.all(campaigns.map(async (campaign) => {
      // آمار کوپن‌ها
      const couponStats = await prisma.coupon.aggregate({
        where: { campaignId: campaign.id },
        _count: { id: true },
        _sum: { usageCount: true }
      });

      // آمار استفاده از کوپن‌ها
      const usageStats = await prisma.couponUsage.aggregate({
        where: { 
          coupon: { campaignId: campaign.id }
        },
        _count: { id: true },
        _sum: { discountAmount: true }
      });

      return {
        ...campaign,
        stats: {
          totalCoupons: couponStats._count.id || 0,
          totalUsage: couponStats._sum.usageCount || 0,
          totalDiscount: usageStats._sum.discountAmount || 0,
          conversions: usageStats._count.id || 0
        }
      };
    }));

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaignsWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('خطا در دریافت کمپین‌های بازاریابی:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت کمپین‌های بازاریابی',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// POST /api/marketing - ایجاد کمپین بازاریابی جدید
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('ایجاد کمپین بازاریابی جدید:', data);

    // اعتبارسنجی داده‌ها
    if (!data.name || !data.type || !data.startDate) {
      return NextResponse.json(
        { success: false, error: 'فیلدهای نام، نوع و تاریخ شروع اجباری هستند' },
        { status: 400 }
      );
    }

    // ایجاد کمپین جدید
    const campaign = await prisma.marketingCampaign.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        category: data.category || 'GENERAL',
        status: data.status || 'DRAFT',
        isActive: data.isActive || false,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget || 0,
        targetAudience: data.targetAudience || {},
        content: data.content || {},
        channels: data.channels || []
      },
      include: {
        coupons: true
      }
    });

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'کمپین بازاریابی با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('خطا در ایجاد کمپین بازاریابی:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ایجاد کمپین بازاریابی',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// PUT /api/marketing - بروزرسانی کمپین بازاریابی
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    console.log('بروزرسانی کمپین بازاریابی:', { id, updateData });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه کمپین اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود کمپین
    const existingCampaign = await prisma.marketingCampaign.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: 'کمپین یافت نشد' },
        { status: 404 }
      );
    }

    // بروزرسانی کمپین
    const updatedCampaign = await prisma.marketingCampaign.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        updatedAt: new Date()
      },
      include: {
        coupons: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'کمپین بازاریابی با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی کمپین بازاریابی:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی کمپین بازاریابی',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/marketing - حذف کمپین بازاریابی
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('حذف کمپین بازاریابی:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه کمپین اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود کمپین
    const existingCampaign = await prisma.marketingCampaign.findUnique({
      where: { id: parseInt(id) },
      include: { coupons: true }
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: 'کمپین یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی امکان حذف (اگر کوپن‌های فعال دارد)
    const activeCoupons = existingCampaign.coupons.filter(c => c.isActive);
    if (activeCoupons.length > 0) {
      return NextResponse.json(
        { success: false, error: 'کمپین دارای کوپن‌های فعال است و قابل حذف نیست' },
        { status: 400 }
      );
    }

    // حذف کمپین
    await prisma.marketingCampaign.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'کمپین بازاریابی با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('خطا در حذف کمپین بازاریابی:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در حذف کمپین بازاریابی',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
