import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Mock database for support tickets
let supportTickets = [
  {
    id: '1',
    title: 'مشکل در پرداخت آنلاین',
    description: 'هنگام پرداخت آنلاین با خطا مواجه می‌شوم',
    status: 'open',
    priority: 'high',
    category: 'technical',
    customerName: 'احمد محمدی',
    customerEmail: 'ahmad@example.com',
    customerPhone: '09123456789',
    assignedTo: null,
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date(),
    responses: []
  },
  {
    id: '2',
    title: 'درخواست تغییر رزرو',
    description: 'می‌خواهم زمان رزروم را تغییر دهم',
    status: 'in_progress',
    priority: 'medium',
    category: 'general',
    customerName: 'زهرا احمدی',
    customerEmail: 'zahra@example.com',
    customerPhone: '09123456788',
    assignedTo: 'پشتیبان 1',
    createdAt: new Date('2024-12-19'),
    updatedAt: new Date(),
    responses: []
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

// GET - دریافت تیکت‌های پشتیبانی
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')

    let filteredTickets = supportTickets

    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status)
    }

    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority)
    }

    if (category) {
      filteredTickets = filteredTickets.filter(ticket => ticket.category === category)
    }

    return NextResponse.json({
      success: true,
      data: filteredTickets,
      stats: {
        total: supportTickets.length,
        open: supportTickets.filter(t => t.status === 'open').length,
        inProgress: supportTickets.filter(t => t.status === 'in_progress').length,
        resolved: supportTickets.filter(t => t.status === 'resolved').length,
        closed: supportTickets.filter(t => t.status === 'closed').length
      }
    })
  } catch (error) {
    console.error('خطا در دریافت تیکت‌ها:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// POST - ایجاد تیکت جدید
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      priority,
      category,
      customerName,
      customerEmail,
      customerPhone,
      assignedTo
    } = body

    // اعتبارسنجی
    if (!title || !description || !priority || !category || !customerName || !customerEmail) {
      return NextResponse.json({ 
        error: 'اطلاعات الزامی ناقص است' 
      }, { status: 400 })
    }

    const newTicket = {
      id: String(Date.now()),
      title,
      description,
      status: 'open',
      priority,
      category,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      assignedTo: assignedTo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: []
    }

    supportTickets.push(newTicket)

    return NextResponse.json({
      success: true,
      message: 'تیکت با موفقیت ایجاد شد',
      data: newTicket
    })
  } catch (error) {
    console.error('خطا در ایجاد تیکت:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PUT - ویرایش تیکت
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      title,
      description,
      status,
      priority,
      category,
      customerName,
      customerEmail,
      customerPhone,
      assignedTo
    } = body

    if (!id) {
      return NextResponse.json({ 
        error: 'شناسه تیکت الزامی است' 
      }, { status: 400 })
    }

    const ticketIndex = supportTickets.findIndex(ticket => ticket.id === id)
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 })
    }

    // ویرایش تیکت
    supportTickets[ticketIndex] = {
      ...supportTickets[ticketIndex],
      title: title || supportTickets[ticketIndex].title,
      description: description || supportTickets[ticketIndex].description,
      status: status || supportTickets[ticketIndex].status,
      priority: priority || supportTickets[ticketIndex].priority,
      category: category || supportTickets[ticketIndex].category,
      customerName: customerName || supportTickets[ticketIndex].customerName,
      customerEmail: customerEmail || supportTickets[ticketIndex].customerEmail,
      customerPhone: customerPhone !== undefined ? customerPhone : supportTickets[ticketIndex].customerPhone,
      assignedTo: assignedTo !== undefined ? assignedTo : supportTickets[ticketIndex].assignedTo,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'تیکت با موفقیت ویرایش شد',
      data: supportTickets[ticketIndex]
    })
  } catch (error) {
    console.error('خطا در ویرایش تیکت:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// DELETE - حذف تیکت
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
        error: 'شناسه تیکت الزامی است' 
      }, { status: 400 })
    }

    const ticketIndex = supportTickets.findIndex(ticket => ticket.id === id)
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 })
    }

    // حذف تیکت
    supportTickets.splice(ticketIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'تیکت با موفقیت حذف شد'
    })
  } catch (error) {
    console.error('خطا در حذف تیکت:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
