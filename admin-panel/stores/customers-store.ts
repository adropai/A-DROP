import { create } from 'zustand';
import { Customer, CustomerTier, CustomerStatus } from '../types/customers';

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  filters: {
    tier?: CustomerTier;
    status?: CustomerStatus;
    search?: string;
  };
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  setSelectedCustomer: (customer: Customer | null) => void;
  setFilters: (filters: Partial<CustomersState['filters']>) => void;
  fetchCustomers: () => Promise<void>;
  getCustomersByTier: (tier: CustomerTier) => Customer[];
  getCustomerStats: () => {
    total: number;
    active: number;
    byTier: Record<CustomerTier, number>;
    totalSpent: number;
    averageValue: number;
  };
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: [
    {
      id: '1',
      name: 'احمد محمدی',
      email: 'ahmad@example.com',
      phone: '09121234567',
      avatar: '/avatars/ahmad.jpg',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      tier: 'Gold',
      status: 'Active',
      addresses: [
        {
          id: 'addr1',
          title: 'منزل',
          address: 'تهران، خیابان ولیعصر، پلاک 123',
          city: 'تهران',
          district: 'منطقه 3',
          postalCode: '1234567890',
          isDefault: true,
        }
      ],
      preferences: {
        favoriteItems: ['pizza-margherita', 'pasta-carbonara'],
        allergies: ['nuts'],
        dietaryRestrictions: [],
        preferredPaymentMethod: 'card',
        deliveryInstructions: 'زنگ آپارتمان واحد 5'
      },
      stats: {
        totalOrders: 45,
        totalSpent: 2750000,
        averageOrderValue: 61111,
        lastOrderDate: '2024-01-20',
        favoriteCategory: 'پیتزا',
        loyaltyPoints: 1250,
        lifetimeValue: 3200000
      },
      tags: ['VIP', 'وفادار'],
      notes: 'مشتری باوفا، همیشه راضی از سرویس',
      createdAt: '2023-06-15T10:30:00Z',
      updatedAt: '2024-01-20T15:45:00Z',
    },
    {
      id: '2',
      name: 'فاطمه رضایی',
      email: 'fateme@example.com',
      phone: '09187654321',
      tier: 'Silver',
      status: 'Active',
      addresses: [
        {
          id: 'addr2',
          title: 'محل کار',
          address: 'تهران، خیابان کریمخان، برج میلاد',
          city: 'تهران',
          district: 'منطقه 6',
          isDefault: true,
        }
      ],
      preferences: {
        favoriteItems: ['salad-caesar', 'sandwich-club'],
        allergies: [],
        dietaryRestrictions: ['vegetarian'],
        preferredPaymentMethod: 'online',
      },
      stats: {
        totalOrders: 23,
        totalSpent: 1250000,
        averageOrderValue: 54347,
        lastOrderDate: '2024-01-18',
        favoriteCategory: 'سالاد',
        loyaltyPoints: 625,
        lifetimeValue: 1450000
      },
      tags: ['گیاهخوار'],
      createdAt: '2023-09-22T14:20:00Z',
      updatedAt: '2024-01-18T12:30:00Z',
    },
    {
      id: '3',
      name: 'حسن احمدی',
      phone: '09309876543',
      tier: 'Bronze',
      status: 'Active',
      addresses: [
        {
          id: 'addr3',
          title: 'منزل',
          address: 'کرج، خیابان فردوسی، کوچه سوم',
          city: 'کرج',
          district: 'مرکز',
          isDefault: true,
        }
      ],
      preferences: {
        favoriteItems: ['kebab-koobideh'],
        allergies: [],
        dietaryRestrictions: [],
        preferredPaymentMethod: 'cash',
      },
      stats: {
        totalOrders: 8,
        totalSpent: 420000,
        averageOrderValue: 52500,
        lastOrderDate: '2024-01-15',
        favoriteCategory: 'کباب',
        loyaltyPoints: 210,
        lifetimeValue: 520000
      },
      tags: ['جدید'],
      createdAt: '2023-12-01T09:15:00Z',
      updatedAt: '2024-01-15T18:20:00Z',
    }
  ],
  selectedCustomer: null,
  loading: false,
  filters: {},

  setCustomers: (customers) => set({ customers }),

  // تابع دریافت مشتریان از API
  fetchCustomers: async () => {
    console.log('🔹 Fetching customers...');
    set({ loading: true });
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات مشتریان');
      }
      const result = await response.json();
      console.log('🔹 Fetch customers API response:', result);
      
      if (result.success && result.data) {
        console.log('🔹 Setting customers:', result.data.length, 'customers');
        set({ customers: result.data, loading: false });
      } else if (Array.isArray(result)) {
        // اگر نتیجه مستقیماً آرایه باشد
        console.log('🔹 Setting customers (array):', result.length, 'customers');
        set({ customers: result, loading: false });
      } else {
        throw new Error(result.error || 'خطا در دریافت اطلاعات مشتریان');
      }
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      set({ loading: false });
      throw error;
    }
  },

  // تابع اضافه کردن مشتری با API
  addCustomer: async (customerData) => {
    console.log('🔹 Adding customer:', customerData);
    set({ loading: true });
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      const result = await response.json();
      console.log('🔹 Add customer API response:', result);

      if (result.success && result.data) {
        // اضافه کردن مشتری جدید به لیست
        set(state => ({ 
          customers: [...state.customers, result.data],
          loading: false 
        }));
        
        // بروزرسانی لیست کامل مشتریان
        const { fetchCustomers } = get();
        await fetchCustomers();
        
        return Promise.resolve();
      } else {
        throw new Error(result.error || 'خطا در ثبت مشتری');
      }
    } catch (error) {
      console.error('❌ Error adding customer:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateCustomer: async (id, updates) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // به‌روزرسانی مشتری در لیست
        set(state => ({
          customers: state.customers.map(customer =>
            customer.id === id ? result.data : customer
          ),
          loading: false
        }));
        return Promise.resolve();
      } else {
        throw new Error(result.error || 'خطا در به‌روزرسانی مشتری');
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // حذف مشتری از لیست
        set(state => ({
          customers: state.customers.filter(customer => customer.id !== id),
          loading: false
        }));
        return Promise.resolve();
      } else {
        throw new Error(result.error || 'خطا در حذف مشتری');
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  setFilters: (filters) => set(state => ({ 
    filters: { ...state.filters, ...filters } 
  })),

  getCustomersByTier: (tier) => {
    return get().customers.filter(customer => customer.tier === tier);
  },

  getCustomerStats: () => {
    const customers = get().customers;
    const active = customers.filter(c => c.status === 'Active').length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.stats?.totalSpent ?? 0), 0);
    const byTier = customers.reduce((acc, customer) => {
      acc[customer.tier] = (acc[customer.tier] || 0) + 1;
      return acc;
    }, {} as Record<CustomerTier, number>);

    return {
      total: customers.length,
      active,
      byTier: {
        Bronze: byTier.Bronze || 0,
        Silver: byTier.Silver || 0,
        Gold: byTier.Gold || 0,
        Platinum: byTier.Platinum || 0,
      },
      totalSpent,
      averageValue: customers.length > 0 ? totalSpent / customers.length : 0,
    };
  },
}));
