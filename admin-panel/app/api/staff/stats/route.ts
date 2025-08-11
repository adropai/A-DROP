// API route for staff statistics
import { NextResponse } from 'next/server';
import { StaffStats } from '../../../../types/staff';

const stats: StaffStats = {
  totalStaff: 15,
  activeStaff: 13,
  onLeave: 2,
  totalSalary: 350000000,
  averagePerformance: 4.3,
  topPerformers: [],
};

export async function GET() {
  return NextResponse.json(stats);
}
