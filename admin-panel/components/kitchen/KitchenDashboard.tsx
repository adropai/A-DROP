'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Tag, 
  Progress, 
  List, 
  Badge, 
  Statistic, 
  Row, 
  Col, 
  Space,
  Tabs,
  notification,
  Popconfirm,
  Typography,
  Alert
} from 'antd';
import { 
  ClockCircleOutlined, 
  PlayCircleOutlined, 
  CheckCircleOutlined,
  PrinterOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { useKitchen } from '@/hooks/useKitchen';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface KitchenDashboardProps {
  station?: string;
}

export default function KitchenDashboard({ station }: KitchenDashboardProps) {
  const [activeTab, setActiveTab] = useState('orders');
  
  const {
    orders,
    timers,
    queue,
    notifications,
    stats,
    loading,
    error,
    connected,
    startTimer,
    completeItem,
    changePriority,
    printOrder,
    clearNotification,
    refresh,
    getOrdersByStation,
    getTimersByStation,
    getOverdueItems,
    formatTime
  } = useKitchen(station);

  // نمایش notifications
  React.useEffect(() => {
    notifications.forEach(notif => {
      notification[notif.type]({
        message: notif.message,
        onClose: () => clearNotification(notif.id)
      });
    });
  }, [notifications, clearNotification]);

  // رنگ‌بندی اولویت
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'NORMAL': return 'blue';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  // رنگ‌بندی وضعیت
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'blue';
      case 'PREPARING': return 'orange';
      case 'READY': return 'green';
      case 'OVERDUE': return 'red';
      default: return 'default';
    }
  };

  // کامپوننت کارت سفارش
  const OrderCard = ({ order }: { order: any }) => {
    const orderTimers = timers.filter(t => t.orderId === order.id);
    const isOverdue = orderTimers.some(t => t.status === 'OVERDUE');
    
    return (
      <Card
        className={`order-card ${isOverdue ? 'overdue' : ''}`}
        size="small"
        title={
          <Space>
            <Text strong>#{order.orderNumber}</Text>
            {order.tableNumber && <Badge count={order.tableNumber} color="blue" />}
            <Tag color={getPriorityColor(order.priority)}>{order.priority}</Tag>
            {isOverdue && <FireOutlined style={{ color: 'red' }} />}
          </Space>
        }
        extra={
          <Space>
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => printOrder(order.id)}
            />
            <Popconfirm
              title="اولویت فوری؟"
              onConfirm={() => changePriority(order.id, 'URGENT')}
            >
              <Button size="small" danger icon={<ExclamationCircleOutlined />} />
            </Popconfirm>
          </Space>
        }
      >
        <List
          dataSource={order.items}
          renderItem={(item: any) => {
            const itemTimer = timers.find(t => t.itemId === item.id);
            
            return (
              <List.Item
                actions={[
                  item.status === 'PENDING' ? (
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => startTimer(item.id, order.id)}
                    >
                      شروع
                    </Button>
                  ) : item.status === 'PREPARING' ? (
                    <Button
                      size="small"
                      type="default"
                      icon={<CheckCircleOutlined />}
                      onClick={() => completeItem(item.id, order.id)}
                    >
                      تکمیل
                    </Button>
                  ) : (
                    <Tag color="green">تکمیل شده</Tag>
                  )
                ]}
              >
                <div style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>{item.name}</Text>
                      <Badge count={item.quantity} style={{ marginLeft: 8 }} />
                    </div>
                    
                    {item.notes && (
                      <Text type="secondary" italic>{item.notes}</Text>
                    )}
                    
                    {itemTimer && (
                      <div>
                        <Progress
                          percent={itemTimer.progress}
                          status={itemTimer.status === 'OVERDUE' ? 'exception' : 'active'}
                          showInfo={false}
                          size="small"
                        />
                        <Text type={itemTimer.status === 'OVERDUE' ? 'danger' : 'secondary'}>
                          {itemTimer.status === 'OVERDUE' ? 'تأخیر: ' : 'باقی‌مانده: '}
                          {formatTime(Math.abs(itemTimer.remainingTime))}
                        </Text>
                      </div>
                    )}
                  </Space>
                </div>
              </List.Item>
            );
          }}
        />
        
        {order.specialRequests && (
          <Alert
            message="درخواست ویژه"
            description={order.specialRequests}
            type="info"
            showIcon
            style={{ marginTop: 8 }}
          />
        )}
      </Card>
    );
  };

  // کامپوننت تایمر
  const TimerCard = ({ timer }: { timer: any }) => (
    <Card size="small" className={timer.status === 'OVERDUE' ? 'overdue-timer' : ''}>
      <Statistic
        title={`آیتم ${timer.itemId}`}
        value={formatTime(Math.abs(timer.remainingTime))}
        prefix={timer.status === 'OVERDUE' ? <FireOutlined /> : <ClockCircleOutlined />}
        valueStyle={{ 
          color: timer.status === 'OVERDUE' ? '#ff4d4f' : '#1890ff',
          fontSize: '18px'
        }}
      />
      <Progress
        percent={timer.progress}
        status={timer.status === 'OVERDUE' ? 'exception' : 'active'}
        size="small"
      />
      <div style={{ marginTop: 8 }}>
        <Tag color={getStatusColor(timer.status)}>{timer.status}</Tag>
        <Tag>{timer.station}</Tag>
      </div>
    </Card>
  );

  if (error) {
    return (
      <Alert
        message="خطا در بارگذاری"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={refresh}>
            تلاش مجدد
          </Button>
        }
      />
    );
  }

  return (
    <div className="kitchen-dashboard">
      {/* Header Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="سفارشات فعال"
              value={stats.activeOrders}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="آیتم‌های تأخیری"
              value={stats.overdueItems}
              prefix={<FireOutlined />}
              valueStyle={{ color: stats.overdueItems > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="متوسط زمان تکمیل"
              value={stats.avgCompletionTime}
              suffix="دقیقه"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="وضعیت اتصال"
              value={connected ? 'متصل' : 'قطع'}
              valueStyle={{ color: connected ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarExtraContent={
          <Button 
            loading={loading} 
            onClick={refresh}
            icon={<ClockCircleOutlined />}
          >
            بروزرسانی
          </Button>
        }
      >
        <TabPane tab={`سفارشات (${orders.length})`} key="orders">
          <Row gutter={[16, 16]}>
            {orders.map((order) => (
              <Col key={order.id} xs={24} lg={12} xl={8}>
                <OrderCard order={order} />
              </Col>
            ))}
          </Row>
          
          {orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
              <div style={{ marginTop: 16 }}>
                <Title level={4}>عالی! هیچ سفارش فعالی وجود ندارد</Title>
                <Text type="secondary">تمام سفارشات تکمیل شده‌اند</Text>
              </div>
            </div>
          )}
        </TabPane>

        <TabPane tab={`تایمرها (${timers.length})`} key="timers">
          <Row gutter={[16, 16]}>
            {timers.map((timer) => (
              <Col key={`${timer.orderId}-${timer.itemId}`} xs={24} sm={12} md={8} lg={6}>
                <TimerCard timer={timer} />
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab={`صف (${queue.length})`} key="queue">
          <List
            dataSource={queue}
            renderItem={(item: any) => (
              <List.Item
                actions={[
                  <Button size="small" icon={<PlayCircleOutlined />}>
                    شروع
                  </Button>,
                  <Button size="small" icon={<PrinterOutlined />}>
                    چاپ
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>#{item.orderNumber}</Text>
                      <Tag color={getPriorityColor(item.priority)}>{item.priority}</Tag>
                      <Badge count={item.quantity} />
                    </Space>
                  }
                  description={
                    <Space direction="vertical">
                      <Text>{item.itemName}</Text>
                      {item.notes && <Text type="secondary">{item.notes}</Text>}
                      <Text type="secondary">
                        زمان تخمینی: {item.preparationTime} دقیقه | ایستگاه: {item.station}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>

      <style jsx>{`
        .kitchen-dashboard .order-card.overdue {
          border-color: #ff4d4f;
          box-shadow: 0 0 10px rgba(255, 77, 79, 0.3);
        }
        
        .kitchen-dashboard .overdue-timer {
          border-color: #ff4d4f;
          background: rgba(255, 77, 79, 0.05);
        }
        
        .kitchen-dashboard .ant-card {
          border-radius: 8px;
        }
        
        .kitchen-dashboard .ant-progress-line {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
