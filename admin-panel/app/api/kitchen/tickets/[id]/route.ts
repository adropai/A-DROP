import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Kitchen Ticket GET API called for ID: ${params.id}`);

    const ticket = await (prisma as any).kitchenTicket.findUnique({
      where: { id: params.id },
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            type: true,
            totalAmount: true
          }
        },
        items: {
          include: {
            orderItem: {
              include: {
                menuItem: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Kitchen ticket not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Kitchen ticket found: ${ticket.ticketNumber}`);
    return NextResponse.json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('❌ Kitchen Ticket GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch kitchen ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔄 Kitchen Ticket PUT API called for ID: ${params.id}`);
    
    const body = await request.json();
    console.log('📝 Update data:', body);

    const updatedTicket = await (prisma as any).kitchenTicket.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            type: true,
            totalAmount: true
          }
        },
        items: {
          include: {
            orderItem: {
              include: {
                menuItem: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ Kitchen ticket updated: ${updatedTicket.ticketNumber}`);
    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: 'Kitchen ticket updated successfully'
    });

  } catch (error) {
    console.error('❌ Kitchen Ticket PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update kitchen ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ Kitchen Ticket DELETE API called for ID: ${params.id}`);

    // First delete all ticket items
    await (prisma as any).kitchenTicketItem.deleteMany({
      where: { ticketId: params.id }
    });

    // Then delete the ticket
    await (prisma as any).kitchenTicket.delete({
      where: { id: params.id }
    });

    console.log(`✅ Kitchen ticket deleted: ${params.id}`);
    return NextResponse.json({
      success: true,
      message: 'Kitchen ticket deleted successfully'
    });

  } catch (error) {
    console.error('❌ Kitchen Ticket DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete kitchen ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
