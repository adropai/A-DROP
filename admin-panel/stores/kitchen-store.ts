// ===============================================
// 🧑‍🍳 Zustand Store برای مدیریت وضعیت آشپزخانه
// ===============================================

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  KitchenOrder, 
  KitchenOrderItem, 
  KitchenStatus, 
  OrderPriority, 
  FoodCategory,
  KitchenFilters, 
  KitchenStats, 
  KitchenSettings,
  KitchenQueue,
  KitchenNotification
} from '@/types/kitchen'

interface KitchenStore {
  // State
  orders: KitchenOrder[]
  activeOrders: KitchenOrder[]
  completedOrders: KitchenOrder[]
  queue: KitchenQueue
  stats: KitchenStats | null
  settings: KitchenSettings
  notifications: KitchenNotification[]
  filters: KitchenFilters
  loading: boolean
  error: string | null
  
  // Real-time connection
  isConnected: boolean
  lastUpdate: Date | null

  // Actions - Data Fetching
  fetchOrders: (filters?: KitchenFilters) => Promise<void>
  fetchStats: () => Promise<void>
  fetchSettings: () => Promise<void>
  
  // Actions - Order Management
  updateOrderStatus: (orderId: string, status: KitchenStatus, notes?: string) => Promise<void>
  updateItemStatus: (orderId: string, itemId: string, status: KitchenStatus) => Promise<void>
  setPriority: (orderId: string, priority: OrderPriority, reason?: string) => Promise<void>
  addOrderNote: (orderId: string, note: string) => Promise<void>
  markDelay: (orderId: string, delayMinutes: number, reason: string) => Promise<void>
  bulkUpdateStatus: (orderIds: string[], status: KitchenStatus) => Promise<void>
  
  // Actions - Queue Management
  organizeQueue: () => void
  getOrdersByCategory: (category: FoodCategory) => KitchenOrder[]
  getOrdersByStatus: (status: KitchenStatus) => KitchenOrder[]
  
  // Actions - Filters & Search
  setFilters: (filters: Partial<KitchenFilters>) => void
  clearFilters: () => void
  searchOrders: (query: string) => KitchenOrder[]
  
  // Actions - Settings
  updateSettings: (settings: Partial<KitchenSettings>) => Promise<void>
  
  // Actions - Notifications
  addNotification: (notification: Omit<KitchenNotification, 'id' | 'timestamp'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  
  // Actions - Real-time
  connectWebSocket: () => void
  disconnectWebSocket: () => void
  
  // Utility Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  refreshData: () => Promise<void>
}

export const useKitchenStore = create<KitchenStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      orders: [],
      activeOrders: [],
      completedOrders: [],
      queue: {
        appetizers: [],
        mainCourses: [],
        desserts: [],
        drinks: [],
        sides: []
      },
      stats: null,
      settings: {
        autoRefreshInterval: 30,
        soundNotifications: true,
        showCustomerInfo: true,
        showTableInfo: true,
        displayMode: 'DETAILED',
        alertDelayThreshold: 15,
        maxOrdersPerView: 20,
        defaultPreparationTimes: {
          APPETIZER: 10,
          MAIN_COURSE: 25,
          DESSERT: 15,
          DRINK: 5,
          SIDE: 8
        },
        priorityColors: {
          LOW: '#52c41a',
          NORMAL: '#1890ff',
          HIGH: '#faad14',
          URGENT: '#ff4d4f'
        },
        statusColors: {
          RECEIVED: '#722ed1',
          PREPARING: '#fa8c16',
          READY: '#52c41a',
          SERVED: '#8c8c8c'
        }
      },
      notifications: [],
      filters: {},
      loading: false,
      error: null,
      isConnected: false,
      lastUpdate: null,

