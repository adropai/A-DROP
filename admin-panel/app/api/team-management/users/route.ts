// ===============================================
// 🔗 API برای مدیریت کاربران سیستم
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import type { SystemUser } from '@/types/team-management';

// Mock users data
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';

    let filteredUsers = mockUsers;

    // Apply search filter
    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.fullName.includes(search) ||
        user.username.includes(search) ||
        user.email.includes(search)
      );
    }

    // Apply role filter
    if (roleFilter) {
      filteredUsers = filteredUsers.filter(user =>
        user.roles.includes(roleFilter)
      );
    }

    // Apply status filter
    if (statusFilter) {
      const isActive = statusFilter === 'active';
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
    }

    // Pagination
    const total = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'کاربران با موفقیت دریافت شدند'
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت کاربران',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['username', 'email', 'fullName', 'password'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'فیلدهای اجباری یافت نشد',
          missingFields
        },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = mockUsers.find(user => 
      user.username === body.username || user.email === body.email
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

    // Create new user
    const newUser: SystemUser = {
      id: (mockUsers.length + 1).toString(),
      username: body.username,
      email: body.email,
      fullName: body.fullName,
      avatar: body.avatar || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      roles: body.roles || [],
      employeeId: body.employeeId || null,
      lastLogin: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        language: 'fa',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    };

    mockUsers.push(newUser);

    // Don't return password in response
    const { ...userResponse } = newUser;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'کاربر با موفقیت ایجاد شد'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ایجاد کاربر',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
