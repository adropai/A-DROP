import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - دریافت سفارشات آشپزخانه
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // پارامترهای فیلتر
    const status = searchParams.getAll('status');
    const priority = searchParams.getAll('priority');
    const orderType = searchParams.getAll('orderType');
    const category = searchParams.getAll('category');
    const timeRange = searchParams.get('timeRange');
    const tableNumber = searchParams.get('tableNumber');
    const customerPhone = searchParams.get('customerPhone');
    
    // ساخت شرایط جستجو - ساده شده
    const where: any = {};

    // فیلتر وضعیت - شامل همه وضعیت‌های ممکن
    if (status.length > 0) {
      where.status = { in: status };
    } 
    // اگر هیچ فیلتری نداشتیم، همه سفارش‌های امروز رو نشون بده
    // حذف فیلتر پیش‌فرض تا همه سفارش‌ها رو ببینیم

    // فیلتر نوع سفارش
    if (orderType.length > 0) {
      where.orderType = { in: orderType };
    }

    // فیلتر شماره میز - فعلاً غیرفعال
    // if (tableNumber) {
    //   where.table = {
    //     number: { contains: tableNumber }
    //   };
    // }

    // فیلتر شماره تلفن مشتری
    if (customerPhone) {
      where.customerPhone = { contains: customerPhone };
    }

    // فیلتر بازه زمانی
    if (timeRange) {
      const now = new Date();
      switch (timeRange) {
        case 'LAST_1H':
          where.createdAt.gte = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'LAST_3H':
          where.createdAt.gte = new Date(now.getTime() - 3 * 60 * 60 * 1000);
          break;
        case 'TODAY':
          where.createdAt.gte = new Date(now.setHours(0, 0, 0, 0));
          break;
      }
    }

    // دریافت سفارشات - ساده شده
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: [
        { createdAt: 'asc' }
      ]
    });

    console.log('🔍 API Debug - Found orders:', orders.length);
    if (orders.length > 0) {
      console.log('First order:', orders[0]);
    }

    // تبدیل ساده داده‌ها به فرمت آشپزخانه
    const kitchenOrders = orders.map(order => ({
      id: order.id.toString(),
      orderNumber: order.orderNumber || order.id.toString(),
      customer: {
        id: order.customerId || '',
        name: order.customerName || 'Unknown',
        phone: order.customerPhone || ''
      },
      table: {
        id: '1',
        number: 1
      },
      items: order.items.map(item => ({
        id: item.id.toString(),
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          nameEn: item.menuItem.nameEn || '',
          nameAr: item.menuItem.nameAr || '',
          category: 'main',
          price: item.menuItem.price,
          preparationTime: item.menuItem.preparationTime || 15
        },
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        notes: item.notes || '',
        status: 'RECEIVED',
        preparationTime: item.menuItem.preparationTime || 15,
        category: 'MAIN_COURSE',
        customizations: [],
        allergens: []
      })),
      status: 'RECEIVED',
      priority: 'NORMAL',
      totalPreparationTime: 20,
      orderType: 'DINE_IN',
      orderTime: order.createdAt,
      expectedReadyTime: undefined,
      notes: order.notes || '',
      tags: [],
      estimatedDelay: 0
    }));

    // فیلتر بر اساس دسته‌بندی غذا
    let filteredOrders = kitchenOrders;
    if (category.length > 0) {
      filteredOrders = kitchenOrders.filter(order =>
        order.items.some(item => category.includes(item.category))
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orders: filteredOrders,
        total: filteredOrders.length
      }
    });

  } catch (error) {
    console.error('خطا در دریافت سفارشات آشپزخانه:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت سفارشات' },
      { status: 500 }
    );
  }
}

// کمکی: تبدیل وضعیت سفارش به وضعیت آشپزخانه
function mapOrderStatusToKitchen(status: string) {
  switch (status) {
    case 'CONFIRMED':
    case 'PENDING': return 'RECEIVED';
    case 'PREPARING': return 'PREPARING';
    case 'READY': return 'READY';
    case 'DELIVERED':
    case 'COMPLETED': return 'SERVED';
    default: return 'RECEIVED';
  }
}

// کمکی: تبدیل اولویت سفارش
function mapOrderPriority(priority: string) {
  switch (priority) {
    case 'LOW': return 'LOW';
    case 'HIGH': return 'HIGH';
    case 'URGENT': return 'URGENT';
    default: return 'NORMAL';
  }
}

// کمکی: تبدیل دسته‌بندی منو به دسته‌بندی غذا
function mapMenuCategoryToFood(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes('پیش') || name.includes('appetizer')) return 'APPETIZER';
  if (name.includes('اصلی') || name.includes('main')) return 'MAIN_COURSE';
  if (name.includes('دسر') || name.includes('dessert')) return 'DESSERT';
  if (name.includes('نوشیدنی') || name.includes('drink')) return 'DRINK';
  return 'SIDE';
}
