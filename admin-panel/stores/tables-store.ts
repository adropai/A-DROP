import { create } from 'zustand';
import { Table, TableStats } from '../types/tables';

interface TablesState {
  tables: Table[];
  loading: boolean;
  addTable: (table: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTable: (id: string, updates: Partial<Table>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  fetchTables: () => Promise<void>;
  generateQRCode: (id: string) => void;
  getTableStats: () => TableStats;
  getTablesByStatus: (status: Table['status']) => Table[];
  getTablesByType: (type: Table['type']) => Table[];
}

export const useTablesStore = create<TablesState>((set, get) => ({
  tables: [],
  loading: false,
  
  // دریافت میزها از API
  fetchTables: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/tables');
      const result = await response.json();
      
      if (result.success && result.data) {
        set({ tables: result.data });
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      set({ loading: false });
    }
  },

  // اضافه کردن میز با API
  addTable: async (tableData) => {
    set({ loading: true });
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        set(state => ({ 
          tables: [...state.tables, result.data],
          loading: false 
        }));
        return Promise.resolve();
      } else {
        throw new Error(result.error || 'خطا در ثبت میز');
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  // به‌روزرسانی میز با API
  updateTable: async (id, updates) => {
    set({ loading: true });
    try {
      const response = await fetch('/api/tables', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        set(state => ({
          tables: state.tables.map(table => 
            table.id === id ? result.data : table
          ),
          loading: false
        }));
        return Promise.resolve();
      } else {
        throw new Error(result.error || 'خطا در به‌روزرسانی میز');
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  // حذف میز با API
  deleteTable: async (id) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/tables?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        set(state => ({
          tables: state.tables.filter(table => table.id !== id),
          loading: false
        }));
        return Promise.resolve();
      } else {
        throw new Error(result.error || 'خطا در حذف میز');
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  generateQRCode: (id) => {
    const qrCodeUrl = `${window.location.origin}/customer/order?table=${id}`;
    get().updateTable(id, { qrCode: qrCodeUrl });
  },

  // آمار میزها
  getTableStats: () => {
    const { tables } = get();
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const reservedTables = tables.filter(t => t.status === 'reserved').length;
    const maintenanceTables = tables.filter(t => t.status === 'maintenance').length;
    // نرخ اشغال فقط بر اساس تعداد میزهای اشغال شده
    const occupancyRate = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;

    return {
      totalTables,
      availableTables,
      occupiedTables,
      reservedTables,
      maintenanceTables,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
    };
  },

  // میزها بر اساس وضعیت
  getTablesByStatus: (status) => {
    const { tables } = get();
    return tables.filter(table => table.status === status);
  },

  // میزها بر اساس نوع
  getTablesByType: (type) => {
    const { tables } = get();
    return tables.filter(table => table.type === type);
  },
}));
