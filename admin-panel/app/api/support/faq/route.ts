import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Mock database for FAQs
let faqs = [
  {
    id: '1',
    question: 'چگونه می‌توانم غذا سفارش دهم؟',
    answer: 'شما می‌توانید از طریق وب‌سایت یا اپلیکیشن موبایل ما سفارش دهید. فقط کافی است منو را مشاهده کرده و غذای مورد نظر خود را انتخاب کنید.',
    category: 'سفارش',
    isActive: true,
    viewCount: 150,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    question: 'زمان تحویل سفارش چقدر است؟',
    answer: 'معمولاً بین 30 تا 45 دقیقه طول می‌کشد. این زمان بسته به فاصله شما و شرایط ترافیک متفاوت است.',
    category: 'تحویل',
    isActive: true,
    viewCount: 120,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date()
  },
  {
    id: '3',
    question: 'آیا امکان پرداخت نقدی وجود دارد؟',
    answer: 'بله، شما می‌توانید هم آنلاین و هم به صورت نقدی هنگام تحویل پرداخت کنید.',
    category: 'پرداخت',
    isActive: true,
    viewCount: 95,
    createdAt: new Date('2024-12-02'),
    updatedAt: new Date()
  },
  {
    id: '4',
    question: 'چگونه رزرو میز کنم؟',
    answer: 'برای رزرو میز، لطفاً با شماره تلفن رستوران تماس بگیرید یا از قسمت رزرو آنلاین استفاده کنید.',
    category: 'رزرو',
    isActive: true,
    viewCount: 80,
    createdAt: new Date('2024-12-03'),
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

// GET - دریافت سوالات متداول
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const public_access = searchParams.get('public')

    // برای دسترسی عمومی (بدون احراز هویت)
    if (public_access === 'true') {
      const publicFaqs = faqs.filter(faq => faq.isActive)
      return NextResponse.json({
        success: true,
        data: publicFaqs
      })
    }

    // برای دسترسی ادمین (نیاز به احراز هویت)
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    let filteredFaqs = faqs

    if (category) {
      filteredFaqs = filteredFaqs.filter(faq => faq.category === category)
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true'
      filteredFaqs = filteredFaqs.filter(faq => faq.isActive === activeFilter)
    }

    return NextResponse.json({
      success: true,
      data: filteredFaqs,
      stats: {
        total: faqs.length,
        active: faqs.filter(f => f.isActive).length,
        inactive: faqs.filter(f => !f.isActive).length,
        totalViews: faqs.reduce((sum, faq) => sum + faq.viewCount, 0)
      }
    })
  } catch (error) {
    console.error('خطا در دریافت سوالات متداول:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// POST - ایجاد سوال جدید
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const {
      question,
      answer,
      category,
      isActive
    } = body

    // اعتبارسنجی
    if (!question || !answer || !category) {
      return NextResponse.json({ 
        error: 'سوال، پاسخ و دسته‌بندی الزامی است' 
      }, { status: 400 })
    }

    const newFaq = {
      id: String(Date.now()),
      question,
      answer,
      category,
      isActive: isActive !== false,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    faqs.push(newFaq)

    return NextResponse.json({
      success: true,
      message: 'سوال با موفقیت ایجاد شد',
      data: newFaq
    })
  } catch (error) {
    console.error('خطا در ایجاد سوال:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PUT - ویرایش سوال
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      question,
      answer,
      category,
      isActive
    } = body

    if (!id) {
      return NextResponse.json({ 
        error: 'شناسه سوال الزامی است' 
      }, { status: 400 })
    }

    const faqIndex = faqs.findIndex(faq => faq.id === id)
    if (faqIndex === -1) {
      return NextResponse.json({ error: 'سوال یافت نشد' }, { status: 404 })
    }

    // ویرایش سوال
    faqs[faqIndex] = {
      ...faqs[faqIndex],
      question: question || faqs[faqIndex].question,
      answer: answer || faqs[faqIndex].answer,
      category: category || faqs[faqIndex].category,
      isActive: isActive !== undefined ? isActive : faqs[faqIndex].isActive,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'سوال با موفقیت ویرایش شد',
      data: faqs[faqIndex]
    })
  } catch (error) {
    console.error('خطا در ویرایش سوال:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// DELETE - حذف سوال
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
        error: 'شناسه سوال الزامی است' 
      }, { status: 400 })
    }

    const faqIndex = faqs.findIndex(faq => faq.id === id)
    if (faqIndex === -1) {
      return NextResponse.json({ error: 'سوال یافت نشد' }, { status: 404 })
    }

    // حذف سوال
    faqs.splice(faqIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'سوال با موفقیت حذف شد'
    })
  } catch (error) {
    console.error('خطا در حذف سوال:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PATCH - افزایش تعداد بازدید
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (action === 'increment_view') {
      const faqIndex = faqs.findIndex(faq => faq.id === id)
      if (faqIndex !== -1) {
        faqs[faqIndex].viewCount += 1
        
        return NextResponse.json({
          success: true,
          message: 'تعداد بازدید به‌روزرسانی شد',
          viewCount: faqs[faqIndex].viewCount
        })
      }
    }

    return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 })
  } catch (error) {
    console.error('خطا در به‌روزرسانی بازدید:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
