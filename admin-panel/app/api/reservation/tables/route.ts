// API route for listing tables
import { NextResponse } from 'next/server';
import { Table } from '../../../../types/reservation';

let tables: Table[] = [
  { id: '1', name: 'میز 1', capacity: 4, location: 'سالن اصلی', status: 'available' },
  { id: '2', name: 'میز 2', capacity: 2, location: 'کنار پنجره', status: 'reserved' },
  { id: '3', name: 'میز 3', capacity: 6, location: 'VIP', status: 'occupied' },
];

export async function GET() {
  return NextResponse.json(tables);
}
