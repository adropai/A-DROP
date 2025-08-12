'use client';

import React, { useEffect, useState } from 'react';
import { 
  ProCard, 
  ProTable, 
  ProColumns 
} from '@ant-design/pro-components';
import { 
  Button, 
  Tag, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  Alert,
  Badge,
  Tabs,
  Progress,
  Tooltip,
  message,
  Modal,
  Divider,
  Typography,
  Drawer,
  Card,
  Switch,
  TimePicker,
  InputNumber,
  Input,
  Form
} from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  CheckCircleOutlined, 
  ReloadOutlined,
  BellOutlined,
  UserOutlined,
  TableOutlined,
  CoffeeOutlined,
  ShopOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useKitchenStore } from '@/stores/kitchen-store';
import { 
  KitchenTicket, 
  KitchenStatus, 
  Department,
  OrderPriority,
  KitchenTicketItemWithDetails 
} from '@/types/kitchen';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const KitchenPage: React.FC = () => {
  const {
    tickets,
    selectedTicket,
    stats,
    departments,
    departmentConfigs,
    loading,
    error,
    filters,
    fetchTickets,
    fetchTicketById,
    updateTicketStatus,
    fetchStats,
    fetchDepartments,
    fetchDepartmentConfigs,
    updateDepartmentConfigs,
    setFilters,
    clearError
  } = useKitchenStore();

  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [form] = Form.useForm();

  // Create department display mapping from configs
  const DepartmentDisplay = React.useMemo(() => {
    const display: any = {};
    departmentConfigs.forEach(config => {
      display[config.id] = {
        name: config.name,
        icon: config.icon,
        color: config.color,
        enabled: config.enabled
      };
    });
    return display;
  }, [departmentConfigs]);

  // وضعیت نمایش
  const StatusDisplay = {
    PENDING: { name: 'در انتظار', color: 'orange', icon: <ClockCircleOutlined /> },
    ACCEPTED: { name: 'پذیرفته شده', color: 'blue', icon: <UserOutlined /> },
    PREPARING: { name: 'در حال آماده‌سازی', color: 'processing', icon: <FireOutlined /> },
    READY: { name: 'آماده', color: 'success', icon: <CheckCircleOutlined /> },
    SERVED: { name: 'سرو شده', color: 'default', icon: <CheckCircleOutlined /> },
    CANCELLED: { name: 'لغو شده', color: 'error', icon: <ClockCircleOutlined /> }
  };

  // اولویت نمایش
  const PriorityDisplay = {
    LOW: { name: 'کم', color: 'default' },
    NORMAL: { name: 'عادی', color: 'blue' },
    HIGH: { name: 'زیاد', color: 'orange' },
    URGENT: { name: 'فوری', color: 'red' }
  };

  // Load initial data
  useEffect(() => {
    fetchTickets();
    fetchStats();
    fetchDepartments();
    fetchDepartmentConfigs();
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Error handling
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error]);

  // Handle status update
  const handleStatusUpdate = async (ticketId: string, status: KitchenStatus) => {
    const success = await updateTicketStatus(ticketId, { status });
    if (success) {
      message.success('وضعیت فیش آشپزخانه به‌روزرسانی شد');
    }
  };

  // Handle assign chef
  const handleAssignChef = async (ticketId: string, chef: string) => {
    const success = await updateTicketStatus(ticketId, { assignedChef: chef });
    if (success) {
      message.success('آشپز مسئول تعیین شد');
    }
  };

  // Calculate estimated completion time
  const getEstimatedTime = (ticket: KitchenTicket) => {
    if (!ticket.startedAt || !ticket.estimatedTime) return null;
    
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - ticket.startedAt.getTime()) / (1000 * 60));
    const remaining = ticket.estimatedTime - elapsed;
    
    return {
      elapsed,
      remaining: Math.max(0, remaining),
      isOverdue: remaining < 0
    };
  };

  // Table columns
  const columns: ProColumns<KitchenTicket>[] = [
    {
      title: 'شماره فیش',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      width: 120,
      fixed: 'left',
      render: (text: string, record: KitchenTicket) => (
        <Button 
          type="link" 
          onClick={() => {
            setDetailModalVisible(true);
            fetchTicketById(record.id);
          }}
        >
          #{text.slice(-6)}
        </Button>
      )
    },
    {
      title: 'بخش',
      dataIndex: 'department',
      key: 'department',
      width: 100,
      responsive: ['md'],
      render: (dept: Department) => {
        const display = DepartmentDisplay[dept];
        if (!display) return dept;
        return (
          <Tag color={display.color}>
            {display.icon} {display.name}
          </Tag>
        );
      }
    },
    {
      title: 'سفارش',
      dataIndex: 'order',
      key: 'order',
      width: 120,
      render: (order: any) => (
        <div>
          <Text strong>#{order.orderNumber.slice(-6)}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {order.customerName || 'مشتری'}
          </Text>
        </div>
      )
    },
    {
      title: 'میز',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
      width: 60,
      responsive: ['lg'],
      render: (table: number) => table ? (
        <Tag icon={<TableOutlined />}>{table}</Tag>
      ) : '-'
    },
    {
      title: 'آیتم‌ها',
      dataIndex: 'items',
      key: 'items',
      width: 200,
      responsive: ['sm'],
      render: (_, record: KitchenTicket) => (
        <div>
          {record.items.slice(0, 2).map(item => (
            <div key={item.id} style={{ fontSize: '12px' }}>
              <Text>{item.quantity}× {item.orderItem.menuItem.name}</Text>
            </div>
          ))}
          {record.items.length > 2 && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              +{record.items.length - 2} آیتم دیگر
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      fixed: 'right',
      render: (status: KitchenStatus, record: KitchenTicket) => {
        const display = StatusDisplay[status];
        return (
          <Select
            value={status}
            style={{ width: '100%' }}
            size="small"
            onChange={(newStatus) => handleStatusUpdate(record.id, newStatus)}
          >
            <Option value="PENDING">
              <Tag color="orange">در انتظار</Tag>
            </Option>
            <Option value="ACCEPTED">
              <Tag color="blue">پذیرفته شده</Tag>
            </Option>
            <Option value="PREPARING">
              <Tag color="processing">در حال آماده‌سازی</Tag>
            </Option>
            <Option value="READY">
              <Tag color="success">آماده</Tag>
            </Option>
            <Option value="SERVED">
              <Tag color="default">سرو شده</Tag>
            </Option>
          </Select>
        );
      }
    },
    {
      title: 'اولویت',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      responsive: ['md'],
      render: (priority: OrderPriority) => {
        const display = PriorityDisplay[priority];
        return <Tag color={display.color}>{display.name}</Tag>;
      }
    },
    {
      title: 'آشپز',
      dataIndex: 'assignedChef',
      key: 'assignedChef',
      width: 100,
      responsive: ['lg'],
      render: (chef: string, record: KitchenTicket) => (
        <Select
          value={chef || undefined}
          placeholder="تعیین آشپز"
          style={{ width: '100%' }}
          size="small"
          allowClear
          onChange={(newChef) => handleAssignChef(record.id, newChef || '')}
        >
          <Option value="علی احمدی">علی احمدی</Option>
          <Option value="فاطمه رضایی">فاطمه رضایی</Option>
          <Option value="محمد کریمی">محمد کریمی</Option>
        </Select>
      )
    },
    {
      title: 'زمان',
      dataIndex: 'estimatedTime',
      key: 'time',
      width: 100,
      responsive: ['md'],
      render: (_: any, record: KitchenTicket) => {
        const timeInfo = getEstimatedTime(record);
        if (!timeInfo) {
          return record.estimatedTime ? `${record.estimatedTime} دقیقه` : '-';
        }
        
        return (
          <div>
            <Progress
              percent={Math.min(100, (timeInfo.elapsed / (record.estimatedTime || 1)) * 100)}
              size="small"
              status={timeInfo.isOverdue ? 'exception' : 'active'}
              showInfo={false}
            />
            <Text style={{ 
              fontSize: '11px',
              color: timeInfo.isOverdue ? '#ff4d4f' : '#666'
            }}>
              {timeInfo.isOverdue ? `+${Math.abs(timeInfo.remaining)}` : timeInfo.remaining} دقیقه
            </Text>
          </div>
        );
      }
    }
  ];

  return (
    <>
      <ProCard 
        title={
          <Space>
            <span>سیستم آشپزخانه</span>
            <Button 
              icon={<SettingOutlined />} 
              type="text"
              onClick={() => setSettingsVisible(true)}
            >
              تنظیمات بخش‌ها
            </Button>
          </Space>
        } 
        ghost
      >
        {/* آمار کلی */}
        <ProCard 
          title="آمار لحظه‌ای آشپزخانه" 
          bordered={false}
          style={{ 
            marginBottom: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12
          }}
          headStyle={{ 
            color: 'white',
            borderBottom: 'none'
          }}
          bodyStyle={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '0 0 12px 12px',
            padding: '24px'
          }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                background: '#fff7e6',
                borderRadius: 8,
                border: '1px solid #ffd666'
              }}>
                <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
                <Statistic 
                  title="فیش‌های در انتظار" 
                  value={stats?.overview?.pendingTickets || 0}
                  valueStyle={{ color: '#faad14', fontSize: 28, fontWeight: 'bold' }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                background: '#e6f7ff',
                borderRadius: 8,
                border: '1px solid #91d5ff'
              }}>
                <FireOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                <Statistic 
                  title="در حال آماده‌سازی" 
                  value={stats?.overview?.preparingTickets || 0}
                  valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 'bold' }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                background: '#f6ffed',
                borderRadius: 8,
                border: '1px solid #b7eb8f'
              }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                <Statistic 
                  title="آماده" 
                  value={stats?.overview?.readyTickets || 0}
                  valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 'bold' }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                background: '#f0f5ff',
                borderRadius: 8,
                border: '1px solid #adc6ff'
              }}>
                <ClockCircleOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
                <Statistic 
                  title="میانگین زمان آماده‌سازی" 
                  value={stats?.overview?.averagePreparationTime || 0}
                  suffix="دقیقه"
                  valueStyle={{ color: '#722ed1', fontSize: 28, fontWeight: 'bold' }}
                />
              </div>
            </Col>
          </Row>
        </ProCard>

        {/* فیلترها و کنترل‌ها */}
        <ProCard 
          title="فیلترها و کنترل‌ها" 
          bordered={false}
          style={{ 
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          {/* فیلترهای اصلی */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={8}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8, color: '#666' }}>
                  انتخاب بخش:
                </Text>
                <Select
                  placeholder="همه بخش‌ها"
                  style={{ width: '100%' }}
                  size="large"
                  value={selectedDepartment}
                  onChange={(value) => {
                    setSelectedDepartment(value);
                    setFilters({ department: value });
                    fetchTickets();
                  }}
                  allowClear
                >
                  {Object.entries(DepartmentDisplay).map(([key, display]: [string, any]) => (
                    <Option key={key} value={key}>
                      <Space>
                        <span style={{ fontSize: 16 }}>{display.icon}</span>
                        {display.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8, color: '#666' }}>
                  وضعیت فیش:
                </Text>
                <Select
                  placeholder="همه وضعیت‌ها"
                  style={{ width: '100%' }}
                  size="large"
                  value={filters.status}
                  onChange={(value) => {
                    setFilters({ status: value });
                    fetchTickets();
                  }}
                  allowClear
                >
                  {Object.entries(StatusDisplay).map(([key, display]) => (
                    <Option key={key} value={key}>
                      <Tag color={display.color} style={{ margin: 0 }}>
                        {display.name}
                      </Tag>
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={24} lg={8}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8, color: '#666' }}>
                  عملیات:
                </Text>
                <Space wrap style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <Button 
                    type="primary"
                    size="large"
                    icon={<ReloadOutlined />} 
                    onClick={() => {
                      fetchTickets();
                      fetchStats();
                    }}
                    loading={loading}
                    style={{ minWidth: 120 }}
                  >
                    بروزرسانی
                  </Button>
                  
                  <Badge 
                    count={tickets.filter(t => t.priority === 'URGENT').length}
                    overflowCount={99}
                  >
                    <Button 
                      size="large"
                      icon={<BellOutlined />} 
                      style={{ minWidth: 100 }}
                    >
                      اعلان‌ها
                    </Button>
                  </Badge>
                </Space>
              </div>
            </Col>
          </Row>
        </ProCard>
      </ProCard>

      {/* جدول فیش‌های آشپزخانه */}
      <ProCard 
        title="فیش‌های آشپزخانه" 
        bordered={false}
        style={{ 
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        extra={
          <Space>
            <Text type="secondary">
              مجموع: {tickets.length} فیش
            </Text>
            <Button 
              type="text" 
              icon={<SettingOutlined />}
              onClick={() => setSettingsVisible(true)}
            >
              تنظیمات
            </Button>
          </Space>
        }
      >
        <ProTable<KitchenTicket>
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `مجموع ${total} فیش`,
            responsive: true
          }}
          search={false}
          options={{
            reload: () => fetchTickets(),
            density: true,
            fullScreen: true,
            setting: true
          }}
          scroll={{ x: 1200 }}
          size="small"
          rowClassName={(record) => {
            const timeInfo = getEstimatedTime(record);
            if (timeInfo?.isOverdue) return 'row-overdue';
            if (record.priority === 'URGENT') return 'row-urgent';
            return '';
          }}
        />
      </ProCard>

      {/* Modal جزئیات فیش */}
      <Modal
        title={`جزئیات فیش آشپزخانه ${selectedTicket?.ticketNumber ? '#' + selectedTicket.ticketNumber.slice(-6) : ''}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTicket && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Title level={5}>اطلاعات سفارش</Title>
                <p><strong>شماره سفارش:</strong> #{selectedTicket.order.orderNumber.slice(-6)}</p>
                <p><strong>مشتری:</strong> {selectedTicket.order.customerName || 'نامشخص'}</p>
                <p><strong>نوع سفارش:</strong> {selectedTicket.order.type}</p>
                <p><strong>میز:</strong> {selectedTicket.tableNumber || 'ندارد'}</p>
              </Col>
              <Col span={12}>
                <Title level={5}>وضعیت فیش</Title>
                <p><strong>بخش:</strong> 
                  <Tag color={DepartmentDisplay[selectedTicket.department].color}>
                    {DepartmentDisplay[selectedTicket.department].icon} {DepartmentDisplay[selectedTicket.department].name}
                  </Tag>
                </p>
                <p><strong>وضعیت:</strong> 
                  <Tag color={StatusDisplay[selectedTicket.status].color}>
                    {StatusDisplay[selectedTicket.status].name}
                  </Tag>
                </p>
                <p><strong>اولویت:</strong> 
                  <Tag color={PriorityDisplay[selectedTicket.priority].color}>
                    {PriorityDisplay[selectedTicket.priority].name}
                  </Tag>
                </p>
                <p><strong>آشپز مسئول:</strong> {selectedTicket.assignedChef || 'تعیین نشده'}</p>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>آیتم‌های سفارش</Title>
            {selectedTicket.items.map(item => (
              <div key={item.id} style={{ 
                padding: '8px', 
                border: '1px solid #f0f0f0', 
                marginBottom: '8px',
                borderRadius: '4px'
              }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong>{item.orderItem.menuItem.name}</Text>
                    <br />
                    <Text type="secondary">
                      تعداد: {item.quantity} × {item.orderItem.price.toLocaleString()} تومان
                    </Text>
                    {item.notes && (
                      <>
                        <br />
                        <Text style={{ fontSize: '12px', fontStyle: 'italic' }}>
                          یادداشت: {item.notes}
                        </Text>
                      </>
                    )}
                  </Col>
                  <Col>
                    <Tag color={StatusDisplay[item.status].color}>
                      {StatusDisplay[item.status].name}
                    </Tag>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Department Settings Modal */}
      <Drawer
        title="تنظیمات بخش‌های آشپزخانه"
        width={720}
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        extra={
          <Space>
            <Button onClick={() => setSettingsVisible(false)}>انصراف</Button>
            <Button type="primary" onClick={() => {
              // Save settings logic here
              message.success('تنظیمات ذخیره شد');
              setSettingsVisible(false);
            }}>
              ذخیره
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message="تنظیمات بخش‌های آشپزخانه"
            description="در اینجا می‌توانید بخش‌های مختلف آشپزخانه را فعال/غیرفعال کرده و ساعات کاری آن‌ها را تنظیم کنید."
            type="info"
            showIcon
          />
        </div>

        <Row gutter={[16, 16]}>
          {departmentConfigs.map(config => (
            <Col key={config.id} span={24}>
              <Card size="small">
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <span style={{ fontSize: '20px' }}>{config.icon}</span>
                      <div>
                        <Text strong>{config.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {config.description}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Switch 
                      checked={config.enabled}
                      onChange={(checked) => {
                        // Update config logic here
                        const newConfigs = departmentConfigs.map(c => 
                          c.id === config.id ? { ...c, enabled: checked } : c
                        );
                        updateDepartmentConfigs(newConfigs);
                      }}
                    />
                  </Col>
                </Row>
                
                {config.enabled && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Text type="secondary">ساعات کاری:</Text>
                        <br />
                        <Space>
                          <TimePicker 
                            format="HH:mm"
                            value={dayjs(config.workingHours.start, 'HH:mm')}
                            size="small"
                          />
                          <span>تا</span>
                          <TimePicker 
                            format="HH:mm"
                            value={dayjs(config.workingHours.end, 'HH:mm')}
                            size="small"
                          />
                        </Space>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary">حداکثر فیش همزمان:</Text>
                        <br />
                        <InputNumber 
                          min={1}
                          max={50}
                          value={config.maxConcurrentTickets}
                          size="small"
                          style={{ width: '100%' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Text type="secondary">زمان پیش‌فرض (دقیقه):</Text>
                        <br />
                        <InputNumber 
                          min={1}
                          max={120}
                          value={config.defaultPreparationTime}
                          size="small"
                          style={{ width: '100%' }}
                        />
                      </Col>
                    </Row>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Drawer>

      <style jsx global>{`
        .row-overdue {
          background-color: #fff2f0 !important;
          animation: pulse 2s infinite;
        }
        .row-urgent {
          background-color: #fff7e6 !important;
          border-left: 4px solid #faad14 !important;
        }
        
        @keyframes pulse {
          0% { background-color: #fff2f0; }
          50% { background-color: #ffccc7; }
          100% { background-color: #fff2f0; }
        }
        
        .ant-pro-card {
          transition: all 0.3s ease;
        }
        
        .ant-pro-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }
        
        .ant-statistic-content {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .ant-select-large .ant-select-selector {
          border-radius: 8px;
          border: 2px solid #d9d9d9;
          transition: all 0.3s ease;
        }
        
        .ant-select-large .ant-select-selector:hover {
          border-color: #40a9ff;
          box-shadow: 0 2px 8px rgba(64, 169, 255, 0.2);
        }
        
        .ant-btn-primary {
          border-radius: 8px;
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          border: none;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
          transition: all 0.3s ease;
        }
        
        .ant-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
        }
        
        .ant-table-tbody > tr:hover > td {
          background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%) !important;
        }
        
        @media (max-width: 768px) {
          .ant-col {
            margin-bottom: 16px;
          }
          
          .ant-space {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default KitchenPage;

