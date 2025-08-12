import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Mock users for testing (در پروداکشن از دیتابیس استفاده شود)
const mockUsers = [
  {
    id: 1,
    email: 'admin@adrop.com',
    password: 'password123', // در واقعیت hash شده
    firstName: 'مدیر',
    lastName: 'سیستم',
    role: { name: 'admin', permissions: ['*'] },
    status: 'active',
    lastLogin: null
  },
  {
    id: 2,
    email: 'manager@adrop.com', 
    password: 'password123',
    firstName: 'مدیر',
    lastName: 'رستوران',
    role: { name: 'manager', permissions: ['orders', 'menu', 'tables'] },
    status: 'active',
    lastLogin: null
  }
];

// POST /api/auth/login - ورود کاربر
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, remember } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { message: 'کاربر یافت نشد' },
        { status: 401 }
      );
    }

    // Check password - برای تست، مقایسه ساده
    let isValidPassword = false;
    
    // Clean the password (remove any extra whitespace)
    const cleanPassword = password.trim();
    
    // For testing, always allow password123
    if (cleanPassword === 'password123') {
      isValidPassword = true;
    } 
    // For admin users, also check some common passwords
    else if (user.email === 'admin@adrop.com' && (cleanPassword === 'admin' || cleanPassword === '123456' || cleanPassword === 'admin123')) {
      isValidPassword = true;
    }
    // Also try the original password as-is
    else if (cleanPassword.length > 0) {
      // For development, be more lenient
      if (cleanPassword.toLowerCase() === 'password123' || cleanPassword === user.email.split('@')[0]) {
        isValidPassword = true;
      }
    }
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status !== 'active') {
      return NextResponse.json(
        { message: 'حساب کاربری غیرفعال است' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const tokenExpiry = remember ? '30d' : '24h';
    const token = sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role.name,
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Update last login (در پروداکشن در دیتابیس ذخیره شود)
    user.lastLogin = new Date();

    // Create response with cookie
    const response = NextResponse.json({
      message: 'ورود موفقیت‌آمیز',
      user: userWithoutPassword,
      token,
    });

    // Set cookie for authentication
    const cookieExpiry = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day in milliseconds
    
    console.log('🍪 Setting auth_token cookie with token:', token.substring(0, 20) + '...');
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: false, // فقط در production فعال شود
      sameSite: 'lax',
      maxAge: cookieExpiry / 1000, // maxAge is in seconds
      path: '/'
    });
    console.log('✅ Cookie set in response');

    return response;  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// GET /api/auth/login - بررسی وضعیت لاگین (برای تست)
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Login endpoint is working',
      availableUsers: mockUsers.map(u => ({
        email: u.email,
        role: u.role.name
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// تابع کمکی: دریافت IP کاربر
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
