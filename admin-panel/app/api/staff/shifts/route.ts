// API route for staff shifts
import { NextResponse } from 'next/server';
import { Shift } from '../../../../types/staff';

let shifts: Shift[] = [
  {
    id: '1',
    staffId: '1',
    date: '2024-01-15',
    startTime: '08:00',
    endTime: '16:00',
    breakTime: 60,
    type: 'regular',
    status: 'completed',
  },
];

export async function GET() {
  return NextResponse.json(shifts);
}

export async function POST(req: Request) {
  const data = await req.json();
  const newShift: Shift = {
    ...data,
    id: Math.random().toString(36).slice(2),
  };
  shifts.push(newShift);
  return NextResponse.json(newShift);
}
