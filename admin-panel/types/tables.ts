export type TableType = 'indoor' | 'outdoor' | 'vip';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface Reservation {
  id: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  location: string;
  type: TableType;
  status: TableStatus;
  isActive: boolean;
  qrCode?: string;
  description?: string;
  reservations?: Reservation[];
  createdAt: string;
  updatedAt: string;
}

export interface TableStats {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  maintenanceTables: number;
  occupancyRate: number;
}
