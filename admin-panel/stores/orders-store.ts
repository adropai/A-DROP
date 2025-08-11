import { create } from 'zustand';
import { Order, OrderStatus } from '../types/orders';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  setStatus: (id: string, status: OrderStatus) => Promise<void>;
  getOrderStats: () => {
    total: number;
    byStatus: Record<OrderStatus, number>;
    totalAmount: number;
    todayOrders: number;
  };
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('خطا در دریافت سفارشات');
      }
      const data = await response.json();
      set({ orders: data.orders || data || [], loading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ 
        error: error instanceof Error ? error.message : 'خطا در دریافت سفارشات', 
        loading: false,
        // Fallback data for development
        orders: [
          {
            id: '1001',
            customer: { id: 'c1', name: 'علی رضایی', phone: '09120000001' },
            items: [
              { id: 'm1', name: 'پیتزا', quantity: 2, price: 180000 },
              { id: 'm2', name: 'نوشابه', quantity: 1, price: 20000 },
            ],
            amount: 200000,
            status: 'New',
            createdAt: new Date().toISOString(),
          },
          {
            id: '1002',
            customer: { id: 'c2', name: 'مریم موسوی', phone: '09120000002' },
            items: [
              { id: 'm3', name: 'برگر', quantity: 1, price: 120000 },
            ],
            amount: 120000,
            status: 'Confirmed',
            createdAt: new Date().toISOString(),
          },
        ]
      });
    }
  },

  addOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('خطا در ثبت سفارش');
      }
      const newOrder = await response.json();
      set(state => ({
        orders: [...state.orders, newOrder],
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'خطا در ثبت سفارش', 
        loading: false 
      });
      throw error;
    }
  },

  updateOrder: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('خطا در بروزرسانی سفارش');
      }
      const updatedOrder = await response.json();
      set(state => ({
        orders: state.orders.map(order => 
          order.id === id ? { ...order, ...updatedOrder } : order
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'خطا در بروزرسانی سفارش', 
        loading: false 
      });
      throw error;
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('خطا در حذف سفارش');
      }
      set(state => ({
        orders: state.orders.filter(order => order.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'خطا در حذف سفارش', 
        loading: false 
      });
      throw error;
    }
  },

  setStatus: async (id, status) => {
    await get().updateOrder(id, { status });
  },

  getOrderStats: () => {
    const orders = get().orders;
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => 
      order.createdAt.startsWith(today)
    ).length;
    
    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);

    const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);

    return {
      total: orders.length,
      byStatus: {
        New: byStatus.New || 0,
        Confirmed: byStatus.Confirmed || 0,
        Preparing: byStatus.Preparing || 0,
        Ready: byStatus.Ready || 0,
        Delivering: byStatus.Delivering || 0,
        Delivered: byStatus.Delivered || 0,
        Cancelled: byStatus.Cancelled || 0,
      },
      totalAmount,
      todayOrders,
    };
  },
}));
