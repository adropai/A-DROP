import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Create sample menu items first
    const menuItems = [
      {
        id: 1,
        name: 'کباب کوبیده',
        price: 85000,
        category: 'گریل',
        department: 'GRILL' as const,
        available: true,
        preparationTime: 25
      },
      {
        id: 2,
        name: 'قهوه اسپرسو',
        price: 25000,
        category: 'نوشیدنی گرم',
        department: 'COFFEE_SHOP' as const,
        available: true,
        preparationTime: 5
      },
      {
        id: 3,
        name: 'سالاد سزار',
        price: 55000,
        category: 'سالاد',
        department: 'SALAD_BAR' as const,
        available: true,
        preparationTime: 10
      },
      {
        id: 4,
        name: 'کیک شکلاتی',
        price: 45000,
        category: 'دسر',
        department: 'DESSERT' as const,
        available: true,
        preparationTime: 15
      },
      {
        id: 5,
        name: 'خورش قیمه',
        price: 67500,
        category: 'غذای اصلی',
        department: 'KITCHEN' as const,
        available: true,
        preparationTime: 20
      },
      {
        id: 6,
        name: 'قلیون سیب',
        price: 95000,
        category: 'قلیون',
        department: 'HOOKAH' as const,
        available: true,
        preparationTime: 10
      },
      {
        id: 7,
        name: 'نان تازه',
        price: 15000,
        category: 'نان',
        department: 'BAKERY' as const,
        available: true,
        preparationTime: 8
      },
      {
        id: 8,
        name: 'قهوه ترک',
        price: 35000,
        category: 'نوشیدنی گرم',
        department: 'COFFEE_SHOP' as const,
        available: true,
        preparationTime: 12
      }
    ];

    // Create menu items
    for (const item of menuItems) {
      await (prisma as any).menuItem.upsert({
        where: { id: item.id.toString() },
        update: {
          ...item,
          id: item.id.toString()
        },
        create: {
          ...item,
          id: item.id.toString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `${menuItems.length} menu items created/updated successfully`,
      data: menuItems
    });

  } catch (error) {
    console.error('Error creating menu items:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error },
      { status: 500 }
    );
  }
}
