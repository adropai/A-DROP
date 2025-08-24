import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/delivery/stats - دریافت آمار تحویلات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'TODAY';

    console.log('دریافت آمار تحویلات برای دوره:', period);

    // تعیین بازه زمانی
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case 'TODAY':
        startDate = new Date(new Date().setHours(0, 0, 0, 0));
        break;
      case 'WEEK':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'MONTH':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'YEAR':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(new Date().setHours(0, 0, 0, 0));
    }

    // آمار کلی تحویلات
    const [
      totalDeliveries,
      pendingDeliveries,
      assignedDeliveries,
      pickedUpDeliveries,
      deliveredDeliveries,
      failedDeliveries,
      returnedDeliveries,
      cancelledDeliveries
    ] = await Promise.all([
      prisma.delivery.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.delivery.count({
        where: {
          status: 'PENDING',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.delivery.count({
        where: {
          status: 'ASSIGNED',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.delivery.count({
        where: {
          status: 'PICKED_UP',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.delivery.count({
        where: {
          status: 'DELIVERED',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.delivery.count({
        where: {
          status: 'FAILED',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.delivery.count({
        where: {
          status: 'RETURNED',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.delivery.count({
        where: {
          status: 'CANCELLED',
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    // آمار مالی
    const financialStats = await prisma.delivery.aggregate({
      _sum: {
        deliveryFee: true
      },
      _avg: {
        deliveryFee: true
      },
      where: {
        status: 'DELIVERED',
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // آمار زمان تحویل (برای تحویلات انجام شده)
    const deliveredOrders = await prisma.delivery.findMany({
      where: {
        status: 'DELIVERED',
        deliveredAt: { not: null },
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        createdAt: true,
        deliveredAt: true,
        estimatedTime: true
      }
    });

    // محاسبه متوسط زمان تحویل
    let avgDeliveryTime = 0;
    let onTimeDeliveries = 0;
    
    if (deliveredOrders.length > 0) {
      const totalTime = deliveredOrders.reduce((sum, delivery) => {
        if (delivery.deliveredAt) {
          const deliveryTime = (delivery.deliveredAt.getTime() - delivery.createdAt.getTime()) / (1000 * 60); // به دقیقه
          
          // بررسی به موقع بودن
          if (delivery.estimatedTime && deliveryTime <= delivery.estimatedTime) {
            onTimeDeliveries++;
          }
          
          return sum + deliveryTime;
        }
        return sum;
      }, 0);
      
      avgDeliveryTime = Math.round(totalTime / deliveredOrders.length);
    }

    const onTimeDeliveryRate = deliveredOrders.length > 0 ? 
      (onTimeDeliveries / deliveredOrders.length) * 100 : 0;

    // آمار پیک‌ها
    const [activeCouriers, totalCouriers, courierRatings] = await Promise.all([
      prisma.deliveryPartner.count({
        where: {
          status: { in: ['AVAILABLE', 'BUSY'] },
          isActive: true
        }
      }),
      prisma.deliveryPartner.count({
        where: { isActive: true }
      }),
      prisma.deliveryPartner.aggregate({
        _avg: { rating: true },
        where: { isActive: true }
      })
    ]);

    // آمار رضایت مشتری (از نظرات تحویلات)
    const customerFeedback = await prisma.delivery.aggregate({
      _avg: { rating: true },
      where: {
        status: 'DELIVERED',
        deliveredAt: { gte: startDate, lte: endDate },
        rating: { not: null }
      }
    });

    // تجمیع آمار
    const stats = {
      total: totalDeliveries,
      pending: pendingDeliveries,
      assigned: assignedDeliveries,
      inTransit: pickedUpDeliveries,
      delivered: deliveredDeliveries,
      failed: failedDeliveries,
      returned: returnedDeliveries,
      cancelled: cancelledDeliveries,
      
      // آمار مالی
      totalRevenue: Math.round(financialStats._sum.deliveryFee || 0),
      avgDeliveryFee: Math.round(financialStats._avg.deliveryFee || 0),
      totalTips: 0, // می‌تواند از فیلد جداگانه محاسبه شود
      
      // آمار عملکرد
      avgDeliveryTime: avgDeliveryTime,
      onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 100) / 100,
      customerSatisfaction: Math.round((customerFeedback._avg.rating || 0) * 100) / 100,
      
      // آمار پیک‌ها
      activeCouriers: activeCouriers,
      totalCouriers: totalCouriers,
      avgCourierRating: Math.round((courierRatings._avg.rating || 0) * 100) / 100,

      // آمار اضافی
      deliverySuccessRate: totalDeliveries > 0 ? 
        Math.round((deliveredDeliveries / totalDeliveries) * 10000) / 100 : 0,
      
      period: period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('خطا در دریافت آمار تحویلات:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت آمار تحویلات',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
