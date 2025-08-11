import { useState, useEffect, useCallback, useRef } from 'react';

interface KitchenOrder {
  id: number;
  orderNumber: string;
  tableNumber?: number;
  customerName?: string;
  status: 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  items: KitchenOrderItem[];
  createdAt: string;
  estimatedCompletionTime: string;
  specialRequests?: string;
}

interface KitchenOrderItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  notes?: string;
  status: 'PENDING' | 'PREPARING' | 'COMPLETED';
  station: string;
  preparationTime: number;
  startedAt?: string;
  completedAt?: string;
}

interface Timer {
  itemId: number;
  orderId: number;
  startTime: Date;
  estimatedEndTime: Date;
  remainingTime: number;
  progress: number;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'OVERDUE';
  station: string;
}

interface KitchenState {
  orders: KitchenOrder[];
  timers: Timer[];
  queue: any[];
  notifications: any[];
  stats: {
    activeOrders: number;
    overdueItems: number;
    avgCompletionTime: number;
    stationWorkload: Record<string, number>;
  };
}

export function useKitchen(station?: string) {
  const [state, setState] = useState<KitchenState>({
    orders: [],
    timers: [],
    queue: [],
    notifications: [],
    stats: {
      activeOrders: 0,
      overdueItems: 0,
      avgCompletionTime: 0,
      stationWorkload: {}
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // اتصال WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      // در پروژه واقعی از WebSocket سرور استفاده کنید
      // ws.current = new WebSocket('ws://localhost:3001/kitchen');
      
      // شبیه‌سازی اتصال
      setConnected(true);
      console.log('Kitchen WebSocket connected');

      // شبیه‌سازی دریافت پیام‌ها
      // ws.current.onmessage = (event) => {
      //   const data = JSON.parse(event.data);
      //   handleWebSocketMessage(data);
      // };

      // ws.current.onclose = () => {
      //   setConnected(false);
      //   console.log('Kitchen WebSocket disconnected');
      //   setTimeout(connectWebSocket, 3000); // تلاش مجدد
      // };

    } catch (error) {
      console.error('خطا در اتصال WebSocket:', error);
      setConnected(false);
    }
  }, []);

  // دریافت داده‌های آشپزخانه
  const fetchKitchenData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // دریافت سفارشات
      const ordersResponse = await fetch(`/api/kitchen${station ? `?station=${station}` : ''}`);
      const ordersData = await ordersResponse.json();

      // دریافت صف
      const queueResponse = await fetch(`/api/kitchen/queue${station ? `?station=${station}` : ''}`);
      const queueData = await queueResponse.json();

      // دریافت تایمرها
      const timersResponse = await fetch(`/api/kitchen/timers${station ? `?station=${station}` : ''}`);
      const timersData = await timersResponse.json();

      if (ordersData.success && queueData.success && timersData.success) {
        setState(prev => ({
          ...prev,
          orders: ordersData.data.orders || [],
          queue: queueData.data.queue || [],
          timers: updateTimers(timersData.data.timers || []),
          stats: {
            activeOrders: ordersData.data.stats?.activeOrders || 0,
            overdueItems: timersData.data.stats?.overdue || 0,
            avgCompletionTime: ordersData.data.stats?.avgCompletionTime || 0,
            stationWorkload: queueData.data.stats?.stationWorkload || {}
          }
        }));
      } else {
        throw new Error('خطا در دریافت داده‌ها');
      }

    } catch (error) {
      console.error('خطا در دریافت داده‌های آشپزخانه:', error);
      setError('خطا در دریافت داده‌ها');
    } finally {
      setLoading(false);
    }
  }, [station]);

  // آپدیت تایمرها
  const updateTimers = useCallback((timers: Timer[]) => {
    const now = new Date();
    
    return timers.map(timer => {
      const elapsed = now.getTime() - timer.startTime.getTime();
      const total = timer.estimatedEndTime.getTime() - timer.startTime.getTime();
      const remainingTime = Math.max(0, timer.estimatedEndTime.getTime() - now.getTime());
      const progress = Math.min(100, (elapsed / total) * 100);
      
      let status = timer.status;
      if (remainingTime === 0 && status === 'RUNNING') {
        status = 'OVERDUE';
      }

      return {
        ...timer,
        remainingTime,
        progress,
        status
      };
    });
  }, []);

  // شروع تایمر آیتم
  const startTimer = useCallback(async (itemId: number, orderId: number) => {
    try {
      const response = await fetch('/api/kitchen/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          itemId,
          orderId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // آپدیت local state
        setState(prev => ({
          ...prev,
          notifications: [...prev.notifications, {
            id: Date.now(),
            type: 'success',
            message: 'تایمر آغاز شد',
            timestamp: new Date()
          }]
        }));
        
        await fetchKitchenData();
      }

    } catch (error) {
      console.error('خطا در شروع تایمر:', error);
      setError('خطا در شروع تایمر');
    }
  }, [fetchKitchenData]);

  // تکمیل آیتم
  const completeItem = useCallback(async (itemId: number, orderId: number) => {
    try {
      const response = await fetch('/api/kitchen/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          itemId,
          orderId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          notifications: [...prev.notifications, {
            id: Date.now(),
            type: 'success',
            message: 'آیتم تکمیل شد',
            timestamp: new Date()
          }]
        }));
        
        await fetchKitchenData();
      }

    } catch (error) {
      console.error('خطا در تکمیل آیتم:', error);
      setError('خطا در تکمیل آیتم');
    }
  }, [fetchKitchenData]);

  // تغییر اولویت
  const changePriority = useCallback(async (orderId: number, priority: string) => {
    try {
      const response = await fetch('/api/kitchen/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'priority',
          targetOrderId: orderId,
          priority
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchKitchenData();
      }

    } catch (error) {
      console.error('خطا در تغییر اولویت:', error);
      setError('خطا در تغییر اولویت');
    }
  }, [fetchKitchenData]);

  // چاپ سفارش
  const printOrder = useCallback(async (orderId: number, type: string = 'KITCHEN_ORDER') => {
    try {
      const response = await fetch('/api/kitchen/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          type,
          station
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          notifications: [...prev.notifications, {
            id: Date.now(),
            type: 'success',
            message: 'سفارش چاپ شد',
            timestamp: new Date()
          }]
        }));
      }

    } catch (error) {
      console.error('خطا در چاپ:', error);
      setError('خطا در چاپ');
    }
  }, [station]);

  // پاک کردن notification
  const clearNotification = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  }, []);

  // راه‌اندازی interval برای آپدیت تایمرها
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        timers: updateTimers(prev.timers)
      }));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateTimers]);

  // راه‌اندازی اولیه
  useEffect(() => {
    fetchKitchenData();
    connectWebSocket();

    // auto-refresh هر 30 ثانیه
    const refreshInterval = setInterval(fetchKitchenData, 30000);

    return () => {
      clearInterval(refreshInterval);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [fetchKitchenData, connectWebSocket]);

  return {
    // State
    orders: state.orders,
    timers: state.timers,
    queue: state.queue,
    notifications: state.notifications,
    stats: state.stats,
    loading,
    error,
    connected,

    // Actions
    startTimer,
    completeItem,
    changePriority,
    printOrder,
    clearNotification,
    refresh: fetchKitchenData,

    // Utils
    getOrdersByStation: (stationName: string) => 
      state.orders.filter(order => 
        order.items.some(item => item.station === stationName)
      ),
    
    getTimersByStation: (stationName: string) =>
      state.timers.filter(timer => timer.station === stationName),
    
    getOverdueItems: () =>
      state.timers.filter(timer => timer.status === 'OVERDUE'),
    
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60000);
      const secs = Math.floor((seconds % 60000) / 1000);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };
}
