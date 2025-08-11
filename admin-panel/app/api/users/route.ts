// API route for system users management
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User, DEFAULT_ROLES, DEFAULT_PERMISSIONS } from '@/types/auth';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// Mock users database - در پروداکشن از دیتابیس واقعی استفاده کنید
let mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@adrop.com',
    name: 'مدیر کل',
    password: '$2a$12$7ZQZr5Qn5bz7qJy7DhZ9LePQCvQxhYZZUWgZ7fH6LZfgZpZZZZZZZa', // "password123"
    role: DEFAULT_ROLES[0], // super_admin
    permissions: DEFAULT_PERMISSIONS,
    status: 'active',
    createdAt: new Date('2024-01-15'),
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
    createdAt: new Date('2024-02-01'),
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
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    department: 'فروش',
  },
];

// Helper function to verify admin permissions
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, JWT_SECRET) as any;
    const user = mockUsers.find(u => u.id === decoded.userId);
    
    // Check if user has admin permissions
    if (user && (user.role.name === 'super_admin' || user.role.name === 'admin')) {
      return user;
    }
    
    return null;
  } catch {
    return null;
  }
}

// GET - Fetch all system users
export async function GET(request: NextRequest) {
  try {
    const adminUser = verifyAdminToken(request);
    
    if (!adminUser) {
      return NextResponse.json(
        { message: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    // Remove passwords from response
    const usersWithoutPasswords = mockUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json({
      users: usersWithoutPasswords,
    });

  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

// POST - Create new system user
export async function POST(request: NextRequest) {
  try {
    const adminUser = verifyAdminToken(request);
    
    if (!adminUser) {
      return NextResponse.json(
        { message: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, password, role, department, status } = body;

    // Validation
    if (!email || !name || !password || !role || !department) {
      return NextResponse.json(
        { message: 'تمام فیلدهای الزامی را پر کنید' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'کاربری با این ایمیل قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // Find role
    const userRole = DEFAULT_ROLES.find(r => r.name === role);
    if (!userRole) {
      return NextResponse.json(
        { message: 'نقش انتخاب شده معتبر نیست' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser: User = {
      id: String(Date.now()),
      email,
      name,
      password: hashedPassword,
      role: userRole,
      permissions: userRole.permissions,
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      department,
    };

    mockUsers.push(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'کاربر با موفقیت ایجاد شد',
      user: userWithoutPassword,
    });

  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

// PUT - Update system user
export async function PUT(request: NextRequest) {
  try {
    const adminUser = verifyAdminToken(request);
    
    if (!adminUser) {
      return NextResponse.json(
        { message: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, email, name, password, role, department, status } = body;

    // Validation
    if (!id || !email || !name || !role || !department) {
      return NextResponse.json(
        { message: 'تمام فیلدهای الزامی را پر کنید' },
        { status: 400 }
      );
    }

    // Find user
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Check if email is taken by another user
    const emailTaken = mockUsers.some(u => u.email === email && u.id !== id);
    if (emailTaken) {
      return NextResponse.json(
        { message: 'کاربری با این ایمیل قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // Find role
    const userRole = DEFAULT_ROLES.find(r => r.name === role);
    if (!userRole) {
      return NextResponse.json(
        { message: 'نقش انتخاب شده معتبر نیست' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = {
      ...mockUsers[userIndex],
      email,
      name,
      role: userRole,
      permissions: userRole.permissions,
      status: status || mockUsers[userIndex].status,
      department,
      updatedAt: new Date(),
    };

    // Update password if provided
    if (password && password.trim()) {
      updatedUser.password = await bcrypt.hash(password, 12);
    }

    mockUsers[userIndex] = updatedUser;

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: 'کاربر با موفقیت ویرایش شد',
      user: userWithoutPassword,
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

// DELETE - Delete system user
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = verifyAdminToken(request);
    
    if (!adminUser) {
      return NextResponse.json(
        { message: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { message: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    // Find user
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Prevent deleting super admin
    if (mockUsers[userIndex].role.name === 'super_admin') {
      return NextResponse.json(
        { message: 'نمی‌توان مدیر کل را حذف کرد' },
        { status: 400 }
      );
    }

    // Delete user
    mockUsers.splice(userIndex, 1);

    return NextResponse.json({
      message: 'کاربر با موفقیت حذف شد',
    });

  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
