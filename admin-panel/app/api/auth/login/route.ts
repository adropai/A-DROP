import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { loginRateLimiter, getClientIdentifier } from '@/lib/rate-limiter';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// POST /api/auth/login - ورود کاربر
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(request);
    
    if (!loginRateLimiter.isAllowed(clientId)) {
      const remaining = loginRateLimiter.getRemainingAttempts(clientId);
      const resetTime = loginRateLimiter.getResetTime(clientId);
      
      return NextResponse.json(
        { 
          message: 'تعداد تلاش‌های ورود بیش از حد مجاز. لطفاً بعداً تلاش کنید.',
          remaining: remaining,
          resetTime: new Date(resetTime).toISOString()
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, remember } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'فرمت ایمیل صحیح نیست' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'کاربر یافت نشد' },
        { status: 401 }
      );
    }

    // Check password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
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
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Create response with cookie
    const response = NextResponse.json({
      message: 'ورود موفقیت‌آمیز',
      user: userWithoutPassword,
      token,
    });

    // Set cookie for authentication
    const cookieExpiry = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day in milliseconds
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieExpiry / 1000, // maxAge is in seconds
      path: '/'
    });

    return response;
  } catch (error: any) {
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
    // Check if we have any users in database
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      message: 'Authentication endpoint is working',
      database: 'Connected to Prisma',
      userCount: userCount,
      status: 'OK'
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'خطای اتصال به دیتابیس', error: error.message },
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
