import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// کاربر تست برای development  
const DEVELOPMENT_USERS = [
  {
    id: '1',
    email: 'admin@adrop.com',
    password: 'admin123',
    name: 'مدیر سیستم',
    role: 'ADMIN',
    permissions: ['*'] // همه دسترسی‌ها
  }
];

// POST /api/auth/login - ورود کاربر
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Login API called');
    
    const body = await request.json();
    const { email, password, remember } = body;

    console.log('📋 Login attempt:', { email, hasPassword: !!password });

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { message: 'ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    // Find user in development users
    const user = DEVELOPMENT_USERS.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      console.log('❌ User not found:', email);
      return NextResponse.json(
        { message: 'کاربر یافت نشد. از حساب‌های تست استفاده کنید.' },
        { status: 401 }
      );
    }

    // Check password (simple string comparison for development)
    if (password !== user.password) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json(
        { message: 'رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    console.log('✅ Login successful for:', user.name);

    // Generate JWT token
    const tokenExpiry = remember ? '30d' : '24h';
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Create response
    const response = NextResponse.json({
      message: 'ورود موفقیت‌آمیز',
      user: userWithoutPassword,
      token,
    });

    // Set cookie for authentication
    const cookieExpiry = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day in seconds
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieExpiry,
      path: '/'
    });

    console.log('🍪 Auth cookie set');
    return response;

  } catch (error: any) {
    console.error('🚨 Login error:', error);
    return NextResponse.json(
      { message: 'خطای سرور: ' + error.message },
      { status: 500 }
    );
  }
}

// GET /api/auth/login - بررسی وضعیت لاگین (برای تست)
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Authentication endpoint is working',
      users: DEVELOPMENT_USERS.map(u => ({ email: u.email, name: u.name, role: u.role })),
      status: 'OK'
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'خطای سرور', error: error.message },
      { status: 500 }
    );
  }
}
