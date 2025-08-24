import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  InventoryItem, 
  InventoryCategory, 
  StockMovement, 
  InventoryStats,
  InventoryFilter,
  InventoryItemForm,
  StockMovementForm
} from '@/types/inventory'

interface InventoryStore {
  // State
  items: InventoryItem[]
  categories: InventoryCategory[]
  movements: StockMovement[]
  stats: InventoryStats | null
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
  filters: InventoryFilter

  // Actions - Items
  fetchItems: (filters?: InventoryFilter) => Promise<void>
  fetchItemById: (id: string) => Promise<InventoryItem | null>
  createItem: (data: InventoryItemForm) => Promise<InventoryItem | null>
  updateItem: (id: string, data: Partial<InventoryItemForm>) => Promise<InventoryItem | null>
  deleteItem: (id: string) => Promise<boolean>

  // Actions - Categories
  fetchCategories: () => Promise<void>
  createCategory: (data: Partial<InventoryCategory>) => Promise<InventoryCategory | null>
  updateCategory: (id: string, data: Partial<InventoryCategory>) => Promise<InventoryCategory | null>
  deleteCategory: (id: string) => Promise<boolean>

  // Actions - Movements
  fetchMovements: (itemId?: string) => Promise<void>
  createMovement: (data: StockMovementForm) => Promise<StockMovement | null>

  // Actions - Stats
  fetchStats: () => Promise<void>

  // Utility Actions
  setFilters: (filters: Partial<InventoryFilter>) => void
  clearFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Analytics Functions
  getItemsByStatus: (status: string) => InventoryItem[]
  getItemsByCategory: (categoryId: string) => InventoryItem[]
  getLowStockItems: () => InventoryItem[]
  getExpiredItems: () => InventoryItem[]
  getExpiringSoonItems: (days?: number) => InventoryItem[]
  getInventoryValue: () => number
  getCategoryStats: () => Array<{
    categoryId: string
    categoryName: string
    itemCount: number
    totalValue: number
  }>
}

