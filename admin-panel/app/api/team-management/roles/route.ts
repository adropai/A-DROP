// ===============================================
// 🔗 API برای مدیریت نقش‌ها
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import type { EmployeeRole, EmployeeRoleForm } from '@/types/team-management';
import { DEFAULT_ROLES } from '@/types/team-management';

// Mock data for development
let mockRoles: EmployeeRole[] = [...DEFAULT_ROLES];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const level = searchParams.get('level');
    const isActive = searchParams.get('isActive');

    let filteredRoles = [...mockRoles];

    // Apply filters
    if (department) {
      filteredRoles = filteredRoles.filter(role => role.department === department);
    }

    if (level) {
      filteredRoles = filteredRoles.filter(role => role.level === parseInt(level));
    }

    if (isActive !== null) {
      filteredRoles = filteredRoles.filter(role => 
        role.isActive === (isActive === 'true')
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredRoles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت نقش‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: EmployeeRoleForm = await request.json();

    // Generate new role
    const newRole: EmployeeRole = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      displayName: data.displayName,
      department: data.department,
      permissions: [], // Will be populated with actual permissions
      level: data.level,
      description: data.description,
      responsibilities: data.responsibilities,
      requirements: data.requirements,
      isActive: true
    };

    mockRoles.push(newRole);

    return NextResponse.json({
      success: true,
      data: newRole,
      message: 'نقش جدید با موفقیت ایجاد شد'
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد نقش جدید' },
      { status: 500 }
    );
  }
}
