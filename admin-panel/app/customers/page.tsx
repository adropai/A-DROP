'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  message,
  Tabs,
  Avatar,
  Descriptions,
  Timeline,
  Progress,
  DatePicker,
  Tooltip,
  Badge,
  Divider
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  GiftOutlined,
  StarFilled,
  TrophyOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  birthday?: string;
  gender?: 'male' | 'female';
  segment: 'new' | 'regular' | 'vip' | 'churned';
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  registrationDate: string;
  preferences?: string[];
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
}

interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  vipCustomers: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  lifetimeValue: number;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    newCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    averageOrderValue: 0,
    customerRetentionRate: 0,
    lifetimeValue: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      message.error('خطا در دریافت اطلاعات مشتریان');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/customers/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  const handleCreateCustomer = async (values: any) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      if (data.success) {
        message.success('مشتری جدید با موفقیت اضافه شد');
        setIsModalVisible(false);
        form.resetFields();
        fetchCustomers();
      } else {
        message.error(data.message || 'خطا در ایجاد مشتری');
      }
    } catch (error) {
      message.error('خطا در ایجاد مشتری');
    }
  };

  const handleEditCustomer = async (values: any) => {
    if (!selectedCustomer) return;
    
    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      if (data.success) {
        message.success('اطلاعات مشتری با موفقیت بروزرسانی شد');
        setIsModalVisible(false);
        setSelectedCustomer(null);
        form.resetFields();
        fetchCustomers();
      } else {
        message.error(data.message || 'خطا در بروزرسانی اطلاعات');
      }
    } catch (error) {
      message.error('خطا در بروزرسانی اطلاعات');
    }
  };

  const getSegmentColor = (segment: string) => {
    const colors = {
      new: 'blue',
      regular: 'green', 
      vip: 'gold',
      churned: 'red'
    };
    return colors[segment as keyof typeof colors] || 'default';
  };

  const getSegmentText = (segment: string) => {
    const texts = {
      new: 'جدید',
      regular: 'عادی',
      vip: 'ویژه',
      churned: 'غیرفعال'
    };
    return texts[segment as keyof typeof texts] || segment;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      inactive: 'warning',
      blocked: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'فعال',
      inactive: 'غیرفعال',
      blocked: 'مسدود'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchText || 
      customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.phone.includes(searchText);
    
    const matchesSegment = filterSegment === 'all' || customer.segment === filterSegment;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesSegment && matchesStatus;
  });

  const columns = [
    {
      title: 'مشتری',
      key: 'customer',
      render: (record: Customer) => (
        <Space>
          <Avatar 
            size="large" 
            icon={<UserOutlined />}
            style={{ backgroundColor: record.segment === 'vip' ? '#faad14' : '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'تماس',
      key: 'contact',
      render: (record: Customer) => (
        <div>
          <div><PhoneOutlined /> {record.phone}</div>
          {record.address && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <EnvironmentOutlined /> {record.address.substring(0, 30)}...
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'دسته‌بندی',
      dataIndex: 'segment',
      key: 'segment',
      render: (segment: string) => (
        <Tag color={getSegmentColor(segment)} icon={
          segment === 'vip' ? <TrophyOutlined /> : 
          segment === 'new' ? <StarFilled /> : 
          <UserOutlined />
        }>
          {getSegmentText(segment)}
        </Tag>
      ),
    },
    {
      title: 'آمار خرید',
      key: 'stats',
      render: (record: Customer) => (
        <div>
          <div><ShoppingCartOutlined /> {record.totalOrders} سفارش</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.totalSpent.toLocaleString()} تومان
          </Text>
        </div>
      ),
    },
    {
      title: 'امتیاز وفاداری',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      render: (points: number) => (
        <Badge count={points} style={{ backgroundColor: '#52c41a' }}>
          <GiftOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
        </Badge>
      ),
    },
    {
      title: 'آخرین سفارش',
      dataIndex: 'lastOrderDate',
      key: 'lastOrderDate',
      render: (date: string) => date ? dayjs(date).format('YYYY/MM/DD') : '-',
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={getStatusText(status)} />
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (record: Customer) => (
        <Space>
          <Tooltip title="مشاهده جزئیات">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedCustomer(record);
                setIsDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="ویرایش">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedCustomer(record);
                form.setFieldsValue(record);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <UserOutlined /> مدیریت مشتریان
        </Title>
        <Text type="secondary">
          مدیریت اطلاعات مشتریان، تحلیل رفتار خرید و برنامه‌های وفاداری
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="کل مشتریان"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="مشتریان جدید"
              value={stats.newCustomers}
              prefix={<PlusOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="مشتریان ویژه"
              value={stats.vipCustomers}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="میانگین خرید"
              value={stats.averageOrderValue}
              suffix="تومان"
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="جستجو در نام، ایمیل یا شماره تماس..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="دسته‌بندی"
              value={filterSegment}
              onChange={setFilterSegment}
            >
              <Option value="all">همه دسته‌ها</Option>
              <Option value="new">جدید</Option>
              <Option value="regular">عادی</Option>
              <Option value="vip">ویژه</Option>
              <Option value="churned">غیرفعال</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="وضعیت"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">همه وضعیت‌ها</Option>
              <Option value="active">فعال</Option>
              <Option value="inactive">غیرفعال</Option>
              <Option value="blocked">مسدود</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedCustomer(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                مشتری جدید
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchCustomers}>
                بروزرسانی
              </Button>
              <Button icon={<ExportOutlined />}>
                خروجی Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Customers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredCustomers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} از ${total} مشتری`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Customer Modal */}
      <Modal
        title={selectedCustomer ? 'ویرایش مشتری' : 'مشتری جدید'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedCustomer(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedCustomer ? handleEditCustomer : handleCreateCustomer}
        >
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="نام و نام خانوادگی"
                rules={[{ required: true, message: 'نام الزامی است' }]}
              >
                <Input placeholder="نام کامل مشتری" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="شماره تماس"
                rules={[{ required: true, message: 'شماره تماس الزامی است' }]}
              >
                <Input placeholder="09123456789" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="ایمیل"
                rules={[{ type: 'email', message: 'ایمیل معتبر وارد کنید' }]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="جنسیت">
                <Select placeholder="انتخاب کنید">
                  <Option value="male">آقا</Option>
                  <Option value="female">خانم</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="آدرس">
            <Input.TextArea placeholder="آدرس کامل مشتری" rows={2} />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item name="segment" label="دسته‌بندی">
                <Select placeholder="انتخاب دسته‌بندی">
                  <Option value="new">جدید</Option>
                  <Option value="regular">عادی</Option>
                  <Option value="vip">ویژه</Option>
                  <Option value="churned">غیرفعال</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="وضعیت">
                <Select placeholder="انتخاب وضعیت">
                  <Option value="active">فعال</Option>
                  <Option value="inactive">غیرفعال</Option>
                  <Option value="blocked">مسدود</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="یادداشت">
            <Input.TextArea placeholder="یادداشت درباره مشتری" rows={2} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedCustomer ? 'بروزرسانی' : 'ایجاد'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setSelectedCustomer(null);
                form.resetFields();
              }}>
                انصراف
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Customer Details Modal */}
      <Modal
        title="جزئیات مشتری"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedCustomer(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            بستن
          </Button>
        ]}
        width={800}
      >
        {selectedCustomer && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="اطلاعات کلی" key="info">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="نام">{selectedCustomer.name}</Descriptions.Item>
                <Descriptions.Item label="ایمیل">{selectedCustomer.email}</Descriptions.Item>
                <Descriptions.Item label="تلفن">{selectedCustomer.phone}</Descriptions.Item>
                <Descriptions.Item label="دسته‌بندی">
                  <Tag color={getSegmentColor(selectedCustomer.segment)}>
                    {getSegmentText(selectedCustomer.segment)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="وضعیت">
                  <Badge status={getStatusColor(selectedCustomer.status) as any} text={getStatusText(selectedCustomer.status)} />
                </Descriptions.Item>
                <Descriptions.Item label="امتیاز وفاداری">{selectedCustomer.loyaltyPoints}</Descriptions.Item>
                <Descriptions.Item label="تعداد سفارشات">{selectedCustomer.totalOrders}</Descriptions.Item>
                <Descriptions.Item label="کل خریدها">{selectedCustomer.totalSpent.toLocaleString()} تومان</Descriptions.Item>
                <Descriptions.Item label="میانگین سفارش">{selectedCustomer.averageOrderValue.toLocaleString()} تومان</Descriptions.Item>
                <Descriptions.Item label="تاریخ ثبت‌نام">
                  {dayjs(selectedCustomer.registrationDate).format('YYYY/MM/DD')}
                </Descriptions.Item>
                {selectedCustomer.address && (
                  <Descriptions.Item label="آدرس" span={2}>{selectedCustomer.address}</Descriptions.Item>
                )}
                {selectedCustomer.notes && (
                  <Descriptions.Item label="یادداشت" span={2}>{selectedCustomer.notes}</Descriptions.Item>
                )}
              </Descriptions>
            </TabPane>
            
            <TabPane tab="تاریخچه سفارشات" key="orders">
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">تاریخچه سفارشات در حال توسعه...</Text>
              </div>
            </TabPane>
            
            <TabPane tab="برنامه وفاداری" key="loyalty">
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">جزئیات برنامه وفاداری در حال توسعه...</Text>
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
