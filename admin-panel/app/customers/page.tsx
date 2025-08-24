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
  DeleteOutlined,
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
import momentJalaali from 'moment-jalaali';
import CreateCustomerForm from '@/components/customers/CreateCustomerForm';
import PersianCalendar from '@/components/common/AdvancedPersianCalendar';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  segment?: 'new' | 'regular' | 'vip' | 'churned';
  loyaltyPoints?: number;
  totalOrders?: number;
  totalSpent?: number;
  averageOrderValue?: number;
  lastOrderDate?: string;
  registrationDate?: string;
  createdAt?: string;
  tags?: string[];
  notes?: string;
  status?: 'active' | 'inactive' | 'blocked';
  avatar?: string;
  preferences?: {
    favoriteItems?: string;
    allergies?: string;
    dietaryRestrictions?: string;
    preferredPaymentMethod?: string;
    deliveryInstructions?: string;
  };
  addresses?: Array<{
    title: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
    isDefault: boolean;
  }>;
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
      console.log('📊 Customer stats response:', data);
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        console.error('Invalid stats response:', data);
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  const handleCreateCustomer = async () => {
    // فرم جدید خودش handle می‌کند
    fetchCustomers();
    fetchStats();
  };

  const handleEditCustomer = async () => {
    // فرم جدید خودش handle می‌کند
    fetchCustomers();
    fetchStats();
  };

  const getSegmentColor = (segment?: string) => {
    const colors = {
      new: 'blue',
      regular: 'green', 
      vip: 'gold',
      churned: 'red'
    };
    return colors[segment as keyof typeof colors] || 'default';
  };

  const getSegmentText = (segment?: string) => {
    const texts = {
      new: 'جدید',
      regular: 'عادی',
      vip: 'ویژه',
      churned: 'غیرفعال'
    };
    return texts[segment as keyof typeof texts] || segment || 'نامشخص';
  };

  const getStatusColor = (status?: string) => {
    const colors = {
      active: 'success',
      inactive: 'warning',
      blocked: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status?: string) => {
    const texts = {
      active: 'فعال',
      inactive: 'غیرفعال',
      blocked: 'مسدود'
    };
    return texts[status as keyof typeof texts] || status || 'نامشخص';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchText || 
      customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchText.toLowerCase())) ||
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
          <div><ShoppingCartOutlined /> {record.totalOrders || 0} سفارش</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {(record.totalSpent || 0).toLocaleString()} تومان
          </Text>
        </div>
      ),
    },
    {
      title: 'امتیاز وفاداری',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      render: (points: number) => (
        <Badge count={points || 0} style={{ backgroundColor: '#52c41a' }}>
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
      title: 'تاریخ تولد',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (date: string) => {
        if (!date) return '-';
        try {
          // تبدیل میلادی به شمسی و نمایش به صورت ۱۴۰۱/۰۵/۲۶
          const gregorianDate = new Date(date);
          if (isNaN(gregorianDate.getTime())) return '-';
          
          const jalaaliDate = momentJalaali(gregorianDate);
          if (!jalaaliDate.isValid()) return '-';
          
          return jalaaliDate.format('jYYYY/jMM/jDD').replace(/j/g, '');
        } catch (error) {
          console.error('خطا در تبدیل تاریخ:', error);
          return '-';
        }
      },
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
              value={stats?.totalCustomers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="مشتریان جدید"
              value={stats?.newCustomers || 0}
              prefix={<PlusOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="مشتریان ویژه"
              value={stats?.vipCustomers || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="میانگین خرید"
              value={stats?.averageOrderValue || 0}
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
      <CreateCustomerForm
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedCustomer(null);
        }}
        onSuccess={() => {
          setIsModalVisible(false);
          setSelectedCustomer(null);
          handleCreateCustomer();
        }}
        editingCustomer={selectedCustomer}
      />

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
                <Descriptions.Item label="امتیاز وفاداری">{selectedCustomer.loyaltyPoints || 0}</Descriptions.Item>
                <Descriptions.Item label="تعداد سفارشات">{selectedCustomer.totalOrders || 0}</Descriptions.Item>
                <Descriptions.Item label="کل خریدها">{(selectedCustomer.totalSpent || 0).toLocaleString()} تومان</Descriptions.Item>
                <Descriptions.Item label="میانگین سفارش">{(selectedCustomer.averageOrderValue || 0).toLocaleString()} تومان</Descriptions.Item>
                <Descriptions.Item label="تاریخ تولد">
                  {selectedCustomer.dateOfBirth ? (() => {
                    try {
                      const gregorianDate = new Date(selectedCustomer.dateOfBirth);
                      if (isNaN(gregorianDate.getTime())) return 'وارد نشده';
                      
                      const jalaaliDate = momentJalaali(gregorianDate);
                      if (!jalaaliDate.isValid()) return 'وارد نشده';
                      
                      return jalaaliDate.format('jYYYY/jMM/jDD').replace(/j/g, '');
                    } catch (error) {
                      return 'وارد نشده';
                    }
                  })() : 'وارد نشده'}
                </Descriptions.Item>
                <Descriptions.Item label="جنسیت">
                  {selectedCustomer.gender === 'male' ? '👨 آقا' : 
                   selectedCustomer.gender === 'female' ? '👩 خانم' : 'نامشخص'}
                </Descriptions.Item>
                <Descriptions.Item label="تاریخ ثبت‌نام">
                  {selectedCustomer.registrationDate 
                    ? dayjs(selectedCustomer.registrationDate).format('YYYY/MM/DD')
                    : selectedCustomer.createdAt 
                      ? dayjs(selectedCustomer.createdAt).format('YYYY/MM/DD')
                      : 'نامشخص'
                  }
                </Descriptions.Item>
                {selectedCustomer.tags && selectedCustomer.tags.length > 0 && (
                  <Descriptions.Item label="برچسب‌ها" span={2}>
                    <Space wrap>
                      {selectedCustomer.tags.map((tag: string, index: number) => (
                        <Tag key={index} color="blue">{tag}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedCustomer.address && (
                  <Descriptions.Item label="آدرس" span={2}>{selectedCustomer.address}</Descriptions.Item>
                )}
                {selectedCustomer.preferences && (
                  <Descriptions.Item label="ترجیحات غذایی" span={2}>
                    <div>
                      {selectedCustomer.preferences.favoriteItems && selectedCustomer.preferences.favoriteItems.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>غذاهای مورد علاقه: </Text>
                          <Text>{JSON.parse(selectedCustomer.preferences.favoriteItems).join(', ')}</Text>
                        </div>
                      )}
                      {selectedCustomer.preferences.allergies && selectedCustomer.preferences.allergies.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>آلرژی‌ها: </Text>
                          <Text>{JSON.parse(selectedCustomer.preferences.allergies).join(', ')}</Text>
                        </div>
                      )}
                      {selectedCustomer.preferences.dietaryRestrictions && (
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>محدودیت‌های غذایی: </Text>
                          <Text>{selectedCustomer.preferences.dietaryRestrictions}</Text>
                        </div>
                      )}
                      {selectedCustomer.preferences.preferredPaymentMethod && (
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>روش پرداخت ترجیحی: </Text>
                          <Text>{selectedCustomer.preferences.preferredPaymentMethod}</Text>
                        </div>
                      )}
                      {selectedCustomer.preferences.deliveryInstructions && (
                        <div>
                          <Text strong>دستورات تحویل: </Text>
                          <Text>{selectedCustomer.preferences.deliveryInstructions}</Text>
                        </div>
                      )}
                    </div>
                  </Descriptions.Item>
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

      {/* Create/Edit Customer Modal */}
      <CreateCustomerForm
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedCustomer(null);
        }}
        onSuccess={() => {
          setIsModalVisible(false);
          setSelectedCustomer(null);
          handleCreateCustomer();
        }}
        editingCustomer={selectedCustomer}
      />
    </div>
  );
};

export default CustomersPage;
