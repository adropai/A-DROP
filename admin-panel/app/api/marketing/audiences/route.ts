// Marketing Audiences API - A-DROP Admin Panel
// مدیریت مخاطبان هدف

import { NextRequest, NextResponse } from 'next/server'
import { TargetAudience } from '@/types/marketing'

export async function GET(request: NextRequest) {
  try {
    // Mock data - در نسخه واقعی از database می‌خوانیم
    const audiences: TargetAudience[] = [
      {
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
      {
        id: 'aud2',
        name: 'علاقه‌مندان غذای ایرانی',
        description: 'مشتریانی که بیشتر غذای ایرانی سفارش می‌دهند',
        criteria: {
          favoriteCategories: ['iranian', 'traditional']
        },
        estimatedSize: 580,
        lastUpdated: new Date()
      },
      {
        id: 'aud3',
        name: 'مشتریان طلایی',
        description: 'مشتریان با بیش از 20 سفارش در 6 ماه اخیر',
        criteria: {
          orderCount: { min: 20 },
          lastOrderDate: {
            from: new Date('2023-10-01'),
            to: new Date('2024-03-31')
          }
        },
        estimatedSize: 180,
        lastUpdated: new Date()
      },
      {
        id: 'aud4',
        name: 'همه مشتریان',
        description: 'تمامی مشتریان ثبت‌نام شده',
        criteria: {},
        estimatedSize: 2500,
        lastUpdated: new Date()
      },
      {
        id: 'aud5',
        name: 'کاربران جدید',
        description: 'کاربرانی که تا کنون سفارش نداده‌اند',
        criteria: {
          orderCount: { min: 0, max: 0 }
        },
        estimatedSize: 850,
        lastUpdated: new Date()
      }
    ]

    return NextResponse.json({
      success: true,
      data: audiences,
      message: 'لیست مخاطبان هدف با موفقیت دریافت شد'
    })

  } catch (error) {
    console.error('Audiences API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در دریافت لیست مخاطبان هدف'
      },
      { status: 500 }
    )
  }
}
