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
  TimePicker,
  InputNumber,
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
  EyeOutlined,
  PlayCircleOutlined
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
    PENDING: { name: 'در انتظار', color: 'orange', icon: <ClockCircleOutlined /> },
    ACCEPTED: { name: 'پذیرفته شده', color: 'blue', icon: <UserOutlined /> },
    PREPARING: { name: 'در حال آماده‌سازی', color: 'processing', icon: <FireOutlined /> },
    READY: { name: 'آماده', color: 'success', icon: <CheckCircleOutlined /> },
    SERVED: { name: 'سرو شده', color: 'default', icon: <CheckCircleOutlined /> },
    CANCELLED: { name: 'لغو شده', color: 'error', icon: <ClockCircleOutlined /> }
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
      width: 100,
      fixed: 'right' as const,
      render: (text: string, record: KitchenTicket) => (
        <Button 
          type="link" 
          onClick={() => {
            setDetailModalVisible(true);
            fetchTicketById(record.id);
          }}
          style={{ 
            fontWeight: 600,
            fontSize: '14px',
            padding: 0
          }}
        >
          #{text?.slice(-6) || 'N/A'}
        </Button>
      )
    },
    {
      title: 'بخش',
      dataIndex: 'department',
      key: 'department',
      width: 100,
      align: 'center' as const,
      render: (dept: Department) => {
        const display = DepartmentDisplay[dept];
        if (!display) return <Tag>{dept}</Tag>;
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '20px', 
              marginBottom: '4px',
              color: display.color 
            }}>
              {display.icon}
            </div>
            <Tag color={display.color} style={{ fontSize: '10px', margin: 0 }}>
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
            <Text strong style={{ color: '#1890ff', display: 'block' }}>
              #{order.orderNumber?.slice(-6) || 'N/A'}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {order.customerName || 'مشتری ناشناس'}
            </Text>
            <div style={{ marginTop: '4px' }}>
              <Tag 
                color={order.type === 'DINE_IN' ? 'blue' : order.type === 'TAKEAWAY' ? 'green' : 'orange'}
                style={{ fontSize: '10px' }}
              >
                {order.type === 'DINE_IN' ? 'حضوری' : 
                 order.type === 'TAKEAWAY' ? 'بیرون‌بر' : 'پیک'}
              </Tag>
            </div>
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
        <Tag icon={<TableOutlined />} color="cyan">
          {table}
        </Tag>
      ) : (
        <Text type="secondary">-</Text>
      )
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
              <div key={item.id || index} style={{ 
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: '12px' }}>
                  {item.quantity}× {item.orderItem?.menuItem?.name || 'آیتم نامشخص'}
                </Text>
                <Tag 
                  color={StatusDisplay[item.status]?.color || 'default'}
                  style={{ fontSize: '10px', margin: 0 }}
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
      fixed: 'left' as const,
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
      width: 80,
      align: 'center' as const,
      render: (priority: OrderPriority) => {
        const display = PriorityDisplay[priority];
        return <Tag color={display?.color || 'default'}>{display?.name || priority}</Tag>;
      }
    },
    {
      title: 'زمان',
      dataIndex: 'estimatedTime',
      key: 'time',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: KitchenTicket) => {
        const timeInfo = getEstimatedTime(record);
        if (!timeInfo) {
          return (
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', color: '#999' }}>
                {record.estimatedTime ? `${record.estimatedTime} دقیقه` : 'نامشخص'}
              </Text>
            </div>
          );
        }
        
        return (
          <div style={{ textAlign: 'center' }}>
            <Progress
              type="circle"
              size={32}
              percent={Math.min(100, (timeInfo.elapsed / (record.estimatedTime || 1)) * 100)}
              status={timeInfo.isOverdue ? 'exception' : 'active'}
              showInfo={false}
              strokeWidth={6}
            />
            <div style={{ 
              fontSize: '10px',
              color: timeInfo.isOverdue ? '#ff4d4f' : '#666',
              marginTop: '2px'
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
    {
      title: 'شماره فیش',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      width: 120,
      fixed: 'right', // تصحیح برای RTL
      render: (text: string, record: KitchenTicket) => (
        <Button 
          type="link" 
          onClick={() => {
            setDetailModalVisible(true);
            fetchTicketById(record.id);
          }}
          style={{ 
            fontWeight: 600,
            fontSize: 14
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
      width: 120,
      responsive: ['md'],
      render: (dept: Department) => {
        const display = DepartmentDisplay[dept];
        if (!display) return dept;
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 24, 
              marginBottom: 4,
              color: display.color 
            }}>
              {display.icon}
            </div>
            <Tag 
              color={display.color}
              style={{ 
                fontSize: '11px',
                fontWeight: 500,
                margin: 0,
                padding: '2px 8px'
              }}
            >
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
      width: 140,
      render: (order: any) => (
        <div style={{ lineHeight: 1.3 }}>
          <Text strong style={{ 
            fontSize: 14,
            color: '#1890ff',
            display: 'block'
          }}>
            #{order.orderNumber.slice(-6)}
          </Text>
          <Text type="secondary" style={{ 
            fontSize: '12px',
            display: 'block',
            marginTop: 2
          }}>
            {order.customerName || 'مشتری ناشناس'}
          </Text>
          <Tag 
            color={order.type === 'DINE_IN' ? 'blue' : order.type === 'TAKEAWAY' ? 'green' : 'orange'}
            style={{ 
              fontSize: '10px',
              marginTop: 4,
              padding: '1px 6px'
            }}
          >
            {order.type === 'DINE_IN' ? 'حضوری' : 
             order.type === 'TAKEAWAY' ? 'بیرون‌بر' : 'پیک'}
          </Tag>
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
      width: 220,
      responsive: ['sm'],
      render: (_, record: KitchenTicket) => (
        <div style={{ lineHeight: 1.4 }}>
          {record.items.slice(0, 2).map((item, index) => (
            <div key={item.id} style={{ 
              fontSize: '13px',
              marginBottom: index === 0 ? 4 : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Text style={{ fontWeight: 500 }}>
                {item.quantity}× {item.orderItem.menuItem.name}
              </Text>
              <Tag 
                color={StatusDisplay[item.status]?.color}
                style={{ 
                  fontSize: 10,
                  lineHeight: 1,
                  margin: 0,
                  marginRight: 4,
                  padding: '1px 6px'
                }}
              >
                {StatusDisplay[item.status]?.name}
              </Tag>
            </div>
          ))}
          {record.items.length > 2 && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              +{record.items.length - 2} آیتم دیگر...
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      fixed: 'left', // تصحیح برای RTL
      render: (status: KitchenStatus, record: KitchenTicket) => {
        const display = StatusDisplay[status];
        return (
          <div style={{ direction: 'rtl' }}>
            <Select
              value={status}
              style={{ width: '100%' }}
              size="small"
              onChange={(newStatus) => handleStatusUpdate(record.id, newStatus)}
              loading={loading}
              placeholder="انتخاب وضعیت"
            >
              <Option value="PENDING">
                <Tag color="orange" style={{ margin: 0 }}>در انتظار</Tag>
              </Option>
              <Option value="ACCEPTED">
                <Tag color="blue" style={{ margin: 0 }}>پذیرفته شده</Tag>
              </Option>
              <Option value="PREPARING">
                <Tag color="processing" style={{ margin: 0 }}>در حال آماده‌سازی</Tag>
              </Option>
              <Option value="READY">
                <Tag color="success" style={{ margin: 0 }}>آماده</Tag>
              </Option>
              <Option value="SERVED">
                <Tag color="default" style={{ margin: 0 }}>سرو شده</Tag>
              </Option>
            </Select>
          </div>
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
      title: 'زمان آماده‌سازی',
      dataIndex: 'estimatedTime',
      key: 'time',
      width: 120,
      responsive: ['md'],
      render: (_: any, record: KitchenTicket) => {
        const timeInfo = getEstimatedTime(record);
        if (!timeInfo) {
          return (
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ color: '#999', fontSize: 16 }} />
              <div style={{ fontSize: '12px', color: '#999', marginTop: 2 }}>
                {record.estimatedTime ? `${record.estimatedTime} دقیقه` : 'نامشخص'}
              </div>
            </div>
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
              strokeWidth={8}
            />
            <div style={{ 
              fontSize: '11px',
              color: timeInfo.isOverdue ? '#ff4d4f' : '#666',
              fontWeight: 500,
              marginTop: 4
            }}>
              {timeInfo.isOverdue ? 
                <Text type="danger">تاخیر {Math.abs(timeInfo.remaining)}د</Text> : 
                <Text>{timeInfo.remaining} دقیقه</Text>
              }
            </div>
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
          <Row gutter={[24, 24]}> {/* افزایش فاصله vertical */}
            <Col xs={24} sm={12} lg={6}> {/* حذف md برای بهتر شدن در تبلت */}
              <div style={{ 
                textAlign: 'center',
                padding: '24px', /* افزایش padding */
                background: '#fff7e6',
                borderRadius: 12, /* افزایش borderRadius */
                border: '2px solid #ffd666', /* ضخیم‌تر کردن border */
                transition: 'all 0.3s ease',
                height: '140px', /* ارتفاع ثابت */
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <ClockCircleOutlined style={{ fontSize: 36, color: '#faad14', marginBottom: 12 }} />
                <Statistic 
                  title={<span style={{ fontSize: 14, fontWeight: 500 }}>فیش‌های در انتظار</span>} 
                  value={stats?.overview?.pendingTickets || 0}
                  valueStyle={{ 
                    color: '#faad14', 
                    fontSize: 32, 
                    fontWeight: 600, 
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.2
                  }}
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
          <Row gutter={[16, 24]} style={{ marginBottom: 24 }}> {/* افزایش فاصله */}
            <Col xs={24} sm={24} md={8}> {/* تغییر breakpoint */}
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: 12, 
                  color: '#262626', 
                  fontSize: 15,
                  fontWeight: 600
                }}>
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
                  dropdownStyle={{ direction: 'rtl' }}
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

            <Col xs={24} sm={24} md={8}> {/* تغییر breakpoint */}
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: 12, 
                  color: '#262626', 
                  fontSize: 15,
                  fontWeight: 600
                }}>
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
                  dropdownStyle={{ direction: 'rtl' }}
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

            <Col xs={24} sm={24} md={8}> {/* تغییر breakpoint */}
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: 12, 
                  color: '#262626', 
                  fontSize: 15,
                  fontWeight: 600
                }}>
                  عملیات:
                </Text>
                <Space 
                  wrap 
                  style={{ 
                    width: '100%', 
                    justifyContent: 'flex-start',
                    gap: 12
                  }}
                >
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
        title={
          <Space size={16}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>فیش‌های آشپزخانه</span>
            <Badge 
              count={tickets.length} 
              style={{ 
                backgroundColor: '#52c41a',
                fontWeight: 600
              }}
            />
          </Space>
        }
        bordered={false}
        style={{ 
          borderRadius: 16,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
        bodyStyle={{ 
          padding: 0 
        }}
        extra={
          <Space size={12}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              آخرین بروزرسانی: {dayjs().format('HH:mm:ss')}
            </Text>
            <Button 
              type="text" 
              icon={<SettingOutlined />}
              onClick={() => setSettingsVisible(true)}
              style={{
                borderRadius: 8,
                height: 36
              }}
            >
              تنظیمات
            </Button>
          </Space>
        }
      >
        <div style={{ 
          background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
          padding: '16px 24px',
          borderBottom: '1px solid #e6f7ff'
        }}>
          <Row gutter={[16, 8]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Space>
                <FireOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                <Text strong style={{ color: '#1890ff' }}>
                  فیش‌های فعال: {tickets.filter(t => ['PENDING', 'ACCEPTED', 'PREPARING'].includes(t.status)).length}
                </Text>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                <Text strong style={{ color: '#52c41a' }}>
                  آماده: {tickets.filter(t => t.status === 'READY').length}
                </Text>
              </Space>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Space>
                <ClockCircleOutlined style={{ color: '#faad14', fontSize: 16 }} />
                <Text strong style={{ color: '#faad14' }}>
                  فوری: {tickets.filter(t => t.priority === 'URGENT').length}
                </Text>
              </Space>
            </Col>
          </Row>
        </div>

        <ProTable<KitchenTicket>
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} از ${total} فیش`,
            responsive: true,
            position: ['bottomCenter'],
            style: { 
              padding: '16px 24px',
              background: '#fafafa'
            }
          }}
          search={false}
          options={{
            reload: () => {
              fetchTickets();
              fetchStats();
            },
            density: true,
            fullScreen: true,
            setting: true
          }}
          scroll={{ 
            x: 1400,
            y: 'calc(100vh - 480px)'
          }}
          size="middle"
          rowClassName={(record) => {
            const timeInfo = getEstimatedTime(record);
            if (timeInfo?.isOverdue) return 'kitchen-row-overdue';
            if (record.priority === 'URGENT') return 'kitchen-row-urgent';
            if (record.status === 'READY') return 'kitchen-row-ready';
            return 'kitchen-row-normal';
          }}
          tableStyle={{
            background: '#fff',
          }}
          headerTitle={false}
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
        .kitchen-row-overdue {
          background: linear-gradient(90deg, #fff2f0 0%, #ffebe8 100%) !important;
          border-right: 4px solid #ff4d4f !important;
          animation: kitchen-pulse 3s infinite;
        }
        
        .kitchen-row-urgent {
          background: linear-gradient(90deg, #fff7e6 0%, #ffefd3 100%) !important;
          border-right: 4px solid #faad14 !important;
          font-weight: 500;
        }
        
        .kitchen-row-ready {
          background: linear-gradient(90deg, #f6ffed 0%, #edffd6 100%) !important;
          border-right: 4px solid #52c41a !important;
        }
        
        .kitchen-row-normal {
          background: #fff !important;
          transition: all 0.3s ease;
        }
        
        .kitchen-row-normal:hover {
          background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        
        @keyframes kitchen-pulse {
          0% { 
            background: linear-gradient(90deg, #fff2f0 0%, #ffebe8 100%);
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
          }
          50% { 
            background: linear-gradient(90deg, #ffccc7 0%, #ffa39e 100%);
            box-shadow: 0 0 0 8px rgba(255, 77, 79, 0.1);
          }
          100% { 
            background: linear-gradient(90deg, #fff2f0 0%, #ffebe8 100%);
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
          }
        }
        
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
            margin-bottom: 24px; /* افزایش فاصله در موبایل */
          }
          
          .ant-space {
            width: 100%;
            justify-content: center;
          }
          
          .ant-statistic-title {
            font-size: 12px !important;
          }
          
          .ant-statistic-content-value {
            font-size: 24px !important;
          }
          
          .ant-pro-table-list-toolbar {
            flex-direction: column;
            gap: 16px;
          }
        }
        
        @media (max-width: 576px) {
          .ant-row [class*="ant-col-"] {
            margin-bottom: 16px;
          }
          
          .ant-select {
            font-size: 14px;
          }
          
          .ant-btn {
            font-size: 14px;
            padding: 4px 12px;
          }
        }
        
        /* بهبود RTL */
        .ant-table-rtl .ant-table-thead > tr > th,
        .ant-table-rtl .ant-table-tbody > tr > td {
          text-align: right;
        }
        
        .ant-table-rtl .ant-table-column-sorter {
          left: 4px;
          right: auto;
        }
        
        /* بهبود جدول آشپزخانه */
        .ant-pro-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-bottom: 2px solid #e2e8f0;
          font-weight: 600;
          color: #334155;
          font-size: 14px;
          padding: 16px 12px;
        }
        
        .ant-pro-table .ant-table-tbody > tr > td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        
        .ant-pro-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none;
        }
        
        /* بهبود Select در جدول */
        .ant-table .ant-select {
          border-radius: 6px;
          border: 1px solid #d1d5db;
          transition: all 0.2s ease;
        }
        
        .ant-table .ant-select:hover {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        
        .ant-table .ant-select-focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        /* بهبود Button در جدول */
        .ant-table .ant-btn-link {
          color: #1890ff;
          font-weight: 600;
          padding: 0;
          height: auto;
          border: none;
          box-shadow: none;
        }
        
        .ant-table .ant-btn-link:hover {
          color: #096dd9;
          text-decoration: underline;
        }
        
        /* بهبود Badge و Tag */
        .ant-tag {
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          margin: 0;
        }
        
        .ant-badge {
          line-height: 1;
        }
        
        /* بهبود Progress */
        .ant-progress-line {
          margin-bottom: 4px;
        }
        
        .ant-progress-bg {
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default KitchenPage;

