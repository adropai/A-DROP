import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  Delivery, 
  Courier, 
  Address,
  DeliveryStats,
  DeliveryFilter,
  DeliveryForm,
  DeliveryUpdateForm,
  CourierForm,
  AddressForm,
  AssignCourierRequest,
  DeliveryReport,
  DeliveryStatus,
  CourierStatus
} from '@/types/delivery'

interface DeliveryStore {
  // State
  deliveries: Delivery[]
  couriers: Courier[]
  addresses: Address[]
  stats: DeliveryStats | null
  report: DeliveryReport | null
  loading: boolean
  error: string | null
  
  // Pagination
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }

  // Filters
  filters: DeliveryFilter
  
  // Selected
  selectedDelivery: Delivery | null
  selectedCourier: Courier | null

  // Actions - Deliveries
  fetchDeliveries: (filters?: DeliveryFilter) => Promise<void>
  createDelivery: (data: DeliveryForm) => Promise<void>
  updateDelivery: (id: string, data: DeliveryUpdateForm) => Promise<void>
  deleteDelivery: (id: string) => Promise<void>
  assignCourier: (data: AssignCourierRequest) => Promise<void>
  updateDeliveryStatus: (id: string, status: string) => Promise<void>
  
  // Actions - Couriers
  fetchCouriers: () => Promise<void>
  createCourier: (data: CourierForm) => Promise<void>
  updateCourier: (id: string, data: Partial<CourierForm>) => Promise<void>
  deleteCourier: (id: string) => Promise<void>
  updateCourierStatus: (id: string, status: string) => Promise<void>
  updateCourierLocation: (id: string, latitude: number, longitude: number) => Promise<void>
  
  // Actions - Addresses
  fetchAddresses: (customerId?: string) => Promise<void>
  createAddress: (data: AddressForm) => Promise<void>
  updateAddress: (id: string, data: Partial<AddressForm>) => Promise<void>
  deleteAddress: (id: string) => Promise<void>
  
  // Actions - Stats & Reports
  fetchStats: (period?: string) => Promise<void>
  fetchReport: (period: string, dateFrom?: Date, dateTo?: Date) => Promise<void>
  
  // Actions - Utilities
  setFilters: (filters: Partial<DeliveryFilter>) => void
  clearFilters: () => void
  setSelectedDelivery: (delivery: Delivery | null) => void
  setSelectedCourier: (courier: Courier | null) => void
  setPagination: (page: number, limit?: number) => void
  clearError: () => void
}

