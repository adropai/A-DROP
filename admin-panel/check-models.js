#!/usr/bin/env node

/**
 * تست Prisma User Model
 */

async function testPrismaUser() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔍 Testing Prisma User Model...');
    
    // Test connection
    console.log('1. Testing connection...');
    await prisma.$connect();
    console.log('✅ Connection successful');
    
    // Test user count
    console.log('2. Testing user.count()...');
    const userCount = await prisma.user.count();
    console.log(`✅ User count: ${userCount}`);
    
    // Test find user
    console.log('3. Testing user.findUnique()...');
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@adrop.com' }
    });
    console.log(`✅ Admin user: ${admin ? admin.name : 'Not found'}`);
    
    await prisma.$disconnect();
    console.log('✅ All Prisma tests passed!');
    
  } catch (error) {
    console.error('❌ Prisma test failed:', error.message);
  }
}

testPrismaUser();
