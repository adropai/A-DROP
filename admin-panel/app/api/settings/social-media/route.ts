import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

interface SocialMediaPlatform {
  id: string
  name: string
  platform: string
  url: string
  isActive: boolean
  displayOrder: number
  customLabel?: string
  icon: string
  createdAt: Date
  updatedAt: Date
}

// Mock database for social media platforms
let socialMediaPlatforms: SocialMediaPlatform[] = [
  {
    id: '1',
    name: 'اینستاگرام',
    platform: 'instagram',
    url: '',
    isActive: false,
    displayOrder: 1,
    icon: '📷',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'تلگرام',
    platform: 'telegram',
    url: '',
    isActive: false,
    displayOrder: 2,
    icon: '✈️',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'واتساپ',
    platform: 'whatsapp',
    url: '',
    isActive: false,
    displayOrder: 3,
    icon: '📱',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'فیسبوک',
    platform: 'facebook',
    url: '',
    isActive: false,
    displayOrder: 4,
    icon: '👥',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: 'توییتر',
    platform: 'twitter',
    url: '',
    isActive: false,
    displayOrder: 5,
    icon: '🐦',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    name: 'یوتیوب',
    platform: 'youtube',
    url: '',
    isActive: false,
    displayOrder: 6,
    icon: '📺',
    createdAt: new Date(),
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

// GET - دریافت شبکه‌های اجتماعی
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const public_access = searchParams.get('public')
    const active_only = searchParams.get('active')

    // For public access (customer app) - only return active platforms
    if (public_access === 'true') {
      const publicPlatforms = socialMediaPlatforms
        .filter(platform => platform.isActive && platform.url)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(platform => ({
          id: platform.id,
          name: platform.customLabel || platform.name,
          platform: platform.platform,
          url: platform.url,
          icon: platform.icon,
          displayOrder: platform.displayOrder
        }))

      return NextResponse.json({
        success: true,
        data: publicPlatforms
      })
    }

    // For admin access
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    let filteredPlatforms = socialMediaPlatforms

    if (active_only === 'true') {
      filteredPlatforms = filteredPlatforms.filter(platform => platform.isActive)
    }

    // Sort by display order
    filteredPlatforms.sort((a, b) => a.displayOrder - b.displayOrder)

    return NextResponse.json({
      success: true,
      data: filteredPlatforms,
      stats: {
        total: socialMediaPlatforms.length,
        active: socialMediaPlatforms.filter(p => p.isActive).length,
        configured: socialMediaPlatforms.filter(p => p.url).length
      }
    })
  } catch (error) {
    console.error('خطا در دریافت شبکه‌های اجتماعی:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// POST - ذخیره تنظیمات شبکه‌های اجتماعی
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const { platforms } = body

    if (!platforms || !Array.isArray(platforms)) {
      return NextResponse.json({ 
        error: 'داده‌های پلتفرم‌ها نامعتبر است' 
      }, { status: 400 })
    }

    // Validate URLs
    for (const platform of platforms) {
      if (platform.url && platform.isActive) {
        try {
          new URL(platform.url)
        } catch {
          return NextResponse.json({ 
            error: `آدرس ${platform.name} نامعتبر است` 
          }, { status: 400 })
        }
      }
    }

    // Update platforms
    socialMediaPlatforms = platforms.map((platform: any) => ({
      ...platform,
      updatedAt: new Date(),
      createdAt: platform.createdAt || new Date()
    }))

    return NextResponse.json({
      success: true,
      message: 'شبکه‌های اجتماعی با موفقیت ذخیره شد',
      data: socialMediaPlatforms
    })
  } catch (error) {
    console.error('خطا در ذخیره شبکه‌های اجتماعی:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PUT - ویرایش یک پلتفرم
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
        error: 'شناسه پلتفرم الزامی است' 
      }, { status: 400 })
    }

    const platformIndex = socialMediaPlatforms.findIndex(platform => platform.id === id)
    if (platformIndex === -1) {
      return NextResponse.json({ error: 'پلتفرم یافت نشد' }, { status: 404 })
    }

    // Validate URL if provided
    if (updates.url) {
      try {
        new URL(updates.url)
      } catch {
        return NextResponse.json({ 
          error: 'آدرس URL نامعتبر است' 
        }, { status: 400 })
      }
    }

    // Update platform
    socialMediaPlatforms[platformIndex] = {
      ...socialMediaPlatforms[platformIndex],
      ...updates,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'پلتفرم با موفقیت ویرایش شد',
      data: socialMediaPlatforms[platformIndex]
    })
  } catch (error) {
    console.error('خطا در ویرایش پلتفرم:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// DELETE - حذف پلتفرم
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
        error: 'شناسه پلتفرم الزامی است' 
      }, { status: 400 })
    }

    const platformIndex = socialMediaPlatforms.findIndex(platform => platform.id === id)
    if (platformIndex === -1) {
      return NextResponse.json({ error: 'پلتفرم یافت نشد' }, { status: 404 })
    }

    // Remove platform
    const deletedPlatform = socialMediaPlatforms.splice(platformIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'پلتفرم حذف شد',
      data: deletedPlatform
    })
  } catch (error) {
    console.error('خطا در حذف پلتفرم:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PATCH - تغییر وضعیت فعال/غیرفعال
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const { id, action, value } = body

    if (!id || !action) {
      return NextResponse.json({ 
        error: 'شناسه و نوع عملیات الزامی است' 
      }, { status: 400 })
    }

    const platformIndex = socialMediaPlatforms.findIndex(platform => platform.id === id)
    if (platformIndex === -1) {
      return NextResponse.json({ error: 'پلتفرم یافت نشد' }, { status: 404 })
    }

    switch (action) {
      case 'toggle_active':
        socialMediaPlatforms[platformIndex].isActive = !socialMediaPlatforms[platformIndex].isActive
        break
      case 'set_active':
        socialMediaPlatforms[platformIndex].isActive = Boolean(value)
        break
      case 'update_order':
        socialMediaPlatforms[platformIndex].displayOrder = Number(value)
        break
      default:
        return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 })
    }

    socialMediaPlatforms[platformIndex].updatedAt = new Date()

    return NextResponse.json({
      success: true,
      message: 'پلتفرم به‌روزرسانی شد',
      data: socialMediaPlatforms[platformIndex]
    })
  } catch (error) {
    console.error('خطا در به‌روزرسانی پلتفرم:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
