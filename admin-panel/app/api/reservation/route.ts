// API route for listing and creating reservations
import { NextResponse } from 'next/server';

// Define Reservation type locally for now
interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  tableId: string;
  tableName?: string;
  hall?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Sample reservations data
let reservations: Reservation[] = [
  {
    id: '1',
    customerName: 'احمد محمدی',
    customerPhone: '09123456789',
    date: new Date().toISOString().split('T')[0], // Today
    time: '19:00',
    partySize: 4,
    tableId: '1',
    tableName: 'میز 1',
    hall: 'سالن اصلی',
    status: 'confirmed',
    notes: 'جشن تولد',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    customerName: 'مریم احمدی',
    customerPhone: '09987654321',
    date: new Date().toISOString().split('T')[0], // Today
    time: '20:30',
    partySize: 2,
    tableId: '2',
    tableName: 'میز 2',
    hall: 'سالن اصلی',
    status: 'pending',
    notes: 'عشای رمانتیک',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  const data = await req.json();
  
  // Find table info to add to reservation
  const tableResponse = await fetch(new URL('/api/tables', req.url).toString());
  const tables = await tableResponse.json();
  const selectedTable = tables.find((t: any) => t.id === data.tableId);
  
  const newReservation: Reservation = {
    ...data,
    id: Math.random().toString(36).slice(2),
    tableName: selectedTable?.name || `میز ${data.tableId}`,
    hall: selectedTable?.hall || 'نامشخص',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  reservations.push(newReservation);
  return NextResponse.json(newReservation);
}
