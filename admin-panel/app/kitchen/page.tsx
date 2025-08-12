'use client';

import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  Alert,
  Badge,
  Progress,
  Tooltip,
  message,
  Modal,
  Divider,
  Typography,
  Drawer,
  Switch,
  Form,
  Empty
} from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  CheckCircleOutlined, 
  ReloadOutlined,
  BellOutlined,
  UserOutlined,
  TableOutlined,
  SettingOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useKitchenStore } from '@/stores/kitchen-store';
import { 
  KitchenTicket, 
  KitchenStatus, 
  Department,
  OrderPriority 
} from '@/types/kitchen';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

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

  // Department Display Mapping
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

  // Status Display
  const StatusDisplay = {
    PENDING: { name: 'در انتظار', color: 'orange' },
    ACCEPTED: { name: 'پذیرفته شده', color: 'blue' },
    PREPARING: { name: 'در حال آماده‌سازی', color: 'processing' },
    READY: { name: 'آماده', color: 'success' },
    SERVED: { name: 'سرو شده', color: 'default' },
    CANCELLED: { name: 'لغو شده', color: 'error' }
  };

  // Priority Display
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
  const columns = [
    {
      title: 'شماره فیش',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      width: 120,
      render: (text: string, record: KitchenTicket) => (
        <Button 
          type="link" 
          onClick={() => {
            setDetailModalVisible(true);
            fetchTicketById(record.id);
          }}
          style={{ fontWeight: 600 }}
        >
          #{text?.slice(-6) || 'N/A'}
        </Button>
      )
    },
    {
      title: 'بخش',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      align: 'center' as const,
      render: (dept: Department) => {
        const display = DepartmentDisplay[dept];
        if (!display) return <Tag>{dept}</Tag>;
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>
              {display.icon}
            </div>
            <Tag color={display.color} style={{ fontSize: '11px' }}>
              {display.name}
            </Tag>
          </div>
        );
      }
    },
    {
      title: 'سفارش',
      dataIndex: 'order',
      key: 'order',
      width: 150,
      render: (order: any) => {
        if (!order) return <Text type="secondary">بدون سفارش</Text>;
        return (
          <div>
            <Text strong style={{ color: '#1890ff' }}>
              #{order.orderNumber?.slice(-6) || 'N/A'}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {order.customerName || 'مشتری ناشناس'}
            </Text>
          </div>
        );
      }
    },
    {
      title: 'میز',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
      width: 80,
      align: 'center' as const,
      render: (table: number) => table ? (
        <Tag icon={<TableOutlined />} color="cyan">{table}</Tag>
      ) : <Text type="secondary">-</Text>
    },
    {
      title: 'آیتم‌ها',
      dataIndex: 'items',
      key: 'items',
      width: 200,
      render: (_, record: KitchenTicket) => {
        if (!record.items || record.items.length === 0) {
          return <Text type="secondary">بدون آیتم</Text>;
        }
        
        return (
          <div>
            {record.items.slice(0, 2).map((item, index) => (
              <div key={item.id || index} style={{ marginBottom: '4px' }}>
                <Text style={{ fontSize: '12px' }}>
                  {item.quantity}× {item.orderItem?.menuItem?.name || 'آیتم نامشخص'}
                </Text>
                <br />
                <Tag 
                  color={StatusDisplay[item.status]?.color || 'default'}
                  style={{ fontSize: '10px' }}
                >
                  {StatusDisplay[item.status]?.name || 'نامشخص'}
                </Tag>
              </div>
            ))}
            {record.items.length > 2 && (
              <Text type="secondary" style={{ fontSize: '10px' }}>
                و {record.items.length - 2} آیتم دیگر...
              </Text>
            )}
          </div>
        );
      }
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: KitchenStatus, record: KitchenTicket) => (
        <Select
          value={status}
          style={{ width: '100%' }}
          size="small"
          onChange={(newStatus) => handleStatusUpdate(record.id, newStatus)}
          loading={loading}
        >
          {Object.entries(StatusDisplay).map(([key, display]) => (
            <Option key={key} value={key}>
              <Tag color={display.color} style={{ margin: 0 }}>
                {display.name}
              </Tag>
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'اولویت',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      align: 'center' as const,
      render: (priority: OrderPriority) => {
        const display = PriorityDisplay[priority];
        return <Tag color={display?.color}>{display?.name || priority}</Tag>;
      }
    },
    {
      title: 'زمان',
      dataIndex: 'estimatedTime',
      key: 'time',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: KitchenTicket) => {
        const timeInfo = getEstimatedTime(record);
        if (!timeInfo) {
          return (
            <Text style={{ fontSize: '12px' }}>
              {record.estimatedTime ? `${record.estimatedTime} دقیقه` : 'نامشخص'}
            </Text>
          );
        }
        
        return (
          <div style={{ textAlign: 'center' }}>
            <Progress
              type="circle"
              size={40}
              percent={Math.min(100, (timeInfo.elapsed / (record.estimatedTime || 1)) * 100)}
              status={timeInfo.isOverdue ? 'exception' : 'active'}
              showInfo={false}
            />
            <div style={{ 
              fontSize: '10px',
              color: timeInfo.isOverdue ? '#ff4d4f' : '#666',
              marginTop: '4px'
            }}>
              {timeInfo.isOverdue ? 
                `تاخیر ${Math.abs(timeInfo.remaining)}د` : 
                `${timeInfo.remaining} دقیقه`
              }
            </div>
          </div>
        );
      }
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 80,
      align: 'center' as const,
      render: (_, record: KitchenTicket) => (
        <Tooltip title="مشاهده جزئیات">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setDetailModalVisible(true);
              fetchTicketById(record.id);
            }}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <FireOutlined /> سیستم آشپزخانه
            </Title>
            <Text type="secondary">مدیریت فیش‌های آشپزخانه و سفارشات</Text>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchTickets();
                  fetchStats();
                }}
                loading={loading}
              >
                بروزرسانی
              </Button>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setSettingsVisible(true)}
              >
                تنظیمات
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="فیش‌های در انتظار"
              value={stats?.overview?.pendingTickets || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="در حال آماده‌سازی"
              value={stats?.overview?.preparingTickets || 0}
              prefix={<FireOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="آماده"
              value={stats?.overview?.readyTickets || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="میانگین زمان آماده‌سازی"
              value={stats?.overview?.averagePreparationTime || 0}
              suffix="دقیقه"
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                انتخاب بخش:
              </Text>
              <Select
                placeholder="همه بخش‌ها"
                style={{ width: '100%' }}
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
                      <span>{display.icon}</span>
                      {display.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                وضعیت فیش:
              </Text>
              <Select
                placeholder="همه وضعیت‌ها"
                style={{ width: '100%' }}
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
          <Col xs={24} sm={24} md={12}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                اعلانات:
              </Text>
              <Space>
                <Badge 
                  count={tickets.filter(t => t.priority === 'URGENT').length}
                  overflowCount={99}
                >
                  <Button icon={<BellOutlined />}>
                    فوری
                  </Button>
                </Badge>
                <Badge 
                  count={tickets.filter(t => {
                    const timeInfo = getEstimatedTime(t);
                    return timeInfo?.isOverdue;
                  }).length}
                  overflowCount={99}
                >
                  <Button icon={<ClockCircleOutlined />}>
                    تاخیر
                  </Button>
                </Badge>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card 
        title={
          <Space>
            <span>فیش‌های آشپزخانه</span>
            <Badge count={tickets.length} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        extra={
          <Text type="secondary">
            آخرین بروزرسانی: {dayjs().format('HH:mm:ss')}
          </Text>
        }
      >
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} از ${total} فیش`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
          rowClassName={(record) => {
            const timeInfo = getEstimatedTime(record);
            if (timeInfo?.isOverdue) return 'kitchen-row-overdue';
            if (record.priority === 'URGENT') return 'kitchen-row-urgent';
            if (record.status === 'READY') return 'kitchen-row-ready';
            return '';
          }}
          locale={{
            emptyText: (
              <Empty
                description="هیچ فیش آشپزخانه‌ای وجود ندارد"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>

      {/* Detail Modal */}
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
                <p><strong>شماره سفارش:</strong> #{selectedTicket.order?.orderNumber?.slice(-6) || 'N/A'}</p>
                <p><strong>مشتری:</strong> {selectedTicket.order?.customerName || 'نامشخص'}</p>
                <p><strong>نوع سفارش:</strong> {selectedTicket.order?.type || 'نامشخص'}</p>
                <p><strong>میز:</strong> {selectedTicket.tableNumber || 'ندارد'}</p>
              </Col>
              <Col span={12}>
                <Title level={5}>وضعیت فیش</Title>
                <p><strong>بخش:</strong> 
                  <Tag color={DepartmentDisplay[selectedTicket.department]?.color}>
                    {DepartmentDisplay[selectedTicket.department]?.icon} {DepartmentDisplay[selectedTicket.department]?.name}
                  </Tag>
                </p>
                <p><strong>وضعیت:</strong> 
                  <Tag color={StatusDisplay[selectedTicket.status]?.color}>
                    {StatusDisplay[selectedTicket.status]?.name}
                  </Tag>
                </p>
                <p><strong>اولویت:</strong> 
                  <Tag color={PriorityDisplay[selectedTicket.priority]?.color}>
                    {PriorityDisplay[selectedTicket.priority]?.name}
                  </Tag>
                </p>
                <p><strong>آشپز مسئول:</strong> {selectedTicket.assignedChef || 'تعیین نشده'}</p>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>آیتم‌های سفارش</Title>
            {selectedTicket.items?.map(item => (
              <div key={item.id} style={{ 
                padding: '12px', 
                border: '1px solid #f0f0f0', 
                marginBottom: '8px',
                borderRadius: '6px'
              }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong>{item.orderItem?.menuItem?.name || 'آیتم نامشخص'}</Text>
                    <br />
                    <Text type="secondary">
                      تعداد: {item.quantity} × {item.orderItem?.price?.toLocaleString() || 0} تومان
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
                    <Tag color={StatusDisplay[item.status]?.color}>
                      {StatusDisplay[item.status]?.name}
                    </Tag>
                  </Col>
                </Row>
              </div>
            )) || <Empty description="آیتمی وجود ندارد" />}
          </div>
        )}
      </Modal>

      {/* Settings Drawer */}
      <Drawer
        title="تنظیمات بخش‌های آشپزخانه"
        width={720}
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        extra={
          <Space>
            <Button onClick={() => setSettingsVisible(false)}>انصراف</Button>
            <Button type="primary" onClick={() => {
              message.success('تنظیمات ذخیره شد');
              setSettingsVisible(false);
            }}>
              ذخیره
            </Button>
          </Space>
        }
      >
        <Alert
          message="تنظیمات بخش‌های آشپزخانه"
          description="در اینجا می‌توانید بخش‌های مختلف آشپزخانه را فعال/غیرفعال کرده و ساعات کاری آن‌ها را تنظیم کنید."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

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
                        const newConfigs = departmentConfigs.map(c => 
                          c.id === config.id ? { ...c, enabled: checked } : c
                        );
                        updateDepartmentConfigs(newConfigs);
                      }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </Drawer>

      <style jsx global>{`
        .kitchen-row-overdue {
          background-color: #fff2f0 !important;
          border-right: 3px solid #ff4d4f;
        }
        
        .kitchen-row-urgent {
          background-color: #fff7e6 !important;
          border-right: 3px solid #faad14;
        }
        
        .kitchen-row-ready {
          background-color: #f6ffed !important;
          border-right: 3px solid #52c41a;
        }
        
        .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5 !important;
        }
        
        .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
        }
        
        /* RTL Support */
        .ant-table-rtl .ant-table-thead > tr > th,
        .ant-table-rtl .ant-table-tbody > tr > td {
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default KitchenPage;
