'use client'

import React, { useState, useEffect } from 'react'
import { Card, List, Badge, Button, Empty, Spin } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  timestamp: Date
  read: boolean
}

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  // Mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'سفارش جدید',
        message: 'سفارش #1247 دریافت شد',
        type: 'info',
        timestamp: new Date(),
        read: false
      },
      {
        id: '2',
        title: 'آشپزخانه',
        message: 'سفارش #1245 آماده تحویل',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        title: 'هشدار موجودی',
        message: 'موجودی کباب کوبیده کم است',
        type: 'warning',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: true
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'همین حالا'
    if (minutes < 60) return `${minutes} دقیقه پیش`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ساعت پیش`
    
    const days = Math.floor(hours / 24)
    return `${days} روز پیش`
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'error': return 'red'
      case 'warning': return 'orange'
      case 'success': return 'green'
      default: return 'blue'
    }
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BellOutlined />
          اعلان‌ها
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="small" />
          )}
        </div>
      }
      size="small"
      style={{ height: 400 }}
      styles={{ body: { padding: '8px', height: 340, overflow: 'auto' } }}
    >
      <Spin spinning={loading}>
        {notifications.length === 0 ? (
          <Empty 
            description="اعلانی وجود ندارد" 
            style={{ margin: '50px 0' }}
          />
        ) : (
          <List
            size="small"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '8px 12px',
                  backgroundColor: item.read ? 'transparent' : '#f6ffed',
                  border: item.read ? 'none' : '1px solid #b7eb8f',
                  borderRadius: 4,
                  marginBottom: 4
                }}
                actions={!item.read ? [
                  <Button 
                    key="read"
                    type="link" 
                    size="small" 
                    icon={<CheckOutlined />}
                    onClick={() => markAsRead(item.id)}
                  >
                    خوانده شد
                  </Button>
                ] : undefined}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge color={getBadgeColor(item.type)} />
                      <span style={{ fontWeight: item.read ? 'normal' : 'bold' }}>
                        {item.title}
                      </span>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 4 }}>{item.message}</div>
                      <small style={{ color: '#8c8c8c' }}>
                        {getTimeAgo(item.timestamp)}
                      </small>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )
}

export default NotificationPanel
