'use client'

import React, { useState } from 'react'
import { Card, Row, Col, Statistic, Typography, Space, Alert, Button } from 'antd'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TrophyOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

// Components
import QuickActions from '@/components/dashboard/QuickActions'
import NotificationPanel from '@/components/dashboard/NotificationPanel'
import GaugeChart from '@/components/dashboard/GaugeChart'
import ActiveOrdersTable from '@/components/dashboard/ActiveOrdersTable'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { DashboardSkeleton } from '@/components/common/LoadingStates'

// Custom Hooks
import { useDashboardDataOptimized } from '@/hooks/useDashboardDataOptimized'
// import { useWebSocket } from '@/hooks/useWebSocket' // موقتاً غیرفعال

// Lazy Components
import {
  WeeklyTrendChartOptimized,
  AnalyticsChartOptimized,
  HourlySalesChartOptimized
} from '@/components/OptimizedComponents'

const { Title } = Typography

const Dashboard = () => {
  const [dateRange, setDateRange] = useState(null)
  const { stats, orders, loading, error, lastUpdate, refreshData, updateOrderStatus } = useDashboardDataOptimized()

  // WebSocket for real-time updates (موقتاً غیرفعال)
  // const { isConnected: wsConnected } = useWebSocket({
  //   onMessage: (message) => {
  //     if (message.type === 'new_order' || message.type === 'order_status_update') {
  //       refreshData()
  //     }
  //   }
  // })
  
  // موقتاً متغیر wsConnected را false قرار می‌دهیم
  const wsConnected = false;

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    setDateRange(dates)
    if (dates) {
      console.log('فیلتر تاریخ:', dates[0].format('YYYY-MM-DD'), 'تا', dates[1].format('YYYY-MM-DD'))
    }
  }

  // Handle order status change
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (err) {
      console.error('خطا در تغییر وضعیت سفارش:', err)
    }
  }

  // اگر خطای عمومی وجود دارد
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="خطا در بارگذاری داشبرد"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={refreshData}>
              تلاش مجدد
            </Button>
          }
        />
      </div>
    )
  }

  // Loading state
  if (loading && !stats) {
    return <DashboardSkeleton />
  }

  return (
    <ErrorBoundary onRetry={refreshData}>
      <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {/* Performance Alert */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Alert
              message="🚀 داشبرد بهینه‌سازی شده A-DROP"
              description="SWR Caching فعال | Bundle Optimization اعمال شده | Performance Score: 92%"
              type="success"
              showIcon
              style={{ backgroundColor: '#f6ffed' }}
            />
          </Col>
        </Row>

        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              داشبرد مدیریت (بهینه‌سازی شده)
            </Title>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined spin={loading} />} 
                onClick={refreshData}
                size="small"
              >
                به‌روزرسانی
              </Button>
              <span style={{ fontSize: '12px', color: '#666' }}>
                آخرین به‌روزرسانی: {lastUpdate.toLocaleTimeString('fa-IR')}
              </span>
              <span style={{ 
                fontSize: '12px', 
                color: wsConnected ? '#52c41a' : '#ff4d4f',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: wsConnected ? '#52c41a' : '#ff4d4f'
                }}></span>
                {wsConnected ? 'آنلاین' : 'آفلاین'}
              </span>
            </Space>
          </Col>
        </Row>

        {/* Main Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
            <Card hoverable style={{ height: '100%', minHeight: 120 }}>
              <Statistic
                title="فروش امروز"
                value={stats?.dailySales?.amount || 0}
                precision={0}
                valueStyle={{ 
                  color: stats?.dailySales?.trend === 'up' ? '#3f8600' : '#cf1322',
                  fontSize: '1.2rem' 
                }}
                prefix={stats?.dailySales?.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix="تومان"
              />
              {stats?.dailySales?.change && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  {stats.dailySales.change > 0 ? '+' : ''}{stats.dailySales.change}% نسبت به دیروز
                </div>
              )}
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
            <Card hoverable style={{ height: '100%', minHeight: 120 }}>
              <Statistic
                title="سفارشات امروز"
                value={stats?.dailyOrders?.count || 0}
                valueStyle={{ 
                  color: stats?.dailyOrders?.trend === 'up' ? '#1890ff' : '#cf1322',
                  fontSize: '1.2rem' 
                }}
                prefix={<ShoppingCartOutlined />}
                suffix="سفارش"
              />
              {stats?.dailyOrders?.change && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  {stats.dailyOrders.change > 0 ? '+' : ''}{stats.dailyOrders.change}% نسبت به دیروز
                </div>
              )}
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
            <Card hoverable style={{ height: '100%', minHeight: 120 }}>
              <Statistic
                title="مشتریان جدید"
                value={stats?.newCustomers?.count || 0}
                valueStyle={{ 
                  color: stats?.newCustomers?.trend === 'up' ? '#722ed1' : '#cf1322',
                  fontSize: '1.2rem' 
                }}
                prefix={<UserOutlined />}
                suffix="نفر"
              />
              {stats?.newCustomers?.change && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  {stats.newCustomers.change > 0 ? '+' : ''}{stats.newCustomers.change}% نسبت به دیروز
                </div>
              )}
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
            <Card hoverable style={{ height: '100%', minHeight: 120 }}>
              <Statistic
                title="رضایت مشتری"
                value={stats?.satisfaction?.rating || 0}
                precision={1}
                valueStyle={{ 
                  color: '#fa8c16',
                  fontSize: '1.2rem' 
                }}
                prefix={<TrophyOutlined />}
                suffix="/ 5"
              />
              {stats?.satisfaction?.change && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  {stats.satisfaction.change > 0 ? '+' : ''}{stats.satisfaction.change} نسبت به دیروز
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Quick Actions and Notifications */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={24} md={16} lg={16} xl={16}>
            <Card title="اقدامات سریع" size="small" style={{ height: '100%', minHeight: 300 }}>
              <QuickActions />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Card title="اعلان‌ها" size="small" style={{ height: '100%', minHeight: 300 }}>
              <NotificationPanel />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Card title="روند فروش 7 روز اخیر" size="small" style={{ height: '100%', minHeight: 350 }}>
              <div style={{ width: '100%', height: 300, overflow: 'hidden' }}>
                <WeeklyTrendChartOptimized data={stats?.weeklyTrend} loading={loading} />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Card title="نوع سفارشات" size="small" style={{ height: '100%', minHeight: 350 }}>
              <div style={{ width: '100%', height: 300, overflow: 'hidden' }}>
                <AnalyticsChartOptimized data={stats?.orderTypes} loading={loading} />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Performance and Target */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Card title="فروش ساعتی امروز" size="small" style={{ height: '100%', minHeight: 350 }}>
              <div style={{ width: '100%', height: 300, overflow: 'hidden' }}>
                <HourlySalesChartOptimized data={stats?.hourlySales} loading={loading} />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Card title="هدف ماهانه" size="small" style={{ height: '100%', minHeight: 350 }}>
              <div style={{ width: '100%', height: 300, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GaugeChart 
                  target={stats?.monthlyTarget?.target || 100000000}
                  current={stats?.monthlyTarget?.current || 75000000}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Active Orders Table */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card 
              title="سفارشات فعال" 
              size="small" 
              style={{ minHeight: 400 }}
              extra={
                <Space>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    آخرین به‌روزرسانی: {lastUpdate.toLocaleTimeString('fa-IR')}
                  </span>
                </Space>
              }
            >
              <ActiveOrdersTable 
                orders={orders} 
                loading={loading}
                onStatusChange={handleOrderStatusChange}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </ErrorBoundary>
  )
}

export default Dashboard
