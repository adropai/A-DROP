// Marketing Store - A-DROP Admin Panel
// مدیریت state کمپین‌های بازاریابی، سگمنت‌ها، و بنرها

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  MarketingCampaign,
  CustomerSegment,
  MarketingBanner,
  MarketingDashboard,
  CampaignFilters,
  SegmentFilters,
  BannerFilters,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CreateSegmentRequest,
  CreateBannerRequest,
  CampaignStatus,
  TargetAudience
} from '@/types/marketing'

interface MarketingState {
  // Dashboard Data
  dashboard: MarketingDashboard | null
  isDashboardLoading: boolean

  // Campaigns
  campaigns: MarketingCampaign[]
  isCampaignsLoading: boolean
  campaignFilters: CampaignFilters
  selectedCampaign: MarketingCampaign | null
  campaignModalOpen: boolean

  // Segments
  segments: CustomerSegment[]
  isSegmentsLoading: boolean
  segmentFilters: SegmentFilters
  selectedSegment: CustomerSegment | null
  segmentModalOpen: boolean

  // Banners
  banners: MarketingBanner[]
  isBannersLoading: boolean
  bannerFilters: BannerFilters
  selectedBanner: MarketingBanner | null
  bannerModalOpen: boolean

  // Target Audiences
  targetAudiences: TargetAudience[]
  isAudiencesLoading: boolean

  // Pagination
  campaignPagination: {
    current: number
    pageSize: number
    total: number
  }
  segmentPagination: {
    current: number
    pageSize: number
    total: number
  }
  bannerPagination: {
    current: number
    pageSize: number
    total: number
  }

  // Actions
  fetchDashboard: () => Promise<void>
  fetchCampaigns: () => Promise<void>
  fetchSegments: () => Promise<void>
  fetchBanners: () => Promise<void>
  fetchTargetAudiences: () => Promise<void>

  createCampaign: (data: CreateCampaignRequest) => Promise<boolean>
  updateCampaign: (data: UpdateCampaignRequest) => Promise<boolean>
  deleteCampaign: (id: string) => Promise<boolean>
  updateCampaignStatus: (id: string, status: CampaignStatus) => Promise<boolean>

  createSegment: (data: CreateSegmentRequest) => Promise<boolean>
  updateSegment: (id: string, data: Partial<CreateSegmentRequest>) => Promise<boolean>
  deleteSegment: (id: string) => Promise<boolean>

  createBanner: (data: CreateBannerRequest) => Promise<boolean>
  updateBanner: (id: string, data: Partial<CreateBannerRequest>) => Promise<boolean>
  deleteBanner: (id: string) => Promise<boolean>
  toggleBannerStatus: (id: string) => Promise<boolean>

  // Filters and UI
  setCampaignFilters: (filters: Partial<CampaignFilters>) => void
  setSegmentFilters: (filters: Partial<SegmentFilters>) => void
  setBannerFilters: (filters: Partial<BannerFilters>) => void
  setCampaignPagination: (pagination: Partial<MarketingState['campaignPagination']>) => void
  setSegmentPagination: (pagination: Partial<MarketingState['segmentPagination']>) => void
  setBannerPagination: (pagination: Partial<MarketingState['bannerPagination']>) => void

  setSelectedCampaign: (campaign: MarketingCampaign | null) => void
  setCampaignModalOpen: (open: boolean) => void
  setSelectedSegment: (segment: CustomerSegment | null) => void
  setSegmentModalOpen: (open: boolean) => void
  setSelectedBanner: (banner: MarketingBanner | null) => void
  setBannerModalOpen: (open: boolean) => void

  reset: () => void
}

const initialState = {
  dashboard: null,
  isDashboardLoading: false,
  campaigns: [],
  isCampaignsLoading: false,
  campaignFilters: {},
  selectedCampaign: null,
  campaignModalOpen: false,
  segments: [],
  isSegmentsLoading: false,
  segmentFilters: {},
  selectedSegment: null,
  segmentModalOpen: false,
  banners: [],
  isBannersLoading: false,
  bannerFilters: {},
  selectedBanner: null,
  bannerModalOpen: false,
  targetAudiences: [],
  isAudiencesLoading: false,
  campaignPagination: { current: 1, pageSize: 10, total: 0 },
  segmentPagination: { current: 1, pageSize: 10, total: 0 },
  bannerPagination: { current: 1, pageSize: 10, total: 0 },
}

