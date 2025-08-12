import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Department } from '@/types/kitchen';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Kitchen Stats API called');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') as Department | null;

    // Base where clause
    const baseWhere = department ? { department } : {};

    // Get overview stats
    const [
      pendingTickets,
      preparingTickets, 
      readyTickets,
      servedTickets,
      totalTickets
    ] = await Promise.all([
      (prisma as any).kitchenTicket.count({
        where: { ...baseWhere, status: 'PENDING' }
      }),
      (prisma as any).kitchenTicket.count({
        where: { ...baseWhere, status: 'PREPARING' }
      }),
      (prisma as any).kitchenTicket.count({
        where: { ...baseWhere, status: 'READY' }
      }),
      (prisma as any).kitchenTicket.count({
        where: { ...baseWhere, status: 'SERVED' }
      }),
      (prisma as any).kitchenTicket.count({
        where: baseWhere
      })
    ]);

    // Get department breakdown
    const departmentStats = await (prisma as any).kitchenTicket.groupBy({
      by: ['department', 'status'],
      _count: {
        id: true
      },
      where: baseWhere
    });

    // Process department stats
    const byDepartment: any = {};
    const departments = ['KITCHEN', 'COFFEE_SHOP', 'GRILL', 'DESSERT', 'HOOKAH', 'BAKERY', 'SALAD_BAR'];
    
    departments.forEach(dept => {
      byDepartment[dept] = {
        pending: 0,
        preparing: 0,
        ready: 0,
        served: 0,
        total: 0
      };
    });

    departmentStats.forEach((stat: any) => {
      const dept = stat.department;
      const status = stat.status.toLowerCase();
      const count = stat._count.id;
      
      if (byDepartment[dept]) {
        byDepartment[dept][status] = count;
        byDepartment[dept].total += count;
      }
    });

    // Calculate average preparation time (mock for now)
    const averagePreparationTime = 15; // minutes

    // Performance stats (mock for now)
    const performance = {
      ticketsCompletedToday: servedTickets,
      averageCompletionTime: averagePreparationTime,
      delayedTickets: 0,
      onTimeTickets: servedTickets
    };

    // Chefs stats (mock for now)
    const chefs = [
      {
        name: 'علی احمدی',
        assignedTickets: Math.floor(totalTickets * 0.4),
        completedTickets: Math.floor(servedTickets * 0.4),
        averageTime: 12
      },
      {
        name: 'فاطمه رضایی',
        assignedTickets: Math.floor(totalTickets * 0.35),
        completedTickets: Math.floor(servedTickets * 0.35),
        averageTime: 18
      },
      {
        name: 'محمد کریمی',
        assignedTickets: Math.floor(totalTickets * 0.25),
        completedTickets: Math.floor(servedTickets * 0.25),
        averageTime: 14
      }
    ];

    const stats = {
      overview: {
        pendingTickets,
        preparingTickets,
        readyTickets,
        servedTickets,
        totalTickets,
        averagePreparationTime
      },
      byDepartment,
      performance,
      chefs
    };

    console.log('✅ Kitchen stats fetched successfully');
    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Kitchen Stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch kitchen stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
