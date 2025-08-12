import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  KitchenTicket, 
  KitchenStats, 
  KitchenFilter, 
  Department,
  KitchenStatus,
  OrderPriority,
  UpdateKitchenTicketForm,
  KitchenApiResponse,
  PaginatedKitchenResponse 
} from '@/types/kitchen';

// Department configuration interface
interface DepartmentConfig {
  id: string;
  name: string;
  nameEn?: string;
  icon: string;
  color: string;
  enabled: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  maxConcurrentTickets: number;
  defaultPreparationTime: number;
  description?: string;
  order: number;
}

interface KitchenState {
  // Data
  tickets: KitchenTicket[];
  selectedTicket: KitchenTicket | null;
  stats: KitchenStats | null;
  departments: any[];
  departmentConfigs: DepartmentConfig[];
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: KitchenFilter;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions - Tickets
  fetchTickets: (filters?: KitchenFilter) => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  updateTicketStatus: (id: string, data: UpdateKitchenTicketForm) => Promise<boolean>;
  createTicketsFromOrder: (orderId: number) => Promise<boolean>;
  
  // Actions - Stats
  fetchStats: (department?: Department) => Promise<void>;
  
  // Actions - Departments
  fetchDepartments: () => Promise<void>;
  fetchDepartmentConfigs: () => Promise<void>;
  updateDepartmentConfigs: (configs: DepartmentConfig[]) => Promise<boolean>;
  
  // Utility Actions
  setFilters: (filters: Partial<KitchenFilter>) => void;
  clearFilters: () => void;
  setSelectedTicket: (ticket: KitchenTicket | null) => void;
  clearError: () => void;
}

export const useKitchenStore = create<KitchenState>()(
  devtools(
    (set, get) => ({
      // Initial State
      tickets: [],
      selectedTicket: null,
      stats: null,
      departments: [],
      departmentConfigs: [],
      loading: false,
      error: null,
      filters: {},
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },

      // Actions - Tickets
      fetchTickets: async (filters?: KitchenFilter) => {
        try {
          set({ loading: true, error: null });
          
          const currentFilters = filters || get().filters;
          const params = new URLSearchParams();
          
          // اضافه کردن فیلترها به query
          if (currentFilters.department) params.append('department', currentFilters.department);
          if (currentFilters.status) params.append('status', currentFilters.status);
          if (currentFilters.priority) params.append('priority', currentFilters.priority);
          if (currentFilters.assignedChef) params.append('assignedChef', currentFilters.assignedChef);
          if (currentFilters.tableNumber) params.append('tableNumber', currentFilters.tableNumber.toString());
          
          params.append('page', get().pagination.page.toString());
          params.append('limit', get().pagination.limit.toString());

          const response = await fetch(`/api/kitchen/tickets?${params}`);
          const result: PaginatedKitchenResponse<KitchenTicket> = await response.json();

          if (result.success) {
            set({ 
              tickets: result.data,
              pagination: {
                ...get().pagination,
                total: result.pagination.total,
                totalPages: result.pagination.pages
              }
            });
          } else {
            set({ error: 'خطا در دریافت فیش‌های آشپزخانه' });
          }
        } catch (error) {
          set({ error: 'خطا در اتصال به سرور' });
        } finally {
          set({ loading: false });
        }
      },

      fetchTicketById: async (id: string) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch(`/api/kitchen/tickets/${id}`);
          const result: KitchenApiResponse<KitchenTicket> = await response.json();

          if (result.success && result.data) {
            set({ selectedTicket: result.data });
          } else {
            set({ error: result.message || 'فیش آشپزخانه یافت نشد' });
          }
        } catch (error) {
          set({ error: 'خطا در اتصال به سرور' });
        } finally {
          set({ loading: false });
        }
      },

      updateTicketStatus: async (id: string, data: UpdateKitchenTicketForm) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch(`/api/kitchen/tickets/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          const result: KitchenApiResponse<KitchenTicket> = await response.json();

          if (result.success) {
            // به‌روزرسانی فیش در لیست
            set(state => ({
              tickets: state.tickets.map(ticket => 
                ticket.id === id ? { ...ticket, ...data } : ticket
              ),
              selectedTicket: state.selectedTicket?.id === id 
                ? { ...state.selectedTicket, ...data } 
                : state.selectedTicket
            }));

            // رفرش آمار
            await get().fetchStats();
            return true;
          } else {
            set({ error: result.message || 'خطا در به‌روزرسانی فیش' });
            return false;
          }
        } catch (error) {
          set({ error: 'خطا در اتصال به سرور' });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createTicketsFromOrder: async (orderId: number) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch('/api/kitchen/tickets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId })
          });

          const result: KitchenApiResponse<KitchenTicket[]> = await response.json();

          if (result.success) {
            // رفرش لیست فیش‌ها
            await get().fetchTickets();
            await get().fetchStats();
            return true;
          } else {
            set({ error: result.message || 'خطا در ایجاد فیش‌های آشپزخانه' });
            return false;
          }
        } catch (error) {
          set({ error: 'خطا در اتصال به سرور' });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      // Actions - Stats
      fetchStats: async (department?: Department) => {
        try {
          const params = department ? `?department=${department}` : '';
          const response = await fetch(`/api/kitchen/stats${params}`);
          const result: KitchenApiResponse<KitchenStats> = await response.json();

          if (result.success && result.data) {
            set({ stats: result.data });
          } else {
            set({ error: result.message || 'خطا در دریافت آمار آشپزخانه' });
          }
        } catch (error) {
          set({ error: 'خطا در اتصال به سرور' });
        }
      },

      // Actions - Departments
      fetchDepartments: async () => {
        try {
          const response = await fetch('/api/kitchen/departments');
          const result: KitchenApiResponse<any[]> = await response.json();

          if (result.success && result.data) {
            set({ departments: result.data });
          } else {
            set({ error: result.message || 'خطا در دریافت بخش‌های آشپزخانه' });
          }
        } catch (error) {
          set({ error: 'خطا در اتصال به سرور' });
        }
      },

      // Utility Actions
      setFilters: (filters: Partial<KitchenFilter>) => {
        set(state => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, page: 1 } // ریست صفحه‌بندی
        }));
      },

      clearFilters: () => {
        set({ 
          filters: {},
          pagination: { ...get().pagination, page: 1 }
        });
      },

      setSelectedTicket: (ticket: KitchenTicket | null) => {
        set({ selectedTicket: ticket });
      },

      fetchDepartmentConfigs: async () => {
        try {
          set({ loading: true, error: null });

          const response = await fetch('/api/kitchen/department-config');
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch department configs');
          }

          set({ 
            departmentConfigs: result.data,
            loading: false 
          });
          
        } catch (error) {
          console.error('❌ Fetch department configs error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch department configs',
            loading: false 
          });
        }
      },

      updateDepartmentConfigs: async (configs: DepartmentConfig[]) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch('/api/kitchen/department-config', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(configs)
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to update department configs');
          }

          set({ 
            departmentConfigs: configs,
            loading: false 
          });

          return true;
          
        } catch (error) {
          console.error('❌ Update department configs error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update department configs',
            loading: false 
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'kitchen-store'
    }
  )
);
