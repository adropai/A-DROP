import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Department, KitchenStatus, OrderPriority } from '@/types/kitchen';

// GET - دریافت فیش‌های آشپزخانه
export async function GET(request: NextRequest) {
  try {
    console.log('🧑‍🍳 Kitchen Tickets GET API called');
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') as Department;
    const status = searchParams.get('status') as KitchenStatus;
    const priority = searchParams.get('priority') as OrderPriority;
    const assignedChef = searchParams.get('assignedChef');
    const tableNumber = searchParams.get('tableNumber');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;
    const where: any = {};

    // فیلترها
    if (department) {
      where.department = department;
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (assignedChef) {
      where.assignedChef = assignedChef;
    }
    if (tableNumber) {
      where.tableNumber = parseInt(tableNumber);
    }

    // دریافت فیش‌ها با جزئیات کامل
    const [tickets, total] = await Promise.all([
      (prisma as any).kitchenTicket.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerName: true,
              type: true,
              tableNumber: true
            }
          },
          items: {
            include: {
              orderItem: {
                include: {
                  menuItem: {
                    include: {
                      category: true
                    }
                  }
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      }),
      (prisma as any).kitchenTicket.count({ where })
    ]);

    console.log(`🧑‍🍳 Found ${tickets.length} kitchen tickets`);

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Kitchen Tickets GET error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت فیش‌های آشپزخانه',
      data: []
    }, { status: 500 });
  }
}

// POST - ایجاد فیش آشپزخانه جدید (خودکار از سفارش)
export async function POST(request: NextRequest) {
  try {
    console.log('🧑‍🍳 Kitchen Tickets POST API called');
    const body = await request.json();
    console.log('🧑‍🍳 Request body:', body);

    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: 'شناسه سفارش الزامی است'
      }, { status: 400 });
    }

    // دریافت سفارش با آیتم‌ها
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    }) as any; // Type casting for now

    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'سفارش یافت نشد'
      }, { status: 404 });
    }

    // گروه‌بندی آیتم‌ها بر اساس بخش
    const itemsByDepartment: Record<string, any[]> = {};
    for (const item of order.items) {
      const department = item.menuItem.department || 'KITCHEN';
      if (!itemsByDepartment[department]) {
        itemsByDepartment[department] = [];
      }
      itemsByDepartment[department].push(item);
    }

    const createdTickets = [];

    // ایجاد فیش برای هر بخش
    for (const [department, items] of Object.entries(itemsByDepartment)) {
      const estimatedTime = (items as any[]).reduce((total, item) => {
        return total + (item.menuItem.preparationTime || 10);
      }, 0);

      const ticket = await (prisma as any).kitchenTicket.create({
        data: {
          ticketNumber: `TKT-${Date.now()}-${department}-${orderId}`,
          orderId: orderId,
          department: department,
          status: 'PENDING',
          priority: order.priority || 'NORMAL',
          tableNumber: order.tableNumber,
          estimatedTime,
          notes: `فیش ${department} برای سفارش ${order.orderNumber}`
        }
      });

      // ایجاد آیتم‌های فیش
      for (const item of items as any[]) {
        await (prisma as any).kitchenTicketItem.create({
          data: {
            kitchenTicketId: ticket.id,
            orderItemId: item.id,
            quantity: item.quantity,
            status: 'PENDING'
          }
        });
      }

      createdTickets.push(ticket);
    }    console.log(`🧑‍🍳 Created ${createdTickets.length} kitchen tickets for order ${orderId}`);

    return NextResponse.json({
      success: true,
      message: `${createdTickets.length} فیش آشپزخانه ایجاد شد`,
      data: createdTickets
    });

  } catch (error) {
    console.error('❌ Kitchen Tickets POST error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد فیش آشپزخانه'
    }, { status: 500 });
  }
}
