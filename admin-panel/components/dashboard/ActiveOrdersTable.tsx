'use client'

import React from 'react'
import { Table, Tag, Button, Space, Avatar, Typography, Tooltip } from 'antd'
import { 
  EyeOutlined, 
  EditOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  CarOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerAvatar?: string
  items: string[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered'
  type: 'dine-in' | 'takeaway' | 'delivery'
  time: string
  estimatedTime?: number
}

interface ActiveOrdersTableProps {
  orders?: Order[]
  loading?: boolean
  onStatusChange?: (orderId: string, newStatus: any) => Promise<void>
}

const ActiveOrdersTable: React.FC<ActiveOrdersTableProps> = ({ 
  orders: propOrders, 
  loading = false, 
  onStatusChange 
}) => {
  // Default mock data - در حالت واقعی از API دریافت می‌شود
  const defaultOrders: Order[] = [
    {
      id: '1',
      orderNumber: '#1234',
      customerName: 'احمد محمدی',
      items: ['چلو کباب کوبیده', 'نوشابه', 'سالاد شیرازی'],
      total: 485000,
      status: 'preparing',
      type: 'dine-in',
      time: '14:30',
      estimatedTime: 15
    },
    {
      id: '2',
      orderNumber: '#1235',
      customerName: 'فاطمه احمدی',
      items: ['پیتزا مخصوص', 'آبمیوه'],
      total: 320000,
      status: 'confirmed',
      type: 'delivery',
      time: '14:25',
      estimatedTime: 25
    },
    {
      id: '3',
      orderNumber: '#1236',
      customerName: 'علی رضایی',
      items: ['برگر مخصوص', 'سیب زمینی', 'کوکاکولا'],
      total: 280000,
      status: 'ready',
      type: 'takeaway',
      time: '14:20'
    },
    {
      id: '4',
      orderNumber: '#1237',
      customerName: 'مریم کریمی',
      items: ['جوجه کباب', 'برنج زعفرانی'],
      total: 420000,
      status: 'pending',
      type: 'dine-in',
      time: '14:35',
      estimatedTime: 20
    },
    {
      id: '5',
      orderNumber: '#1238',
      customerName: 'محسن نوری',
      items: ['قرمه سبزی', 'برنج', 'دوغ'],
      total: 180000,
      status: 'preparing',
      type: 'delivery',
      time: '14:15',
      estimatedTime: 30
    }
  ]

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'orange'
      case 'confirmed': return 'blue'
      case 'preparing': return 'purple'
      case 'ready': return 'green'
      case 'delivered': return 'gray'
      default: return 'default'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'در انتظار'
      case 'confirmed': return 'تأیید شده'
      case 'preparing': return 'در حال آماده‌سازی'
      case 'ready': return 'آماده'
      case 'delivered': return 'تحویل داده شده'
      default: return status
    }
  }

  const getTypeIcon = (type: Order['type']) => {
    switch (type) {
      case 'dine-in': return <ShopOutlined />
      case 'takeaway': return <CarOutlined />
      case 'delivery': return <SendOutlined />
      default: return <UserOutlined />
    }
  }

  const getTypeText = (type: Order['type']) => {
    switch (type) {
      case 'dine-in': return 'حضوری'
      case 'takeaway': return 'بیرون بر'
      case 'delivery': return 'ارسالی'
      default: return type
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (onStatusChange) {
      await onStatusChange(orderId, newStatus)
    } else {
      // تغییر وضعیت سفارش
      // در اینجا API call برای تغییر وضعیت انجام می‌شود
    }
  }

  const columns: ColumnsType<Order> = [
    {
      title: 'شماره سفارش',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      render: (text: string) => (
        <Text strong style={{ color: '#1890ff' }}>{text}</Text>
      )
    },
    {
      title: 'مشتری',
      key: 'customer',
      width: 150,
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.customerAvatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <Text>{record.customerName}</Text>
        </Space>
      )
    },
    {
      title: 'آیتم‌ها',
      dataIndex: 'items',
      key: 'items',
      render: (items: string[]) => (
        <Tooltip title={items.join('، ')}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {items.join('، ')}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'مبلغ',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total: number) => (
        <Text strong>{total.toLocaleString('fa-IR')} تومان</Text>
      )
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: Order['type']) => (
        <Space>
          {getTypeIcon(type)}
          <Text>{getTypeText(type)}</Text>
        </Space>
      )
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: Order['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'زمان',
      key: 'timing',
      width: 100,
      render: (_, record) => (
        <div>
          <Text>{record.time}</Text>
          {record.estimatedTime && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <ClockCircleOutlined /> {record.estimatedTime} دقیقه
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="مشاهده جزئیات">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {/* مشاهده سفارش */}}
            />
          </Tooltip>
          <Tooltip title="ویرایش">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => {/* ویرایش سفارش */}}
            />
          </Tooltip>
          {record.status !== 'delivered' && (
            <Tooltip title="تأیید مرحله بعد">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined />} 
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => {
                  const nextStatus = record.status === 'pending' ? 'confirmed' :
                                   record.status === 'confirmed' ? 'preparing' :
                                   record.status === 'preparing' ? 'ready' : 'delivered'
                  handleStatusChange(record.id, nextStatus)
                }}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  const orders = propOrders || defaultOrders

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      loading={loading}
      pagination={false}
      size="small"
      scroll={{ x: 1000 }}
      style={{ 
        backgroundColor: '#fff',
        borderRadius: '8px'
      }}
      rowClassName={(record) => {
        if (record.status === 'ready') return 'order-ready'
        if (record.estimatedTime && record.estimatedTime < 10) return 'order-urgent'
        return ''
      }}
    />
  )
}

export default ActiveOrdersTable
