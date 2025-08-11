'use client'
import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, DatePicker, Select, Button, Space, Typography } from 'antd'
import { Line, Column, Pie, Area } from '@ant-design/plots'
import { RiseOutlined, ShoppingCartOutlined, UserOutlined, DollarOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAnalyticsStore } from '@/stores/analytics-store'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'days'),
    dayjs()
  ])
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  
  const {
    salesData,
    revenueData,
    orderStats,
    customerStats,
    popularItems,
    loading,
    fetchSalesData,
    fetchRevenueData,
    fetchOrderStats,
    fetchCustomerStats,
    fetchPopularItems
  } = useAnalyticsStore()

  useEffect(() => {
    refreshData()
  }, [dateRange, period])

  const refreshData = () => {
    const startDate = dateRange[0].format('YYYY-MM-DD')
    const endDate = dateRange[1].format('YYYY-MM-DD')
    
    fetchSalesData(startDate, endDate, period)
    fetchRevenueData(startDate, endDate, period)
    fetchOrderStats(startDate, endDate)
    fetchCustomerStats(startDate, endDate)
    fetchPopularItems(startDate, endDate)
  }

  // نمودار فروش روزانه
  const salesChartConfig = {
    data: salesData,
    xField: 'date',
    yField: 'amount',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 3,
      shape: 'circle'
    },
    label: {
      style: {
        fill: '#aaa'
      }
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: 'فروش',
          value: `${datum.amount?.toLocaleString()} تومان`
        }
      }
    }
  }

  // نمودار ستونی سفارشات
  const ordersChartConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'orders',
    color: '#52c41a',
    columnWidthRatio: 0.6,
    label: {
      position: 'top' as const,
      style: {
        fill: '#52c41a'
      }
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: 'تعداد سفارش',
          value: `${datum.orders} سفارش`
        }
      }
    }
  }

  // نمودار دایره‌ای محبوب‌ترین غذاها
  const popularItemsConfig = {
    data: popularItems,
    angleField: 'count',
    colorField: 'name',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}%'
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.name,
          value: `${datum.count} سفارش`
        }
      }
    }
  }

  // نمودار منطقه‌ای درآمد
  const revenueAreaConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    color: '#722ed1',
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#722ed1 1:#722ed1'
    }
  }

  const exportData = () => {
    // پیاده‌سازی export داده‌ها
    console.log('Exporting analytics data...')
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>📊 تحلیل‌ها و گزارشات</Title>
        <Space>
          <RangePicker
            value={[dateRange[0], dateRange[1]]}
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0]!, dates[1]!])
              }
            }}
            format="YYYY-MM-DD"
          />
          <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
            <Option value="daily">روزانه</Option>
            <Option value="weekly">هفتگی</Option>
            <Option value="monthly">ماهانه</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
            بروزرسانی
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={exportData}>
            خروجی Excel
          </Button>
        </Space>
      </div>

      {/* کارت‌های آماری اصلی */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل فروش"
              value={orderStats?.totalRevenue || 0}
              suffix="تومان"
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {orderStats?.revenueGrowth && orderStats.revenueGrowth > 0 ? '+' : ''}
              {orderStats?.revenueGrowth?.toFixed(1)}% از دوره قبل
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="تعداد سفارشات"
              value={orderStats?.totalOrders || 0}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {orderStats?.ordersGrowth && orderStats.ordersGrowth > 0 ? '+' : ''}
              {orderStats?.ordersGrowth?.toFixed(1)}% از دوره قبل
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="مشتریان جدید"
              value={customerStats?.newCustomers || 0}
              prefix={<UserOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {customerStats?.customerGrowth && customerStats.customerGrowth > 0 ? '+' : ''}
              {customerStats?.customerGrowth?.toFixed(1)}% از دوره قبل
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="میانگین سفارش"
              value={orderStats?.averageOrderValue || 0}
              suffix="تومان"
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {orderStats?.avgOrderGrowth && orderStats.avgOrderGrowth > 0 ? '+' : ''}
              {orderStats?.avgOrderGrowth?.toFixed(1)}% از دوره قبل
            </Text>
          </Card>
        </Col>
      </Row>

      {/* نمودارهای اصلی */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="روند فروش" loading={loading}>
            <Line {...salesChartConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="تعداد سفارشات" loading={loading}>
            <Column {...ordersChartConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="درآمد کل" loading={loading}>
            <Area {...revenueAreaConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="محبوب‌ترین غذاها" loading={loading}>
            <Pie {...popularItemsConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* جدول آمار تفصیلی */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="آمار مشتریان" loading={loading}>
            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text>کل مشتریان:</Text>
                <Text strong>{customerStats?.totalCustomers?.toLocaleString()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text>مشتریان فعال:</Text>
                <Text strong>{customerStats?.activeCustomers?.toLocaleString()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text>نرخ بازگشت:</Text>
                <Text strong>{customerStats?.returnRate?.toFixed(1)}%</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>میانگین خرید:</Text>
                <Text strong>{customerStats?.avgLifetimeValue?.toLocaleString()} تومان</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="آمار سفارشات" loading={loading}>
            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text>سفارشات تکمیل شده:</Text>
                <Text strong>{orderStats?.completedOrders?.toLocaleString()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text>سفارشات لغو شده:</Text>
                <Text strong style={{ color: '#ff4d4f' }}>{orderStats?.cancelledOrders?.toLocaleString()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text>نرخ موفقیت:</Text>
                <Text strong style={{ color: '#52c41a' }}>{orderStats?.successRate?.toFixed(1)}%</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>زمان متوسط آماده‌سازی:</Text>
                <Text strong>{orderStats?.avgPreparationTime} دقیقه</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="آمار مالی" loading={loading}>
            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text>درآمد خالص:</Text>
                <Text strong style={{ color: '#52c41a' }}>{orderStats?.netRevenue?.toLocaleString()} تومان</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text>کل تخفیفات:</Text>
                <Text strong style={{ color: '#faad14' }}>{orderStats?.totalDiscounts?.toLocaleString()} تومان</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text>کل مالیات:</Text>
                <Text strong>{orderStats?.totalTax?.toLocaleString()} تومان</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>حاشیه سود:</Text>
                <Text strong>{orderStats?.profitMargin?.toFixed(1)}%</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
