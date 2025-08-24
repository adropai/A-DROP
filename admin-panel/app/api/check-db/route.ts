import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Test endpoint برای بررسی وجود جداول
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking database tables...');
    
    // بررسی جداول موجود
    const tables = await (prisma as any).$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table';
    `;
    
    console.log('📋 Available tables:', tables);
    
    // بررسی جدول orders
    const ordersCount = await prisma.order.count();
    console.log('📦 Orders count:', ordersCount);
    
    // بررسی وجود جدول kitchenTicket
    let kitchenTicketExists = false;
    let kitchenTicketsCount = 0;
    
    try {
      const kitchenTable = await (prisma as any).$queryRaw`
        SELECT name FROM sqlite_master WHERE type='table' AND name='KitchenTicket';
      `;
      
      if (kitchenTable && kitchenTable.length > 0) {
        kitchenTicketExists = true;
        kitchenTicketsCount = await (prisma as any).kitchenTicket.count();
        console.log('🧑‍🍳 Kitchen tickets count:', kitchenTicketsCount);
      }
    } catch (error) {
      console.log('❌ Kitchen ticket table check failed:', error);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        tables: tables,
        orders_count: ordersCount,
        kitchen_ticket_exists: kitchenTicketExists,
        kitchen_tickets_count: kitchenTicketsCount
      }
    });

  } catch (error) {
    console.error('❌ Database check error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در بررسی دیتابیس',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
