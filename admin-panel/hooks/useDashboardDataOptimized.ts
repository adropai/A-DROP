'use client'

import useSWR from 'swr'
import { message } from 'antd'
import { useState, useCallback } from 'react'

// SWR Configuration
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 30000, // 30 seconds
  dedupingInterval: 5000, // 5 seconds
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  onError: (error: any) => {
    console.error('SWR Error:', error)
    message.error('خطا در بارگذاری داده‌ها')
  },
  onSuccess: () => {
    // Optional success callback
  }
}

// Fetcher function with caching headers
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'max-age=300', // 5 minutes cache
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// Stats hook with SWR
export const useStats = () => {
  const { data, error, mutate, isLoading } = useSWR(
    '/api/stats/overview',
    fetcher,
    swrConfig
  )

  return {
    stats: data,
    loading: isLoading,
    error: error?.message,
    refreshStats: mutate,
    lastUpdate: data ? new Date() : new Date()
  }
}

// Orders hook with SWR
export const useOrders = () => {
  const { data, error, mutate, isLoading } = useSWR(
    '/api/orders/recent',
    fetcher,
    swrConfig
  )

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      // Optimistic update
      const currentData = data || { orders: [] }
      const updatedOrders = currentData.orders.map((order: any) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
      
      // Update cache immediately
      mutate({ ...currentData, orders: updatedOrders }, false)
      
      // Make API call
      const response = await fetch(`/api/orders/recent`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Revalidate data
      mutate()
      message.success('وضعیت سفارش به‌روزرسانی شد')
    } catch (error) {
      // Revert optimistic update on error
      mutate()
      message.error('خطا در به‌روزرسانی وضعیت سفارش')
      throw error
    }
  }, [data, mutate])

  return {
    orders: data?.orders || [],
    loading: isLoading,
    error: error?.message,
    refreshOrders: mutate,
    updateOrderStatus,
    lastUpdate: data ? new Date() : new Date()
  }
}

// Combined dashboard hook
export const useDashboardDataOptimized = () => {
  const statsHook = useStats()
  const ordersHook = useOrders()
  const [componentError, setComponentError] = useState<string | null>(null)

  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        statsHook.refreshStats(),
        ordersHook.refreshOrders()
      ])
      setComponentError(null)
    } catch (error) {
      setComponentError('خطا در به‌روزرسانی داده‌ها')
    }
  }, [statsHook.refreshStats, ordersHook.refreshOrders])

  const handleError = useCallback((error: any, context?: string) => {
    const errorMessage = context ? `${context}: ${error.message}` : error.message
    setComponentError(errorMessage)
    console.error('Dashboard Error:', error)
  }, [])

  const clearError = useCallback(() => {
    setComponentError(null)
  }, [])

  return {
    // Stats
    stats: statsHook.stats,
    // Orders
    orders: ordersHook.orders,
    updateOrderStatus: ordersHook.updateOrderStatus,
    // Loading states
    loading: statsHook.loading || ordersHook.loading,
    // Errors
    error: statsHook.error || ordersHook.error,
    componentError,
    handleError,
    clearError,
    // Actions
    refreshData,
    lastUpdate: statsHook.lastUpdate > ordersHook.lastUpdate ? statsHook.lastUpdate : ordersHook.lastUpdate
  }
}

export default useDashboardDataOptimized
