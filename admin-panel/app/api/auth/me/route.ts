import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here'

// اطلاعات کاربران آزمایشی (مشابه login API)
const testUsers = [
  {
    id: '1',
    email: 'admin@test.com',
    name: 'مدیر کل سیستم',
    role: 'SUPER_ADMIN',
    permissions: ['*'],
    avatar: null,
    isActive: true,
    lastLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2', 
    email: 'manager@test.com',
    name: 'مدیر رستوران',
    role: 'MANAGER',
    permissions: ['orders.read', 'orders.write', 'kitchen.read', 'kitchen.write', 'staff.read'],
    avatar: null,
    isActive: true,
    lastLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'chef@test.com', 
    name: 'سرآشپز',
    role: 'CHEF',
    permissions: ['kitchen.read', 'kitchen.write', 'orders.read'],
    avatar: null,
    isActive: true,
    lastLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    // دریافت token از cookie یا header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'توکن احراز هویت یافت نشد' },
        { status: 401 }
      )
    }

    // تأیید اعتبار token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // جستجوی کاربر
    const user = testUsers.find(u => u.id === decoded.userId)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'کاربر یافت نشد' },
        { status: 401 }
      )
    }

    // بررسی وضعیت فعال بودن کاربر
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'حساب کاربری غیرفعال است' },
        { status: 401 }
      )
    }

    // اطلاعات کاربر برای response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'احراز هویت معتبر است'
    })

  } catch (error) {
    console.error('Check Auth API Error:', error)
    
    // در صورت خطای JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'توکن نامعتبر است' },
        { status: 401 }
      )
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { success: false, error: 'توکن منقضی شده است' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    )
  }
}