export const useMarketingStore = create<MarketingState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Dashboard
      fetchDashboard: async () => {
        set({ isDashboardLoading: true })
        try {
          const response = await fetch('/api/marketing/dashboard')
          const result = await response.json()
          
          if (result.success) {
            set({ dashboard: result.data })
          }
        } catch (error) {
          console.error('خطا در دریافت داده‌های داشبورد بازاریابی:', error)
        } finally {
          set({ isDashboardLoading: false })
        }
      },

      // Campaigns
      fetchCampaigns: async () => {
        set({ isCampaignsLoading: true })
        try {
          const { campaignFilters, campaignPagination } = get()
          const params = new URLSearchParams()
          params.append('page', campaignPagination.current.toString())
          params.append('limit', campaignPagination.pageSize.toString())
          
          // Add filters as individual parameters
          if (campaignFilters.search) params.append('search', campaignFilters.search)
          if (campaignFilters.type) params.append('type', campaignFilters.type)
          if (campaignFilters.status) params.append('status', campaignFilters.status)
          if (campaignFilters.channel) params.append('channel', campaignFilters.channel)
          if (campaignFilters.dateRange) {
            params.append('startDate', campaignFilters.dateRange.start.toISOString())
            params.append('endDate', campaignFilters.dateRange.end.toISOString())
          }
          if (campaignFilters.budgetRange) {
            params.append('minBudget', campaignFilters.budgetRange.min.toString())
            params.append('maxBudget', campaignFilters.budgetRange.max.toString())
          }

          const response = await fetch(`/api/marketing/campaigns?${params}`)
          const result = await response.json()
          
          if (result.success) {
            set({ 
              campaigns: result.data,
              campaignPagination: {
                ...campaignPagination,
                total: result.pagination?.total || 0
              }
            })
          }
        } catch (error) {
          console.error('خطا در دریافت کمپین‌ها:', error)
        } finally {
          set({ isCampaignsLoading: false })
        }
      },

      createCampaign: async (data: CreateCampaignRequest) => {
        try {
          const response = await fetch('/api/marketing/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchCampaigns()
            await get().fetchDashboard()
            set({ campaignModalOpen: false, selectedCampaign: null })
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در ایجاد کمپین:', error)
          return false
        }
      },

      updateCampaign: async (data: UpdateCampaignRequest) => {
        try {
          const response = await fetch(`/api/marketing/campaigns/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchCampaigns()
            await get().fetchDashboard()
            set({ campaignModalOpen: false, selectedCampaign: null })
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در به‌روزرسانی کمپین:', error)
          return false
        }
      },

      deleteCampaign: async (id: string) => {
        try {
          const response = await fetch(`/api/marketing/campaigns/${id}`, {
            method: 'DELETE'
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchCampaigns()
            await get().fetchDashboard()
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در حذف کمپین:', error)
          return false
        }
      },

      updateCampaignStatus: async (id: string, status: CampaignStatus) => {
        try {
          const response = await fetch(`/api/marketing/campaigns/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchCampaigns()
            await get().fetchDashboard()
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در تغییر وضعیت کمپین:', error)
          return false
        }
      },

      // Segments
      fetchSegments: async () => {
        set({ isSegmentsLoading: true })
        try {
          const { segmentFilters, segmentPagination } = get()
          const params = new URLSearchParams()
          params.append('page', segmentPagination.current.toString())
          params.append('limit', segmentPagination.pageSize.toString())
          
          // Add filters as individual parameters
          if (segmentFilters.search) params.append('search', segmentFilters.search)
          if (segmentFilters.minCustomers) params.append('minCustomers', segmentFilters.minCustomers.toString())
          if (segmentFilters.maxCustomers) params.append('maxCustomers', segmentFilters.maxCustomers.toString())
          if (segmentFilters.isActive !== undefined) params.append('isActive', segmentFilters.isActive.toString())

          const response = await fetch(`/api/marketing/segments?${params}`)
          const result = await response.json()
          
          if (result.success) {
            set({ 
              segments: result.data,
              segmentPagination: {
                ...segmentPagination,
                total: result.pagination?.total || 0
              }
            })
          }
        } catch (error) {
          console.error('خطا در دریافت سگمنت‌ها:', error)
        } finally {
          set({ isSegmentsLoading: false })
        }
      },

      createSegment: async (data: CreateSegmentRequest) => {
        try {
          const response = await fetch('/api/marketing/segments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchSegments()
            set({ segmentModalOpen: false, selectedSegment: null })
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در ایجاد سگمنت:', error)
          return false
        }
      },

      updateSegment: async (id: string, data: Partial<CreateSegmentRequest>) => {
        try {
          const response = await fetch(`/api/marketing/segments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchSegments()
            set({ segmentModalOpen: false, selectedSegment: null })
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در به‌روزرسانی سگمنت:', error)
          return false
        }
      },

      deleteSegment: async (id: string) => {
        try {
          const response = await fetch(`/api/marketing/segments/${id}`, {
            method: 'DELETE'
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchSegments()
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در حذف سگمنت:', error)
          return false
        }
      },

      // Banners
      fetchBanners: async () => {
        set({ isBannersLoading: true })
        try {
          const { bannerFilters, bannerPagination } = get()
          const params = new URLSearchParams()
          params.append('page', bannerPagination.current.toString())
          params.append('limit', bannerPagination.pageSize.toString())
          
          // Add filters as individual parameters
          if (bannerFilters.search) params.append('search', bannerFilters.search)
          if (bannerFilters.position) params.append('position', bannerFilters.position)
          if (bannerFilters.isActive !== undefined) params.append('isActive', bannerFilters.isActive.toString())
          if (bannerFilters.dateRange) {
            params.append('startDate', bannerFilters.dateRange.start.toISOString())
            params.append('endDate', bannerFilters.dateRange.end.toISOString())
          }

          const response = await fetch(`/api/marketing/banners?${params}`)
          const result = await response.json()
          
          if (result.success) {
            set({ 
              banners: result.data,
              bannerPagination: {
                ...bannerPagination,
                total: result.pagination?.total || 0
              }
            })
          }
        } catch (error) {
          console.error('خطا در دریافت بنرها:', error)
        } finally {
          set({ isBannersLoading: false })
        }
      },

      createBanner: async (data: CreateBannerRequest) => {
        try {
          const response = await fetch('/api/marketing/banners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchBanners()
            set({ bannerModalOpen: false, selectedBanner: null })
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در ایجاد بنر:', error)
          return false
        }
      },

      updateBanner: async (id: string, data: Partial<CreateBannerRequest>) => {
        try {
          const response = await fetch(`/api/marketing/banners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchBanners()
            set({ bannerModalOpen: false, selectedBanner: null })
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در به‌روزرسانی بنر:', error)
          return false
        }
      },

      deleteBanner: async (id: string) => {
        try {
          const response = await fetch(`/api/marketing/banners/${id}`, {
            method: 'DELETE'
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchBanners()
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در حذف بنر:', error)
          return false
        }
      },

      toggleBannerStatus: async (id: string) => {
        try {
          const response = await fetch(`/api/marketing/banners/${id}/toggle`, {
            method: 'PATCH'
          })
          
          const result = await response.json()
          
          if (result.success) {
            await get().fetchBanners()
            return true
          }
          return false
        } catch (error) {
          console.error('خطا در تغییر وضعیت بنر:', error)
          return false
        }
      },

      // Target Audiences
      fetchTargetAudiences: async () => {
        set({ isAudiencesLoading: true })
        try {
          const response = await fetch('/api/marketing/audiences')
          const result = await response.json()
          
          if (result.success) {
            set({ targetAudiences: result.data })
          }
        } catch (error) {
          console.error('خطا در دریافت مخاطبان هدف:', error)
        } finally {
          set({ isAudiencesLoading: false })
        }
      },

      // Filters and UI
      setCampaignFilters: (filters) => {
        set(state => ({
          campaignFilters: { ...state.campaignFilters, ...filters },
          campaignPagination: { ...state.campaignPagination, current: 1 }
        }))
      },

      setSegmentFilters: (filters) => {
        set(state => ({
          segmentFilters: { ...state.segmentFilters, ...filters },
          segmentPagination: { ...state.segmentPagination, current: 1 }
        }))
      },

      setBannerFilters: (filters) => {
        set(state => ({
          bannerFilters: { ...state.bannerFilters, ...filters },
          bannerPagination: { ...state.bannerPagination, current: 1 }
        }))
      },

      setCampaignPagination: (pagination) => {
        set(state => ({
          campaignPagination: { ...state.campaignPagination, ...pagination }
        }))
      },

      setSegmentPagination: (pagination) => {
        set(state => ({
          segmentPagination: { ...state.segmentPagination, ...pagination }
        }))
      },

      setBannerPagination: (pagination) => {
        set(state => ({
          bannerPagination: { ...state.bannerPagination, ...pagination }
        }))
      },

      setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),
      setCampaignModalOpen: (open) => set({ campaignModalOpen: open }),
      setSelectedSegment: (segment) => set({ selectedSegment: segment }),
      setSegmentModalOpen: (open) => set({ segmentModalOpen: open }),
      setSelectedBanner: (banner) => set({ selectedBanner: banner }),
      setBannerModalOpen: (open) => set({ bannerModalOpen: open }),

      reset: () => set(initialState)
    }),
    { name: 'marketing-store' }
  )
)
