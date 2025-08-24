// ===============================================
// 🔗 API برای مدیریت نقش خاص
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import type { EmployeeRole } from '@/types/team-management';

// Mock roles data
const mockRoles: EmployeeRole[] = [
  {
    id: 'admin',
    name: 'admin',
    displayName: 'مدیر سیستم',
    department: 'management',
    permissions: [
      'users:*', 'roles:*', 'team:*', 'analytics:*', 
      'financial:*', 'inventory:*', 'orders:*', 'customers:*'
    ],
    level: 5,
    description: 'مدیر کل سیستم با دسترسی کامل',
    responsibilities: ['مدیریت کل سیستم', 'نظارت بر عملیات'],
    requirements: ['تجربه مدیریت'],
    maxMembers: 2,
    isActive: true
  },
  {
    id: 'kitchen_chef',
    name: 'chef',
    displayName: 'سرآشپز',
    department: 'kitchen',
    permissions: ['kitchen:*', 'inventory:read', 'orders:read'],
    level: 3,
    description: 'مسئول آشپزخانه',
    responsibilities: ['تهیه غذا', 'مدیریت آشپزخانه', 'کنترل کیفیت'],
    requirements: ['تجربه آشپزی', 'مدرک آشپزی'],
    maxMembers: 5,
    isActive: true
  },
  {
    id: 'cashier',
    name: 'cashier',
    displayName: 'صندوقدار',
    department: 'service',
    permissions: ['orders:write', 'payment:write', 'customers:read'],
    level: 2,
    description: 'مسئول فروش و صندوق',
    responsibilities: ['دریافت سفارش', 'دریافت پول', 'صدور فاکتور'],
    requirements: ['آشنایی با سیستم فروش'],
    maxMembers: 10,
    isActive: true
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Find role by ID
    const role = mockRoles.find(r => r.id === id);
    
    if (!role) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'نقش پیدا نشد',
          code: 'ROLE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: role,
      message: 'نقش با موفقیت دریافت شد'
    });

  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت نقش',
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
    
    // Find role index
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    
    if (roleIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'نقش پیدا نشد',
          code: 'ROLE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update role
    const updatedRole: EmployeeRole = {
      ...mockRoles[roleIndex],
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    mockRoles[roleIndex] = updatedRole;

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'نقش با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در به‌روزرسانی نقش:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در به‌روزرسانی نقش',
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
    
    // Find role index
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    
    if (roleIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'نقش پیدا نشد',
          code: 'ROLE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if role can be deleted (not in use)
    // In real implementation, check if any users have this role
    
    // Remove role
    mockRoles.splice(roleIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'نقش با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در حذف نقش',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}


