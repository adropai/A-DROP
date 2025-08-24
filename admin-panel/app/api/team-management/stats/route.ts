// ===============================================
// 🔗 API برای آمار تیم
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import type { TeamStats } from '@/types/team-management';

export async function GET(request: NextRequest) {
  try {
    // Mock stats data
    const mockStats: TeamStats = {
      totalEmployees: 25,
      activeEmployees: 23,
      onLeaveEmployees: 2,
      totalSalary: 250000000,
      averagePerformance: 88.5,
      departmentStats: [
        {
          department: 'kitchen',
          employeeCount: 8,
          averageSalary: 12000000,
          averagePerformance: 90,
          attendanceRate: 95
        },
        {
          department: 'service',
          employeeCount: 10,
          averageSalary: 8500000,
          averagePerformance: 92,
          attendanceRate: 98
        },
        {
          department: 'cashier',
          employeeCount: 3,
          averageSalary: 9000000,
          averagePerformance: 85,
          attendanceRate: 96
        },
        {
          department: 'delivery',
          employeeCount: 4,
          averageSalary: 7500000,
          averagePerformance: 87,
          attendanceRate: 94
        }
      ],
      shiftCoverage: [
        {
          date: new Date(),
          shifts: {
            morning: 8,
            evening: 10,
            night: 5
          },
          totalRequired: 25,
          totalScheduled: 23,
          coverageRate: 92
        }
      ],
      topPerformers: [], // Will be populated with actual data
      attendanceRate: 95.5,
      turnoverRate: 8.2
    };

    return NextResponse.json({
      success: true,
      data: mockStats
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت آمار تیم' },
      { status: 500 }
    );
  }
}
