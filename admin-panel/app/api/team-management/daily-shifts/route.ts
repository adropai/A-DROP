import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment-jalaali';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString();

    // Mock data for daily shifts
    const mockDailyShifts = [
      {
        id: '1',
        employeeId: 'emp1',
        shiftId: 'shift1',
        date: date,
        startTime: '08:00',
        endTime: '16:00',
        actualStartTime: null,
        actualEndTime: null,
        status: 'scheduled',
        notes: '',
        overtimeHours: 0,
        checkedBy: null,
        checkInTime: null,
        checkOutTime: null
      },
      {
        id: '2',
        employeeId: 'emp2',
        shiftId: 'shift2',
        date: date,
        startTime: '16:00',
        endTime: '00:00',
        actualStartTime: '16:05',
        actualEndTime: null,
        status: 'active',
        notes: '5 دقیقه تاخیر',
        overtimeHours: 0,
        checkedBy: 'manager1',
        checkInTime: '16:05',
        checkOutTime: null
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockDailyShifts,
      total: mockDailyShifts.length
    });

  } catch (error) {
    console.error('Error in daily-shifts API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daily shifts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Mock creation
    const newShift = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newShift
    });

  } catch (error) {
    console.error('Error creating daily shift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create daily shift' },
      { status: 500 }
    );
  }
}
