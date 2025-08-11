// Marketing Banners API - A-DROP Admin Panel
// مدیریت بنرهای تبلیغاتی

import { NextRequest, NextResponse } from 'next/server'
import { MarketingBanner } from '@/types/marketing'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Mock data - در نسخه واقعی از database می‌خوانیم
    const allBanners: MarketingBanner[] = [
      {
        id: '1',
        title: 'بنر تخفیف نوروزی',
        description: 'بنر ویژه تخفیفات نوروز برای صفحه اصلی',
        image: '/images/banners/norooz-main.jpg',
        link: '/menu?category=special',
        position: 'header',
        priority: 1,
        isActive: true,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-04-15'),
        clickCount: 1250,
        viewCount: 15600,
        targetPages: ['home', 'menu'],
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-20')
      },
      {
        id: '2',
        title: 'معرفی منوی جدید',
        description: 'بنر معرفی غذاهای جدید فصل',
        image: '/images/banners/new-menu.jpg',
        link: '/menu?section=new',
        position: 'sidebar',
        priority: 2,
        isActive: true,
        startDate: new Date('2024-03-25'),
        endDate: new Date('2024-04-25'),
        clickCount: 680,
        viewCount: 8900,
        targetPages: ['menu', 'categories'],
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-25')
      },
      {
        id: '3',
        title: 'پاپ‌آپ باشگاه مشتریان',
        description: 'دعوت به عضویت در باشگاه مشتریان وفادار',
        image: '/images/banners/loyalty-popup.jpg',
        link: '/loyalty-program',
        position: 'popup',
        priority: 3,
        isActive: false,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-06-01'),
        clickCount: 420,
        viewCount: 5200,
        targetPages: ['home'],
        createdAt: new Date('2024-03-28'),
        updatedAt: new Date('2024-03-30')
      },
      {
        id: '4',
        title: 'بنر شناور تماس',
        description: 'بنر شناور برای تماس سریع و سفارش تلفنی',
        image: '/images/banners/call-banner.jpg',
        link: 'tel:+982155667788',
        position: 'floating',
        priority: 4,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        clickCount: 2100,
        viewCount: 45000,
        targetPages: ['all'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-03-15')
      },
      {
        id: '5',
        title: 'بنر فوتر شبکه‌های اجتماعی',
        description: 'معرفی کانال‌های رسمی در شبکه‌های اجتماعی',
        image: '/images/banners/social-footer.jpg',
        link: '/social-media',
        position: 'footer',
        priority: 5,
        isActive: true,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-12-31'),
        clickCount: 890,
        viewCount: 12500,
        targetPages: ['all'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15')
      }
    ]

    // فیلتر کردن بر اساس جستجو
    let filteredBanners = allBanners
    
    if (search) {
      filteredBanners = filteredBanners.filter(banner =>
        banner.title.toLowerCase().includes(search.toLowerCase()) ||
        banner.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Pagination
    const total = filteredBanners.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedBanners = filteredBanners.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedBanners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'لیست بنرها با موفقیت دریافت شد'
    })

  } catch (error) {
    console.error('Banners API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در دریافت لیست بنرها'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // اعتبارسنجی داده‌های ورودی
    const requiredFields = ['title', 'description', 'image', 'position', 'priority', 'startDate', 'endDate', 'targetPages']
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

    // ایجاد بنر جدید
    const newBanner: MarketingBanner = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      image: body.image,
      link: body.link,
      position: body.position,
      priority: body.priority,
      isActive: true,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      clickCount: 0,
      viewCount: 0,
      targetPages: body.targetPages,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // در نسخه واقعی در database ذخیره می‌شود
    console.log('ایجاد بنر جدید:', newBanner)

    return NextResponse.json({
      success: true,
      data: newBanner,
      message: 'بنر جدید با موفقیت ایجاد شد'
    })

  } catch (error) {
    console.error('Create Banner API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در ایجاد بنر جدید'
      },
      { status: 500 }
    )
  }
}
