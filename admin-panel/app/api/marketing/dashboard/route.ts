// Marketing Dashboard API - A-DROP Admin Panel
// گزارش کلی عملکرد بازاریابی و آمار کمپین‌ها

import { NextRequest, NextResponse } from 'next/server'
import { MarketingDashboard } from '@/types/marketing'

export async function GET(request: NextRequest) {
  try {
    // Mock data - در نسخه واقعی از database می‌خوانیم
    const dashboard: MarketingDashboard = {
      totalCampaigns: 24,
      activeCampaigns: 6,
      totalSent: 15240,
      totalClicks: 2870,
      totalRevenue: 4850000,
      averageROI: 3.2,
      
      topPerformingCampaign: {
        id: '1',
        name: 'تخفیف ویژه عید نوروز',
        description: 'کمپین تخفیفی بهاری برای جشن نوروز',
        type: 'seasonal',
        status: 'active',
        targetAudience: {
          id: 'aud1',
          name: 'مشتریان VIP',
          description: 'مشتریان با خرید بالای 2 میلیون تومان',
          criteria: {
            totalSpent: { min: 2000000 },
            orderCount: { min: 10 }
          },
          estimatedSize: 245,
          lastUpdated: new Date()
        },
        channels: ['sms', 'push', 'email'],
        content: {
          title: 'تخفیف ویژه نوروز 🎉',
          subtitle: 'تا 40% تخفیف روی همه محصولات',
          message: 'به مناسبت آغاز سال نو، از تخفیفات ویژه ما استفاده کنید',
          callToAction: 'همین حالا سفارش دهید',
          images: ['/images/norooz-banner.jpg'],
          discountCode: 'NOROOZ1403',
          discountPercent: 25,
          minOrderAmount: 100000,
          maxUsage: 1000,
          validUntil: new Date('2024-04-15')
        },
        budget: 2000000,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-04-15'),
        metrics: {
          sent: 2450,
          delivered: 2380,
          opened: 1850,
          clicked: 680,
          converted: 245,
          revenue: 1250000,
          cost: 180000,
          roi: 6.9,
          engagementRate: 77.7,
          conversionRate: 36.0,
          unsubscribed: 12
        },
        createdBy: 'admin',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-20')
      },

      recentCampaigns: [
        {
          id: '2',
          name: 'معرفی منوی جدید',
          description: 'کمپین معرفی غذاهای جدید فصل',
          type: 'newProduct',
          status: 'active',
          targetAudience: {
            id: 'aud2',
            name: 'علاقه‌مندان غذای ایرانی',
            description: 'مشتریانی که بیشتر غذای ایرانی سفارش می‌دهند',
            criteria: {
              favoriteCategories: ['iranian', 'traditional']
            },
            estimatedSize: 580,
            lastUpdated: new Date()
          },
          channels: ['inApp', 'push'],
          content: {
            title: 'منوی جدید رسید! 🍽️',
            subtitle: 'طعم‌های بی‌نظیر فصل پاییز',
            message: 'غذاهای محلی و سنتی جدید را امتحان کنید',
            callToAction: 'مشاهده منو',
            images: ['/images/new-menu.jpg']
          },
          budget: 800000,
          startDate: new Date('2024-03-25'),
          endDate: new Date('2024-04-25'),
          metrics: {
            sent: 1200,
            delivered: 1180,
            opened: 890,
            clicked: 340,
            converted: 125,
            revenue: 580000,
            cost: 120000,
            roi: 4.8,
            engagementRate: 75.4,
            conversionRate: 36.8,
            unsubscribed: 5
          },
          createdBy: 'marketing_manager',
          createdAt: new Date('2024-03-20'),
          updatedAt: new Date('2024-03-25')
        }
      ],

      segmentSummary: {
        totalSegments: 8,
        totalCustomers: 3240,
        averageSegmentSize: 405
      },

      channelPerformance: [
        {
          channel: 'sms',
          campaigns: 12,
          sent: 8500,
          opened: 7650,
          clicked: 1530,
          revenue: 2100000
        },
        {
          channel: 'push',
          campaigns: 15,
          sent: 12400,
          opened: 8680,
          clicked: 2040,
          revenue: 1850000
        },
        {
          channel: 'email',
          campaigns: 8,
          sent: 3200,
          opened: 1920,
          clicked: 480,
          revenue: 750000
        },
        {
          channel: 'inApp',
          campaigns: 10,
          sent: 9800,
          opened: 8820,
          clicked: 1960,
          revenue: 1400000
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: dashboard,
      message: 'داده‌های داشبورد بازاریابی با موفقیت دریافت شد'
    })

  } catch (error) {
    console.error('Marketing Dashboard API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در دریافت داده‌های داشبورد بازاریابی'
      },
      { status: 500 }
    )
  }
}
