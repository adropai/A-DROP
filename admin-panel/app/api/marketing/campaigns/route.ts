// Marketing Campaigns API - A-DROP Admin Panel  
// مدیریت کمپین‌های بازاریابی - CRUD کامل

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

interface MarketingCampaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'automation'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  targetSegment: string
  subject: string
  content: string
  scheduledDate?: Date
  startDate?: Date
  endDate?: Date
  budget?: number
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    revenue: number
  }
  createdAt: Date
  updatedAt: Date
}

// Mock database for marketing campaigns
let marketingCampaigns: MarketingCampaign[] = [
  {
    id: '1',
    name: 'کمپین خوش‌آمدگویی',
    type: 'email',
    status: 'active',
    targetSegment: 'new_customers',
    subject: 'به رستوران A-DROP خوش آمدید!',
    content: 'سلام {نام_مشتری}، به خانواده بزرگ رستوران A-DROP خوش آمدید. برای اولین سفارش خود 20% تخفیف دریافت کنید.',
    startDate: new Date('2024-12-01'),
    budget: 5000000,
    metrics: {
      sent: 850,
      delivered: 820,
      opened: 410,
      clicked: 123,
      converted: 45,
      revenue: 12500000
    },
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'تخفیف تولد مشتریان',
    type: 'sms',
    status: 'active',
    targetSegment: 'birthday_customers',
    subject: 'تولدت مبارک!',
    content: 'سلام {نام_مشتری}، تولدت مبارک! امروز برای جشن تولدت 30% تخفیف ویژه داریم.',
    metrics: {
      sent: 234,
      delivered: 228,
      opened: 200,
      clicked: 89,
      converted: 34,
      revenue: 8900000
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date()
  }
]

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

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    let filteredCampaigns = marketingCampaigns

    if (status) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status)
    }

    if (type) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.type === type)
    }

    return NextResponse.json({
      success: true,
      data: filteredCampaigns,
      stats: {
        total: marketingCampaigns.length,
        active: marketingCampaigns.filter(c => c.status === 'active').length,
        totalSent: marketingCampaigns.reduce((sum, c) => sum + c.metrics.sent, 0),
        totalRevenue: marketingCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0),
        averageOpenRate: Math.round(
          marketingCampaigns.reduce((sum, c) => sum + (c.metrics.opened / c.metrics.sent * 100), 0) / marketingCampaigns.length
        )
      }
    })
  } catch (error) {
    console.error('خطا در دریافت کمپین‌ها:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// POST - ایجاد کمپین جدید
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      type,
      targetSegment,
      subject,
      content,
      scheduledDate,
      budget
    } = body

    // اعتبارسنجی
    if (!name || !type || !targetSegment || !subject || !content) {
      return NextResponse.json({ 
        error: 'اطلاعات الزامی ناقص است' 
      }, { status: 400 })
    }

    const newCampaign: MarketingCampaign = {
      id: String(Date.now()),
      name,
      type,
      status: 'draft',
      targetSegment,
      subject,
      content,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      budget: budget || 0,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        revenue: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    marketingCampaigns.push(newCampaign)

    return NextResponse.json({
      success: true,
      message: 'کمپین با موفقیت ایجاد شد',
      data: newCampaign
    })
  } catch (error) {
    console.error('خطا در ایجاد کمپین:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PUT - ویرایش کمپین
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ 
        error: 'شناسه کمپین الزامی است' 
      }, { status: 400 })
    }

    const campaignIndex = marketingCampaigns.findIndex(campaign => campaign.id === id)
    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'کمپین یافت نشد' }, { status: 404 })
    }

    // ویرایش کمپین
    marketingCampaigns[campaignIndex] = {
      ...marketingCampaigns[campaignIndex],
      ...updates,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'کمپین با موفقیت ویرایش شد',
      data: marketingCampaigns[campaignIndex]
    })
  } catch (error) {
    console.error('خطا در ویرایش کمپین:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// DELETE - حذف کمپین
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ 
        error: 'شناسه کمپین الزامی است' 
      }, { status: 400 })
    }

    const campaignIndex = marketingCampaigns.findIndex(campaign => campaign.id === id)
    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'کمپین یافت نشد' }, { status: 404 })
    }

    // حذف کمپین
    marketingCampaigns.splice(campaignIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'کمپین با موفقیت حذف شد'
    })
  } catch (error) {
    console.error('خطا در حذف کمپین:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
