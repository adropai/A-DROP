import dynamic from 'next/dynamic'
import { Skeleton } from 'antd'

// Chart Components with optimized bundle splitting
export const WeeklyTrendChartOptimized = dynamic(
  () => import('@/components/charts/WeeklyTrendChart'),
  {
    loading: () => (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton.Button active style={{ width: '90%', height: 250 }} />
      </div>
    ),
    ssr: false
  }
)

export const AnalyticsChartOptimized = dynamic(
  () => import('@/components/charts/AnalyticsChart'),
  {
    loading: () => (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton.Button active style={{ width: '90%', height: 250 }} />
      </div>
    ),
    ssr: false
  }
)

export const HourlySalesChartOptimized = dynamic(
  () => import('@/components/charts/HourlySalesChart'),
  {
    loading: () => (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton.Button active style={{ width: '90%', height: 250 }} />
      </div>
    ),
    ssr: false
  }
)

// Dashboard Components with lazy loading
export const QuickActionsOptimized = dynamic(
  () => import('@/components/dashboard/QuickActions'),
  {
    loading: () => <Skeleton active paragraph={{ rows: 3 }} />,
    ssr: false
  }
)

export const NotificationPanelOptimized = dynamic(
  () => import('@/components/dashboard/NotificationPanel'),
  {
    loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
    ssr: false
  }
)

export const GaugeChartOptimized = dynamic(
  () => import('@/components/dashboard/GaugeChart'),
  {
    loading: () => (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton.Button active style={{ width: 200, height: 200, borderRadius: '50%' }} />
      </div>
    ),
    ssr: false
  }
)

export const ActiveOrdersTableOptimized = dynamic(
  () => import('@/components/dashboard/ActiveOrdersTable'),
  {
    loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
    ssr: false
  }
)

// Optimized Date Picker
export const DatePickerOptimized = dynamic(
  () => import('antd/es/date-picker').then(mod => ({ default: mod.default })),
  {
    loading: () => <Skeleton.Input active style={{ width: 200 }} />,
    ssr: false
  }
)

// Bundle-split Recharts
export const OptimizedRechartsBundle = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => <Skeleton.Button active style={{ width: '100%', height: 300 }} />,
    ssr: false
  }
)
