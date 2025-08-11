// API route for listing and creating staff
import { NextResponse } from 'next/server';
import { Staff } from '../../../types/staff';

let staff: Staff[] = [
  {
    id: '1',
    firstName: 'احمد',
    lastName: 'محمدی',
    email: 'ahmad@example.com',
    phone: '09123456789',
    position: 'سرآشپز',
    department: 'kitchen',
    salary: 25000000,
    hireDate: '2023-01-15',
    status: 'active',
    permissions: ['menu_management', 'order_management'],
    shifts: [],
    performance: {
      attendanceRate: 0.95,
      customerRating: 4.7,
      tasksCompleted: 180,
      punctualityScore: 0.92,
    },
  },
];

export async function GET() {
  return NextResponse.json(staff);
}

export async function POST(req: Request) {
  const data = await req.json();
  const newStaff: Staff = {
    ...data,
    id: Math.random().toString(36).slice(2),
    shifts: [],
    performance: {
      attendanceRate: 1.0,
      customerRating: 5.0,
      tasksCompleted: 0,
      punctualityScore: 1.0,
    },
  };
  staff.push(newStaff);
  return NextResponse.json(newStaff);
}
