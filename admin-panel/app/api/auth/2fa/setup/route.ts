import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

interface SetupRequest {
  method: 'sms' | 'email' | 'app'
  userId?: string
  contact?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SetupRequest = await request.json()
    const { method, userId = 'demo-user', contact } = body

    console.log('🔐 2FA Setup API called:', { method, userId })

    if (method === 'app') {
      // تولید secret key برای اپلیکیشن احراز هویت
      const secret = speakeasy.generateSecret({
        name: `A-DROP (${userId})`,
        issuer: 'A-DROP Restaurant',
        length: 32
      })

      // تولید QR Code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

      return NextResponse.json({
        success: true,
        method: 'app',
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        otpauth_url: secret.otpauth_url
      })
    }

    if (method === 'sms') {
      // در پروژه واقعی، اینجا SMS ارسال می‌شود
      console.log('📱 Sending SMS to:', contact)
      
      // شبیه‌سازی ارسال SMS
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // در پروژه واقعی، این کد در دیتابیس ذخیره می‌شود
      console.log('📱 SMS Code generated:', verificationCode)

      return NextResponse.json({
        success: true,
        method: 'sms',
        message: 'کد تأیید به شماره تلفن شما ارسال شد',
        // در production این کد ارسال نمی‌شود
        testCode: verificationCode
      })
    }

    if (method === 'email') {
      // در پروژه واقعی، اینجا ایمیل ارسال می‌شود
      console.log('📧 Sending email to:', contact)
      
      // شبیه‌سازی ارسال ایمیل
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // در پروژه واقعی، این کد در دیتابیس ذخیره می‌شود
      console.log('📧 Email Code generated:', verificationCode)

      return NextResponse.json({
        success: true,
        method: 'email',
        message: 'کد تأیید به ایمیل شما ارسال شد',
        // در production این کد ارسال نمی‌شود
        testCode: verificationCode
      })
    }

    return NextResponse.json({
      success: false,
      error: 'روش نامعتبر'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ 2FA Setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'خطا در راه‌اندازی احراز هویت دو مرحله‌ای'
    }, { status: 500 })
  }
}
