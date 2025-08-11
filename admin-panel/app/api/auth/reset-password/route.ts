// API route for password reset
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Reset password schema
const resetPasswordSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  newPassword: z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
  resetCode: z.string().min(6, 'کد تایید باید 6 رقم باشد'),
});

// Mock reset codes (در پروداکشن از Redis یا دیتابیس استفاده کنید)
const resetCodes: { [email: string]: { code: string; expiry: Date } } = {};

// Mock users (در پروداکشن از دیتابیس استفاده کنید)
const mockUsers: any[] = [];

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'request') {
      // Request reset code
      const { email } = body;
      
      if (!email) {
        return NextResponse.json(
          { message: 'ایمیل الزامی است' },
          { status: 400 }
        );
      }

      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        return NextResponse.json(
          { message: 'کاربر با این ایمیل یافت نشد' },
          { status: 404 }
        );
      }

      // Generate 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 15); // 15 minutes expiry

      // Store reset code
      resetCodes[email] = { code: resetCode, expiry };

      // در پروداکشن، کد را از طریق ایمیل ارسال کنید
      console.log(`Reset code for ${email}: ${resetCode}`);

      return NextResponse.json({
        message: 'کد تایید به ایمیل شما ارسال شد',
        // در پروداکشن این کد را نمایش ندهید
        resetCode: resetCode,
      });

    } else if (action === 'reset') {
      // Reset password with code
      const validationResult = resetPasswordSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            message: 'اطلاعات وارد شده معتبر نیست',
            errors: validationResult.error.errors 
          },
          { status: 400 }
        );
      }

      const { email, newPassword, resetCode } = validationResult.data;

      // Check reset code
      const storedCode = resetCodes[email];
      if (!storedCode) {
        return NextResponse.json(
          { message: 'کد تایید یافت نشد' },
          { status: 400 }
        );
      }

      if (storedCode.code !== resetCode) {
        return NextResponse.json(
          { message: 'کد تایید اشتباه است' },
          { status: 400 }
        );
      }

      if (new Date() > storedCode.expiry) {
        return NextResponse.json(
          { message: 'کد تایید منقضی شده است' },
          { status: 400 }
        );
      }

      // Find user and update password
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        return NextResponse.json(
          { message: 'کاربر یافت نشد' },
          { status: 404 }
        );
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, 12);
      user.updatedAt = new Date();

      // Remove used reset code
      delete resetCodes[email];

      return NextResponse.json({
        message: 'رمز عبور با موفقیت تغییر یافت',
      });

    } else {
      return NextResponse.json(
        { message: 'عملیات نامعتبر' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
