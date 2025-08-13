'use client'

import React, { useState } from 'react'
import { Card, Row, Col, Statistic, Select, DatePicker, Spin, Alert, Typography } from 'antd'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { Line, Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const { RangePicker } = DatePicker
const { Option } = Select
const { Text } = Typography

interface AdvancedDashboardProps {
  className?: string
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ className }) => {
  const [period, setPeriod] = useState('7d')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  // Mock data برای نمایش
  const mockData = {
    summary: {
      totalOrders: 1247,
      totalRevenue: 45890000,
      avgOrderValue: 36800,
      orderGrowth: 12.5,
      revenueGrowth: 18.3
    },
    charts: {
      daily: [
        { date: '2025-08-06', orders: 45, revenue: 1650000, avgOrder: 36667 },
        { date: '2025-08-07', orders: 52, revenue: 1920000, avgOrder: 36923 },
        { date: '2025-08-08', orders: 48, revenue: 1760000, avgOrder: 36667 },
        { date: '2025-08-09', orders: 61, revenue: 2250000, avgOrder: 36885 },
        { date: '2025-08-10', orders: 55, revenue: 2020000, avgOrder: 36727 },
        { date: '2025-08-11', orders: 58, revenue: 2130000, avgOrder: 36724 },
        { date: '2025-08-12', orders: 63, revenue: 2310000, avgOrder: 36667 }
      ],
      hourly: [
        { hour: 8, orders: 5, revenue: 180000 },
        { hour: 9, orders: 8, revenue: 295000 },
        { hour: 10, orders: 12, revenue: 441000 },
        { hour: 11, orders: 15, revenue: 552000 },
        { hour: 12, orders: 25, revenue: 920000 },
        { hour: 13, orders: 22, revenue: 809000 },
        { hour: 14, orders: 18, revenue: 662000 },
        { hour: 15, orders: 14, revenue: 514000 },
        { hour: 16, orders: 11, revenue: 404000 },
        { hour: 17, orders: 9, revenue: 331000 }
      ]
    },
    popularItems: [
      { id: '1', name: 'کباب کوبیده', price: 45000, totalSold: 156, orderCount: 89 },
      { id: '2', name: 'چلو خورشت قیمه', price: 38000, totalSold: 134, orderCount: 76 },
      { id: '3', name: 'پیتزا مخصوص', price: 52000, totalSold: 98, orderCount: 67 },
      { id: '4', name: 'برگر ممتاز', price: 42000, totalSold: 87, orderCount: 54 },
      { id: '5', name: 'سالاد سزار', price: 28000, totalSold: 76, orderCount: 48 }
    ]
  }

  // Chart configurations
  const dailyRevenueChart = {
    labels: mockData.charts.daily.map(d => new Date(d.date).toLocaleDateString('fa-IR')),
    datasets: [
      {
        label: 'درآمد روزانه (تومان)',
        data: mockData.charts.daily.map(d => d.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const hourlyOrdersChart = {
    labels: mockData.charts.hourly.map(h => `${h.hour}:00`),
    datasets: [
      {
        label: 'تعداد سفارش',
        data: mockData.charts.hourly.map(h => h.orders),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  }

  const popularItemsChart = {
    labels: mockData.popularItems.map(item => item.name),
    datasets: [
      {
        data: mockData.popularItems.map(item => item.totalSold),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  return (
    <div className={className}>
      {/* Controls */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 200 }}
            placeholder="انتخاب دوره زمانی"
          >
            <Option value="1d">امروز</Option>
            <Option value="7d">7 روز گذشته</Option>
            <Option value="30d">30 روز گذشته</Option>
            <Option value="90d">3 ماه گذشته</Option>
          </Select>
        </Col>
        <Col span={12}>
          <RangePicker style={{ width: '100%' }} />
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل سفارشات"
              value={mockData.summary.totalOrders}
              prefix={<ShoppingCartOutlined />}
              suffix={
                <span style={{ fontSize: '12px', color: mockData.summary.orderGrowth > 0 ? '#52c41a' : '#ff4d4f' }}>
                  {mockData.summary.orderGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockData.summary.orderGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="درآمد کل"
              value={mockData.summary.totalRevenue}
              prefix={<DollarOutlined />}
              suffix={
                <span style={{ fontSize: '12px', color: mockData.summary.revenueGrowth > 0 ? '#52c41a' : '#ff4d4f' }}>
                  {mockData.summary.revenueGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockData.summary.revenueGrowth)}%
                </span>
              }
              formatter={(value) => `${Number(value).toLocaleString()} ﷼`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="میانگین سفارش"
              value={mockData.summary.avgOrderValue}
              prefix={<TeamOutlined />}
              formatter={(value) => `${Number(value).toLocaleString()} ﷼`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="محبوب‌ترین غذا"
              value={mockData.popularItems[0]?.name || 'نامشخص'}
              prefix={<TrophyOutlined />}
              suffix={`${mockData.popularItems[0]?.totalSold || 0} فروش`}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="نمودار درآمد روزانه" extra={<Text type="secondary">تومان</Text>}>
            <Line data={dailyRevenueChart} options={chartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="محبوب‌ترین غذاها">
            <Pie data={popularItemsChart} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="سفارشات ساعتی امروز" extra={<Text type="secondary">تعداد</Text>}>
            <Bar data={hourlyOrdersChart} options={chartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="غذاهای پرفروش" bodyStyle={{ padding: '12px' }}>
            {mockData.popularItems.slice(0, 5).map((item, index) => (
              <div key={item.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0',
                borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none'
              }}>
                <span>{item.name}</span>
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                  {item.totalSold} فروش
                </span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdvancedDashboard
