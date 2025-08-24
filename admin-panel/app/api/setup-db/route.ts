import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force create tables endpoint
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Force creating database tables...');
    
    // ابتدا بررسی کنیم کدام جداول وجود دارند
    const existingTables = await (prisma as any).$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
    `;
    
    console.log('📋 Existing tables:', existingTables);
    
    // اگر جدول kitchen_tickets وجود ندارد، دستی ایجاد کنیم
    const kitchenTicketsTable = existingTables.find((table: any) => 
      table.name === 'kitchen_tickets' || table.name === 'KitchenTicket'
    );
    
    if (!kitchenTicketsTable) {
      console.log('🏗️ Creating kitchen_tickets table manually...');
      
      // ایجاد جدول kitchen_tickets
      await (prisma as any).$executeRaw`
        CREATE TABLE "kitchen_tickets" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "ticketNumber" TEXT NOT NULL,
          "orderId" INTEGER NOT NULL,
          "department" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "priority" TEXT NOT NULL DEFAULT 'NORMAL',
          "assignedChef" TEXT,
          "tableNumber" INTEGER,
          "notes" TEXT,
          "estimatedTime" INTEGER,
          "startedAt" DATETIME,
          "readyAt" DATETIME,
          "servedAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
        );
      `;
      
      // ایجاد indexes
      await (prisma as any).$executeRaw`
        CREATE INDEX "kitchen_tickets_department_idx" ON "kitchen_tickets"("department");
      `;
      
      await (prisma as any).$executeRaw`
        CREATE INDEX "kitchen_tickets_status_idx" ON "kitchen_tickets"("status");
      `;
      
      await (prisma as any).$executeRaw`
        CREATE UNIQUE INDEX "kitchen_tickets_ticketNumber_key" ON "kitchen_tickets"("ticketNumber");
      `;
      
      console.log('✅ kitchen_tickets table created');
    }
    
    // بررسی جدول kitchen_ticket_items
    const kitchenItemsTable = existingTables.find((table: any) => 
      table.name === 'kitchen_ticket_items' || table.name === 'KitchenTicketItem'
    );
    
    if (!kitchenItemsTable) {
      console.log('🏗️ Creating kitchen_ticket_items table manually...');
      
      await (prisma as any).$executeRaw`
        CREATE TABLE "kitchen_ticket_items" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "kitchenTicketId" TEXT NOT NULL,
          "orderItemId" INTEGER NOT NULL,
          "quantity" INTEGER NOT NULL,
          "notes" TEXT,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "preparationTime" INTEGER,
          "startedAt" DATETIME,
          "completedAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("kitchenTicketId") REFERENCES "kitchen_tickets"("id") ON DELETE CASCADE,
          FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE
        );
      `;
      
      // ایجاد indexes
      await (prisma as any).$executeRaw`
        CREATE INDEX "kitchen_ticket_items_kitchenTicketId_idx" ON "kitchen_ticket_items"("kitchenTicketId");
      `;
      
      console.log('✅ kitchen_ticket_items table created');
    }
    
    // بررسی جداول نهایی
    const finalTables = await (prisma as any).$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
    `;
    
    return NextResponse.json({
      success: true,
      message: 'جداول با موفقیت ایجاد شدند',
      data: {
        before: existingTables,
        after: finalTables
      }
    });

  } catch (error) {
    console.error('❌ Table creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد جداول',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
