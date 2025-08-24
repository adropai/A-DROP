// ===============================================
// 🔗 API برای مدیریت اعضای تیم
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import type { TeamMember, TeamMemberForm } from '@/types/team-management';

// Mock data for development
const mockMembers: TeamMember[] = [
  {
    id: '1',
    personalInfo: {
      firstName: 'مجید',
      lastName: 'احمدی',
      nationalId: '1234567890',
      email: 'majid@example.com',
      phone: '09123456789',
      avatar: '',
      address: {
        street: 'خیابان آزادی',
        city: 'تهران',
        state: 'تهران',
        postalCode: '1234567890',
        country: 'ایران'
      },
      emergencyContact: {
        name: 'زهرا احمدی',
        phone: '09987654321',
        relation: 'همسر'
      },
      dateOfBirth: new Date('1990-01-01'),
      maritalStatus: 'married',
      education: 'دیپلم',
      documents: []
    },
    workInfo: {
      employeeCode: 'EMP001',
      hireDate: new Date('2023-01-01'),
      department: 'kitchen',
      position: 'سرآشپز',
      role: {
        id: 'kitchen_chef',
        name: 'chef',
        displayName: 'سرآشپز',
        department: 'kitchen',
        permissions: [],
        level: 2,
        description: 'مسئول آشپزخانه',
        responsibilities: ['تهیه غذا', 'مدیریت آشپزخانه'],
        requirements: ['تجربه آشپزی'],
        isActive: true
      },
      salary: {
        baseSalary: 15000000,
        hourlyRate: 50000,
        overtimeRate: 75000,
        bonuses: 0,
        deductions: 0,
        currency: 'IRR',
        paymentMethod: 'bank'
      },
      workType: 'fullTime'
    },
    shiftSchedule: {
      id: 'sch1',
      employeeId: '1',
      type: 'fixed_daily',
      pattern: {
        name: 'شیفت صبح',
        description: 'شیفت صبح 8 تا 16',
        repeatCycle: 1,
        workDaysInCycle: 6,
        restDaysInCycle: 1
      },
      workDays: [
        {
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '16:00',
          breakDuration: 60,
          isWorkDay: true
        }
      ],
      startDate: new Date('2023-01-01'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    performance: {
      attendanceRate: 95,
      punctualityScore: 90,
      customerRating: 4.5,
      productivityScore: 88,
      teamworkRating: 92,
      lastEvaluation: new Date(),
      evaluations: []
    },
    permissions: ['kitchen.manage', 'orders.read'],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    personalInfo: {
      firstName: 'حمید',
      lastName: 'کریمی',
      nationalId: '0987654321',
      email: 'hamid@example.com',
      phone: '09876543210',
      avatar: '',
      address: {
        street: 'خیابان ولیعصر',
        city: 'تهران',
        state: 'تهران',
        postalCode: '0987654321',
        country: 'ایران'
      },
      emergencyContact: {
        name: 'فاطمه کریمی',
        phone: '09123456780',
        relation: 'مادر'
      },
      dateOfBirth: new Date('1995-05-15'),
      maritalStatus: 'single',
      education: 'لیسانس',
      documents: []
    },
    workInfo: {
      employeeCode: 'EMP002',
      hireDate: new Date('2023-03-01'),
      department: 'service',
      position: 'گارسون',
      role: {
        id: 'service_waiter',
        name: 'waiter',
        displayName: 'گارسون',
        department: 'service',
        permissions: [],
        level: 3,
        description: 'سرویس‌دهی به مشتریان',
        responsibilities: ['گرفتن سفارش', 'سرو غذا'],
        requirements: ['مهارت ارتباطی'],
        isActive: true
      },
      salary: {
        baseSalary: 8000000,
        hourlyRate: 30000,
        overtimeRate: 45000,
        bonuses: 500000,
        deductions: 0,
        currency: 'IRR',
        paymentMethod: 'bank'
      },
      workType: 'fullTime'
    },
    shiftSchedule: {
      id: 'sch2',
      employeeId: '2',
      type: 'fixed_daily',
      pattern: {
        name: 'شیفت عصر',
        description: 'شیفت عصر 16 تا 24',
        repeatCycle: 1,
        workDaysInCycle: 6,
        restDaysInCycle: 1
      },
      workDays: [
        {
          dayOfWeek: 1,
          startTime: '16:00',
          endTime: '24:00',
          breakDuration: 30,
          isWorkDay: true
        }
      ],
      startDate: new Date('2023-03-01'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    performance: {
      attendanceRate: 98,
      punctualityScore: 95,
      customerRating: 4.8,
      productivityScore: 92,
      teamworkRating: 96,
      lastEvaluation: new Date(),
      evaluations: []
    },
    permissions: ['orders.read', 'customers.read'],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredMembers = [...mockMembers];

    // Apply filters
    if (department) {
      filteredMembers = filteredMembers.filter(member => 
        member.workInfo.department === department
      );
    }

    if (status) {
      filteredMembers = filteredMembers.filter(member => 
        member.status === status
      );
    }

    if (role) {
      filteredMembers = filteredMembers.filter(member => 
        member.workInfo.role.id === role
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedMembers,
      pagination: {
        current: page,
        pageSize: limit,
        total: filteredMembers.length,
        totalPages: Math.ceil(filteredMembers.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اعضای تیم' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: TeamMemberForm = await request.json();

    // Generate new member
    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      personalInfo: {
        ...data.personalInfo,
        documents: []
      },
      workInfo: {
        ...data.workInfo,
        employeeCode: `EMP${String(mockMembers.length + 1).padStart(3, '0')}`,
        role: {
          id: data.roleId,
          name: 'temp',
          displayName: 'نقش موقت',
          department: data.workInfo.department,
          permissions: [],
          level: 3,
          description: '',
          responsibilities: [],
          requirements: [],
          isActive: true
        }
      },
      shiftSchedule: {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: '',
        type: 'fixed_daily',
        pattern: {
          name: 'شیفت عادی',
          description: 'شیفت عادی روزانه',
          repeatCycle: 1,
          workDaysInCycle: 6,
          restDaysInCycle: 1
        },
        workDays: [
          {
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '16:00',
            breakDuration: 60,
            isWorkDay: true
          }
        ],
        startDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      performance: {
        attendanceRate: 0,
        punctualityScore: 0,
        customerRating: 0,
        productivityScore: 0,
        teamworkRating: 0,
        lastEvaluation: new Date(),
        evaluations: []
      },
      permissions: data.permissions || [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    newMember.shiftSchedule.employeeId = newMember.id;
    mockMembers.push(newMember);

    return NextResponse.json({
      success: true,
      data: newMember,
      message: 'عضو جدید با موفقیت اضافه شد'
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد عضو جدید' },
      { status: 500 }
    );
  }
}
