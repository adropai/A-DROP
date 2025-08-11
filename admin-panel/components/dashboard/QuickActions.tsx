'use client'

import React from 'react'
import { Card, Button, Space, Tooltip } from 'antd'
import { 
  PlusOutlined, 
  MenuOutlined, 
  BarChartOutlined, 
  MessageOutlined, 
  CalendarOutlined,
  ShoppingCartOutlined,
  UserAddOutlined,
  FileTextOutlined 
} from '@ant-design/icons'
import Link from 'next/link'

const QuickActions: React.FC = () => {
  const quickActions = [
    {
      title: 'سفارش جدید',
      icon: <PlusOutlined />,
      href: '/orders/new',
      color: '#1890ff',
      description: 'ثبت سفارش جدید'
    },
    {
      title: 'افزودن منو',
      icon: <MenuOutlined />,
      href: '/menu/new',
      color: '#52c41a',
      description: 'اضافه کردن آیتم جدید'
    },
    {
      title: 'گزارش امروز',
      icon: <BarChartOutlined />,
      href: '/analytics/today',
      color: '#faad14',
      description: 'مشاهده گزارش امروز'
    },
    {
      title: 'پیام گروهی',
      icon: <MessageOutlined />,
      href: '/marketing/broadcast',
      color: '#722ed1',
      description: 'ارسال پیام به مشتریان'
    },
    {
      title: 'رزرو امروز',
      icon: <CalendarOutlined />,
      href: '/reservation/today',
      color: '#13c2c2',
      description: 'مدیریت رزروهای امروز'
    },
    {
      title: 'مشتری جدید',
      icon: <UserAddOutlined />,
      href: '/customers/new',
      color: '#eb2f96',
      description: 'افزودن مشتری جدید'
    }
  ]

  return (
    <Card 
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>اقدامات سریع</span>
        </Space>
      }
      extra={
        <Link href="/dashboard/actions">
          <Button type="link" size="small">همه عملیات</Button>
        </Link>
      }
      style={{ borderRadius: '12px' }}
      styles={{ header: { borderBottom: '1px solid #f0f0f0' } }}
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: 12 
      }}>
        {quickActions.map((action, index) => (
          <Tooltip key={index} title={action.description} placement="top">
            <Link href={action.href}>
              <Button
                type="text"
                style={{
                  height: 'auto',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
                className="quick-action-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color
                  e.currentTarget.style.boxShadow = `0 2px 8px ${action.color}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ 
                  fontSize: 20, 
                  color: action.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {action.icon}
                </div>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 500,
                  textAlign: 'center',
                  color: '#595959'
                }}>
                  {action.title}
                </span>
              </Button>
            </Link>
          </Tooltip>
        ))}
      </div>

      {/* استایل‌های اضافی برای hover effect */}
      <style jsx>{`
        .quick-action-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </Card>
  )
}

export default QuickActions
