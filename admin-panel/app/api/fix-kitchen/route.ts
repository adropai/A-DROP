import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔧 Creating kitchen tables...');
    
    // ایجاد جدول kitchen_tickets
    console.log('📝 Creating kitchen_tickets table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "kitchen_tickets" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "ticketNumber" TEXT NOT NULL UNIQUE,
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
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ kitchen_tickets table created');
    
    // ایجاد جدول kitchen_ticket_items
    console.log('📝 Creating kitchen_ticket_items table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "kitchen_ticket_items" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "kitchenTicketId" TEXT NOT NULL,
        "orderItemId" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL,
        "notes" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "preparationTime" INTEGER,
        "startedAt" DATETIME,
        "completedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ kitchen_ticket_items table created');
    
    // بررسی جداول ایجاد شده
    console.log('🔍 Checking created tables...');
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%kitchen%' ORDER BY name;
    `;
    console.log('📋 Kitchen tables found:', tables);
    
    return NextResponse.json({
      success: true,
      message: 'Kitchen tables created successfully',
      tables: tables
    });
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
