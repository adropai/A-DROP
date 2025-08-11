import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Mock database for branding settings
let brandingSettings = {
  id: '1',
  restaurantName: 'رستوران A-DROP',
  restaurantNameEn: 'A-DROP Restaurant',
  description: 'بهترین رستوران شهر با غذاهای اصیل و طعم بی‌نظیر',
  descriptionEn: 'The best restaurant in the city with authentic and delicious food',
  logo: '',
  favicon: '',
  primaryColor: '#1890ff',
  secondaryColor: '#52c41a', 
  accentColor: '#faad14',
  fontFamily: 'IRANSans',
  customCSS: '',
  createdAt: new Date(),
  updatedAt: new Date()
}

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

// GET - دریافت تنظیمات برندینگ
export async function GET(request: NextRequest) {
  try {
    // For public access (customer app)
    const { searchParams } = new URL(request.url)
    const public_access = searchParams.get('public')
    
    if (public_access === 'true') {
      // Return only public branding info
      const publicData = {
        restaurantName: brandingSettings.restaurantName,
        restaurantNameEn: brandingSettings.restaurantNameEn,
        description: brandingSettings.description,
        descriptionEn: brandingSettings.descriptionEn,
        logo: brandingSettings.logo,
        favicon: brandingSettings.favicon,
        primaryColor: brandingSettings.primaryColor,
        secondaryColor: brandingSettings.secondaryColor,
        accentColor: brandingSettings.accentColor,
        fontFamily: brandingSettings.fontFamily,
        customCSS: brandingSettings.customCSS
      }
      
      return NextResponse.json({
        success: true,
        data: publicData
      })
    }

    // For admin access (requires authentication)
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: brandingSettings
    })
  } catch (error) {
    console.error('خطا در دریافت تنظیمات برندینگ:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// POST - ذخیره تنظیمات برندینگ
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const {
      restaurantName,
      restaurantNameEn,
      description,
      descriptionEn,
      logo,
      favicon,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      customCSS
    } = body

    // اعتبارسنجی
    if (!restaurantName) {
      return NextResponse.json({ 
        error: 'نام رستوران الزامی است' 
      }, { status: 400 })
    }

    // Color validation
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (primaryColor && !colorRegex.test(primaryColor)) {
      return NextResponse.json({ 
        error: 'فرمت رنگ اصلی صحیح نیست' 
      }, { status: 400 })
    }

    // Update branding settings
    brandingSettings = {
      ...brandingSettings,
      restaurantName,
      restaurantNameEn: restaurantNameEn || '',
      description: description || '',
      descriptionEn: descriptionEn || '',
      logo: logo || brandingSettings.logo,
      favicon: favicon || brandingSettings.favicon,
      primaryColor: primaryColor || brandingSettings.primaryColor,
      secondaryColor: secondaryColor || brandingSettings.secondaryColor,
      accentColor: accentColor || brandingSettings.accentColor,
      fontFamily: fontFamily || brandingSettings.fontFamily,
      customCSS: customCSS || '',
      updatedAt: new Date()
    }

    // Here you would save to actual database
    // await db.brandingSettings.update({ where: { id: '1' }, data: brandingSettings })

    return NextResponse.json({
      success: true,
      message: 'تنظیمات برندینگ با موفقیت ذخیره شد',
      data: brandingSettings
    })
  } catch (error) {
    console.error('خطا در ذخیره تنظیمات برندینگ:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PUT - ویرایش تنظیمات برندینگ
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    
    // Partial update
    brandingSettings = {
      ...brandingSettings,
      ...body,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'تنظیمات به‌روزرسانی شد',
      data: brandingSettings
    })
  } catch (error) {
    console.error('خطا در ویرایش تنظیمات:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// DELETE - بازنشانی تنظیمات برندینگ
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    // Reset to default values
    brandingSettings = {
      id: '1',
      restaurantName: 'رستوران A-DROP',
      restaurantNameEn: 'A-DROP Restaurant',
      description: '',
      descriptionEn: '',
      logo: '',
      favicon: '',
      primaryColor: '#1890ff',
      secondaryColor: '#52c41a',
      accentColor: '#faad14',
      fontFamily: 'IRANSans',
      customCSS: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'تنظیمات برندینگ بازنشانی شد',
      data: brandingSettings
    })
  } catch (error) {
    console.error('خطا در بازنشانی تنظیمات:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
