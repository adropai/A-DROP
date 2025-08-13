'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Progress, Typography } from 'antd'
import { 
  ShoppingCartOutlined, ClockCircleOutlined, CheckCircleOutlined, 
  DollarOutlined, TruckOutlined, FireOutlined 
} from '@ant-design/icons'

const { Title } = Typography

interface OrderStatsProps {
  stats: {
    totalOrders: number
    todayOrders: number
    pendingOrders: number
    preparingOrders: number
    readyOrders: number
    completedOrders: number
    totalRevenue: number
    todayRevenue: number
    averageOrderValue: number
    completionRate: number
  }
}

const OrderStats: React.FC<OrderStatsProps> = ({ stats }) => {
  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return '#52c41a'
    if (rate >= 70) return '#faad14'
    return '#ff4d4f'
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>آمار سفارشات</Title>
      
      <Row gutter={[16, 16]}>
        {/* Total Orders */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل سفارشات"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        {/* Today Orders */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="سفارشات امروز"
              value={stats.todayOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        {/* Total Revenue */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل درآمد"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="﷼"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        {/* Today Revenue */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="درآمد امروز"
              value={stats.todayRevenue}
              prefix={<DollarOutlined />}
              suffix="﷼"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Pending Orders */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="در انتظار"
              value={stats.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        {/* Preparing Orders */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="در حال آماده‌سازی"
              value={stats.preparingOrders}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        {/* Ready Orders */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="آماده تحویل"
              value={stats.readyOrders}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>

        {/* Completed Orders */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="تکمیل شده"
              value={stats.completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Average Order Value */}
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="میانگین ارزش سفارش"
              value={stats.averageOrderValue}
              prefix={<DollarOutlined />}
              suffix="﷼"
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        {/* Completion Rate */}
        <Col xs={24} sm={12}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Statistic
                title="نرخ تکمیل سفارشات"
                value={stats.completionRate}
                suffix="%"
                precision={1}
                valueStyle={{ color: getCompletionColor(stats.completionRate) }}
              />
            </div>
            <Progress
              percent={stats.completionRate}
              strokeColor={getCompletionColor(stats.completionRate)}
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default OrderStats
