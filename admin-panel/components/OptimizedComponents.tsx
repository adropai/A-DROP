'use client'

import React, { lazy, Suspense } from 'react'
import { Skeleton } from 'antd'

// Lazy load chart components for better performance
const WeeklyTrendChart = lazy(() => import('./charts/WeeklyTrendChart'))
const AnalyticsChart = lazy(() => import('./charts/AnalyticsChart'))
const HourlySalesChart = lazy(() => import('./charts/HourlySalesChart'))

// Optimized wrapper components
export const WeeklyTrendChartOptimized: React.FC<any> = (props) => (
  <Suspense fallback={<Skeleton.Input active style={{ width: '100%', height: 200 }} />}>
    <WeeklyTrendChart {...props} />
  </Suspense>
)

export const AnalyticsChartOptimized: React.FC<any> = (props) => (
  <Suspense fallback={<Skeleton.Input active style={{ width: '100%', height: 200 }} />}>
    <AnalyticsChart {...props} />
  </Suspense>
)

export const HourlySalesChartOptimized: React.FC<any> = (props) => (
  <Suspense fallback={<Skeleton.Input active style={{ width: '100%', height: 200 }} />}>
    <HourlySalesChart {...props} />
  </Suspense>
)
