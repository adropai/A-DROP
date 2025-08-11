import { create } from 'zustand'
import type { CashierTransaction, CashRegister, DailyReport } from '@/types/cashier'

interface CashierStore {
  // State
  transactions: CashierTransaction[]
  registers: CashRegister[]
  dailyReport: DailyReport | null
  loading: boolean
  error: string | null

  // Actions
  fetchTransactions: () => Promise<void>
  fetchRegisters: () => Promise<void>
  fetchDailyReport: () => Promise<void>
  createTransaction: (transaction: Partial<CashierTransaction>) => Promise<void>
  updateTransaction: (id: string, updates: Partial<CashierTransaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  openRegister: (id: string) => Promise<void>
  closeRegister: (id: string) => Promise<void>
  setError: (error: string | null) => void
  clearError: () => void
}

export const useCashierStore = create<CashierStore>((set, get) => ({
  // Initial State
  transactions: [],
  registers: [],
  dailyReport: null,
  loading: false,
  error: null,

  // Actions
  fetchTransactions: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/cashier/transactions')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const transactions = await response.json()
      set({ transactions, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchRegisters: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/cashier/registers')
      if (!response.ok) throw new Error('Failed to fetch registers')
      const registers = await response.json()
      set({ registers, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchDailyReport: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/cashier/daily-report')
      if (!response.ok) throw new Error('Failed to fetch daily report')
      const dailyReport = await response.json()
      set({ dailyReport, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createTransaction: async (transactionData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/cashier/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      })
      if (!response.ok) throw new Error('Failed to create transaction')
      
      // Refresh transactions after creating
      await get().fetchTransactions()
      set({ loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateTransaction: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/cashier/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update transaction')
      
      // Update local state
      const transactions = get().transactions.map(t => 
        t.id === id ? { ...t, ...updates } : t
      )
      set({ transactions, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/cashier/transactions/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete transaction')
      
      // Remove from local state
      const transactions = get().transactions.filter(t => t.id !== id)
      set({ transactions, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  openRegister: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/cashier/registers/${id}/open`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to open register')
      
      // Update local state
      const registers = get().registers.map(r => 
        r.id === id ? { ...r, status: 'open' as const, lastActivity: new Date().toISOString() } : r
      )
      set({ registers, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  closeRegister: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/cashier/registers/${id}/close`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to close register')
      
      // Update local state
      const registers = get().registers.map(r => 
        r.id === id ? { ...r, status: 'closed' as const, lastActivity: new Date().toISOString() } : r
      )
      set({ registers, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}))

// Initialize stores on first import
if (typeof window !== 'undefined') {
  const store = useCashierStore.getState()
  store.fetchTransactions()
  store.fetchRegisters()
  store.fetchDailyReport()
}
