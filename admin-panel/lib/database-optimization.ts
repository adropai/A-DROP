'use client'

import useSWR, { mutate } from 'swr'
import { message } from 'antd'

// Database optimization utilities
export class DatabaseOptimizer {
  private static cache = new Map()
  private static batchQueue = new Map()
  private static batchTimeouts = new Map()

  // Batch API calls to reduce database queries
  static batchCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    delay: number = 50
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batchQueue.has(key)) {
        this.batchQueue.set(key, [])
      }

      this.batchQueue.get(key).push({ resolve, reject })

      // Clear existing timeout
      if (this.batchTimeouts.has(key)) {
        clearTimeout(this.batchTimeouts.get(key))
      }

      // Set new timeout
      const timeout = setTimeout(async () => {
        const queue = this.batchQueue.get(key) || []
        this.batchQueue.delete(key)
        this.batchTimeouts.delete(key)

        try {
          const result = await apiCall()
          queue.forEach(({ resolve }) => resolve(result))
        } catch (error) {
          queue.forEach(({ reject }) => reject(error))
        }
      }, delay)

      this.batchTimeouts.set(key, timeout)
    })
  }

  // Optimistic updates
  static optimisticUpdate<T>(
    key: string,
    newData: T,
    apiCall: () => Promise<T>
  ) {
    // Immediately update cache
    mutate(key, newData, false)

    // Perform actual API call
    return apiCall()
      .then((result) => {
        mutate(key, result)
        return result
      })
      .catch((error) => {
        // Revert on error
        mutate(key)
        message.error('خطا در ذخیره اطلاعات')
        throw error
      })
  }

  // Intelligent prefetching
  static prefetch(keys: string[], fetcher: (key: string) => Promise<any>) {
    keys.forEach((key) => {
      if (!this.cache.has(key)) {
        this.cache.set(key, true)
        mutate(key, fetcher(key))
      }
    })
  }

  // Memory management
  static clearCache(pattern?: string) {
    if (pattern) {
      // Clear specific pattern
      const keys = Array.from(this.cache.keys()).filter(key => 
        key.includes(pattern)
      )
      keys.forEach(key => {
        this.cache.delete(key)
        mutate(key, undefined, false)
      })
    } else {
      // Clear all cache
      this.cache.clear()
      mutate(() => true, undefined, false)
    }
  }
}

// Optimized menu hooks with database optimization
export const useOptimizedMenu = () => {
  const { data, error, isLoading, mutate: mutateFn } = useSWR(
    '/api/menu/optimized',
    () => DatabaseOptimizer.batchCall(
      'menu-batch',
      () => fetch('/api/menu?include=categories,items,pricing').then(r => r.json())
    ),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      staleTime: 60000, // 1 minute
    }
  )

  const updateMenuItem = async (id: string, data: any) => {
    return DatabaseOptimizer.optimisticUpdate(
      '/api/menu/optimized',
      {
        ...data,
        items: data.items?.map((item: any) => 
          item.id === id ? { ...item, ...data } : item
        )
      },
      () => fetch(`/api/menu/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json())
    )
  }

  return {
    menu: data,
    isLoading,
    error,
    updateMenuItem,
    refreshMenu: mutateFn
  }
}

// Optimized orders with pagination and filtering
export const useOptimizedOrders = (params: {
  page?: number
  status?: string
  dateRange?: [string, string]
  limit?: number
}) => {
  const queryKey = `/api/orders/optimized?${new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
    ...(params.status && { status: params.status }),
    ...(params.dateRange && { 
      startDate: params.dateRange[0],
      endDate: params.dateRange[1]
    })
  })}`

  const { data, error, isLoading } = useSWR(
    queryKey,
    () => DatabaseOptimizer.batchCall(
      `orders-batch-${params.page}`,
      () => fetch(queryKey).then(r => r.json())
    ),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds for orders
      staleTime: 15000, // 15 seconds
    }
  )

  const updateOrderStatus = async (orderId: string, status: string) => {
    return DatabaseOptimizer.optimisticUpdate(
      queryKey,
      {
        ...data,
        orders: data?.orders?.map((order: any) =>
          order.id === orderId ? { ...order, status } : order
        )
      },
      () => fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).then(r => r.json())
    )
  }

  return {
    orders: data?.orders || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    updateOrderStatus
  }
}

// Optimized analytics with smart caching
export const useOptimizedAnalytics = (timeRange: string = '7d') => {
  const { data, error, isLoading } = useSWR(
    `/api/analytics/optimized?range=${timeRange}`,
    () => DatabaseOptimizer.batchCall(
      `analytics-batch-${timeRange}`,
      () => fetch(`/api/analytics?range=${timeRange}&aggregate=true`).then(r => r.json())
    ),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes for analytics
      staleTime: 600000, // 10 minutes
    }
  )

  return {
    analytics: data,
    isLoading,
    error
  }
}

// Intelligent prefetching hook
export const usePrefetcher = () => {
  const prefetchRelatedData = (currentPage: string) => {
    const prefetchMap: Record<string, string[]> = {
      'dashboard': ['/api/analytics/optimized?range=7d', '/api/orders/optimized?limit=5'],
      'orders': ['/api/menu/optimized', '/api/customers/recent'],
      'menu': ['/api/inventory/low-stock', '/api/analytics/menu-performance'],
      'customers': ['/api/orders/optimized?limit=10', '/api/analytics/customers'],
    }

    const keys = prefetchMap[currentPage] || []
    DatabaseOptimizer.prefetch(keys, (key) => fetch(key).then(r => r.json()))
  }

  return { prefetchRelatedData }
}

// Cache management hook
export const useCacheManager = () => {
  const clearCache = (pattern?: string) => {
    DatabaseOptimizer.clearCache(pattern)
    message.success(pattern ? `کش ${pattern} پاک شد` : 'تمام کش پاک شد')
  }

  const refreshData = (keys: string[]) => {
    keys.forEach(key => mutate(key))
    message.success('اطلاعات به‌روزرسانی شد')
  }

  return {
    clearCache,
    refreshData
  }
}
