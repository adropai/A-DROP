import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get completed orders for the day
    const completedOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Calculate daily stats
    const totalSales = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Group by payment method
    const paymentMethodGroups = completedOrders.reduce((acc, order) => {
      const method = order.paymentMethod || 'unknown';
      if (!acc[method]) {
        acc[method] = { amount: 0, count: 0 };
      }
      acc[method].amount += order.totalAmount || 0;
      acc[method].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const paymentMethods = Object.entries(paymentMethodGroups).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: totalSales > 0 ? (data.amount / totalSales) * 100 : 0
    }));

    // Hourly breakdown
    const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => {
      const hourStart = new Date(startOfDay);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(startOfDay);
      hourEnd.setHours(hour, 59, 59, 999);

      const hourOrders = completedOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= hourStart && orderDate <= hourEnd;
      });

      return {
        hour,
        sales: hourOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        orders: hourOrders.length
      };
    }).filter(item => item.sales > 0 || item.orders > 0);

    // Top selling items
    const itemSales = completedOrders.flatMap(order => order.items).reduce((acc, item) => {
      const itemName = item.menuItem?.name || 'Unknown Item';
      if (!acc[itemName]) {
        acc[itemName] = { quantity: 0, revenue: 0 };
      }
      acc[itemName].quantity += item.quantity;
      acc[itemName].revenue += item.price * item.quantity;
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const report = {
      date,
      totalSales,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue),
      paymentMethods,
      hourlyBreakdown,
      topItems,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error generating daily report:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در تولید گزارش روزانه' },
      { status: 500 }
    );
  }
}
