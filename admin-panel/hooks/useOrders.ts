import useSWR from 'swr'
import { Order, OrderStatus } from '../types/orders'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useOrders(status?: OrderStatus) {
  const url = status ? `/api/orders?status=${status}` : '/api/orders'
  
  const { data, error, mutate } = useSWR(url, fetcher, {
    refreshInterval: 30000, // به‌روزرسانی هر 30 ثانیه
    revalidateOnFocus: true,
  })

  return {
    orders: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
    total: data?.count || 0
  }
}

export function useOrderStats() {
  const { data, error } = useSWR('/api/orders/stats', fetcher, {
    refreshInterval: 60000, // به‌روزرسانی هر دقیقه
  })

  return {
    stats: data?.data || {
      total: 0,
      new: 0,
      preparing: 0,
      ready: 0,
      delivered: 0
    },
    isLoading: !error && !data,
    isError: error
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error('خطا در به‌روزرسانی وضعیت سفارش')
  }

  return response.json()
}
