'use client'

import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, message } from 'antd'
import { EyeOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons'

interface Order {
  id: string
  tableNumber: string
  items: string[]
  totalAmount: number
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED'
  createdAt: string
  customerName?: string
}

const ActiveOrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  // Mock data
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1247',
        tableNumber: '12',
        items: ['کباب کوبیده', 'نوشابه'],
        totalAmount: 65000,
        status: 'PREPARING',
        createdAt: '10:30',
        customerName: 'علی احمدی'
      },
      {
        id: '1248',
        tableNumber: '8',
        items: ['پیتزا مخصوص', 'سالاد سزار'],
        totalAmount: 89000,
        status: 'PENDING',
        createdAt: '10:45',
        customerName: 'مریم رضایی'
      },
      {
        id: '1249',
        tableNumber: '15',
        items: ['چلو خورشت قیمه'],
        totalAmount: 42000,
        status: 'READY',
        createdAt: '10:15',
        customerName: 'محمد کریمی'
      }
    ]
    setOrders(mockOrders)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange'
      case 'PREPARING': return 'blue'
      case 'READY': return 'green'
      case 'DELIVERED': return 'gray'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'در انتظار'
      case 'PREPARING': return 'در حال آماده‌سازی'
      case 'READY': return 'آماده تحویل'
      case 'DELIVERED': return 'تحویل شده'
      default: return status
    }
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any }
          : order
      )
    )
    message.success('وضعیت سفارش به‌روزرسانی شد')
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
      render: (num: string) => `میز ${num}`
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
      render: (items: string[]) => items.join(', ')
    },
    {
      title: 'مبلغ',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount.toLocaleString()} ﷼`
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
      render: (_, record: Order) => (
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
              onClick={() => handleStatusChange(record.id, 'DELIVERED')}
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
