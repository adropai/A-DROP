'use client'

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Tag, List, Avatar, Button, Space, message } from 'antd'
import { 
  ClockCircleOutlined, FireOutlined, CheckCircleOutlined, 
  AlertOutlined, UserOutlined, ShoppingCartOutlined 
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface KitchenDisplayProps {
  refreshInterval?: number
}

const KitchenDisplay: React.FC<KitchenDisplayProps> = ({ refreshInterval = 30000 }) => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKitchenOrders()
    
    const interval = setInterval(() => {
      fetchKitchenOrders()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const fetchKitchenOrders = async () => {
    try {
      const response = await fetch('/api/kitchen/orders')
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error)
      message.error('خطا در دریافت سفارشات آشپزخانه')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/kitchen/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        message.success('وضعیت سفارش آشپزخانه بروزرسانی شد')
        fetchKitchenOrders()
      } else {
        message.error('خطا در بروزرسانی وضعیت')
      }
    } catch (error) {
      console.error('Error updating kitchen order:', error)
      message.error('خطا در بروزرسانی وضعیت')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'orange',
      'preparing': 'blue',
      'ready': 'green',
      'completed': 'success'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts = {
      'pending': 'در انتظار',
      'preparing': 'در حال آماده‌سازی',
      'ready': 'آماده',
      'completed': 'تکمیل شده'
    }
    return texts[status as keyof typeof texts] || status
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': '#ff4d4f',
      'medium': '#faad14',
      'low': '#52c41a'
    }
    return colors[priority as keyof typeof colors] || '#1890ff'
  }

  const getTimeDifference = (createdAt: string) => {
    const now = dayjs()
    const created = dayjs(createdAt)
    const diffMinutes = now.diff(created, 'minute')
    
    if (diffMinutes < 60) {
      return `${diffMinutes} دقیقه پیش`
    } else {
      return `${Math.floor(diffMinutes / 60)} ساعت پیش`
    }
  }

  const urgentOrders = orders.filter(order => {
    const diffMinutes = dayjs().diff(dayjs(order.createdAt), 'minute')
    return diffMinutes > 30 || order.priority === 'high'
  })

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Title level={3}>
            نمایشگر آشپزخانه
            <Tag color={urgentOrders.length > 0 ? 'red' : 'green'} style={{ marginLeft: 16 }}>
              {orders.filter(o => o.status !== 'completed').length} سفارش فعال
            </Tag>
          </Title>
        </Col>
      </Row>

      {urgentOrders.length > 0 && (
        <Card 
          title={
            <Space>
              <AlertOutlined style={{ color: '#ff4d4f' }} />
              <Text style={{ color: '#ff4d4f' }}>سفارشات فوری</Text>
            </Space>
          }
          style={{ marginBottom: 24, border: '2px solid #ff4d4f' }}
        >
          <Row gutter={[16, 16]}>
            {urgentOrders.map(order => (
              <Col xs={24} sm={12} lg={8} key={order.id}>
                <Card 
                  size="small"
                  style={{ 
                    backgroundColor: '#fff2f0',
                    border: '1px solid #ff4d4f'
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Row justify="space-between" align="middle">
                      <Text strong>#{order.orderNumber}</Text>
                      <Tag color="red">فوری</Tag>
                    </Row>
                    <Text type="secondary">{getTimeDifference(order.createdAt)}</Text>
                    <Button 
                      type="primary" 
                      danger 
                      size="small"
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                    >
                      شروع آماده‌سازی
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        {/* Pending Orders */}
        <Col xs={24} lg={8}>
          <Card title="در انتظار" extra={<ClockCircleOutlined />}>
            <List
              dataSource={orders.filter(o => o.status === 'pending')}
              renderItem={order => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Row justify="space-between">
                        <Text strong>#{order.orderNumber}</Text>
                        <Tag color={getPriorityColor(order.priority)}>
                          {order.priority === 'high' ? 'بالا' : 
                           order.priority === 'medium' ? 'متوسط' : 'پایین'}
                        </Tag>
                      </Row>
                      <Text type="secondary">{getTimeDifference(order.createdAt)}</Text>
                      <Text>میز: {order.tableNumber || '-'}</Text>
                      <div>
                        {order.items?.map((item: any, index: number) => (
                          <div key={index}>
                            <Text>{item.name} x {item.quantity}</Text>
                            {item.notes && (
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                <br />یادداشت: {item.notes}
                              </Text>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button 
                        type="primary" 
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        style={{ width: '100%' }}
                      >
                        شروع آماده‌سازی
                      </Button>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Preparing Orders */}
        <Col xs={24} lg={8}>
          <Card title="در حال آماده‌سازی" extra={<FireOutlined />}>
            <List
              dataSource={orders.filter(o => o.status === 'preparing')}
              renderItem={order => (
                <List.Item>
                  <Card size="small" style={{ width: '100%', backgroundColor: '#e6f7ff' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Row justify="space-between">
                        <Text strong>#{order.orderNumber}</Text>
                        <Tag color="blue">در حال آماده‌سازی</Tag>
                      </Row>
                      <Text type="secondary">{getTimeDifference(order.createdAt)}</Text>
                      <Text>میز: {order.tableNumber || '-'}</Text>
                      <div>
                        {order.items?.map((item: any, index: number) => (
                          <div key={index}>
                            <Text>{item.name} x {item.quantity}</Text>
                            {item.notes && (
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                <br />یادداشت: {item.notes}
                              </Text>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button 
                        type="primary" 
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                      >
                        آماده است
                      </Button>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Ready Orders */}
        <Col xs={24} lg={8}>
          <Card title="آماده تحویل" extra={<CheckCircleOutlined />}>
            <List
              dataSource={orders.filter(o => o.status === 'ready')}
              renderItem={order => (
                <List.Item>
                  <Card size="small" style={{ width: '100%', backgroundColor: '#f6ffed' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Row justify="space-between">
                        <Text strong>#{order.orderNumber}</Text>
                        <Tag color="green">آماده</Tag>
                      </Row>
                      <Text type="secondary">{getTimeDifference(order.createdAt)}</Text>
                      <Text>میز: {order.tableNumber || '-'}</Text>
                      <div>
                        {order.items?.map((item: any, index: number) => (
                          <div key={index}>
                            <Text>{item.name} x {item.quantity}</Text>
                          </div>
                        ))}
                      </div>
                      <Button 
                        type="default" 
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        style={{ width: '100%' }}
                      >
                        تحویل داده شد
                      </Button>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default KitchenDisplay
