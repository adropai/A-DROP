'use client'

import { useState, useEffect } from 'react'
import { Card, Table, Tag, Space, Typography, Row, Col, Statistic, Button, message } from 'antd'
import { ShoppingCartOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title } = Typography

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; phone: string };
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: string;
  type: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      const data = await response.json()
      console.log('📦 Orders data received:', data)
      
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      message.error('خطا در دریافت سفارشات')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'blue'
      case 'Preparing': return 'orange' 
      case 'Ready': return 'green'
      case 'Delivered': return 'default'
      case 'Cancelled': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'New': return 'جدید'
      case 'Preparing': return 'در حال آماده‌سازی'
      case 'Ready': return 'آماده تحویل'
      case 'Delivered': return 'تحویل شده'
      case 'Cancelled': return 'لغو شده'
      default: return status
    }
  }

  const orderSummary = {
    total: orders.length,
    new: orders.filter(o => o.status === 'New').length,
    preparing: orders.filter(o => o.status === 'Preparing').length,
    ready: orders.filter(o => o.status === 'Ready').length
  }

  const columns = [
    {
      title: 'شماره سفارش',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'مشتری',
      dataIndex: ['customer', 'name'],
      key: 'customer',
    },
    {
      title: 'تلفن',
      dataIndex: ['customer', 'phone'],
      key: 'phone',
    },
    {
      title: 'مبلغ کل',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount.toLocaleString()} تومان`
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'نوع سفارش',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small">مشاهده</Button>
          <Button size="small" type="primary">تغییر وضعیت</Button>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6">
      <Title level={2}>مدیریت سفارشات</Title>
      
      {/* آمار خلاصه */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic 
              title="کل سفارشات" 
              value={orderSummary.total} 
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="سفارشات جدید" 
              value={orderSummary.new} 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="در حال آماده‌سازی" 
              value={orderSummary.preparing} 
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="آماده تحویل" 
              value={orderSummary.ready} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* جدول سفارشات */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `نمایش ${range[0]} تا ${range[1]} از ${total} سفارش`
          }}
        />
      </Card>
    </div>
  )
}
