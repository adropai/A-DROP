import useSWR, { SWRConfiguration, mutate } from 'swr'
import { message } from 'antd'

// API fetcher with error handling
const fetcher = async (url: string) => {
  const res = await fetch(url)
  
  if (!res.ok) {
    const error = new Error('خطا در دریافت داده‌ها')
    error.message = res.statusText
    throw error
  }
  
  return res.json()
}

// Default SWR configuration
const defaultConfig: SWRConfiguration = {
  refreshInterval: 30000, // 30 seconds
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 10000, // 10 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  onError: (error) => {
    message.error('خطا در بارگذاری داده‌ها')
  }
}

// Custom hooks for different data types
export const useDashboardStats = () => {
  return useSWR('/api/dashboard/stats', fetcher, {
    ...defaultConfig,
    refreshInterval: 60000, // 1 minute for stats
  })
}

export const useOrders = (filters?: any) => {
  const params = filters ? `?${new URLSearchParams(filters).toString()}` : ''
  return useSWR(`/api/orders${params}`, fetcher, {
    ...defaultConfig,
    refreshInterval: 15000, // 15 seconds for orders
  })
}

export const useMenuItems = (filters?: any) => {
  const params = filters ? `?${new URLSearchParams(filters).toString()}` : ''
  return useSWR(`/api/menu/items${params}`, fetcher, {
    ...defaultConfig,
    refreshInterval: 300000, // 5 minutes for menu items
  })
}

export const useCustomers = (filters?: any) => {
  const params = filters ? `?${new URLSearchParams(filters).toString()}` : ''
  return useSWR(`/api/customers${params}`, fetcher, {
    ...defaultConfig,
    refreshInterval: 120000, // 2 minutes for customers
  })
}

export const useInventory = () => {
  return useSWR('/api/inventory', fetcher, {
    ...defaultConfig,
    refreshInterval: 300000, // 5 minutes for inventory
  })
}

export const useReservations = (date?: string) => {
  const params = date ? `?date=${date}` : ''
  return useSWR(`/api/reservations${params}`, fetcher, {
    ...defaultConfig,
    refreshInterval: 60000, // 1 minute for reservations
  })
}

export const useAnalytics = (period: string) => {
  return useSWR(`/api/analytics?period=${period}`, fetcher, {
    ...defaultConfig,
    refreshInterval: 600000, // 10 minutes for analytics
  })
}

export const useMarketingCampaigns = () => {
  return useSWR('/api/marketing/campaigns', fetcher, {
    ...defaultConfig,
    refreshInterval: 300000, // 5 minutes for campaigns
  })
}

export const useAITrainingData = () => {
  return useSWR('/api/ai/training', fetcher, {
    ...defaultConfig,
    refreshInterval: 600000, // 10 minutes for AI data
  })
}

export const useSettings = () => {
  return useSWR('/api/settings', fetcher, {
    ...defaultConfig,
    refreshInterval: 0, // No auto refresh for settings
    revalidateOnFocus: false,
  })
}

// Utility function to preload data
export const preloadData = (url: string) => {
  return fetcher(url)
}

// Cache management utilities
export const invalidateCache = (key: string) => {
  return mutate(key)
}

export const invalidateAllCache = () => {
  return mutate(() => true)
}

export default fetcher
