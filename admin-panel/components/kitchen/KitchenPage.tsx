'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Card,
  Statistic,
  Space,
  Badge,
  Tag,
  Tabs,
  App
} from 'antd';
import { 
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
  ReloadOutlined,
  BellOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Content, Header } = Layout;
const { Title } = Typography;

interface KitchenOrder {
  id: string;
  orderNumber: string;
  items: string[];
  status: 'new' | 'preparing' | 'ready';
  priority: 'high' | 'normal' | 'low';
  customerName: string;
  tableNumber?: number;
  orderType?: string;
  createdAt?: string;
  estimatedTime: number;
}

const KitchenPage: React.FC = () => {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new');

  // Load orders from real API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('📋 Kitchen fetching orders from API...');
      
      // Fetch all orders that need kitchen attention (not just completed payments)
      // Kitchen should see: PENDING (new), PREPARING, READY orders
      const response = await fetch('/api/orders?status=PENDING,PREPARING,READY&limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      const fetchedOrders = data.orders || [];
      console.log('📦 Fetched orders count:', fetchedOrders.length);
      
      // Transform API data to kitchen format
      const kitchenOrders: KitchenOrder[] = fetchedOrders.map((order: any) => ({
        id: order.id.toString(),
        orderNumber: order.orderNumber || `#${order.id}`,
        items: (order.items || []).map((item: any) => 
          `${item.quantity}× ${item.menuItem?.name || item.name || 'آیتم نامشخص'}`
        ),
        status: order.status === 'PREPARING' ? 'preparing' : 
                order.status === 'READY' ? 'ready' : 'new',
        priority: order.type === 'DELIVERY' ? 'high' : 'normal',
        customerName: order.customer?.name || order.customerName || 'مشتری ناشناس',
        tableNumber: order.tableNumber,
        orderType: order.type,
        estimatedTime: Math.max(10, (order.items || []).length * 5),
        createdAt: order.createdAt
      }));
      
      setOrders(kitchenOrders);
      console.log('✅ Kitchen orders loaded:', kitchenOrders.length);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('خطا در بارگذاری سفارشات');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Update order status in database
  const updateOrderStatus = async (orderId: string, newStatus: 'new' | 'preparing' | 'ready') => {
    try {
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
      
      // Map kitchen status to database status
      const statusMap = {
        'new': 'PENDING',
        'preparing': 'PREPARING', 
        'ready': 'READY'
      };
      
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusMap[newStatus] })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }
      
      // Update local state for immediate feedback
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      message.success('وضعیت سفارش بروزرسانی شد');
      console.log(`✅ Order ${orderId} status updated successfully`);
      
      // Refresh data from server after a short delay
      setTimeout(() => {
        fetchOrders();
      }, 500);
      
    } catch (error) {
      console.error('❌ Error updating status:', error);
      message.error('خطا در بروزرسانی وضعیت');
    }
  };

  // Load data on mount and setup auto-refresh
  useEffect(() => {
    fetchOrders();
    
    // Auto refresh every 30 seconds to get new orders
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders
  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  // Stats
  const stats = {
    newOrders: newOrders.length,
    preparingOrders: preparingOrders.length,
    readyOrders: readyOrders.length,
    totalActive: orders.length
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = { 'high': 'red', 'normal': 'blue', 'low': 'green' };
    return colors[priority as keyof typeof colors] || 'blue';
  };

  // Render order card
  const OrderCard = ({ order }: { order: KitchenOrder }) => {
    const borderColors = { 'new': '#faad14', 'preparing': '#1890ff', 'ready': '#52c41a' };
    
    return (
      <Card
        size="small"
        style={{ 
          marginBottom: 16,
          borderLeft: `4px solid ${borderColors[order.status]}`
        }}
        title={
          <Space>
            <span>{order.orderNumber}</span>
            {order.tableNumber && <Tag color="blue">میز {order.tableNumber}</Tag>}
            <Tag color={getPriorityColor(order.priority)}>
              {order.priority === 'high' ? 'فوری' : order.priority === 'normal' ? 'عادی' : 'کم‌اهمیت'}
            </Tag>
            {order.orderType === 'DELIVERY' && <Tag color="orange">تحویل</Tag>}
          </Space>
        }
        extra={
          <Space>
            {order.status === 'new' && (
              <Button type="primary" size="small" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                شروع آماده‌سازی
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button type="primary" size="small" style={{ backgroundColor: '#52c41a' }}
                onClick={() => updateOrderStatus(order.id, 'ready')}>
                آماده است
              </Button>
            )}
            {order.status === 'ready' && <Tag color="green">آماده تحویل</Tag>}
          </Space>
        }
      >
        <div>
          <div style={{ marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            <strong>مشتری:</strong> {order.customerName}
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong>آیتم‌ها:</strong> {order.items.join('، ')}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            زمان تخمینی: {order.estimatedTime} دقیقه
          </div>
        </div>
      </Card>
    );
  };

  // Tab content renderer
  const TabContent = ({ orders: tabOrders, emptyMessage }: { orders: KitchenOrder[], emptyMessage: string }) => (
    <div style={{ minHeight: 400, marginTop: 16 }}>
      {tabOrders.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <ClockCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <div style={{ fontSize: 16, color: '#666' }}>{emptyMessage}</div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {tabOrders.map((order) => (
            <Col xs={24} lg={12} key={order.id}>
              <OrderCard order={order} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header style={{ 
        backgroundColor: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Title level={2} style={{ margin: 0, color: '#ff6b35' }}>
            🍳 سیستم آشپزخانه
          </Title>
          <Space>
            <Badge count={stats.totalActive} showZero>
              <Button icon={<BellOutlined />}>سفارشات فعال</Button>
            </Badge>
            <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
              بروزرسانی
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{ margin: '24px', backgroundColor: 'transparent' }}>
        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="سفارشات جدید"
                value={stats.newOrders}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="در حال آماده‌سازی"
                value={stats.preparingOrders}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="آماده تحویل"
                value={stats.readyOrders}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="کل سفارشات فعال"
                value={stats.totalActive}
                prefix={<BellOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Workflow Tabs */}
        <Card>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'new',
                label: `🕐 سفارشات جدید (${newOrders.length})`
              },
              {
                key: 'preparing', 
                label: `🔥 در حال آماده‌سازی (${preparingOrders.length})`
              },
              {
                key: 'ready',
                label: `✅ آماده تحویل (${readyOrders.length})`
              }
            ]}
          />
          
          {activeTab === 'new' && (
            <TabContent orders={newOrders} emptyMessage="هیچ سفارش جدیدی وجود ندارد" />
          )}
          {activeTab === 'preparing' && (
            <TabContent orders={preparingOrders} emptyMessage="هیچ سفارشی در حال آماده‌سازی نیست" />
          )}
          {activeTab === 'ready' && (
            <TabContent orders={readyOrders} emptyMessage="هیچ سفارش آماده‌ای وجود ندارد" />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default KitchenPage;