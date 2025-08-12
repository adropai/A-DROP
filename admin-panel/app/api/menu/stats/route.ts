import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Menu stats API called');
    
    // Get total items count
    const totalItems = await prisma.menuItem.count();
    
    // Get available items count
    const availableItems = await prisma.menuItem.count({
      where: { isAvailable: true }
    });
    
    // Get special items count  
    const specialItems = await prisma.menuItem.count({
      where: { isSpecial: true }
    });
    
    // Get total categories count
    const totalCategories = await prisma.category.count({
      where: { isActive: true }
    });
    
    // Get category stats
    const categoryStats = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { menuItems: true }
        }
      },
      orderBy: { priority: 'desc' },
      take: 5
    });
    
    // Get price range
    const priceStats = await prisma.menuItem.aggregate({
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true }
    });
    
    // Get popular items (based on order count) 
    const popularItems = await prisma.menuItem.findMany({
      select: {
        id: true,
        name: true,
        orderItems: {
          select: { id: true }
        }
      },
      orderBy: { priority: 'desc' },
      take: 3
    });

    const stats = {
      totalItems,
      totalCategories,
      availableItems,
      unavailableItems: totalItems - availableItems,
      specialItems,
      categoryStats: categoryStats.map(cat => ({
        category: cat.name,
        count: cat._count.menuItems
      })),
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 0,
        average: Math.round(priceStats._avg.price || 0)
      },
      popularItems: popularItems.map(item => ({
        id: item.id,
        name: item.name,
        orderCount: item.orderItems.length
      }))
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Menu stats API error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور',
      data: {
        totalItems: 0,
        totalCategories: 0,
        availableItems: 0,
        unavailableItems: 0,
        specialItems: 0,
        categoryStats: [],
        priceRange: { min: 0, max: 0, average: 0 },
        popularItems: []
      }
    }, { status: 500 });
  }
}
