// API route for user registration
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, DEFAULT_ROLES } from '@/types/auth';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
  department: z.string().optional(),
  roleId: z.string().optional(),
});

// Mock users database (در پروداکشن از دیتابیس واقعی استفاده کنید)
let mockUsers: User[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'اطلاعات وارد شده معتبر نیست',
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { name, email, password, department, roleId } = validationResult.data;

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'کاربر با این ایمیل قبلاً ثبت شده است' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get role (default to waiter if not specified)
    const selectedRole = DEFAULT_ROLES.find(r => r.id === roleId) || 
                        DEFAULT_ROLES.find(r => r.name === 'waiter')!;

    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email,
      password: hashedPassword,
      role: {
        ...selectedRole,
        permissions: selectedRole.permissions?.map((p, index) => ({ 
          id: String(index + 1), 
          ...p 
        })) || [],
      },
      permissions: selectedRole.permissions?.map((p, index) => ({ 
        id: String(index + 1), 
        ...p 
      })) || [],
      status: 'active',
      department: department || 'عمومی',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to mock database
    mockUsers.push(newUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'ثبت نام موفقیت‌آمیز',
      user: userWithoutPassword,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// Get all users (for admin)
export async function GET(request: NextRequest) {
  try {
    // Remove passwords from response
    const usersWithoutPasswords = mockUsers.map(({ password, ...user }) => user);
    
    return NextResponse.json({
      users: usersWithoutPasswords,
      total: mockUsers.length,
    });

  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
