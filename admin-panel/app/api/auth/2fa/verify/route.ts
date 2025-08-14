import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'

interface VerifyRequest {
  code: string
  method: 'sms' | 'email' | 'app'
  secret?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json()
    const { code, method, secret } = body

    console.log('🔐 2FA Verify API called:', { method, code: code.substring(0, 2) + '****' })

    if (!code || code.length !== 6) {
      return NextResponse.json({
        success: false,
        error: 'کد تأیید باید 6 رقم باشد'
      }, { status: 400 })
    }

    if (method === 'app') {
      if (!secret) {
        return NextResponse.json({
          success: false,
          error: 'کلید مخفی مورد نیاز است'
        }, { status: 400 })
      }

      // تأیید کد با استفاده از speakeasy
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
        window: 2 // اجازه 2 time step برای تفاوت ساعت
      })

      if (verified) {
        console.log('✅ 2FA App verification successful')
        return NextResponse.json({
          success: true,
          method: 'app',
          message: 'احراز هویت دو مرحله‌ای با موفقیت تأیید شد'
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'کد تأیید نامعتبر است'
        }, { status: 400 })
      }
    }

    if (method === 'sms' || method === 'email') {
      // در پروژه واقعی، کد از دیتابیس خوانده می‌شود
      // برای نمایش، هر کد 6 رقمی را قبول می‌کنیم
      const isValidCode = /^\d{6}$/.test(code)
      
      if (isValidCode) {
        console.log(`✅ 2FA ${method} verification successful`)
        return NextResponse.json({
          success: true,
          method: method,
          message: `احراز هویت ${method === 'sms' ? 'پیامکی' : 'ایمیلی'} با موفقیت تأیید شد`
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'کد تأیید نامعتبر است'
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'روش نامعتبر'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ 2FA Verify error:', error)
    return NextResponse.json({
      success: false,
      error: 'خطا در تأیید کد'
    }, { status: 500 })
  }
}
