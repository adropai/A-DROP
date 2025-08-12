import { prisma } from '../lib/prisma';
import { ReservationStatus } from '@prisma/client';

async function seedReservations() {
  console.log('🌱 Seeding reservations...');

  // ابتدا چند رزرو نمونه اضافه می‌کنیم
  const tables = await prisma.table.findMany();
  
  if (tables.length === 0) {
    console.log('❌ No tables found. Please run seed-tables first.');
    return;
  }

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
  const reservations = [
    {
      tableId: tables[0]?.id,
      customerName: 'احمد محمدی',
      customerPhone: '09123456789',
      customerEmail: 'ahmad@email.com',
      partySize: 4,
      reservationDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0), // امروز 19:00
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 21, 0), // 2 hours later
      status: 'CONFIRMED' as ReservationStatus,
      notes: 'رزرو ویژه برای شام خانوادگی'
    },
    {
      tableId: tables[1]?.id,
      customerName: 'سارا احمدی',
      customerPhone: '09987654321',
      customerEmail: 'sara@email.com',
      partySize: 2,
      reservationDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 30), // امروز 20:30
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 30),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 30), // 2 hours later
      status: 'PENDING' as ReservationStatus,
      notes: 'قرار عاشقانه'
    },
    {
      tableId: tables[2]?.id,
      customerName: 'علی رضایی',
      customerPhone: '09112233445',
      partySize: 6,
      reservationDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0), // فردا 18:00
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 20, 30), // 2.5 hours later
      status: 'PENDING' as ReservationStatus,
      notes: 'جلسه کاری'
    },
    {
      tableId: tables[0]?.id,
      customerName: 'فاطمه کریمی',
      customerPhone: '09334455667',
      partySize: 3,
      reservationDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 21, 0), // فردا 21:00
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 21, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 0), // 2 hours later
      status: 'CONFIRMED' as ReservationStatus,
      notes: 'شام خانوادگی'
    }
  ];

  for (const reservation of reservations) {
    if (reservation.tableId) {
      await prisma.reservation.create({
        data: {
          tableId: reservation.tableId,
          customerName: reservation.customerName,
          customerPhone: reservation.customerPhone,
          customerEmail: reservation.customerEmail,
          partySize: reservation.partySize,
          reservationDate: reservation.reservationDate,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          status: reservation.status,
          notes: reservation.notes
        }
      });
    }
  }

  console.log('✅ Reservations seeded successfully');
}

seedReservations()
  .catch((e) => {
    console.error('❌ Error seeding reservations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