export const useDeliveryStore = create<DeliveryStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      deliveries: [],
      couriers: [],
      addresses: [],
      stats: null,
      report: null,
      loading: false,
      error: null,
      
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },

      filters: {},
      selectedDelivery: null,
      selectedCourier: null,

      // Actions - Deliveries
      fetchDeliveries: async (filters?: DeliveryFilter) => {
        try {
          set({ loading: true, error: null })
          
          const { pagination } = get()
          const params = new URLSearchParams()
          params.append('page', pagination.page.toString())
          params.append('limit', pagination.limit.toString())
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                value.forEach((v) => params.append(key, String(v)))
              } else if (value instanceof Date) {
                params.append(key, value.toISOString())
              } else if (value !== undefined) {
                params.append(key, String(value))
              }
            })
          }

          const response = await fetch(`/api/delivery?${params.toString()}`)

          if (!response.ok) {
            throw new Error('خطا در دریافت تحویلات')
          }

          const data = await response.json()

          if (data.success) {
            set({ 
              deliveries: data.data.map((d: any) => ({
                ...d,
                status: d.status as DeliveryStatus,
              })),
              pagination: {
                ...pagination,
                total: data.pagination.total,
                totalPages: data.pagination.pages
              }
            })
          } else {
            throw new Error(data.error || 'خطا در دریافت تحویلات')
          }
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ loading: false })
        }
      },

      createDelivery: async (data: DeliveryForm) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch('/api/delivery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) {
            throw new Error('خطا در ایجاد تحویل')
          }

          const result = await response.json()
          
          if (result.success) {
            // Refresh deliveries
            await get().fetchDeliveries()
          } else {
            throw new Error(result.error || 'خطا در ایجاد تحویل')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updateDelivery: async (id: string, data: DeliveryUpdateForm) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch(`/api/delivery/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) {
            throw new Error('خطا در ویرایش تحویل')
          }

          const result = await response.json()
          
          if (result.success) {
            // Update local state
            set(state => ({
              deliveries: state.deliveries.map(delivery => 
                delivery.id === id ? { ...delivery, ...data } : delivery
              )
            }))
          } else {
            throw new Error(result.error || 'خطا در ویرایش تحویل')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      deleteDelivery: async (id: string) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch(`/api/delivery/${id}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('خطا در حذف تحویل')
          }

          const result = await response.json()
          
          if (result.success) {
            // Remove from local state
            set(state => ({
              deliveries: state.deliveries.filter(delivery => delivery.id !== id)
            }))
          } else {
            throw new Error(result.error || 'خطا در حذف تحویل')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      assignCourier: async (data: AssignCourierRequest) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch('/api/delivery/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) {
            throw new Error('خطا در تخصیص پیک')
          }

          const result = await response.json()
          
          if (result.success) {
            // Refresh deliveries
            await get().fetchDeliveries()
          } else {
            throw new Error(result.error || 'خطا در تخصیص پیک')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updateDeliveryStatus: async (id: string, status: string) => {
        try {
          const response = await fetch(`/api/delivery/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          })

          if (!response.ok) {
            throw new Error('خطا در به‌روزرسانی وضعیت')
          }

          const result = await response.json()
          
          if (result.success) {
            // Update local state
            set(state => ({
              deliveries: state.deliveries.map(delivery => 
                delivery.id === id ? { ...delivery, status: status as DeliveryStatus } : delivery
              )
            }))
          } else {
            throw new Error(result.error || 'خطا در به‌روزرسانی وضعیت')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        }
      },

      // Actions - Couriers
      fetchCouriers: async () => {
        try {
          set({ loading: true, error: null })

          const response = await fetch('/api/delivery/couriers')
          
          if (!response.ok) {
            throw new Error('خطا در دریافت پیک‌ها')
          }

          const data = await response.json()
          
          if (data.success) {
            set({ couriers: data.data })
          } else {
            throw new Error(data.error || 'خطا در دریافت پیک‌ها')
          }
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ loading: false })
        }
      },

      createCourier: async (data: CourierForm) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch('/api/delivery/couriers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) {
            throw new Error('خطا در ایجاد پیک')
          }

          const result = await response.json()
          
          if (result.success) {
            // Refresh couriers
            await get().fetchCouriers()
          } else {
            throw new Error(result.error || 'خطا در ایجاد پیک')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updateCourier: async (id: string, data: Partial<CourierForm>) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch(`/api/delivery/couriers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) {
            throw new Error('خطا در ویرایش پیک')
          }

          const result = await response.json()
          
          if (result.success) {
            // Update local state
            set(state => ({
              couriers: state.couriers.map(courier => 
                courier.id === id ? { ...courier, ...data } : courier
              )
            }))
          } else {
            throw new Error(result.error || 'خطا در ویرایش پیک')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      deleteCourier: async (id: string) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch(`/api/delivery/couriers/${id}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('خطا در حذف پیک')
          }

          const result = await response.json()
          
          if (result.success) {
            // Remove from local state
            set(state => ({
              couriers: state.couriers.filter(courier => courier.id !== id)
            }))
          } else {
            throw new Error(result.error || 'خطا در حذف پیک')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updateCourierStatus: async (id: string, status: string) => {
        try {
          const response = await fetch(`/api/delivery/couriers/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          })

          if (!response.ok) {
            throw new Error('خطا در به‌روزرسانی وضعیت پیک')
          }

          const result = await response.json()
          
          if (result.success) {
            // Update local state
            set(state => ({
              couriers: state.couriers.map(courier => 
                courier.id === id ? { ...courier, status: status as CourierStatus } : courier
              )
            }))
          } else {
            throw new Error(result.error || 'خطا در به‌روزرسانی وضعیت پیک')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        }
      },

      updateCourierLocation: async (id: string, latitude: number, longitude: number) => {
        try {
          const response = await fetch(`/api/delivery/couriers/${id}/location`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          })

          if (!response.ok) {
            throw new Error('خطا در به‌روزرسانی موقعیت پیک')
          }

          const result = await response.json()
          
          if (result.success) {
            // Update local state
            set(state => ({
              couriers: state.couriers.map(courier => 
                courier.id === id ? { 
                  ...courier, 
                  currentLocation: { latitude, longitude, lastUpdated: new Date() }
                } : courier
              )
            }))
          }
        } catch (error) {
          set({ error: (error as Error).message })
        }
      },

      // Actions - Addresses
      fetchAddresses: async (customerId?: string) => {
        try {
          set({ loading: true, error: null })

          const params = customerId ? `?customerId=${customerId}` : ''
          const response = await fetch(`/api/delivery/addresses${params}`)
          
          if (!response.ok) {
            throw new Error('خطا در دریافت آدرس‌ها')
          }

          const data = await response.json()
          
          if (data.success) {
            set({ addresses: data.data })
          } else {
            throw new Error(data.error || 'خطا در دریافت آدرس‌ها')
          }
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ loading: false })
        }
      },

      createAddress: async (data: AddressForm) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch('/api/delivery/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) {
            throw new Error('خطا در ایجاد آدرس')
          }

          const result = await response.json()
          
          if (result.success) {
            // Refresh addresses
            await get().fetchAddresses()
          } else {
            throw new Error(result.error || 'خطا در ایجاد آدرس')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updateAddress: async (id: string, data: Partial<AddressForm>) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch(`/api/delivery/addresses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) {
            throw new Error('خطا در ویرایش آدرس')
          }

          const result = await response.json()
          
          if (result.success) {
            // Update local state
            set(state => ({
              addresses: state.addresses.map(address => 
                address.id === id ? { ...address, ...data } : address
              )
            }))
          } else {
            throw new Error(result.error || 'خطا در ویرایش آدرس')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      deleteAddress: async (id: string) => {
        try {
          set({ loading: true, error: null })

          const response = await fetch(`/api/delivery/addresses/${id}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('خطا در حذف آدرس')
          }

          const result = await response.json()
          
          if (result.success) {
            // Remove from local state
            set(state => ({
              addresses: state.addresses.filter(address => address.id !== id)
            }))
          } else {
            throw new Error(result.error || 'خطا در حذف آدرس')
          }
        } catch (error) {
          set({ error: (error as Error).message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      // Actions - Stats & Reports
      fetchStats: async (period = 'TODAY') => {
        try {
          set({ loading: true, error: null })

          const response = await fetch(`/api/delivery/stats?period=${period}`)
          
          if (!response.ok) {
            throw new Error('خطا در دریافت آمار')
          }

          const data = await response.json()
          
          if (data.success) {
            set({ stats: data.data })
          } else {
            throw new Error(data.error || 'خطا در دریافت آمار')
          }
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ loading: false })
        }
      },

      fetchReport: async (period: string, dateFrom?: Date, dateTo?: Date) => {
        try {
          set({ loading: true, error: null })

          const params = new URLSearchParams({ period })
          if (dateFrom) params.append('dateFrom', dateFrom.toISOString())
          if (dateTo) params.append('dateTo', dateTo.toISOString())

          const response = await fetch(`/api/delivery/reports?${params}`)
          
          if (!response.ok) {
            throw new Error('خطا در دریافت گزارش')
          }

          const data = await response.json()
          
          if (data.success) {
            set({ report: data.data })
          } else {
            throw new Error(data.error || 'خطا در دریافت گزارش')
          }
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ loading: false })
        }
      },

      // Actions - Utilities
      setFilters: (filters: Partial<DeliveryFilter>) => {
        set(state => ({ filters: { ...state.filters, ...filters } }))
      },

      clearFilters: () => {
        set({ filters: {} })
      },

      setSelectedDelivery: (delivery: Delivery | null) => {
        set({ selectedDelivery: delivery })
      },

      setSelectedCourier: (courier: Courier | null) => {
        set({ selectedCourier: courier })
      },

      setPagination: (page: number, limit?: number) => {
        set(state => ({ 
          pagination: { 
            ...state.pagination, 
            page, 
            ...(limit && { limit })
          } 
        }))
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'delivery-store'
    }
  )
)
