import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here'

// اطلاعات کاربران آزمایشی
const testUsers = [
  {
    id: '1',
    email: 'admin@test.com',
    name: 'مدیر کل سیستم',
    role: 'SUPER_ADMIN',
    permissions: ['*'],
  },
  {
    id: '2', 
    email: 'manager@test.com',
    name: 'مدیر رستوران',
    role: 'MANAGER',
    permissions: ['orders.read', 'orders.write', 'orders.delete', 'kitchen.read', 'kitchen.write', 'staff.read'],
  },
  {
    id: '3',
    email: 'chef@test.com', 
    name: 'سرآشپز',
    role: 'CHEF',
    permissions: ['kitchen.read', 'kitchen.write', 'orders.read'],
  },
  {
    id: '4',
    email: 'cashier@test.com', 
    name: 'صندوقدار',
    role: 'CASHIER',
    permissions: ['orders.read', 'orders.write'],
  },
  {
    id: '5',
    email: 'waiter@test.com', 
    name: 'کاپیتان',
    role: 'WAITER',
    permissions: ['orders.read'],
  }
]

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return testUsers.find(user => user.id === decoded.userId)
  } catch (error) {
    return null
  }
}

// Helper function to check permissions
function hasPermission(user: any, permission: string): boolean {
  if (!user) return false
  if (user.role === 'SUPER_ADMIN' || user.permissions.includes('*')) return true
  return user.permissions.includes(permission)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // بررسی احراز هویت
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت نامعتبر' },
        { status: 401 }
      )
    }

    // بررسی دسترسی حذف سفارش
    if (!hasPermission(user, 'orders.delete')) {
      // ثبت تلاش غیرمجاز
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'ATTEMPT_DELETE_ORDER_DENIED',
          entityType: 'ORDER',
          entityId: params.id,
          details: JSON.stringify({ 
            orderId: params.id,
            userRole: user.role,
            reason: 'دسترسی کافی نیست',
            attemptedBy: user.name
          }),
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
      
      return NextResponse.json(
        { success: false, error: 'شما دسترسی حذف سفارش را ندارید' },
        { status: 403 }
      )
    }

    const orderId = parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: 'شناسه سفارش نامعتبر است' },
        { status: 400 }
      )
    }

    // بررسی وجود سفارش
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'سفارش یافت نشد' },
        { status: 404 }
      )
    }

    // حذف آیتم‌های سفارش
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId }
    })

    // حذف سفارش
    await prisma.order.delete({
      where: { id: orderId }
    })

    // ثبت log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_ORDER',
        entityType: 'ORDER',
        entityId: orderId.toString(),
        details: JSON.stringify({
          orderId: orderId,
          orderNumber: existingOrder.orderNumber,
          customerName: existingOrder.customerName,
          totalAmount: existingOrder.totalAmount,
          itemsCount: existingOrder.items.length,
          deletedBy: user.name,
          deletedByRole: user.role,
          timestamp: new Date().toISOString()
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت حذف شد',
      deletedOrder: {
        id: orderId,
        orderNumber: existingOrder.orderNumber
      }
    })

  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در حذف سفارش' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // بررسی احراز هویت
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت نامعتبر' },
        { status: 401 }
      )
    }

    // بررسی دسترسی ویرایش سفارش
    if (!hasPermission(user, 'orders.write')) {
      // ثبت تلاش غیرمجاز
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'ATTEMPT_EDIT_ORDER_DENIED',
          entityType: 'ORDER',
          entityId: params.id,
          details: JSON.stringify({ 
            orderId: params.id,
            userRole: user.role,
            reason: 'دسترسی کافی نیست',
            attemptedBy: user.name
          }),
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
      
      return NextResponse.json(
        { success: false, error: 'شما دسترسی ویرایش سفارش را ندارید' },
        { status: 403 }
      )
    }

    const orderId = parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: 'شناسه سفارش نامعتبر است' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // بررسی وجود سفارش
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'سفارش یافت نشد' },
        { status: 404 }
      )
    }

    // به‌روزرسانی سفارش
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerAddress: body.customerAddress,
        notes: body.notes,
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    })

    // ثبت log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'EDIT_ORDER',
        entityType: 'ORDER',
        entityId: orderId.toString(),
        details: JSON.stringify({
          orderId: orderId,
          orderNumber: existingOrder.orderNumber,
          changes: body,
          editedBy: user.name,
          editedByRole: user.role,
          timestamp: new Date().toISOString()
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت به‌روزرسانی شد',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در به‌روزرسانی سفارش' },
      { status: 500 }
    )
  }
}
