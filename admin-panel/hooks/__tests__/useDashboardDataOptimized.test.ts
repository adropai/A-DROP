import { renderHook, waitFor } from '@testing-library/react'
import useDashboardDataOptimized from '../useDashboardDataOptimized'

// Mock fetch globally
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}))

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

const mockSWR = require('swr').default

describe('useDashboardDataOptimized Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    consoleSpy.mockClear()
    
    // Default SWR mock implementation
    mockSWR.mockImplementation(() => ({
      data: null,
      error: null,
      mutate: jest.fn(),
      isLoading: true
    }))
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useDashboardDataOptimized())

    expect(result.current.loading).toBe(true)
    expect(result.current.stats).toBeNull()
    expect(result.current.error).toBeUndefined()
  })

  it('should return stats data when loaded', () => {
    const mockStats = {
      totalRevenue: 125000,
      totalOrders: 1250,
      activeCustomers: 890,
      averageOrderValue: 100
    }

    // Mock SWR to return stats data
    mockSWR.mockImplementation((url: string) => {
      if (url === '/api/stats/overview') {
        return {
          data: mockStats,
          error: null,
          mutate: jest.fn(),
          isLoading: false
        }
      }
      return {
        data: null,
        error: null,
        mutate: jest.fn(),
        isLoading: false
      }
    })

    const { result } = renderHook(() => useDashboardDataOptimized())

    expect(result.current.loading).toBe(false)
    expect(result.current.stats).toEqual(mockStats)
    expect(result.current.error).toBeUndefined()
  })

  it('should handle API errors gracefully', () => {
    const mockError = new Error('Network error')

    mockSWR.mockImplementation(() => ({
      data: null,
      error: mockError,
      mutate: jest.fn(),
      isLoading: false
    }))

    const { result } = renderHook(() => useDashboardDataOptimized())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Network error')
    expect(result.current.stats).toBeNull()
  })

  it('should provide updateOrderStatus function', () => {
    mockSWR.mockImplementation(() => ({
      data: { orders: [] },
      error: null,
      mutate: jest.fn(),
      isLoading: false
    }))

    const { result } = renderHook(() => useDashboardDataOptimized())

    expect(typeof result.current.updateOrderStatus).toBe('function')
  })

  it('should provide refreshData function', () => {
    mockSWR.mockImplementation(() => ({
      data: null,
      error: null,
      mutate: jest.fn(),
      isLoading: false
    }))

    const { result } = renderHook(() => useDashboardDataOptimized())

    expect(typeof result.current.refreshData).toBe('function')
  })

  it('should handle component errors', () => {
    mockSWR.mockImplementation(() => ({
      data: null,
      error: null,
      mutate: jest.fn(),
      isLoading: false
    }))

    const { result } = renderHook(() => useDashboardDataOptimized())

    expect(result.current.componentError).toBeNull()
    expect(typeof result.current.handleError).toBe('function')
    expect(typeof result.current.clearError).toBe('function')
  })

  it('should return lastUpdate timestamp', () => {
    mockSWR.mockImplementation(() => ({
      data: { someData: true },
      error: null,
      mutate: jest.fn(),
      isLoading: false
    }))

    const { result } = renderHook(() => useDashboardDataOptimized())

    expect(result.current.lastUpdate).toBeInstanceOf(Date)
  })
})
