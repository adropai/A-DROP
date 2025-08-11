// Marketing Segments API - A-DROP Admin Panel
// مدیریت سگمنت‌های مشتریان

import { NextRequest, NextResponse } from 'next/server'
import { CustomerSegment } from '@/types/marketing'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Mock data - در نسخه واقعی از database می‌خوانیم
    const allSegments: CustomerSegment[] = [
      {
        id: '1',
        name: 'مشتریان VIP',
        description: 'مشتریان با خرید بالای 2 میلیون تومان در 6 ماه اخیر',
        criteria: {
          totalSpent: { min: 2000000 },
          orderCount: { min: 15 },
          lastOrderDate: {
            from: new Date('2023-10-01'),
            to: new Date('2024-03-31')
          }
        },
        customerCount: 245,
        averageOrderValue: 180000,
        totalRevenue: 44100000,
        lastCampaignDate: new Date('2024-03-15'),
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20')
      },
      {
        id: '2',
        name: 'علاقه‌مندان غذای ایرانی',
        description: 'مشتریانی که بیش از 70% سفارشاتشان غذای ایرانی است',
        criteria: {
          favoriteCategories: ['iranian', 'traditional'],
          orderCount: { min: 5 }
        },
        customerCount: 580,
        averageOrderValue: 95000,
        totalRevenue: 55100000,
        lastCampaignDate: new Date('2024-03-25'),
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-03-25')
      },
      {
        id: '3',
        name: 'مشتریان طلایی',
        description: 'مشتریان با بیش از 20 سفارش موفق در 6 ماه اخیر',
        criteria: {
          orderCount: { min: 20 },
          lastOrderDate: {
            from: new Date('2023-10-01'),
            to: new Date('2024-03-31')
          }
        },
        customerCount: 180,
        averageOrderValue: 140000,
        totalRevenue: 25200000,
        isActive: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-03-28')
      },
      {
        id: '4',
        name: 'مشتریان جدید',
        description: 'مشتریانی که در 30 روز اخیر عضو شده‌اند',
        criteria: {
          registrationDate: {
            from: new Date('2024-03-01'),
            to: new Date('2024-03-31')
          },
          orderCount: { min: 1, max: 3 }
        },
        customerCount: 156,
        averageOrderValue: 65000,
        totalRevenue: 10140000,
        isActive: true,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-31')
      },
      {
        id: '5',
        name: 'مشتریان غیرفعال',
        description: 'مشتریانی که بیش از 2 ماه سفارش نداده‌اند',
        criteria: {
          lastOrderDate: {
            from: new Date('2023-01-01'),
            to: new Date('2024-01-31')
          },
          orderCount: { min: 2 }
        },
        customerCount: 320,
        averageOrderValue: 85000,
        totalRevenue: 27200000,
        lastCampaignDate: new Date('2024-02-15'),
        isActive: false,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-20')
      }
    ]

    // فیلتر کردن بر اساس جستجو
    let filteredSegments = allSegments
    
    if (search) {
      filteredSegments = filteredSegments.filter(segment =>
        segment.name.toLowerCase().includes(search.toLowerCase()) ||
        segment.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Pagination
    const total = filteredSegments.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSegments = filteredSegments.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedSegments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'لیست سگمنت‌ها با موفقیت دریافت شد'
    })

  } catch (error) {
    console.error('Segments API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در دریافت لیست سگمنت‌ها'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // اعتبارسنجی داده‌های ورودی
    const requiredFields = ['name', 'description', 'criteria']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `فیلد ${field} الزامی است`
          },
          { status: 400 }
        )
      }
    }

    // ایجاد سگمنت جدید
    const newSegment: CustomerSegment = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description,
      criteria: body.criteria,
      customerCount: Math.floor(Math.random() * 500) + 50, // محاسبه واقعی از database
      averageOrderValue: Math.floor(Math.random() * 200000) + 50000,
      totalRevenue: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // در نسخه واقعی در database ذخیره می‌شود
    console.log('ایجاد سگمنت جدید:', newSegment)

    return NextResponse.json({
      success: true,
      data: newSegment,
      message: 'سگمنت جدید با موفقیت ایجاد شد'
    })

  } catch (error) {
    console.error('Create Segment API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در ایجاد سگمنت جدید'
      },
      { status: 500 }
    )
  }
}
