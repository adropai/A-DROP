import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Verify JWT token
async function verifyToken(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    return decoded
  } catch (error) {
    return null
  }
}

// GET - دریافت آمار کلی تبلیغات
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    // Mock marketing stats
    const marketingStats = {
      totalCampaigns: 12,
      activeCampaigns: 4,
      totalSent: 8750,
      averageOpenRate: 42.5,
      totalRevenue: 35600000,
      automationRules: 8,
      totalClicks: 1280,
      totalConversions: 125,
      averageConversionRate: 9.8,
      totalBudget: 18500000,
      totalCost: 12300000,
      averageROI: 289,
      topPerformingCampaign: {
        id: '1',
        name: 'کمپین خوش‌آمدگویی',
        revenue: 12500000,
        conversionRate: 15.2
      },
      campaignsByType: {
        email: 5,
        sms: 4,
        push: 2,
        automation: 1
      },
      recentActivity: [
        {
          id: '1',
          type: 'campaign_started',
          message: 'کمپین "تخفیف تولد" شروع شد',
          timestamp: new Date(),
          campaign: 'تخفیف تولد مشتریان'
        },
        {
          id: '2', 
          type: 'high_engagement',
          message: 'کمپین "خوش‌آمدگویی" نرخ باز شدن 85% دارد',
          timestamp: new Date(Date.now() - 3600000),
          campaign: 'کمپین خوش‌آمدگویی'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: marketingStats
    })
  } catch (error) {
    console.error('خطا در دریافت آمار تبلیغات:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
