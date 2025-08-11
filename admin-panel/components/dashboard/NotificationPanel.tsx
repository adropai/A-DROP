'use client'

import React from 'react'
import { Card, List, Badge, Avatar, Button, Typography, Space, Tag } from 'antd'
import { 
  BellOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const { Text } = Typography

interface Notification {
  id: string
  type: 'order' | 'warning' | 'info' | 'success'
  title: string
  message: string
  time: string
  read: boolean
  priority: 'high' | 'medium' | 'low'
}

const NotificationPanel: React.FC = () => {
  // داده‌های نمونه اعلان‌ها
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'order',
      title: 'سفارش جدید',
      message: 'سفارش #1234 از علی احمدی دریافت شد',
      time: '2 دقیقه پیش',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'warning',
      title: 'کمبود موجودی',
      message: 'موجودی برنج کمتر از 5 کیلو شده است',
      time: '15 دقیقه پیش',
      read: false,
      priority: 'high'
    },
    {
      id: '3',
      type: 'order',
      title: 'سفارش آماده',
      message: 'سفارش #1230 آماده تحویل است',
      time: '30 دقیقه پیش',
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'info',
      title: 'مشتری جدید',
      message: 'مریم کریمی عضو سیستم شد',
      time: '1 ساعت پیش',
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'success',
      title: 'پرداخت موفق',
      message: 'پرداخت سفارش #1225 با موفقیت انجام شد',
      time: '2 ساعت پیش',
      read: true,
      priority: 'medium'
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCartOutlined style={{ color: '#1890ff' }} />
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />
      case 'info':
        return <ExclamationCircleOutlined style={{ color: '#13c2c2' }} />
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      default:
        return <BellOutlined />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ff4d4f'
      case 'medium':
        return '#faad14'
      case 'low':
        return '#52c41a'
      default:
        return '#d9d9d9'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Card 
      title={
        <Space>
          <Badge count={unreadCount} size="small">
            <BellOutlined />
          </Badge>
          <span>اعلان‌ها</span>
        </Space>
      }
      extra={
        <Button type="link" size="small">
          مشاهده همه
        </Button>
      }
      style={{ borderRadius: '12px' }}
      styles={{ 
        header: { borderBottom: '1px solid #f0f0f0' },
        body: { padding: 0 }
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        style={{ maxHeight: 400, overflowY: 'auto' }}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '12px 16px',
              backgroundColor: item.read ? 'transparent' : '#f6f8ff',
              borderLeft: `3px solid ${getPriorityColor(item.priority)}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="notification-item"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = item.read ? 'transparent' : '#f6f8ff'
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={getNotificationIcon(item.type)}
                  style={{ 
                    backgroundColor: 'transparent',
                    border: '1px solid #f0f0f0' 
                  }}
                />
              }
              title={
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <Text strong style={{ fontSize: 13 }}>
                    {item.title}
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {!item.read && (
                      <Badge 
                        dot 
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    )}
                    <Tag 
                      color={getPriorityColor(item.priority)}
                      style={{ margin: 0, fontSize: 10 }}
                    >
                      {item.priority === 'high' ? 'فوری' : 
                       item.priority === 'medium' ? 'مهم' : 'عادی'}
                    </Tag>
                  </div>
                </div>
              }
              description={
                <div>
                  <Text style={{ fontSize: 12, color: '#595959' }}>
                    {item.message}
                  </Text>
                  <div style={{ 
                    marginTop: 4, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4 
                  }}>
                    <ClockCircleOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />
                    <Text style={{ fontSize: 10, color: '#8c8c8c' }}>
                      {item.time}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />

      {notifications.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#8c8c8c' 
        }}>
          <BellOutlined style={{ fontSize: 24, marginBottom: 8 }} />
          <div>اعلانی موجود نیست</div>
        </div>
      )}
    </Card>
  )
}

export default NotificationPanel
