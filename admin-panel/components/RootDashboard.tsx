'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Drawer, Switch, Select, Space, ColorPicker, Card, Grid } from 'antd'
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  RobotOutlined,
  BarChartOutlined,
  SkinOutlined,
  MessageOutlined,
  InboxOutlined,
  CalendarOutlined,
  FireOutlined,
  QrcodeOutlined,
  MobileOutlined,
  CarOutlined,
  TeamOutlined
} from '@ant-design/icons'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'

const { Header, Sider, Content } = Layout
const { Option } = Select
const { useBreakpoint } = Grid

const RootDashboard = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>('right')
  const [layoutDirection, setLayoutDirection] = useState<'rtl' | 'ltr'>('rtl')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#1890ff')
  const [settingsVisible, setSettingsVisible] = useState(false)
  
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()

  // Check if current page is auth page (but not root page)
  const isAuthPage = pathname?.startsWith('/auth')

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
    }
  }, [isMobile])

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">داشبورد</Link>,
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: <Link href="/orders">سفارشات</Link>,
    },
    {
      key: '/menu',
      icon: <MenuOutlined />,
      label: <Link href="/menu">منو</Link>,
    },
    {
      key: '/tables',
      icon: <QrcodeOutlined />,
      label: <Link href="/tables">میزها و QR Code</Link>,
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: <Link href="/customers">مشتریان</Link>,
    },
    {
      key: '/reservation',
      icon: <CalendarOutlined />,
      label: <Link href="/reservation">رزرواسیون</Link>,
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: <Link href="/inventory">انبارداری</Link>,
    },
    {
      key: '/kitchen',
      icon: <FireOutlined />,
      label: <Link href="/kitchen">آشپزخانه</Link>,
    },
    {
      key: '/delivery',
      icon: <CarOutlined />,
      label: <Link href="/delivery">تحویل</Link>,
    },
    {
      key: '/marketing',
      icon: <MessageOutlined />,
      label: <Link href="/marketing">تبلیغات</Link>,
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: <Link href="/analytics">تحلیل و گزارش</Link>,
    },
    {
      key: '/staff',
      icon: <TeamOutlined />,
      label: <Link href="/staff">مدیریت کارکنان</Link>,
    },
    {
      key: '/ai-training',
      icon: <RobotOutlined />,
      label: <Link href="/ai-training">هوش مصنوعی</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">تنظیمات</Link>,
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'پروفایل',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'تنظیمات',
      onClick: () => setSettingsVisible(true),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'خروج',
      danger: true,
      onClick: async () => {
        await logout()
        window.location.href = '/auth/login'
      },
    },
  ]

  const handleDirectionChange = (direction: 'rtl' | 'ltr') => {
    setLayoutDirection(direction)
    document.documentElement.dir = direction
  }

  // Mobile sidebar component
  const MobileSidebar = () => (
    <Drawer
      title={
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: primaryColor,
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          A-DROP
        </div>
      }
      placement={sidebarPosition}
      onClose={() => setMobileDrawerVisible(false)}
      open={mobileDrawerVisible}
      width={250}
      styles={{ body: { padding: 0 } }}
    >
      <Menu
        theme={isDarkMode ? 'dark' : 'light'}
        mode="inline"
        defaultSelectedKeys={['/dashboard']}
        items={menuItems}
        style={{ borderInlineEnd: 'none', height: '100%' }}
        onClick={() => setMobileDrawerVisible(false)}
      />
    </Drawer>
  )

  // If user is not authenticated or on auth page, show simple layout
  if (!isAuthenticated || isAuthPage) {
    return (
      <div style={{ minHeight: '100vh' }}>
        {children}
      </div>
    )
  }

  return (
    <Layout style={{ 
      minHeight: '100vh',
      direction: layoutDirection 
    }}>
      {/* Mobile Sidebar */}
      {isMobile && <MobileSidebar />}
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          collapsedWidth={80}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            [sidebarPosition]: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            borderInlineEnd: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0'
          }}
          theme={isDarkMode ? 'dark' : 'light'}
        >
          <div style={{ 
            height: 48, 
            margin: 16, 
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: collapsed ? '14px' : '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {collapsed ? 'A' : 'A-DROP'}
          </div>
          
          <Menu
            theme={isDarkMode ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={['/dashboard']}
            items={menuItems}
            style={{ 
              borderInlineEnd: 'none',
              fontSize: '14px'
            }}
          />
        </Sider>
      )}
        
      <Layout style={{ 
        marginLeft: !isMobile ? (sidebarPosition === 'left' ? (collapsed ? 80 : 250) : 0) : 0,
        marginRight: !isMobile ? (sidebarPosition === 'right' ? (collapsed ? 80 : 250) : 0) : 0,
        transition: 'all 0.2s'
      }}>
        <Header style={{ 
          padding: '0 16px', 
          background: isDarkMode ? '#141414' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderBottom: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 64
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              type="text"
              icon={isMobile ? <MobileOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={() => isMobile ? setMobileDrawerVisible(true) : setCollapsed(!collapsed)}
              style={{ 
                fontSize: '16px', 
                width: 48, 
                height: 48,
                color: isDarkMode ? '#fff' : '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
            
            {isMobile && (
              <div style={{
                color: primaryColor,
                fontWeight: 'bold',
                fontSize: '18px',
                marginLeft: 8
              }}>
                A-DROP
              </div>
            )}
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? 8 : 16 
          }}>
            {!isMobile && (
              <Button
                type="text"
                icon={<SkinOutlined />}
                onClick={() => setSettingsVisible(true)}
                style={{ 
                  color: isDarkMode ? '#fff' : '#000',
                  width: 40,
                  height: 40
                }}
              />
            )}
            
            <Badge count={5} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                style={{ 
                  color: isDarkMode ? '#fff' : '#000',
                  width: 40,
                  height: 40
                }}
              />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomLeft">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                color: isDarkMode ? '#fff' : '#000',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  size={isMobile ? 32 : 36}
                  style={{ backgroundColor: primaryColor }}
                  src={user?.avatar}
                />
                {!isMobile && (
                  <span style={{ marginLeft: 8, fontWeight: 500 }}>
                    {user?.name || 'کاربر'}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ 
          margin: isMobile ? '12px 8px' : '24px 16px',
          padding: isMobile ? 12 : 24,
          minHeight: 'calc(100vh - 64px)',
          background: isDarkMode ? '#1f1f1f' : '#f5f5f5',
          borderRadius: isMobile ? 8 : 12,
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>

      {/* Settings Drawer */}
      <Drawer
        title={
          <Space>
            <SkinOutlined />
            تنظیمات ظاهر
          </Space>
        }
        placement={sidebarPosition === 'right' ? 'left' : 'right'}
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={320}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Theme Mode */}
          <Card size="small" title="حالت تم">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>حالت تاریک</span>
                <Switch
                  checked={isDarkMode}
                  onChange={setIsDarkMode}
                  checkedChildren="🌙"
                  unCheckedChildren="☀️"
                />
              </div>
            </Space>
          </Card>

          {/* Layout Direction */}
          <Card size="small" title="جهت صفحه">
            <Select
              value={layoutDirection}
              onChange={handleDirectionChange}
              style={{ width: '100%' }}
            >
              <Option value="rtl">راست به چپ (RTL)</Option>
              <Option value="ltr">چپ به راست (LTR)</Option>
            </Select>
          </Card>

          {/* Sidebar Position */}
          <Card size="small" title="موقعیت منو">
            <Select
              value={sidebarPosition}
              onChange={setSidebarPosition}
              style={{ width: '100%' }}
            >
              <Option value="right">سمت راست</Option>
              <Option value="left">سمت چپ</Option>
            </Select>
          </Card>

          {/* Primary Color */}
          <Card size="small" title="رنگ اصلی">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ColorPicker
                value={primaryColor}
                onChange={(color) => setPrimaryColor(color.toHexString())}
                showText
                style={{ width: '100%' }}
              />
              
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  '#1890ff', '#52c41a', '#faad14', '#f5222d', 
                  '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'
                ].map(color => (
                  <div
                    key={color}
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: color,
                      borderRadius: 6,
                      cursor: 'pointer',
                      border: primaryColor === color ? '2px solid #000' : '1px solid #d9d9d9'
                    }}
                    onClick={() => setPrimaryColor(color)}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card size="small" title="عملیات سریع">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                onClick={() => {
                  setIsDarkMode(false)
                  setLayoutDirection('rtl')
                  setSidebarPosition('right')
                  setPrimaryColor('#1890ff')
                }}
              >
                بازگردانی به حالت پیش‌فرض
              </Button>
              
              <Button 
                block
                type="primary"
                onClick={() => {
                  localStorage.setItem('dashboardSettings', JSON.stringify({
                    isDarkMode,
                    layoutDirection,
                    sidebarPosition,
                    primaryColor
                  }))
                }}
              >
                ذخیره تنظیمات
              </Button>
            </Space>
          </Card>

        </div>
      </Drawer>
    </Layout>
  )
}

export default RootDashboard
