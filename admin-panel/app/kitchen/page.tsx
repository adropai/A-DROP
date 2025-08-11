'use client'

import React, { useEffect, useState } from 'react';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { 
  Button, 
  Tag, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Modal, 
  Select, 
  Input, 
  Alert,
  Badge,
  Tabs,
  Card,
  Progress,
  Avatar,
  Tooltip,
  message,
  DatePicker
} from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined,
  BellOutlined,
  UserOutlined,
  TableOutlined,
  PhoneOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useKitchenStore } from '@/stores/kitchen-store';
import { KitchenOrder, KitchenStatus, OrderPriority, FoodCategory } from '@/types/kitchen';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const KitchenPage: React.FC = () => {
  const {
    orders,
    activeOrders,
    completedOrders,
    queue,
    stats,
    settings,
    notifications,
    loading,
    error,
    fetchOrders,
    fetchStats,
    updateOrderStatus,
    setPriority,
    addOrderNote,
    setFilters,
    refreshData,
    addNotification,
    markNotificationRead
  } = useKitchenStore();

  // States
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  // Auto refresh
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshData();
      }, settings.autoRefreshInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, settings.autoRefreshInterval]);

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: KitchenStatus) => {
    try {
      // Update order status via API
      await updateOrderStatus(orderId, newStatus);
      
      message.success(`وضعیت سفارش به "${getStatusText(newStatus)}" تغییر یافت`);
      
      // Force refresh data to get updated status
      await refreshData();
      
    } catch (error) {
      message.error('خطا در تغییر وضعیت سفارش');
    }
  };

  // Handle priority change
  const handlePriorityChange = async (orderId: string, priority: OrderPriority) => {
    try {
      await setPriority(orderId, priority);
      message.success('اولویت سفارش تغییر یافت');
    } catch (error) {
      message.error('خطا در تغییر اولویت');
    }
  };

  // Get status color
  const getStatusColor = (status: KitchenStatus) => {
    switch (status) {
      case 'RECEIVED': return 'purple';
      case 'PREPARING': return 'orange';
      case 'READY': return 'green';
      case 'SERVED': return 'gray';
      default: return 'default';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: OrderPriority) => {
    switch (priority) {
      case 'LOW': return '#52c41a';
      case 'NORMAL': return '#1890ff';
      case 'HIGH': return '#faad14';
      case 'URGENT': return '#ff4d4f';
      default: return '#1890ff';
    }
  };

  // Get time since order
  const getTimeSinceOrder = (orderTime: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(orderTime).getTime()) / (1000 * 60));
    return diff;
  };

  // Filter orders by category
  const getOrdersByCategory = (category: FoodCategory) => {
    return activeOrders.filter(order => 
      order.items.some(item => item.category === category)
    );
  };

  // Get filtered orders based on active tab
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'active': return activeOrders; // تمام سفارشات فعال
      case 'pending': return orders.filter(o => o.status === 'RECEIVED');
      case 'preparing': return orders.filter(o => o.status === 'PREPARING');
      case 'ready': return orders.filter(o => o.status === 'READY');
      case 'served': return completedOrders; // سفارشات تحویل شده
      default: return activeOrders;
    }
  };

  // Order card component
  const OrderCard = ({ order }: { order: KitchenOrder }) => {
    const timeSinceOrder = getTimeSinceOrder(order.orderTime);
    const isDelayed = timeSinceOrder > order.totalPreparationTime + 10;
    
    return (
      <Card
        size="small"
        className={`mb-3 ${isDelayed ? 'border-red-300' : ''}`}
        style={{ 
          borderLeft: `4px solid ${getPriorityColor(order.priority)}`,
          minHeight: '120px'
        }}
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Badge 
                  count={order.items.length} 
                  style={{ backgroundColor: getPriorityColor(order.priority) }}
                />
                <strong>#{order.orderNumber.slice(-6)}</strong>
                {isDelayed && <FireOutlined style={{ color: '#ff4d4f' }} />}
              </Space>
            </Col>
            <Col>
              <Space>
                <Tag color={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Tag>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {timeSinceOrder} دقیقه
                </span>
              </Space>
            </Col>
          </Row>
        }
        extra={
          <Space>
            <Tooltip title="تغییر وضعیت">
              <Button 
                size="small" 
                onClick={() => {
                  setSelectedOrder(order);
                  setStatusModalVisible(true);
                }}
              >
                <CheckCircleOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="تغییر اولویت">
              <Button 
                size="small" 
                onClick={() => {
                  setSelectedOrder(order);
                  setPriorityModalVisible(true);
                }}
              >
                <ExclamationCircleOutlined />
              </Button>
            </Tooltip>
          </Space>
        }
      >
        {/* Customer & Table Info */}
        <Row gutter={8} className="mb-2">
          <Col span={12}>
            {order.customer && (
              <Space size={4}>
                <UserOutlined style={{ fontSize: '12px' }} />
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{order.customer.name}</span>
              </Space>
            )}
          </Col>
          <Col span={12}>
            {order.table && (
              <Space size={4}>
                <TableOutlined style={{ fontSize: '12px' }} />
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>میز {order.table.number}</span>
                <span style={{ fontSize: '10px', color: '#666' }}>({order.items.length} آیتم)</span>
              </Space>
            )}
          </Col>
        </Row>

        {/* Order Items */}
        <div className="space-y-1 mb-2">
          {order.items.map((item) => (
            <Row key={item.id} justify="space-between" align="middle" className="py-1">
              <Col span={14}>
                <Space size={4}>
                  <Badge 
                    count={item.quantity} 
                    size="small" 
                    style={{ backgroundColor: '#1890ff', minWidth: '18px', height: '18px', fontSize: '10px' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.menuItem.name}</span>
                  {item.notes && (
                    <Tooltip title={item.notes}>
                      <span style={{ fontSize: '11px', color: '#faad14' }}>📝</span>
                    </Tooltip>
                  )}
                </Space>
              </Col>
              <Col span={10} style={{ textAlign: 'right' }}>
                <div>
                  <Tag color={getCategoryColor(item.category)}>
                    {getCategoryText(item.category)}
                  </Tag>
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                    {(item.menuItem.price * item.quantity).toLocaleString()} تومان
                  </div>
                </div>
              </Col>
            </Row>
          ))}
          <div style={{ borderTop: '1px dashed #d9d9d9', paddingTop: '4px', marginTop: '8px' }}>
            <Row justify="space-between">
              <Col><strong style={{ fontSize: '12px' }}>جمع کل:</strong></Col>
              <Col><strong style={{ fontSize: '12px' }}>
                {order.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0).toLocaleString()} تومان
              </strong></Col>
            </Row>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <Alert 
            message={order.notes} 
            type="info" 
            className="mt-2" 
          />
        )}

        {/* Quick Actions */}
        {order.status !== 'SERVED' ? (
          <Row gutter={8} className="mt-3">
            <Col span={8}>
              <Button 
                size="small" 
                block 
                type={order.status === 'RECEIVED' ? 'primary' : 'default'}
                disabled={order.status !== 'RECEIVED'}
                onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
              >
                شروع
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                size="small" 
                block 
                type={order.status === 'PREPARING' ? 'primary' : 'default'}
                disabled={order.status !== 'PREPARING'}
                onClick={() => handleStatusUpdate(order.id, 'READY')}
              >
                آماده
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                size="small" 
                block 
                type={order.status === 'READY' ? 'primary' : 'default'}
                disabled={order.status !== 'READY'}
                onClick={() => handleStatusUpdate(order.id, 'SERVED')}
              >
                سرو
              </Button>
            </Col>
          </Row>
        ) : (
          <div className="mt-3 text-center">
            <Tag color="success" icon={<CheckCircleOutlined />}>
              ✅ تحویل داده شده
            </Tag>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              زمان تحویل: {new Date(order.orderTime).toLocaleTimeString('fa-IR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="kitchen-panel h-screen bg-gray-50 p-4">
      {/* Header */}
      <Row gutter={16} className="mb-4">
        <Col span={18}>
          <h1 className="text-2xl font-bold mb-0">🧑‍🍳 پنل آشپزخانه</h1>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Space>
            <Badge count={notifications.filter(n => !n.read).length}>
              <Button icon={<BellOutlined />} />
            </Badge>
            <Button 
              icon={<ReloadOutlined />} 
              loading={loading}
              onClick={refreshData}
            >
              رفرش
            </Button>
            <Select 
              value={autoRefresh}
              onChange={setAutoRefresh}
              style={{ width: 120 }}
            >
              <Option value={true}>خودکار</Option>
              <Option value={false}>دستی</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="سفارشات امروز" 
              value={orders.length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="در انتظار" 
              value={orders.filter(o => o.status === 'RECEIVED').length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="در حال آماده‌سازی" 
              value={orders.filter(o => o.status === 'PREPARING').length}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="آماده" 
              value={orders.filter(o => o.status === 'READY').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Orders Section */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="small"
          items={[
            {
              key: 'active',
              label: `فعال (${activeOrders.length})`,
            },
            {
              key: 'pending',
              label: `در انتظار (${orders.filter(o => o.status === 'RECEIVED').length})`,
            },
            {
              key: 'preparing',
              label: `در حال آماده‌سازی (${orders.filter(o => o.status === 'PREPARING').length})`,
            },
            {
              key: 'ready',
              label: `آماده (${orders.filter(o => o.status === 'READY').length})`,
            },
            {
              key: 'served',
              label: `🍽️ تحویل شده (${completedOrders.length})`,
            },
          ]}
        />

        {/* Search and Filter for Served Orders */}
        {activeTab === 'served' && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <Row gutter={16}>
              <Col span={8}>
                <Search 
                  placeholder="جستجو در سفارشات تحویل شده (نام مشتری، شماره سفارش)"
                  allowClear
                  size="small"
                />
              </Col>
              <Col span={6}>
                <Select 
                  placeholder="مرتب‌سازی"
                  size="small"
                  style={{ width: '100%' }}
                  options={[
                    { value: 'newest', label: 'جدیدترین' },
                    { value: 'oldest', label: 'قدیمی‌ترین' },
                    { value: 'amount', label: 'مبلغ (بالا به پایین)' },
                    { value: 'customer', label: 'نام مشتری (الف-ی)' },
                  ]}
                />
              </Col>
              <Col span={6}>
                <RangePicker 
                  placeholder={['از تاریخ', 'تا تاریخ']}
                  size="small"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={4}>
                <Button 
                  icon={<DownloadOutlined />} 
                  size="small" 
                  block
                >
                  خروجی Excel
                </Button>
              </Col>
            </Row>
          </div>
        )}

        <div 
          className="orders-grid"
          style={{ 
            height: 'calc(100vh - 350px)', 
            overflowY: 'auto',
            padding: '16px 0'
          }}
        >
          {loading && (
            <div className="text-center py-8">
              <p>در حال بارگذاری...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <Alert 
                message="خطا در بارگذاری سفارشات" 
                description={error}
                type="error" 
                showIcon 
              />
            </div>
          )}
          
          {!loading && !error && (
            <>
              <Row gutter={16}>
                {getFilteredOrders().map(order => (
                  <Col key={order.id} span={8}>
                    <OrderCard order={order} />
                  </Col>
                ))}
              </Row>
              
              {getFilteredOrders().length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    سفارشی یافت نشد - تب فعال: {activeTab} - کل سفارشات: {orders.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Status Update Modal */}
      <Modal
        title="تغییر وضعیت سفارش"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <p>سفارش: #{selectedOrder.orderNumber}</p>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                type="primary" 
                onClick={() => {
                  handleStatusUpdate(selectedOrder.id, 'PREPARING');
                  setStatusModalVisible(false);
                }}
                disabled={selectedOrder.status !== 'RECEIVED'}
              >
                شروع آماده‌سازی
              </Button>
              <Button 
                block 
                type="primary" 
                onClick={() => {
                  handleStatusUpdate(selectedOrder.id, 'READY');
                  setStatusModalVisible(false);
                }}
                disabled={selectedOrder.status !== 'PREPARING'}
              >
                آماده است
              </Button>
              <Button 
                block 
                type="primary" 
                onClick={() => {
                  handleStatusUpdate(selectedOrder.id, 'SERVED');
                  setStatusModalVisible(false);
                }}
                disabled={selectedOrder.status !== 'READY'}
              >
                سرو شد
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* Priority Modal */}
      <Modal
        title="تغییر اولویت سفارش"
        open={priorityModalVisible}
        onCancel={() => setPriorityModalVisible(false)}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <p>سفارش: #{selectedOrder.orderNumber}</p>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                onClick={() => {
                  handlePriorityChange(selectedOrder.id, 'LOW');
                  setPriorityModalVisible(false);
                }}
                style={{ backgroundColor: '#52c41a', color: 'white' }}
              >
                اولویت پایین
              </Button>
              <Button 
                block 
                onClick={() => {
                  handlePriorityChange(selectedOrder.id, 'NORMAL');
                  setPriorityModalVisible(false);
                }}
                style={{ backgroundColor: '#1890ff', color: 'white' }}
              >
                اولویت عادی
              </Button>
              <Button 
                block 
                onClick={() => {
                  handlePriorityChange(selectedOrder.id, 'HIGH');
                  setPriorityModalVisible(false);
                }}
                style={{ backgroundColor: '#faad14', color: 'white' }}
              >
                اولویت بالا
              </Button>
              <Button 
                block 
                onClick={() => {
                  handlePriorityChange(selectedOrder.id, 'URGENT');
                  setPriorityModalVisible(false);
                }}
                style={{ backgroundColor: '#ff4d4f', color: 'white' }}
              >
                فوری
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Helper functions
const getStatusText = (status: KitchenStatus) => {
  switch (status) {
    case 'RECEIVED': return 'دریافت شد';
    case 'PREPARING': return 'در حال آماده‌سازی';
    case 'READY': return 'آماده';
    case 'SERVED': return 'سرو شد';
    default: return 'نامشخص';
  }
};

const getCategoryColor = (category: FoodCategory) => {
  switch (category) {
    case 'APPETIZER': return 'blue';
    case 'MAIN_COURSE': return 'green';
    case 'DESSERT': return 'pink';
    case 'DRINK': return 'cyan';
    case 'SIDE': return 'orange';
    default: return 'default';
  }
};

const getCategoryText = (category: FoodCategory) => {
  switch (category) {
    case 'APPETIZER': return 'پیش‌غذا';
    case 'MAIN_COURSE': return 'اصلی';
    case 'DESSERT': return 'دسر';
    case 'DRINK': return 'نوشیدنی';
    case 'SIDE': return 'جانبی';
    default: return 'نامشخص';
  }
};

export default KitchenPage;
