import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - دریافت آمار انبار
export async function GET(request: NextRequest) {
  try {
    // آمار کلی
    const [
      totalItems,
      totalCategories,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      expiredItems,
      categoryStats,
      totalValue,
      recentMovements
    ] = await Promise.all([
      // کل آیتم‌ها
      prisma.inventoryItem.count({ where: { isActive: true } }),
      
      // کل دسته‌بندی‌ها
      prisma.inventoryCategory.count({ where: { isActive: true } }),
      
      // آیتم‌های موجود
      prisma.inventoryItem.count({
        where: { 
          status: 'IN_STOCK',
          isActive: true 
        }
      }),
      
      // آیتم‌های کم موجود
      prisma.inventoryItem.count({
        where: { 
          status: 'LOW_STOCK',
          isActive: true 
        }
      }),
      
      // آیتم‌های ناموجود
      prisma.inventoryItem.count({
        where: { 
          status: 'OUT_OF_STOCK',
          isActive: true 
        }
      }),
      
      // آیتم‌های منقضی شده
      prisma.inventoryItem.count({
        where: { 
          status: 'EXPIRED',
          isActive: true 
        }
      }),

      // آمار دسته‌بندی‌ها
      prisma.inventoryCategory.findMany({
        include: {
          _count: {
            select: { items: true }
          }
        },
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }),

      // مجموع ارزش انبار
      prisma.inventoryItem.aggregate({
        _sum: {
          currentStock: true
        },
        where: { isActive: true }
      }),

      // حرکات اخیر
      prisma.stockMovement.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخرین هفته
          }
        }
      })
    ]);

    // آیتم‌های نیاز به سفارش مجدد
    const reorderItems = await prisma.inventoryItem.count({
      where: {
        AND: [
          { isActive: true },
          { autoReorder: true },
          {
            OR: [
              { currentStock: { lte: prisma.inventoryItem.fields.minStock } },
              { currentStock: { lte: prisma.inventoryItem.fields.reorderPoint } }
            ]
          }
        ]
      }
    });

    // آیتم‌های نزدیک به انقضا (30 روز آینده)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiryAlerts = await prisma.inventoryItem.count({
      where: {
        AND: [
          { isActive: true },
          { expiryDate: { lte: thirtyDaysFromNow } },
          { expiryDate: { gte: new Date() } }
        ]
      }
    });

    // روند موجودی (آخرین 7 روز)
    const stockTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const [inStock, lowStock, outOfStock] = await Promise.all([
        prisma.inventoryItem.count({
          where: {
            status: 'IN_STOCK',
            isActive: true,
            updatedAt: { gte: dayStart, lte: dayEnd }
          }
        }),
        prisma.inventoryItem.count({
          where: {
            status: 'LOW_STOCK',
            isActive: true,
            updatedAt: { gte: dayStart, lte: dayEnd }
          }
        }),
        prisma.inventoryItem.count({
          where: {
            status: 'OUT_OF_STOCK',
            isActive: true,
            updatedAt: { gte: dayStart, lte: dayEnd }
          }
        })
      ]);

      stockTrend.push({
        date: dayStart.toISOString().split('T')[0],
        inStock,
        lowStock,
        outOfStock
      });
    }

    // آمار حرکات بر اساس نوع
    const movementStats = await prisma.stockMovement.groupBy({
      by: ['type'],
      _count: {
        type: true
      },
      _sum: {
        totalValue: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // آخرین ماه
        }
      }
    });

    const movementsByType = movementStats.map(stat => ({
      type: stat.type,
      count: stat._count.type,
      value: stat._sum.totalValue || 0
    }));

    // تاپ دسته‌بندی‌ها بر اساس تعداد آیتم و ارزش
    const topCategories = await Promise.all(
      categoryStats.slice(0, 5).map(async (category) => {
        const totalValue = await prisma.inventoryItem.aggregate({
          _sum: {
            currentStock: true,
            price: true
          },
          where: {
            categoryId: category.id,
            isActive: true
          }
        });

        return {
          categoryName: category.name,
          itemCount: category._count.items,
          totalValue: (totalValue._sum.currentStock || 0) * (totalValue._sum.price || 0)
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        // آمار اصلی
        totalItems,
        totalCategories,
        inStockItems,
        lowStockItems,
        outOfStockItems,
        expiredItems,
        totalValue: totalValue._sum.currentStock || 0,
        lowStockAlerts: lowStockItems,
        expiryAlerts,
        recentMovements,
        reorderItems,

        // آمار تفصیلی
        overview: {
          totalItems,
          totalCategories,
          inStockItems,
          lowStockItems,
          outOfStockItems,
          expiredItems,
          activeItems: inStockItems + lowStockItems
        },

        // آمار دسته‌بندی‌ها
        categories: categoryStats.map(cat => ({
          id: cat.id,
          name: cat.name,
          itemCount: cat._count.items
        })),

        // تاپ دسته‌بندی‌ها
        topCategories,

        // روند موجودی
        stockTrend,

        // آمار حرکات
        movementsByType,

        // هشدارها
        alerts: {
          lowStock: lowStockItems,
          outOfStock: outOfStockItems,
          expired: expiredItems,
          expiringSoon: expiryAlerts,
          reorderNeeded: reorderItems
        }
      }
    });

  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت آمار انبار',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
