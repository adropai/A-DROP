// ===============================================
// 🔗 API برای مدیریت کاربر خاص
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import type { SystemUser } from '@/types/team-management';

// Mock users data (same as parent route)
const mockUsers: SystemUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@restaurant.com',
    fullName: 'مدیر سیستم',
    avatar: '',
    isActive: true,
    roles: ['admin'],
    employeeId: '1',
    lastLogin: new Date('2024-08-24T10:00:00'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-08-24'),
    settings: {
      language: 'fa',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  },
  {
    id: '2',
    username: 'chef_majid',
    email: 'majid@restaurant.com',
    fullName: 'مجید احمدی',
    avatar: '',
    isActive: true,
    roles: ['kitchen_chef'],
    employeeId: '1',
    lastLogin: new Date('2024-08-24T08:30:00'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-08-24'),
    settings: {
      language: 'fa',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: true
      }
    }
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Find user by ID
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'کاربر پیدا نشد',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'کاربر با موفقیت دریافت شد'
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت کاربر',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Find user index
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'کاربر پیدا نشد',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check for duplicate username/email (exclude current user)
    if (body.username || body.email) {
      const existingUser = mockUsers.find(user => 
        user.id !== id && (
          (body.username && user.username === body.username) ||
          (body.email && user.email === body.email)
        )
      );
      
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'نام کاربری یا ایمیل قبلاً ثبت شده است',
            code: 'USER_EXISTS'
          },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser: SystemUser = {
      ...mockUsers[userIndex],
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    mockUsers[userIndex] = updatedUser;

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'کاربر با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در به‌روزرسانی کاربر',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Find user index
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'کاربر پیدا نشد',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if user can be deleted (e.g., not admin user)
    const user = mockUsers[userIndex];
    if (user.roles.includes('admin') && mockUsers.filter(u => u.roles.includes('admin')).length === 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'نمی‌توان آخرین مدیر سیستم را حذف کرد',
          code: 'CANNOT_DELETE_LAST_ADMIN'
        },
        { status: 409 }
      );
    }

    // Remove user
    mockUsers.splice(userIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'کاربر با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در حذف کاربر',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
