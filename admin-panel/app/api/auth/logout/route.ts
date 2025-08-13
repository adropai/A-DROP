import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // دریافت اطلاعات کاربر از token
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value

    // Log logout activity (اختیاری)
    if (token) {
      console.log('🚪 User logout initiated with token:', token.substring(0, 20) + '...');
    }

    // ایجاد response برای logout
    const response = NextResponse.json({
      success: true,
      message: 'خروج با موفقیت انجام شد'
    })

    // حذف cookie احراز هویت
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // حذف فوری
      path: '/'
    })

    console.log('✅ Logout successful - auth_token cookie cleared');
    return response

  } catch (error: any) {
    console.error('❌ Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در خروج از سیستم' },
      { status: 500 }
    )
  }
}
