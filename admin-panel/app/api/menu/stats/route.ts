import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - دریافت آمار کلی منو
export async function GET(request: NextRequest) {
  try {
    // دریافت آمار همزمان
    const [
      totalItems,
      totalCategories,
      availableItems,
      specialItems,
      categoryStats,
      priceRange
    ] = await Promise.all([
      // کل آیتم‌ها
      prisma.menuItem.count(),
      
      // کل دسته‌بندی‌ها
      prisma.category.count(),
      
      // آیتم‌های موجود
      prisma.menuItem.count({
        where: { isAvailable: true }
      }),
      
      // آیتم‌های ویژه
      prisma.menuItem.count({
        where: { isSpecial: true }
      }),
      
      // آمار دسته‌بندی‌ها با تعداد آیتم‌ها
      prisma.category.findMany({
        include: {
          _count: {
            select: { menuItems: true }
          }
        },
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }),
      
      // محدوده قیمت
      prisma.menuItem.aggregate({
        _min: { price: true },
        _max: { price: true },
        _avg: { price: true }
      })
    ]);

    // آیتم‌های پرفروش
    const topSelling = await prisma.menuItem.findMany({
      take: 5,
      orderBy: { soldCount: 'desc' },
      select: {
        id: true,
        name: true,
        soldCount: true,
        price: true,
        category: {
          select: { name: true }
        }
      }
    });

    // آیتم‌های جدید (آخرین هفته)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const newItems = await prisma.menuItem.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        // آمار اصلی که در frontend استفاده می‌شود
        totalItems,
        totalCategories,
        availableItems,
        specialItems,
        unavailableItems: totalItems - availableItems,
        regularItems: totalItems - specialItems,
        
        // آمار تفصیلی
        overview: {
          totalItems,
          totalCategories,
          availableItems,
          specialItems,
          newItems
        },
        pricing: {
          minPrice: priceRange._min.price || 0,
          maxPrice: priceRange._max.price || 0,
          avgPrice: Math.round(priceRange._avg.price || 0)
        },
        categories: categoryStats.map(cat => ({
          id: cat.id,
          name: cat.name,
          itemCount: cat._count.menuItems,
          isActive: cat.isActive
        })),
        topSelling: topSelling.map(item => ({
          id: item.id,
          name: item.name,
          soldCount: item.soldCount,
          price: item.price,
          category: item.category.name
        }))
      }
    });

  } catch (error) {
    console.error('خطا در دریافت آمار منو:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت آمار منو' },
      { status: 500 }
    );
  }
}
