// ===============================================
// 🔗 API برای مدیریت شیفت‌ها
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import type { ShiftSchedule, ShiftScheduleForm } from '@/types/team-management';

// Mock data for development
const mockSchedules: ShiftSchedule[] = [
  {
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
      },
      {
        dayOfWeek: 2,
        startTime: '08:00',
        endTime: '16:00',
        breakDuration: 60,
        isWorkDay: true
      },
      {
        dayOfWeek: 3,
        startTime: '08:00',
        endTime: '16:00',
        breakDuration: 60,
        isWorkDay: true
      },
      {
        dayOfWeek: 4,
        startTime: '08:00',
        endTime: '16:00',
        breakDuration: 60,
        isWorkDay: true
      },
      {
        dayOfWeek: 5,
        startTime: '08:00',
        endTime: '16:00',
        breakDuration: 60,
        isWorkDay: true
      },
      {
        dayOfWeek: 6,
        startTime: '08:00',
        endTime: '16:00',
        breakDuration: 60,
        isWorkDay: true
      },
      {
        dayOfWeek: 0,
        startTime: '00:00',
        endTime: '00:00',
        breakDuration: 0,
        isWorkDay: false
      }
    ],
    startDate: new Date('2023-01-01'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sch2',
    employeeId: '2',
    type: 'rotating',
    pattern: {
      name: 'شیفت چرخشی',
      description: 'دو روز کار، یک روز استراحت',
      repeatCycle: 3,
      workDaysInCycle: 2,
      restDaysInCycle: 1
    },
    workDays: [
      {
        dayOfWeek: 1,
        startTime: '16:00',
        endTime: '24:00',
        breakDuration: 30,
        isWorkDay: true
      },
      {
        dayOfWeek: 2,
        startTime: '16:00',
        endTime: '24:00',
        breakDuration: 30,
        isWorkDay: true
      },
      {
        dayOfWeek: 3,
        startTime: '00:00',
        endTime: '00:00',
        breakDuration: 0,
        isWorkDay: false
      }
    ],
    startDate: new Date('2023-03-01'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const department = searchParams.get('department');
    const type = searchParams.get('type');

    let filteredSchedules = [...mockSchedules];

    // Apply filters
    if (employeeId) {
      filteredSchedules = filteredSchedules.filter(schedule => 
        schedule.employeeId === employeeId
      );
    }

    if (type) {
      filteredSchedules = filteredSchedules.filter(schedule => 
        schedule.type === type
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredSchedules
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت برنامه‌های شیفت' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ShiftScheduleForm = await request.json();

    // Generate new schedule
    const newSchedule: ShiftSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: data.employeeId,
      type: data.type,
      pattern: data.pattern,
      workDays: data.workDays,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockSchedules.push(newSchedule);

    return NextResponse.json({
      success: true,
      data: newSchedule,
      message: 'برنامه شیفت جدید با موفقیت ایجاد شد'
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد برنامه شیفت' },
      { status: 500 }
    );
  }
}
