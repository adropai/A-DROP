// TypeScript types for Reservation System
export interface Reservation {
  id: string;
  tableId: string;
  customerId: string;
  customerName: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  location: string;
  status: 'available' | 'reserved' | 'occupied' | 'inactive';
}

export interface ReservationStats {
  total: number;
  today: number;
  week: number;
  month: number;
  occupancyRate: number;
  peakHours: string[];
  revenue: number;
}
