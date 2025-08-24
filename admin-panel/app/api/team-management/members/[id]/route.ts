// ===============================================
// 🔗 API برای مدیریت عضو خاص تیم
// ===============================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock data - در محیط واقعی از دیتابیس دریافت کنید
    const mockMember = {
      id: id,
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
        employeeId: id,
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
    };

    return NextResponse.json({
      success: true,
      data: mockMember
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات عضو' },
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
    const updateData = await request.json();

    // Mock update - در محیط واقعی دیتابیس را بروزرسانی کنید
    const updatedMember = {
      id: id,
      ...updateData,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: 'اطلاعات عضو با موفقیت بروزرسانی شد'
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بروزرسانی اطلاعات عضو' },
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

    // Mock delete - در محیط واقعی از دیتابیس حذف کنید
    console.log(`Deleting member with ID: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'عضو با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف عضو' },
      { status: 500 }
    );
  }
}
