// Marketing Types - A-DROP Admin Panel
// مدیریت کمپین‌های بازاریابی، سگمنت‌بندی مشتریان، و محتوای تبلیغاتی

export interface MarketingCampaign {
  id: string
  name: string                    // نام کمپین
  description: string             // توضیحات کمپین
  type: CampaignType             // نوع کمپین
  status: CampaignStatus         // وضعیت کمپین
  targetAudience: TargetAudience // مخاطب هدف
  channels: CommunicationChannel[] // کانال‌های ارتباطی
  content: CampaignContent       // محتوای کمپین
  budget: number                 // بودجه کمپین
  startDate: Date               // تاریخ شروع
  endDate: Date                 // تاریخ پایان
  metrics: CampaignMetrics      // معیارهای عملکرد
  createdBy: string             // ایجاد شده توسط
  createdAt: Date
  updatedAt: Date
}

export type CampaignType = 
  | 'promotional'     // تبلیغاتی
  | 'discount'        // تخفیفی
  | 'loyalty'         // وفاداری
  | 'seasonal'        // فصلی
  | 'newProduct'      // محصول جدید
  | 'retention'       // حفظ مشتری
  | 'acquisition'     // جذب مشتری

export type CampaignStatus =
  | 'draft'           // پیش‌نویس
  | 'scheduled'       // زمان‌بندی شده
  | 'active'          // فعال
  | 'paused'          // متوقف
  | 'completed'       // تکمیل شده
  | 'cancelled'       // لغو شده

export interface TargetAudience {
  id: string
  name: string                  // نام سگمنت
  description: string           // توضیحات
  criteria: AudienceCriteria    // معیارهای انتخاب
  estimatedSize: number         // تعداد تخمینی
  lastUpdated: Date
}

export interface AudienceCriteria {
  ageRange?: {
    min: number
    max: number
  }
  gender?: 'male' | 'female' | 'all'
  location?: string[]           // مناطق جغرافیایی
  orderCount?: {
    min: number
    max?: number
  }
  totalSpent?: {
    min: number
    max?: number
  }
  lastOrderDate?: {
    from: Date
    to: Date
  }
  favoriteCategories?: string[] // دسته‌بندی‌های مورد علاقه
  loyaltyTier?: string[]        // سطح وفاداری
  registrationDate?: {
    from: Date
    to: Date
  }
}

export type CommunicationChannel =
  | 'sms'             // پیامک
  | 'email'           // ایمیل
  | 'push'            // اعلان اپ
  | 'inApp'           // درون اپ
  | 'social'          // شبکه‌های اجتماعی
  | 'website'         // وبسایت

export interface CampaignContent {
  title: string                 // عنوان
  subtitle?: string            // زیرعنوان
  message: string              // پیام اصلی
  callToAction: string         // فراخوان عمل
  images: string[]             // تصاویر
  discountCode?: string        // کد تخفیف
  discountPercent?: number     // درصد تخفیف
  discountAmount?: number      // مبلغ تخفیف
  minOrderAmount?: number      // حداقل مبلغ سفارش
  maxUsage?: number           // حداکثر استفاده
  validUntil?: Date           // معتبر تا
}

export interface CampaignMetrics {
  sent: number                 // ارسال شده
  delivered: number            // تحویل شده
  opened: number               // باز شده
  clicked: number              // کلیک شده
  converted: number            // تبدیل شده
  revenue: number              // درآمد حاصله
  cost: number                 // هزینه
  roi: number                  // بازگشت سرمایه
  engagementRate: number       // نرخ تعامل
  conversionRate: number       // نرخ تبدیل
  unsubscribed: number         // لغو اشتراک
}

export interface MarketingBanner {
  id: string
  title: string                // عنوان بنر
  description: string          // توضیحات
  image: string               // تصویر بنر
  link?: string               // لینک هدف
  position: BannerPosition    // موقعیت نمایش
  priority: number            // اولویت نمایش
  isActive: boolean           // فعال/غیرفعال
  startDate: Date            // تاریخ شروع
  endDate: Date              // تاریخ پایان
  clickCount: number         // تعداد کلیک
  viewCount: number          // تعداد نمایش
  targetPages: string[]      // صفحات هدف
  createdAt: Date
  updatedAt: Date
}

export type BannerPosition =
  | 'header'          // بالای صفحه
  | 'sidebar'         // کناری
  | 'footer'          // پایین صفحه
  | 'popup'           // پاپ آپ
  | 'floating'        // شناور
  | 'inline'          // درون محتوا

export interface CustomerSegment {
  id: string
  name: string                // نام سگمنت
  description: string         // توضیحات
  criteria: AudienceCriteria  // معیارهای عضویت
  customerCount: number       // تعداد مشتری
  averageOrderValue: number   // میانگین ارزش سفارش
  totalRevenue: number        // کل درآمد
  lastCampaignDate?: Date     // آخرین کمپین
  isActive: boolean           // فعال/غیرفعال
  createdAt: Date
  updatedAt: Date
}

export interface MarketingDashboard {
  totalCampaigns: number
  activeCampaigns: number
  totalSent: number
  totalClicks: number
  totalRevenue: number
  averageROI: number
  topPerformingCampaign?: MarketingCampaign
  recentCampaigns: MarketingCampaign[]
  segmentSummary: {
    totalSegments: number
    totalCustomers: number
    averageSegmentSize: number
  }
  channelPerformance: {
    channel: CommunicationChannel
    campaigns: number
    sent: number
    opened: number
    clicked: number
    revenue: number
  }[]
}

// Form Types
export interface CreateCampaignRequest {
  name: string
  description: string
  type: CampaignType
  targetAudienceId: string
  channels: CommunicationChannel[]
  content: CampaignContent
  budget: number
  startDate: Date
  endDate: Date
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {
  id: string
  status?: CampaignStatus
}

export interface CreateSegmentRequest {
  name: string
  description: string
  criteria: AudienceCriteria
}

export interface CreateBannerRequest {
  title: string
  description: string
  image: string
  link?: string
  position: BannerPosition
  priority: number
  startDate: Date
  endDate: Date
  targetPages: string[]
}

// API Response Types
export interface MarketingAPIResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CampaignListResponse extends MarketingAPIResponse<MarketingCampaign[]> {}
export interface CampaignDetailResponse extends MarketingAPIResponse<MarketingCampaign> {}
export interface SegmentListResponse extends MarketingAPIResponse<CustomerSegment[]> {}
export interface BannerListResponse extends MarketingAPIResponse<MarketingBanner[]> {}
export interface DashboardResponse extends MarketingAPIResponse<MarketingDashboard> {}

// Filter and Search Types
export interface CampaignFilters {
  search?: string
  type?: CampaignType
  status?: CampaignStatus
  channel?: CommunicationChannel
  dateRange?: {
    start: Date
    end: Date
  }
  budgetRange?: {
    min: number
    max: number
  }
}

export interface SegmentFilters {
  search?: string
  minCustomers?: number
  maxCustomers?: number
  isActive?: boolean
}

export interface BannerFilters {
  search?: string
  position?: BannerPosition
  isActive?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}
