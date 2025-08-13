'use client'

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Space, Alert, Button, Progress, Badge, Tooltip, Grid } from 'antd'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TrophyOutlined,
  ReloadOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FireOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ShopOutlined,
  CoffeeOutlined,
  CarOutlined,
  HeartOutlined,
  BookOutlined,
  SettingOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import Link from 'next/link'

// Components
import QuickActions from '@/components/dashboard/QuickActions'
import NotificationPanel from '@/components/dashboard/NotificationPanel'
import GaugeChart from '@/components/dashboard/GaugeChart'
import ActiveOrdersTable from '@/components/dashboard/ActiveOrdersTable'
import AdvancedDashboard from '@/components/dashboard/AdvancedDashboard'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { DashboardSkeleton } from '@/components/common/LoadingStates'

// Custom Hooks
import { useDashboardDataOptimized } from '@/hooks/useDashboardDataOptimized'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const Dashboard = () => {
  const [dateRange, setDateRange] = useState(null)
  const { stats, orders, loading, error, lastUpdate, refreshData, updateOrderStatus } = useDashboardDataOptimized()
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 0,
    pendingOrders: 0,
    kitchenQueue: 0,
    deliveryQueue: 0
  })
  
  const screens = useBreakpoint()
  const wsConnected = false // WebSocket connection status
  
  // Real-time data simulation (در آینده با WebSocket جایگزین می‌شود)
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats({
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pendingOrders: Math.floor(Math.random() * 15) + 5,
        kitchenQueue: Math.floor(Math.random() * 8) + 2,
        deliveryQueue: Math.floor(Math.random() * 12) + 3
      })
    }, 30000) // هر 30 ثانیه بروزرسانی

    return () => clearInterval(interval)
  }, [])

  // Quick Stats Data
  const quickStats = [
    {
      title: 'فروش امروز',
      value: stats?.todayRevenue || 0,
      prefix: '﷼',
      precision: 0,
      valueStyle: { color: '#3f8600' },
      icon: <DollarOutlined />,
      change: '+12.5%',
      color: '#52c41a'
    },
    {
      title: 'سفارشات امروز',
      value: stats?.todayOrders || 0,
      icon: <ShoppingCartOutlined />,
      change: '+8.2%',
      color: '#1890ff'
    },
    {
      title: 'مشتریان فعال',
      value: realTimeStats.activeUsers,
      icon: <UserOutlined />,
      change: '+5.1%',
      color: '#722ed1'
    },
    {
      title: 'میانگین رضایت',
      value: 4.8,
      precision: 1,
      suffix: '/5',
      icon: <HeartOutlined />,
      change: '+0.3',
      color: '#eb2f96'
    }
  ]

  // System Status
  const systemStatus = [
    { name: 'سرور', status: 'آنلاین', color: '#52c41a' },
    { name: 'پایگاه داده', status: 'آنلاین', color: '#52c41a' },
    { name: 'WebSocket', status: wsConnected ? 'متصل' : 'قطع', color: wsConnected ? '#52c41a' : '#ff4d4f' },
    { name: 'Payment Gateway', status: 'آنلاین', color: '#52c41a' }
  ]

  // Quick Access Menu Items
  const quickAccessItems = [
    { title: 'سفارشات جدید', icon: <ShoppingCartOutlined />, path: '/orders', badge: realTimeStats.pendingOrders, color: '#1890ff' },
    { title: 'آشپزخانه', icon: <FireOutlined />, path: '/kitchen', badge: realTimeStats.kitchenQueue, color: '#ff7a45' },
    { title: 'تحویل', icon: <CarOutlined />, path: '/delivery', badge: realTimeStats.deliveryQueue, color: '#52c41a' },
    { title: 'صندوق', icon: <DollarOutlined />, path: '/cashier', color: '#722ed1' },
    { title: 'منو', icon: <BookOutlined />, path: '/menu', color: '#eb2f96' },
    { title: 'میزها', icon: <ShopOutlined />, path: '/tables', color: '#13c2c2' },
    { title: 'مشتریان', icon: <UserOutlined />, path: '/customers', color: '#fa8c16' },
    { title: 'کارکنان', icon: <TeamOutlined />, path: '/staff', color: '#a0d911' },
    { title: 'موجودی', icon: <CoffeeOutlined />, path: '/inventory', color: '#fadb14' },
    { title: 'رزرواسیون', icon: <CalendarOutlined />, path: '/reservation', color: '#f759ab' },
    { title: 'آنالیتیکس', icon: <BarChartOutlined />, path: '/analytics', color: '#9254de' },
    { title: 'تنظیمات', icon: <SettingOutlined />, path: '/settings', color: '#595959' },
    { title: 'امنیت', icon: <SafetyOutlined />, path: '/security', color: '#ff4d4f' },
    { title: 'نقش‌ها', icon: <TeamOutlined />, path: '/roles', color: '#52c41a' },
    { title: 'پشتیبانی', icon: <BellOutlined />, path: '/support', color: '#13c2c2' },
    { title: 'بازاریابی', icon: <WarningOutlined />, path: '/marketing', color: '#fa541c' },
    { title: 'وفاداری', icon: <HeartOutlined />, path: '/loyalty', color: '#eb2f96' },
    { title: 'یکپارچه‌سازی', icon: <SettingOutlined />, path: '/integrations', color: '#722ed1' },
    { title: 'هوش مصنوعی', icon: <BarChartOutlined />, path: '/ai-training', color: '#1890ff' }
  ]

  // Today's priorities
  const todayPriorities = [
    { task: 'بررسی سفارشات در انتظار', status: 'urgent', count: realTimeStats.pendingOrders },
    { task: 'آماده‌سازی غذاهای آشپزخانه', status: 'high', count: realTimeStats.kitchenQueue },
    { task: 'تحویل‌های در صف', status: 'medium', count: realTimeStats.deliveryQueue },
    { task: 'پاسخ به پشتیبانی', status: 'low', count: 3 }
  ]

  // Recent activities
  const recentActivities = [
    { action: 'سفارش جدید #12345', time: '2 دقیقه پیش', type: 'order' },
    { action: 'پرداخت موفق', time: '5 دقیقه پیش', type: 'payment' },
    { action: 'ورود کاربر جدید', time: '10 دقیقه پیش', type: 'user' },
    { action: 'غذا آماده شد', time: '15 دقیقه پیش', type: 'kitchen' }
  ]

  // Performance indicators
  const performanceData = [
    { label: 'سرعت سرویس', value: 87, target: 90, color: '#1890ff' },
    { label: 'کیفیت غذا', value: 94, target: 95, color: '#52c41a' },
    { label: 'رضایت مشتری', value: 92, target: 90, color: '#eb2f96' },
    { label: 'کارایی کارکنان', value: 78, target: 85, color: '#fa8c16' }
  ]

  // Handle date range change
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates)
    if (dates) {
      console.log('فیلتر تاریخ:', dates[0].format('YYYY-MM-DD'), 'تا', dates[1].format('YYYY-MM-DD'))
    }
  }

  // Handle order status change
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (err) {
      console.error('خطا در تغییر وضعیت سفارش:', err)
    }
  }

  // اگر خطای عمومی وجود دارد
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="خطا در بارگذاری داشبرد"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={refreshData}>
              تلاش مجدد
            </Button>
          }
        />
      </div>
    )
  }

  // Loading state
  if (loading && !stats) {
    return <DashboardSkeleton />
  }

  return (
    <ErrorBoundary onRetry={refreshData}>
      <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        
        {/* Header Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    🏪 داشبرد مدیریت A-DROP
                  </Title>
                  <Text type="secondary">
                    خوش آمدید! آخرین بروزرسانی: {typeof lastUpdate === 'string' ? lastUpdate : dayjs().format('HH:mm:ss')}
                  </Text>
                </Col>
                <Col>
                  <Space>
                    <Badge status={wsConnected ? "processing" : "error"} 
                           text={wsConnected ? "آنلاین" : "آفلاین"} />
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={refreshData}
                      loading={loading}
                    >
                      بروزرسانی
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Quick Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {quickStats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  precision={stat.precision || 0}
                  valueStyle={{ color: stat.color }}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px', color: stat.color }}>
                    {stat.icon}
                  </span>
                  <Text type="success" style={{ fontSize: '12px' }}>
                    {stat.change}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* System Status */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="وضعیت سیستم" size="small">
              <Row gutter={[16, 8]}>
                {systemStatus.map((item, index) => (
                  <Col xs={12} sm={6} key={index}>
                    <Space>
                      <Badge color={item.color} />
                      <Text>{item.name}: </Text>
                      <Text strong style={{ color: item.color }}>{item.status}</Text>
                    </Space>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Quick Access Menu */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="دسترسی سریع" extra={<Text type="secondary">کلیک کنید تا وارد هر بخش شوید</Text>}>
              <Row gutter={[16, 16]}>
                {quickAccessItems.map((item, index) => (
                  <Col xs={12} sm={8} md={6} lg={4} xl={3} key={index}>
                    <Link href={item.path}>
                      <Card 
                        hoverable 
                        style={{ 
                          textAlign: 'center',
                          border: `2px solid ${item.color}20`,
                          backgroundColor: `${item.color}05`
                        }}
                        bodyStyle={{ padding: '16px 8px' }}
                      >
                        <Badge count={item.badge || 0} offset={[10, 0]}>
                          <div style={{ fontSize: '28px', color: item.color, marginBottom: 8 }}>
                            {item.icon}
                          </div>
                        </Badge>
                        <Text strong style={{ fontSize: '12px', display: 'block' }}>
                          {item.title}
                        </Text>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Performance Metrics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={8}>
            <Card title="عملکرد امروز">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>فروش (هدف: 5,000,000 ﷼)</Text>
                  <Progress 
                    percent={Math.min((stats?.todayRevenue || 0) / 50000, 100)} 
                    strokeColor="#52c41a"
                    showInfo={false}
                  />
                  <Text type="secondary">{((stats?.todayRevenue || 0) / 50000 * 100).toFixed(1)}%</Text>
                </div>
                <div>
                  <Text>سفارشات (هدف: 100 سفارش)</Text>
                  <Progress 
                    percent={Math.min((stats?.todayOrders || 0), 100)} 
                    strokeColor="#1890ff"
                    showInfo={false}
                  />
                  <Text type="secondary">{stats?.todayOrders || 0}/100</Text>
                </div>
                <div>
                  <Text>رضایت مشتریان</Text>
                  <Progress 
                    percent={96} 
                    strokeColor="#eb2f96"
                    showInfo={false}
                  />
                  <Text type="secondary">96% رضایت</Text>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card title="اولویت‌های امروز">
              <Space direction="vertical" style={{ width: '100%' }}>
                {todayPriorities.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>{item.task}</Text>
                    <Badge 
                      count={item.count} 
                      style={{ 
                        backgroundColor: item.status === 'urgent' ? '#ff4d4f' : 
                                        item.status === 'high' ? '#fa8c16' :
                                        item.status === 'medium' ? '#1890ff' : '#52c41a'
                      }} 
                    />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card title="فعالیت‌های اخیر">
              <Space direction="vertical" style={{ width: '100%' }}>
                {recentActivities.map((activity, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text>{activity.action}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>{activity.time}</Text>
                    </div>
                    <span style={{ 
                      fontSize: '16px', 
                      color: activity.type === 'order' ? '#1890ff' :
                             activity.type === 'payment' ? '#52c41a' :
                             activity.type === 'user' ? '#722ed1' : '#fa8c16'
                    }}>
                      {activity.type === 'order' ? <ShoppingCartOutlined /> :
                       activity.type === 'payment' ? <DollarOutlined /> :
                       activity.type === 'user' ? <UserOutlined /> : <FireOutlined />}
                    </span>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Performance Indicators */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="شاخص‌های عملکرد">
              <Row gutter={[16, 16]}>
                {performanceData.map((item, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={item.value}
                        strokeColor={item.color}
                        width={80}
                        format={percent => `${percent}%`}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{item.label}</Text>
                        <br />
                        <Text type="secondary">هدف: {item.target}%</Text>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Original Performance Metrics - keeping one for backward compatibility */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={8}>
            <GaugeChart 
              title="عملکرد کلی امروز"
              value={85}
              max={100}
              suffix="%"
              color="#52c41a"
            />
          </Col>
          
          <Col xs={24} lg={8}>
            <NotificationPanel />
          </Col>
          
          <Col xs={24} lg={8}>
            <QuickActions />
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <AdvancedDashboard />
          </Col>
        </Row>

        {/* Active Orders */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <ActiveOrdersTable />
          </Col>
        </Row>

        {/* Footer Info */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card size="small">
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <SafetyOutlined style={{ color: '#52c41a' }} />
                    <Text type="secondary">سیستم امن و بروز</Text>
                    <Text type="secondary">|</Text>
                    <Text type="secondary">نسخه 4.0.0</Text>
                    <Text type="secondary">|</Text>
                    <Text type="secondary">تمام حقوق محفوظ است © A-DROP 2025</Text>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Tooltip title="وضعیت سرور">
                      <Badge status="processing" />
                    </Tooltip>
                    <Text type="secondary">
                      آخرین فعالیت: {dayjs().format('HH:mm')}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
      </div>
    </ErrorBoundary>
  )
}

export default Dashboard
