import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // دریافت اطلاعات کاربر از token (اختیاری برای لاگ)
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

    // ایجاد response برای logout
    const response = NextResponse.json({
      success: true,
      message: 'خروج با موفقیت انجام شد'
    })

    // حذف cookie های احراز هویت
    response.cookies.delete('auth-token')
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // حذف فوری
      path: '/'
    })

    // در صورت نیاز، می‌توان token را در لیست سیاه قرار داد
    // blacklistToken(token)

    return response

  } catch (error) {
    console.error('Logout API Error:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در خروج از سیستم' },
      { status: 500 }
    )
  }
}

// GET method برای logout (اختیاری)
export async function GET(request: NextRequest) {
  return POST(request)
}
