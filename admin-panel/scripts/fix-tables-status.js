const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTablesStatus() {
  try {
    console.log('🔧 Starting tables status migration...');

    // Get all tables
    const tables = await prisma.table.findMany();
    console.log(`📋 Found ${tables.length} tables to process`);

    let updated = 0;

    for (const table of tables) {
      console.log(`Processing table ${table.number}...`);
      
      // Update each table to ensure proper status, type, and isActive values
      await prisma.table.update({
        where: { id: table.id },
        data: {
          status: table.status || 'AVAILABLE', // Ensure status exists
          type: table.type || 'INDOOR', // Ensure type exists
          isActive: table.isActive !== undefined ? table.isActive : true, // Ensure isActive is set
        }
      });
      
      updated++;
      console.log(`✅ Updated table ${table.number}`);
    }

    console.log(`🎉 Migration completed! Updated ${updated} tables.`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTablesStatus();