      // Data Fetching Actions
      fetchOrders: async (filters = {}) => {
        set({ loading: true, error: null })
        
        try {
          const params = new URLSearchParams()
          
          // اضافه کردن فیلترها
          Object.entries({ ...get().filters, ...filters }).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v))
              } else {
                params.set(key, value.toString())
              }
            }
          })
          
          const response = await fetch(`/api/kitchen/orders-simple?${params}`)
          const result = await response.json()
          
          if (result.success) {
            const orders = result.data.orders || []
            
            set({
              orders,
              activeOrders: orders.filter((order: KitchenOrder) => 
                ['RECEIVED', 'PREPARING', 'READY'].includes(order.status)
              ),
              completedOrders: orders.filter((order: KitchenOrder) => 
                order.status === 'SERVED'
              ),
              lastUpdate: new Date(),
              filters: { ...get().filters, ...filters }
            })
            
            // سازماندهی صف
            get().organizeQueue()
          } else {
            set({ error: result.error || 'خطا در دریافت سفارشات' })
          }
        } catch (error) {
          set({ error: 'خطا در ارتباط با سرور' })
        } finally {
          set({ loading: false })
        }
      },

      fetchStats: async () => {
        try {
          const response = await fetch('/api/kitchen/stats')
          const result = await response.json()
          
          if (result.success) {
            set({ stats: result.data })
          }
        } catch (error) {
          // خطا در دریافت آمار
        }
      },

      fetchSettings: async () => {
        try {
          const response = await fetch('/api/kitchen/settings')
          const result = await response.json()
          
          if (result.success) {
            set({ settings: { ...get().settings, ...result.data } })
          }
        } catch (error) {
          // خطا در دریافت تنظیمات
        }
      },

      // Order Management Actions
      updateOrderStatus: async (orderId: string, status: KitchenStatus, notes?: string) => {
        try {
          const response = await fetch(`/api/kitchen/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, notes })
          })
          
          const result = await response.json()
          
          if (result.success) {
            // به‌روزرسانی وضعیت در store
            set(state => ({
              orders: state.orders.map(order =>
                order.id === orderId 
                  ? { ...order, status, notes: notes || order.notes }
                  : order
              )
            }))
            
            // ارسال نوتیفیکیشن
            get().addNotification({
              type: 'SUCCESS',
              title: 'وضعیت سفارش تغییر یافت',
              message: `سفارش #${orderId.slice(-6)} به وضعیت ${status} تغییر یافت`,
              priority: 'MEDIUM',
              read: false
            })
            
            // رفرش داده‌ها
            await get().fetchOrders()
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          get().addNotification({
            type: 'ERROR',
            title: 'خطا در تغییر وضعیت',
            message: 'امکان تغییر وضعیت سفارش وجود ندارد',
            priority: 'HIGH',
            read: false
          })
        }
      },

      updateItemStatus: async (orderId: string, itemId: string, status: KitchenStatus) => {
        try {
          const response = await fetch(`/api/kitchen/orders/${orderId}/items/${itemId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          })
          
          const result = await response.json()
          
          if (result.success) {
            // به‌روزرسانی آیتم در store
            set(state => ({
              orders: state.orders.map(order =>
                order.id === orderId 
                  ? {
                      ...order,
                      items: order.items.map(item =>
                        item.id === itemId ? { ...item, status } : item
                      )
                    }
                  : order
              )
            }))
            
            await get().fetchOrders()
          }
        } catch (error) {
          console.error('خطا در تغییر وضعیت آیتم:', error)
        }
      },

      setPriority: async (orderId: string, priority: OrderPriority, reason?: string) => {
        try {
          const response = await fetch(`/api/kitchen/orders/${orderId}/priority`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority, reason })
          })
          
          if (response.ok) {
            set(state => ({
              orders: state.orders.map(order =>
                order.id === orderId ? { ...order, priority } : order
              )
            }))
            
            await get().fetchOrders()
          }
        } catch (error) {
          console.error('خطا در تنظیم اولویت:', error)
        }
      },

      addOrderNote: async (orderId: string, note: string) => {
        try {
          const response = await fetch(`/api/kitchen/orders/${orderId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note })
          })
          
          if (response.ok) {
            await get().fetchOrders()
          }
        } catch (error) {
          console.error('خطا در افزودن یادداشت:', error)
        }
      },

      markDelay: async (orderId: string, delayMinutes: number, reason: string) => {
        try {
          const response = await fetch(`/api/kitchen/orders/${orderId}/delay`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delayMinutes, reason })
          })
          
          if (response.ok) {
            await get().fetchOrders()
          }
        } catch (error) {
          console.error('خطا در ثبت تاخیر:', error)
        }
      },

      bulkUpdateStatus: async (orderIds: string[], status: KitchenStatus) => {
        try {
          const response = await fetch('/api/kitchen/orders/bulk-status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIds, status })
          })
          
          if (response.ok) {
            await get().fetchOrders()
          }
        } catch (error) {
          console.error('خطا در به‌روزرسانی گروهی:', error)
        }
      },

      // Queue Management
      organizeQueue: () => {
        const orders = get().activeOrders
        
        const queue: KitchenQueue = {
          appetizers: orders.filter(order => 
            order.items.some(item => item.category === 'APPETIZER')
          ),
          mainCourses: orders.filter(order => 
            order.items.some(item => item.category === 'MAIN_COURSE')
          ),
          desserts: orders.filter(order => 
            order.items.some(item => item.category === 'DESSERT')
          ),
          drinks: orders.filter(order => 
            order.items.some(item => item.category === 'DRINK')
          ),
          sides: orders.filter(order => 
            order.items.some(item => item.category === 'SIDE')
          )
        }
        
        set({ queue })
      },

      getOrdersByCategory: (category: FoodCategory) => {
        return get().orders.filter(order =>
          order.items.some(item => item.category === category)
        )
      },

      getOrdersByStatus: (status: KitchenStatus) => {
        return get().orders.filter(order => order.status === status)
      },

      // Filters & Search
      setFilters: (filters: Partial<KitchenFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...filters }
        }))
        get().fetchOrders()
      },

      clearFilters: () => {
        set({ filters: {} })
        get().fetchOrders()
      },

      searchOrders: (query: string) => {
        const orders = get().orders
        return orders.filter(order =>
          order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
          order.customer?.name.toLowerCase().includes(query.toLowerCase()) ||
          order.customer?.phone?.includes(query) ||
          order.table?.number.includes(query)
        )
      },

      // Settings
      updateSettings: async (settings: Partial<KitchenSettings>) => {
        try {
          const response = await fetch('/api/kitchen/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
          })
          
          if (response.ok) {
            set(state => ({
              settings: { ...state.settings, ...settings }
            }))
          }
        } catch (error) {
          console.error('خطا در به‌روزرسانی تنظیمات:', error)
        }
      },

      // Notifications
      addNotification: (notification) => {
        const newNotification: KitchenNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date()
        }
        
        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50)
        }))
        
        // پخش صدای اعلان
        if (get().settings.soundNotifications) {
          // اینجا می‌توان صدای اعلان پخش کرد
        }
      },

      markNotificationRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      // Real-time WebSocket (پیاده‌سازی در آینده)
      connectWebSocket: () => {
        // اتصال WebSocket برای دریافت سفارشات real-time
        set({ isConnected: true })
      },

      disconnectWebSocket: () => {
        set({ isConnected: false })
      },

      // Utility
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),

      refreshData: async () => {
        await Promise.all([
          get().fetchOrders(),
          get().fetchStats(),
          get().fetchSettings()
        ])
      }
    }),
    { name: 'kitchen-store' }
  )
)
