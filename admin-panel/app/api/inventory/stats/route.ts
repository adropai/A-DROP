import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Inventory Stats GET API called');

    // آمار کلی - ساده
    const totalItems = await prisma.inventoryItem.count({
      where: { isActive: true }
    });

    const totalCategories = await prisma.inventoryCategory.count({
      where: { isActive: true }
    });

    const totalMovements = await prisma.stockMovement.count();

    const outOfStockItems = await prisma.inventoryItem.count({
      where: {
        isActive: true,
        currentStock: { lte: 0 }
      }
    });

    // آیتم‌های کم موجود
    const allItems = await prisma.inventoryItem.findMany({
      where: { isActive: true },
      select: {
        id: true,
        currentStock: true,
        minStock: true
      }
    });

    const lowStockItems = allItems.filter(item => 
      item.currentStock <= item.minStock
    ).length;

    // ارزش کل
    const totalValue = await prisma.inventoryItem.aggregate({
      where: { isActive: true },
      _sum: {
        unitPrice: true
      }
    });

    // آمار دسته‌بندی‌ها
    const categories = await prisma.inventoryCategory.findMany({
      where: { isActive: true },
      include: {
        items: {
          where: { isActive: true }
        }
      }
    });

    const categoryData = categories.map(category => ({
      id: category.id,
      name: category.name,
      color: category.color,
      itemsCount: category.items.length,
      totalStock: category.items.reduce((sum, item) => sum + item.currentStock, 0),
      totalValue: category.items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0),
      lowStockCount: category.items.filter(item => item.currentStock <= item.minStock).length
    }));

    // آیتم‌های کم موجود جزئیات
    const lowStockDetails = await prisma.inventoryItem.findMany({
      where: {
        isActive: true,
        OR: [
          { currentStock: { lte: 0 } }
        ]
      },
      include: {
        category: true
      },
      orderBy: { currentStock: 'asc' },
      take: 10
    });

    // حرکت‌های اخیر
    const recentMovements = await prisma.stockMovement.findMany({
      include: {
        item: {
          select: {
            name: true,
            sku: true,
            unit: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const stats = {
      overview: {
        totalItems,
        totalCategories,
        totalMovements,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValue._sum.unitPrice || 0
      },
      categories: categoryData,
      lowStockItems: lowStockDetails,
      recentMovements
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Inventory Stats GET error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت آمار انبار',
      data: {
        overview: {
          totalItems: 0,
          totalCategories: 0,
          totalMovements: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          totalValue: 0
        },
        categories: [],
        lowStockItems: [],
        recentMovements: []
      }
    }, { status: 500 });
  }
}
