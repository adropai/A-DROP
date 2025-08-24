'use client'

import React from 'react'
import { Card, Table, Tag, Button, Space, message, Alert } from 'antd'
import { EyeOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useOrders } from '@/hooks/useDashboardDataOptimized'

type DashboardOrder = {
  id: string
  tableNumber?: number | null
  items: string[]
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED'
  createdAt: string
  customerName?: string
}

const ActiveOrdersTable: React.FC = () => {
  const { orders, loading, error, updateOrderStatus } = useOrders()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange'
      case 'PREPARING': return 'blue'
      case 'READY': return 'green'
      case 'SERVED': return 'gray'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'در انتظار'
      case 'PREPARING': return 'در حال آماده‌سازی'
      case 'READY': return 'آماده تحویل'
      case 'SERVED': return 'سرو شده'
      default: return status
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      message.success('وضعیت سفارش به‌روزرسانی شد')
    } catch (e) {
      message.error('خطا در به‌روزرسانی وضعیت سفارش')
    }
  }

  const columns = [
    {
      title: 'سفارش',
      dataIndex: 'id',
      key: 'id',
  render: (id: string) => `#${id}`
    },
    {
      title: 'میز',
  dataIndex: 'tableNumber',
      key: 'tableNumber',
  render: (num: string | number | null) => num ? `میز ${num}` : '-'
    },
    {
      title: 'مشتری',
      dataIndex: 'customerName',
      key: 'customerName'
    },
    {
      title: 'آیتم‌ها',
      dataIndex: 'items',
      key: 'items',
  render: (items: string[]) => (items || []).join(', ')
    },
    {
      title: 'مبلغ',
  dataIndex: 'total',
  key: 'total',
  render: (amount: number) => `${(amount || 0).toLocaleString()} ﷼`
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
      title: 'زمان',
      dataIndex: 'createdAt',
      key: 'createdAt',
  render: (time: string) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {time}
        </span>
      )
    },
    {
      title: 'عملیات',
      key: 'actions',
  render: (_: unknown, record: DashboardOrder) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} />
          {record.status === 'PENDING' && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => handleStatusChange(record.id, 'PREPARING')}
            >
              شروع آماده‌سازی
            </Button>
          )}
          {record.status === 'PREPARING' && (
            <Button 
              size="small" 
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusChange(record.id, 'READY')}
            >
              آماده است
            </Button>
          )}
      {record.status === 'READY' && (
            <Button 
              size="small" 
              type="default"
        onClick={() => handleStatusChange(record.id, 'SERVED')}
            >
              تحویل شد
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <Card title="سفارشات فعال" size="small">
      {error && (
        <Alert type="error" showIcon message="خطا در دریافت سفارشات" description={error} style={{ marginBottom: 12 }} />
      )}
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
      />
    </Card>
  )
}

export default ActiveOrdersTable
