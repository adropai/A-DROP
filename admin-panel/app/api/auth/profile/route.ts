// API route for user profile management
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, DEFAULT_ROLES, DEFAULT_PERMISSIONS } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// Update profile schema
const updateProfileSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد').optional(),
  department: z.string().optional(),
  avatar: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد').optional(),
});

// Mock users database - same as login API
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@adrop.com',
    name: 'مدیر کل',
    password: '$2a$12$7ZQZr5Qn5bz7qJy7DhZ9LePQCvQxhYZZUWgZ7fH6LZfgZpZZZZZZZa', // "password123"
    role: DEFAULT_ROLES[0], // super_admin
    permissions: DEFAULT_PERMISSIONS,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    department: 'مدیریت',
  },
  {
    id: '2',
    email: 'manager@adrop.com',
    name: 'احمد محمدی',
    password: '$2a$12$7ZQZr5Qn5bz7qJy7DhZ9LePQCvQxhYZZUWgZ7fH6LZfgZpZZZZZZZa', // "password123"
    role: DEFAULT_ROLES[2], // manager
    permissions: DEFAULT_ROLES[2].permissions,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    department: 'عملیات',
  },
  {
    id: '3',
    email: 'cashier@adrop.com',
    name: 'زهرا احمدی',
    password: '$2a$12$7ZQZr5Qn5bz7qJy7DhZ9LePQCvQxhYZZUWgZ7fH6LZfgZpZZZZZZZa', // "password123"
    role: DEFAULT_ROLES[3], // cashier
    permissions: DEFAULT_ROLES[3].permissions,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    department: 'فروش',
  },
];

// Helper function to get user from token
function getUserFromToken(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET) as any;
    return mockUsers.find(u => u.id === decoded.userId);
  } catch {
    return null;
  }
}

// Get current user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'توکن احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'توکن احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'اطلاعات وارد شده معتبر نیست',
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { name, department, avatar, currentPassword, newPassword } = validationResult.data;

    // If changing password, verify current password
    if (newPassword && currentPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { message: 'رمز عبور فعلی اشتباه است' },
          { status: 400 }
        );
      }
      
      // Hash new password
      user.password = await bcrypt.hash(newPassword, 12);
    }

    // Update user fields
    if (name) user.name = name;
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;
    user.updatedAt = new Date();

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'پروفایل با موفقیت به‌روزرسانی شد',
      user: userWithoutPassword,
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
