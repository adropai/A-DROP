import { useState, useEffect, useCallback } from 'react';

interface CashierStats {
  totalSales: number;
  totalTax: number;
  totalDiscount: number;
  orderCount: number;
  avgOrderValue: number;
}

interface PaymentMethod {
  method: string;
  amount: number;
  count: number;
}

interface PendingOrder {
  id: number;
  orderNumber: string;
  tableNumber?: number;
  customerName?: string;
  total: number;
  tax: number;
  subtotal: number;
  discountAmount: number;
  items: OrderItem[];
  createdAt: string;
}

interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Transaction {
  id: number;
  orderNumber: string;
  tableNumber?: number;
  total: number;
  tax: number;
  discountAmount: number;
  paymentMethod: string;
  createdAt: string;
  completedAt: string;
}

interface CashierState {
  dailyStats: CashierStats;
  pendingOrders: PendingOrder[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  shiftInfo: any;
}

export function useCashier() {
  const [state, setState] = useState<CashierState>({
    dailyStats: {
      totalSales: 0,
      totalTax: 0,
      totalDiscount: 0,
      orderCount: 0,
      avgOrderValue: 0
    },
    pendingOrders: [],
    paymentMethods: [],
    transactions: [],
    shiftInfo: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // دریافت داده‌های داشبورد صندوقدار
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cashier?action=dashboard&date=${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          dailyStats: data.data.dailyStats,
          pendingOrders: data.data.pendingOrders,
          paymentMethods: data.data.paymentMethods
        }));
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('خطا در دریافت داده‌های داشبورد:', error);
      setError('خطا در دریافت داده‌ها');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // دریافت تراکنش‌ها
  const fetchTransactions = useCallback(async (paymentMethod?: string) => {
    try {
      const url = `/api/cashier?action=transactions&date=${selectedDate}${
        paymentMethod ? `&method=${paymentMethod}` : ''
      }`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          transactions: data.data.transactions
        }));
      }

    } catch (error) {
      console.error('خطا در دریافت تراکنش‌ها:', error);
    }
  }, [selectedDate]);

  // دریافت اطلاعات شیفت
  const fetchShiftInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/cashier?action=shift&date=${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          shiftInfo: data.data
        }));
      }

    } catch (error) {
      console.error('خطا در دریافت اطلاعات شیفت:', error);
    }
  }, [selectedDate]);

  // پردازش پرداخت
  const processCheckout = useCallback(async (orderId: number, paymentData: any) => {
    try {
      setLoading(true);

      const response = await fetch('/api/cashier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          orderId,
          paymentData
        })
      });

      const data = await response.json();

      if (data.success) {
        // بروزرسانی داده‌ها
        await fetchDashboardData();
        return data.data;
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('خطا در پردازش پرداخت:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardData]);

  // اعمال تخفیف
  const applyDiscount = useCallback(async (orderId: number, discountData: any) => {
    try {
      const response = await fetch('/api/cashier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'discount',
          orderId,
          discountData
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchDashboardData();
        return data.data;
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('خطا در اعمال تخفیف:', error);
      throw error;
    }
  }, [fetchDashboardData]);

  // بازگشت وجه
  const processRefund = useCallback(async (orderId: number, refundData: any) => {
    try {
      const response = await fetch('/api/cashier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refund',
          orderId,
          refundData
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchDashboardData();
        return data.data;
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('خطا در بازگشت وجه:', error);
      throw error;
    }
  }, [fetchDashboardData]);

  // تقسیم صورتحساب
  const splitBill = useCallback(async (orderId: number, splitData: any) => {
    try {
      const response = await fetch('/api/cashier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'split-bill',
          orderId,
          splitData
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchDashboardData();
        return data.data;
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('خطا در تقسیم صورتحساب:', error);
      throw error;
    }
  }, [fetchDashboardData]);

  // چاپ رسید
  const printReceipt = useCallback(async (orderId: number) => {
    try {
      const response = await fetch('/api/cashier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'print-receipt',
          orderId
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data;

    } catch (error) {
      console.error('خطا در چاپ رسید:', error);
      throw error;
    }
  }, []);

  // راه‌اندازی اولیه
  useEffect(() => {
    fetchDashboardData();
    fetchTransactions();
    fetchShiftInfo();
  }, [fetchDashboardData, fetchTransactions, fetchShiftInfo]);

  // تغییر تاریخ
  const changeDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  return {
    // State
    dailyStats: state.dailyStats,
    pendingOrders: state.pendingOrders,
    paymentMethods: state.paymentMethods,
    transactions: state.transactions,
    shiftInfo: state.shiftInfo,
    loading,
    error,
    selectedDate,

    // Actions
    processCheckout,
    applyDiscount,
    processRefund,
    splitBill,
    printReceipt,
    changeDate,
    refresh: fetchDashboardData,

    // Utils
    getOrderTotal: (order: PendingOrder) => 
      order.subtotal + order.tax - order.discountAmount,
    
    getPaymentMethodTotal: (method: string) => 
      state.paymentMethods.find(pm => pm.method === method)?.amount || 0,
    
    getPaymentMethodLabel: (method: string) => {
      switch (method) {
        case 'CASH': return 'نقدی';
        case 'CARD': return 'کارت';
        case 'DIGITAL': return 'کیف پول دیجیتال';
        case 'CREDIT': return 'اعتباری';
        default: return method;
      }
    },
    
    formatCurrency: (amount: number) => 
      new Intl.NumberFormat('fa-IR', {
        style: 'currency',
        currency: 'IRR',
        minimumFractionDigits: 0
      }).format(amount),
    
    getOrdersByStatus: (status: string) =>
      state.pendingOrders.filter(order => (order as any).status === status),
    
    getTotalCashReceived: () =>
      state.paymentMethods
        .filter(pm => pm.method === 'CASH')
        .reduce((sum, pm) => sum + pm.amount, 0),
    
    getTotalCardPayments: () =>
      state.paymentMethods
        .filter(pm => pm.method === 'CARD')
        .reduce((sum, pm) => sum + pm.amount, 0)
  };
}
