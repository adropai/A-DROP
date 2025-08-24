import { create } from 'zustand'

// Types for Analytics
export interface SalesDataPoint {
  date: string
  amount: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
}

export interface PopularItem {
  name: string
  count: number
  percentage: number
}

export interface OrderStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  completedOrders: number
  cancelledOrders: number
  successRate: number
  avgPreparationTime: number
  netRevenue: number
  totalDiscounts: number
  totalTax: number
  profitMargin: number
  revenueGrowth: number
  ordersGrowth: number
  avgOrderGrowth: number
}

export interface CustomerStats {
  totalCustomers: number
  newCustomers: number
  activeCustomers: number
  returnRate: number
  avgLifetimeValue: number
  customerGrowth: number
}

interface AnalyticsStore {
  // State
  salesData: SalesDataPoint[]
  revenueData: RevenueDataPoint[]
  orderStats: OrderStats | null
  customerStats: CustomerStats | null
  popularItems: PopularItem[]
  loading: boolean
  error: string | null

  // Actions
  fetchSalesData: (startDate: string, endDate: string, period: string) => Promise<void>
  fetchRevenueData: (startDate: string, endDate: string, period: string) => Promise<void>
  fetchOrderStats: (startDate: string, endDate: string) => Promise<void>
  fetchCustomerStats: (startDate: string, endDate: string) => Promise<void>
  fetchPopularItems: (startDate: string, endDate: string) => Promise<void>
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  // Initial State
  salesData: [],
  revenueData: [],
  orderStats: null,
  customerStats: null,
  popularItems: [],
  loading: false,
  error: null,

  // Actions
  fetchSalesData: async (startDate, endDate, period) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/analytics?type=sales&startDate=${startDate}&endDate=${endDate}&period=${period}`)
      if (!response.ok) throw new Error('Failed to fetch sales data')
      const result = await response.json()
      set({ salesData: result.data, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchRevenueData: async (startDate, endDate, period) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/analytics?type=overview&startDate=${startDate}&endDate=${endDate}`)
      if (!response.ok) throw new Error('Failed to fetch revenue data')
      const result = await response.json()
      set({ 
        revenueData: result.data.salesData,
        orderStats: result.data.overview,
        loading: false 
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchOrderStats: async (startDate, endDate) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/analytics?type=overview&startDate=${startDate}&endDate=${endDate}`)
      if (!response.ok) throw new Error('Failed to fetch order stats')
      const result = await response.json()
      set({ orderStats: result.data.overview, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchCustomerStats: async (startDate, endDate) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/analytics?type=customers&startDate=${startDate}&endDate=${endDate}`)
      if (!response.ok) throw new Error('Failed to fetch customer stats')
      const result = await response.json()
      set({ customerStats: result.data, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchPopularItems: async (startDate, endDate) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/analytics?type=overview&startDate=${startDate}&endDate=${endDate}`)
      if (!response.ok) throw new Error('Failed to fetch popular items')
      const result = await response.json()
      set({ popularItems: result.data.popularItems, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}))

// Initialize store data on first import
if (typeof window !== 'undefined') {
  const store = useAnalyticsStore.getState()
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  store.fetchSalesData(weekAgo, today, 'daily')
  store.fetchRevenueData(weekAgo, today, 'daily')
  store.fetchOrderStats(weekAgo, today)
  store.fetchCustomerStats(weekAgo, today)
  store.fetchPopularItems(weekAgo, today)
}