export const useInventoryStore = create<InventoryStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      items: [],
      categories: [],
      movements: [],
      stats: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      filters: {},

      // Actions - Items
      fetchItems: async (filters = {}) => {
        set({ loading: true, error: null })
        
        try {
          const params = new URLSearchParams()
          
          // اضافه کردن فیلترها به پارامترها
          Object.entries({ ...get().filters, ...filters }).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v.toString()))
              } else {
                params.set(key, value.toString())
              }
            }
          })

          const response = await fetch(`/api/inventory?${params}`)
          const result = await response.json()

          if (result.success) {
            set({ 
              items: result.data,
              pagination: result.pagination,
              filters: { ...get().filters, ...filters }
            })
          } else {
            set({ error: result.error })
          }
        } catch (error) {
          set({ error: 'خطا در دریافت آیتم‌های انبار' })
        } finally {
          set({ loading: false })
        }
      },

      fetchItemById: async (id: string) => {
        try {
          const response = await fetch(`/api/inventory/${id}`)
          const result = await response.json()

          if (result.success) {
            return result.data
          } else {
            set({ error: result.error })
            return null
          }
        } catch (error) {
          set({ error: 'خطا در دریافت جزئیات آیتم' })
          return null
        }
      },

      createItem: async (data: InventoryItemForm) => {
        set({ loading: true, error: null })
        
        try {
          console.log('📦 Store: Creating item with data:', data);
          
          const response = await fetch('/api/inventory', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          console.log('📦 Store: Response status:', response.status);
          console.log('📦 Store: Response ok:', response.ok);

          const result = await response.json()
          console.log('📦 Store: Response data:', result);

          if (response.ok && result.success) {
            console.log('✅ Store: Item created successfully');
            // بازیابی لیست برای به‌روزرسانی
            await get().fetchItems()
            await get().fetchStats()
            return result.data
          } else {
            console.error('❌ Store: Item creation failed:', result);
            set({ error: result.message || result.error || 'خطا در ایجاد آیتم' })
            return null
          }
        } catch (error) {
          console.error('❌ Store: Network error:', error);
          set({ error: 'خطا در ایجاد آیتم انبار' })
          return null
        } finally {
          set({ loading: false })
        }
      },

      updateItem: async (id: string, data: Partial<InventoryItemForm>) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`/api/inventory/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          const result = await response.json()

          if (result.success) {
            // به‌روزرسانی آیتم در لیست
            set(state => ({
              items: state.items.map(item => 
                item.id === id ? { ...item, ...result.data } : item
              )
            }))
            await get().fetchStats()
            return result.data
          } else {
            set({ error: result.error })
            return null
          }
        } catch (error) {
          set({ error: 'خطا در به‌روزرسانی آیتم انبار' })
          return null
        } finally {
          set({ loading: false })
        }
      },

      deleteItem: async (id: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`/api/inventory/${id}`, {
            method: 'DELETE',
          })

          const result = await response.json()

          if (result.success) {
            // حذف آیتم از لیست
            set(state => ({
              items: state.items.filter(item => item.id !== id)
            }))
            await get().fetchStats()
            return true
          } else {
            set({ error: result.error })
            return false
          }
        } catch (error) {
          set({ error: 'خطا در حذف آیتم انبار' })
          return false
        } finally {
          set({ loading: false })
        }
      },

      // Actions - Categories
      fetchCategories: async () => {
        try {
          const response = await fetch('/api/inventory/categories')
          const result = await response.json()

          if (result.success) {
            set({ categories: result.data })
          } else {
            set({ error: result.error })
          }
        } catch (error) {
          set({ error: 'خطا در دریافت دسته‌بندی‌ها' })
        }
      },

      createCategory: async (data: Partial<InventoryCategory>) => {
        try {
          const response = await fetch('/api/inventory/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          const result = await response.json()

          if (result.success) {
            // اضافه کردن دسته‌بندی جدید به لیست
            set(state => ({
              categories: [...state.categories, result.data]
            }))
            return result.data
          } else {
            set({ error: result.error })
            return null
          }
        } catch (error) {
          set({ error: 'خطا در ایجاد دسته‌بندی' })
          return null
        }
      },

      updateCategory: async (id: string, data: Partial<InventoryCategory>) => {
        try {
          const response = await fetch(`/api/inventory/categories/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          const result = await response.json()

          if (result.success) {
            set(state => ({
              categories: state.categories.map(cat => 
                cat.id === id ? { ...cat, ...result.data } : cat
              )
            }))
            return result.data
          } else {
            set({ error: result.error })
            return null
          }
        } catch (error) {
          set({ error: 'خطا در بروزرسانی دسته‌بندی' })
          return null
        }
      },

      deleteCategory: async (id: string) => {
        try {
          const response = await fetch(`/api/inventory/categories/${id}`, {
            method: 'DELETE',
          })

          const result = await response.json()

          if (result.success) {
            set(state => ({
              categories: state.categories.filter(cat => cat.id !== id)
            }))
            return true
          } else {
            set({ error: result.error })
            return false
          }
        } catch (error) {
          set({ error: 'خطا در حذف دسته‌بندی' })
          return false
        }
      },

      // Actions - Movements
      fetchMovements: async (itemId?: string) => {
        try {
          const params = itemId ? `?itemId=${itemId}` : ''
          const response = await fetch(`/api/inventory/movements${params}`)
          const result = await response.json()

          if (result.success) {
            set({ movements: result.data })
          } else {
            set({ error: result.error })
          }
        } catch (error) {
          set({ error: 'خطا در دریافت حرکات انبار' })
        }
      },

      createMovement: async (data: StockMovementForm) => {
        try {
          const response = await fetch('/api/inventory/movements', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          const result = await response.json()

          if (result.success) {
            // بازیابی حرکات و آیتم‌ها برای به‌روزرسانی
            await get().fetchMovements()
            await get().fetchItems()
            await get().fetchStats()
            return result.data
          } else {
            set({ error: result.error })
            return null
          }
        } catch (error) {
          set({ error: 'خطا در ثبت حرکت انبار' })
          return null
        }
      },

      // Actions - Stats
      fetchStats: async () => {
        try {
          const response = await fetch('/api/inventory/stats')
          const result = await response.json()

          if (result.success) {
            set({ stats: result.data })
          } else {
            set({ error: result.error })
          }
        } catch (error) {
          set({ error: 'خطا در دریافت آمار انبار' })
        }
      },

      // Utility Actions
      setFilters: (filters: Partial<InventoryFilter>) => {
        set(state => ({
          filters: { ...state.filters, ...filters }
        }))
      },

      clearFilters: () => {
        set({ filters: {} })
      },

      setLoading: (loading: boolean) => {
        set({ loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      // Analytics Functions
      getItemsByStatus: (status: string) => {
        const { items } = get()
        return items.filter(item => item.status === status)
      },

      getItemsByCategory: (categoryId: string) => {
        const { items } = get()
        return items.filter(item => item.categoryId === categoryId)
      },

      getLowStockItems: () => {
        const { items } = get()
        return items.filter(item => 
          item.status === 'LOW_STOCK' || 
          (item.currentStock <= item.minStock && item.currentStock > 0)
        )
      },

      getExpiredItems: () => {
        const { items } = get()
        return items.filter(item => 
          item.status === 'EXPIRED' ||
          (item.expiryDate && new Date(item.expiryDate) <= new Date())
        )
      },

      getExpiringSoonItems: (days = 30) => {
        const { items } = get()
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + days)
        
        return items.filter(item => 
          item.expiryDate && 
          new Date(item.expiryDate) <= futureDate &&
          new Date(item.expiryDate) > new Date()
        )
      },

      getInventoryValue: () => {
        const { items } = get()
        return items.reduce((total, item) => 
          total + (item.currentStock * item.price), 0
        )
      },

      getCategoryStats: () => {
        const { items, categories } = get()
        
        return categories.map(category => {
          const categoryItems = items.filter(item => item.categoryId === category.id)
          const totalValue = categoryItems.reduce((sum, item) => 
            sum + (item.currentStock * item.price), 0
          )
          
          return {
            categoryId: category.id,
            categoryName: category.name,
            itemCount: categoryItems.length,
            totalValue
          }
        })
      },
    }),
    {
      name: 'inventory-store',
    }
  )
)
