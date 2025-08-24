'use client'

import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Space, Typography, App } from 'antd'
import { 
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  GiftOutlined,
  BarChartOutlined,
  TableOutlined,
  CrownOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CarOutlined,
  BoxPlotOutlined,
  CoffeeOutlined,
  CalendarOutlined,
  SafetyOutlined,
  RobotOutlined,
  DollarCircleOutlined,
  CustomerServiceOutlined,
  TagsOutlined,
  ApiOutlined,
  LockOutlined
} from '@ant-design/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './providers/AuthProvider'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const RootDashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { message } = App.useApp();
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    message.success('با موفقیت خارج شدید')
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">داشبرد</Link>
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: <Link href="/orders">سفارشات</Link>
    },
    {
      key: '/menu',
      icon: <MenuOutlined />,
      label: <Link href="/menu">منو</Link>
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: <Link href="/customers">مشتریان</Link>
    },
    {
      key: '/cashier',
      icon: <DollarCircleOutlined />,
      label: <Link href="/cashier">صندوق</Link>
    },
    {
      key: '/kitchen',
      icon: <CoffeeOutlined />,
      label: <Link href="/kitchen">آشپزخانه</Link>
    },
    {
      key: '/delivery',
      icon: <CarOutlined />,
      label: <Link href="/delivery">تحویل</Link>
    },
    {
      key: '/reservation',
      icon: <CalendarOutlined />,
      label: <Link href="/reservation">رزرو</Link>
    },
    {
      key: '/tables',
      icon: <TableOutlined />,
      label: <Link href="/tables">میزها</Link>
    },
    {
      key: '/inventory',
      icon: <BoxPlotOutlined />,
      label: <Link href="/inventory">انبار</Link>
    },
    {
      key: '/team-management',
      icon: <TeamOutlined />,
      label: <Link href="/team-management">مدیریت تیم</Link>
    },
    {
      key: '/loyalty',
      icon: <GiftOutlined />,
      label: <Link href="/loyalty">برنامه وفاداری</Link>
    },
    {
      key: '/marketing',
      icon: <TagsOutlined />,
      label: <Link href="/marketing">بازاریابی</Link>
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: <Link href="/analytics">آنالیتیکس</Link>
    },
    {
      key: '/integrations',
      icon: <ApiOutlined />,
      label: <Link href="/integrations">یکپارچه‌سازی</Link>
    },
    {
      key: '/ai-training',
      icon: <RobotOutlined />,
      label: <Link href="/ai-training">آموزش هوش مصنوعی</Link>
    },
    {
      key: '/security',
      icon: <SafetyOutlined />,
      label: <Link href="/security">امنیت</Link>
    },
    {
      key: '/support',
      icon: <CustomerServiceOutlined />,
      label: <Link href="/support">پشتیبانی</Link>
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">تنظیمات</Link>
    }
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'پروفایل کاربری'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'تنظیمات'
    },
    {
      key: 'divider',
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'خروج',
      danger: true,
      onClick: handleLogout
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <CrownOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          {!collapsed && <Text strong style={{ marginLeft: '8px', color: '#1890ff' }}>A-DROP</Text>}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ border: 'none', marginTop: '16px' }}
          items={menuItems}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px' }}
          />
          
          <Space size="large">
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text strong>{user?.name || 'مدیر سیستم'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: 0, background: '#f5f5f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default RootDashboard
