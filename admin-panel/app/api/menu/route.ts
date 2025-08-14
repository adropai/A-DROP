import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Schema validation برای menu
const menuSchema = z.object({
  name: z.string().min(1, 'نام آیتم الزامی است'),
  price: z.number().positive('قیمت باید مثبت باشد'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  description: z.string().optional(),
  isAvailable: z.boolean().default(true),
  images: z.string().optional(),
  preparationTime: z.number().optional(),
  ingredients: z.string().optional()
})

const transformMenuData = (data: any) => ({
  name: data.name,
  price: data.price,
  categoryId: data.category || data.categoryId,
  description: data.description,
  isAvailable: data.available ?? data.isAvailable ?? true,
  images: data.image || data.images || "[]",
  preparationTime: data.preparationTime || 15,
  ingredients: Array.isArray(data.ingredients) ? JSON.stringify(data.ingredients) : (data.ingredients || "[]")
})

/**
 * GET /api/menu
 * دریافت لیست منو
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const available = searchParams.get('available')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (available !== null) {
      where.available = available === 'true'
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      orderBy: [
        { categoryId: 'asc' },
        { name: 'asc' }
      ],
      include: {
        orderItems: {
          select: {
            id: true,
            quantity: true,
            order: {
              select: {
                id: true,
                createdAt: true
              }
            }
          }
        },
        category: true
      }
    })

    // محاسبه آمار فروش برای هر آیتم
    const menuWithStats = menuItems.map(item => ({
      ...item,
      totalOrders: item.orderItems.length,
      totalSold: item.orderItems.reduce((sum, orderItem) => sum + orderItem.quantity, 0),
      lastOrderDate: item.orderItems.length > 0 
        ? Math.max(...item.orderItems.map(oi => new Date(oi.order.createdAt).getTime()))
        : null
    }))

    return NextResponse.json({
      success: true,
      data: menuWithStats,
      total: menuWithStats.length
    })

  } catch (error) {
    console.error('خطا در دریافت منو:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات منو' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/menu
 * ایجاد آیتم جدید در منو
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const transformedData = transformMenuData(body)
    const validatedData = menuSchema.parse(transformedData)

    // بررسی تکراری نبودن نام
    const existingItem = await prisma.menuItem.findFirst({
      where: { name: validatedData.name }
    })

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: 'آیتمی با این نام قبلاً ثبت شده است' },
        { status: 400 }
      )
    }

    const newMenuItem = await prisma.menuItem.create({
      data: {
        ...validatedData,
        preparationTime: validatedData.preparationTime || 15
      }
    })

    return NextResponse.json({
      success: true,
      data: newMenuItem,
      message: 'آیتم جدید با موفقیت ثبت شد'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'داده‌های ورودی نامعتبر', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطا در ایجاد آیتم منو:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در ثبت آیتم جدید' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/menu
 * بروزرسانی آیتم منو
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه آیتم الزامی است' },
        { status: 400 }
      )
    }

    const transformedData = transformMenuData(updateData)
    const validatedData = menuSchema.partial().parse(transformedData)

    // بررسی وجود آیتم
    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'آیتم مورد نظر یافت نشد' },
        { status: 404 }
      )
    }

    // بررسی تکراری نبودن نام (در صورت تغییر نام)
    if (validatedData.name && validatedData.name !== existingItem.name) {
      const duplicateItem = await prisma.menuItem.findFirst({
        where: { 
          name: validatedData.name,
          id: { not: id }
        }
      })

      if (duplicateItem) {
        return NextResponse.json(
          { success: false, error: 'آیتمی با این نام قبلاً ثبت شده است' },
          { status: 400 }
        )
      }
    }

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: updatedMenuItem,
      message: 'آیتم با موفقیت بروزرسانی شد'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'داده‌های ورودی نامعتبر', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطا در بروزرسانی آیتم منو:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در بروزرسانی آیتم' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/menu
 * حذف آیتم از منو
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه آیتم الزامی است' },
        { status: 400 }
      )
    }

    // بررسی وجود آیتم
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'آیتم مورد نظر یافت نشد' },
        { status: 404 }
      )
    }

    // بررسی وجود سفارشات مرتبط
    if (existingItem.orderItems.length > 0) {
      return NextResponse.json(
        { success: false, error: 'این آیتم در سفارشات استفاده شده و قابل حذف نیست' },
        { status: 400 }
      )
    }

    await prisma.menuItem.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'آیتم با موفقیت حذف شد'
    })

  } catch (error) {
    console.error('خطا در حذف آیتم منو:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در حذف آیتم' },
      { status: 500 }
    )
  }
}
