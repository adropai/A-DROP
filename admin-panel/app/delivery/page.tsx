'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Card, 
  Tabs, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Popconfirm, 
  Avatar, 
  Badge,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
  App
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  PhoneOutlined,
  CarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'

const { Title, Text } = Typography
const { Option } = Select

// Types
interface Courier {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  vehicleType: string
  vehicleDetails?: string
  status: string
  currentLocation?: string
  currentLatitude?: number
  currentLongitude?: number
  isActive: boolean
  rating: number
  totalDeliveries: number
  successfulDeliveries: number
  createdAt: string
  updatedAt: string
  deliveries?: any[]
  stats?: {
    pendingOrders: number
    activeOrders: number
    totalActiveOrders: number
  }
}

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
}

interface Address {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
}

interface Delivery {
  id: string
  orderId: string
  courierId?: string
  status: string
  deliveryAddress: string | Address
  estimatedDeliveryTime?: string
  actualDeliveryTime?: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  customer?: Customer
  courier?: Courier
}

// Styled wrapper for better layout
const ProTableWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
    {children}
  </div>
)

// Helper function to handle safe hydration
const AntdHydrationSafe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <div>Loading...</div>
  }
  
  return <>{children}</>
}

const DeliveryPage: React.FC = () => {
  const { message } = App.useApp();
  // States
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [assignCourierModalVisible, setAssignCourierModalVisible] = useState(false)
  const [selectedDeliveryForAssign, setSelectedDeliveryForAssign] = useState<Delivery | null>(null)
  const [selectedCourierId, setSelectedCourierId] = useState<string>('')
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [activeTab, setActiveTab] = useState('couriers')
  
  // Courier assignment states
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false)
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Delivery | null>(null)
  
  // Details modal states
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false)
  const [selectedDeliveryForDetails, setSelectedDeliveryForDetails] = useState<Delivery | null>(null)

  // Forms
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  const [courierAssignForm] = Form.useForm()

  // Fetch data functions
  const fetchCouriers = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching couriers...')
      const response = await fetch('/api/delivery/couriers')
      const data = await response.json()
      console.log('📋 Couriers data received:', data)
      
      if (data.couriers) {
        setCouriers(data.couriers)
        console.log(`✅ Set ${data.couriers.length} couriers`)
      } else {
        console.warn('⚠️ No couriers field in response')
        setCouriers([])
      }
    } catch (error) {
      console.error('❌ Error fetching couriers:', error)
      message.error('خطا در دریافت اطلاعات پیک‌ها')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/delivery/orders')
      const data = await response.json()
      if (data.success) {
        setDeliveries(data.deliveries || [])
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error)
      message.error('خطا در دریافت اطلاعات تحویل')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCouriers()
    fetchDeliveries()
  }, [fetchCouriers, fetchDeliveries])

  // Courier handlers
  const handleEditCourier = async () => {
    try {
      const values = await form.validateFields()
      if (!selectedCourier) return

      const response = await fetch(`/api/delivery/couriers/${selectedCourier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      const data = await response.json()
      if (data.success) {
        message.success('پیک با موفقیت ویرایش شد')
        setEditModalVisible(false)
        fetchCouriers()
      } else {
        message.error(data.message || 'خطا در ویرایش پیک')
      }
    } catch (error) {
      message.error('خطا در ویرایش پیک')
    }
  }

  const handleAddCourier = async () => {
    try {
      const values = await addForm.validateFields()
      
      const response = await fetch('/api/delivery/couriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      const data = await response.json()
      if (data.success) {
        message.success('پیک جدید اضافه شد')
        setAddModalVisible(false)
        addForm.resetFields()
        fetchCouriers()
      } else {
        message.error(data.message || 'خطا در افزودن پیک')
      }
    } catch (error) {
      message.error('خطا در افزودن پیک')
    }
  }

  const handleDeleteCourier = async (id: string) => {
    try {
      const response = await fetch(`/api/delivery/couriers/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        message.success('پیک حذف شد')
        fetchCouriers()
      } else {
        message.error(data.message || 'خطا در حذف پیک')
      }
    } catch (error) {
      message.error('خطا در حذف پیک')
    }
  }

  // Delivery status handler
  const handleStatusUpdate = async () => {
    try {
      if (!selectedDelivery || !newStatus) return

      const response = await fetch(`/api/delivery/${selectedDelivery.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      if (data.success) {
        message.success('وضعیت تحویل بروزرسانی شد')
        setStatusModalVisible(false)
        fetchDeliveries()
      } else {
        message.error(data.message || 'خطا در بروزرسانی وضعیت')
      }
    } catch (error) {
      message.error('خطا در بروزرسانی وضعیت')
    }
  }

  // Assign courier to delivery
  const handleAssignCourier = async () => {
    try {
      if (!selectedDeliveryForAssign || !selectedCourierId) {
        message.error('لطفاً پیک را انتخاب کنید')
        return
      }

      console.log('🚚 Assigning courier:', selectedCourierId, 'to delivery:', selectedDeliveryForAssign.id)

      const response = await fetch(`/api/delivery/${selectedDeliveryForAssign.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courierId: selectedCourierId 
        })
      })

      const data = await response.json()
      if (data.success) {
        message.success('پیک با موفقیت اختصاص داده شد')
        setAssignCourierModalVisible(false)
        setSelectedDeliveryForAssign(null)
        setSelectedCourierId('')
        fetchDeliveries()
        fetchCouriers() // برای بروزرسانی وضعیت پیک‌ها
      } else {
        message.error(data.message || 'خطا در اختصاص پیک')
      }
    } catch (error) {
      console.error('❌ Error assigning courier:', error)
      message.error('خطا در اختصاص پیک')
    }
  }

  // Handler for new courier assignment modal
  const handleCourierAssign = async (values: { courierId: string; notes?: string }) => {
    try {
      if (!selectedOrderForAssign) {
        message.error('سفارش انتخاب نشده است')
        return
      }

      setLoading(true)
      
      const response = await fetch(`/api/delivery/${selectedOrderForAssign.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courierId: values.courierId,
          notes: values.notes 
        })
      })

      const data = await response.json()
      
      if (data.success) {
        message.success('پیک با موفقیت اختصاص داده شد')
        setIsAssignModalVisible(false)
        setSelectedOrderForAssign(null)
        courierAssignForm.resetFields()
        fetchDeliveries()
        fetchCouriers()
      } else {
        message.error(data.message || 'خطا در اختصاص پیک')
      }
    } catch (error) {
      console.error('❌ Error assigning courier:', error)
      message.error('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  // Table columns for couriers
  const courierColumns: ColumnsType<Courier> = [
    {
      title: 'نام پیک',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span style={{ fontWeight: 'bold' }}>{name}</span>
        </Space>
      )
    },
    {
      title: 'شماره تلفن',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          <span>{phone}</span>
        </Space>
      )
    },
    {
      title: 'نوع وسیله نقلیه',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (vehicleType: string) => {
        const typeMap = {
          'MOTORCYCLE': { icon: <CarOutlined />, text: 'موتورسیکلت' },
          'CAR': { icon: <CarOutlined />, text: 'خودرو' },
          'BICYCLE': { icon: <CarOutlined />, text: 'دوچرخه' },
          'WALKING': { icon: <UserOutlined />, text: 'پیاده' },
          'motorcycle': { icon: <CarOutlined />, text: 'موتورسیکلت' },
          'car': { icon: <CarOutlined />, text: 'خودرو' },
          'bicycle': { icon: <CarOutlined />, text: 'دوچرخه' }
        }
        const typeInfo = typeMap[vehicleType as keyof typeof typeMap] || { icon: <CarOutlined />, text: vehicleType }
        return (
          <Space>
            {typeInfo.icon}
            <span>{typeInfo.text}</span>
          </Space>
        )
      }
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          'AVAILABLE': { color: 'green', text: 'آماده' },
          'BUSY': { color: 'orange', text: 'مشغول' },
          'OFFLINE': { color: 'red', text: 'غیرفعال' }
        }
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 200,
      render: (_, record: Courier) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedCourier(record)
              form.setFieldsValue(record)
              setEditModalVisible(true)
            }}
          >
            ویرایش
          </Button>
          <Popconfirm
            title="آیا مطمئن هستید؟"
            onConfirm={() => handleDeleteCourier(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // Table columns for active deliveries
  const activeDeliveryColumns: ColumnsType<Delivery> = [
    {
      title: 'شماره سفارش',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (orderId: string) => <Tag color="blue">#{orderId}</Tag>
    },
    {
      title: 'مشتری',
      dataIndex: 'customer',
      key: 'customer',
      width: 200,
      render: (customer: Customer) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{customer?.name || 'مشتری نامشخص'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {customer?.phone || 'شماره نامشخص'}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'آدرس تحویل',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      width: 250,
      render: (address: string | Address) => (
        <Space>
          <EnvironmentOutlined />
          <span>{typeof address === 'string' ? address : `${address?.street}, ${address?.city}`}</span>
        </Space>
      )
    },
    {
      title: 'پیک',
      dataIndex: 'courier',
      key: 'courier',
      width: 150,
      render: (courier: Courier) => courier ? (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{courier.name}</span>
        </Space>
      ) : <Text type="secondary">اختصاص نداده شده</Text>
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap = {
          'PENDING': { color: 'orange', text: 'در انتظار' },
          'ASSIGNED': { color: 'blue', text: 'اختصاص داده شده' },
          'DISPATCHED': { color: 'purple', text: 'در راه' },
          'DELIVERED': { color: 'green', text: 'تحویل شده' },
          'CANCELLED': { color: 'red', text: 'لغو شده' }
        }
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: 'مبلغ',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount: number) => `${amount?.toLocaleString()} تومان`
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 200,
      render: (_, record: Delivery) => (
        <Space>
          {!record.courierId && (
            <Button 
              type="primary" 
              size="small"
              icon={<UserOutlined />}
              onClick={() => {
                setSelectedOrderForAssign(record)
                setIsAssignModalVisible(true)
              }}
            >
              اختصاص پیک
            </Button>
          )}
          <Button 
            type="default" 
            size="small"
            onClick={() => {
              setSelectedDelivery(record)
              setNewStatus(record.status)
              setStatusModalVisible(true)
            }}
          >
            تغییر وضعیت
          </Button>
          <Button 
            type="default" 
            size="small"
            onClick={() => {
              setSelectedDeliveryForDetails(record)
              setIsDetailsModalVisible(true)
            }}
          >
            جزئیات
          </Button>
        </Space>
      )
    }
  ]

  // Table columns for completed deliveries
  const completedDeliveryColumns: ColumnsType<Delivery> = [
    {
      title: 'شماره سفارش',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (orderId: string) => <Tag color="blue">#{orderId}</Tag>
    },
    {
      title: 'مشتری',
      dataIndex: 'customer',
      key: 'customer',
      width: 200,
      render: (customer: Customer) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{customer?.name || 'مشتری نامشخص'}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'پیک',
      dataIndex: 'courier',
      key: 'courier',
      width: 150,
      render: (courier: Courier) => courier ? (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{courier.name}</span>
        </Space>
      ) : <Text type="secondary">اختصاص نداده شده</Text>
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap = {
          'DELIVERED': { color: 'green', text: 'تحویل شده' },
          'CANCELLED': { color: 'red', text: 'لغو شده' }
        }
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: 'مبلغ',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount: number) => `${amount?.toLocaleString()} تومان`
    },
    {
      title: 'تاریخ تحویل',
      dataIndex: 'actualDeliveryTime',
      key: 'actualDeliveryTime',
      width: 150,
      render: (deliveredAt: string) => (
        <Space>
          <ClockCircleOutlined />
          <span>{deliveredAt ? new Date(deliveredAt).toLocaleDateString('fa-IR') : 'نامشخص'}</span>
        </Space>
      )
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 120,
      render: (_, record: Delivery) => (
        <Button 
          type="default" 
          size="small"
          onClick={() => {
            setSelectedDeliveryForDetails(record)
            setIsDetailsModalVisible(true)
          }}
        >
          جزئیات
        </Button>
      )
    }
  ]

  // Statistics
  const availableCouriers = couriers.filter(c => c.status === 'AVAILABLE').length
  const busyCouriers = couriers.filter(c => c.status === 'BUSY').length
  const activeDeliveries = deliveries.filter(d => 
    d.status !== 'DELIVERED' && d.status !== 'CANCELLED'
  ).length
  const completedDeliveries = deliveries.filter(d => 
    d.status === 'DELIVERED' || d.status === 'CANCELLED'
  ).length

  const tabItems = [
    {
      key: 'couriers',
      label: (
        <span>
          👤 مدیریت پیک‌ها
          <Badge count={couriers.length} style={{ backgroundColor: '#1890ff', marginLeft: 8 }} />
        </span>
      ),
      children: (
        <div>
          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="پیک‌های آماده"
                  value={availableCouriers}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="پیک‌های مشغول"
                  value={busyCouriers}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="کل پیک‌ها"
                  value={couriers.length}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <ProTableWrapper>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4}>لیست پیک‌ها</Title>
              <Space>
                <Button 
                  type="default"
                  onClick={() => {
                    console.log('🧪 Testing data fetch...')
                    fetchCouriers()
                    fetchDeliveries()
                  }}
                >
                  🔄 تست دریافت داده‌ها
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setAddModalVisible(true)}
                >
                  افزودن پیک جدید
                </Button>
              </Space>
            </div>
            <Table
              columns={courierColumns}
              dataSource={couriers}
              rowKey="id"
              loading={loading}
              pagination={{
                defaultPageSize: 10,
                showQuickJumper: true,
                showTotal: (total) => `مجموع ${total} پیک`
              }}
            />
          </ProTableWrapper>
        </div>
      )
    },
    {
      key: 'active-deliveries',
      label: (
        <span>
          🚚 تحویل سفارش
          <Badge count={activeDeliveries} style={{ backgroundColor: '#faad14', marginLeft: 8 }} />
        </span>
      ),
      children: (
        <div>
          <ProTableWrapper>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>سفارشات فعال</Title>
              <Text type="secondary">سفارشاتی که در حال پردازش یا تحویل هستند</Text>
            </div>
            <Table
              columns={activeDeliveryColumns}
              dataSource={deliveries.filter(d => 
                d.status !== 'DELIVERED' && d.status !== 'CANCELLED'
              )}
              rowKey="id"
              loading={loading}
              pagination={{
                defaultPageSize: 10,
                showQuickJumper: true,
                showTotal: (total) => `مجموع ${total} سفارش فعال`
              }}
            />
          </ProTableWrapper>
        </div>
      )
    },
    {
      key: 'completed-deliveries',
      label: (
        <span>
          ✅ سفارشات تحویل شده
          <Badge count={completedDeliveries} style={{ backgroundColor: '#52c41a', marginLeft: 8 }} />
        </span>
      ),
      children: (
        <div>
          <ProTableWrapper>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>سفارشات تحویل شده</Title>
              <Text type="secondary">سفارشات تحویل شده و لغو شده</Text>
            </div>
            <Table
              columns={completedDeliveryColumns}
              dataSource={deliveries.filter(d => 
                d.status === 'DELIVERED' || d.status === 'CANCELLED'
              )}
              rowKey="id"
              loading={loading}
              pagination={{
                defaultPageSize: 10,
                showQuickJumper: true,
                showTotal: (total) => `مجموع ${total} سفارش تکمیل شده`
              }}
            />
          </ProTableWrapper>
        </div>
      )
    }
  ]

  return (
    <AntdHydrationSafe>
      <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <PageContainer
          header={{
            title: 'مدیریت تحویل و پیک‌ها',
            breadcrumb: {
              items: [
                { title: 'داشبورد' },
                { title: 'مدیریت تحویل' }
              ]
            }
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            size="large"
            items={tabItems}
          />
        </PageContainer>

        {/* Modals */}
        <Modal
          title="ویرایش پیک"
          open={editModalVisible}
          onOk={handleEditCourier}
          onCancel={() => setEditModalVisible(false)}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="نام پیک" rules={[{ required: true, message: 'نام پیک الزامی است' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="شماره تلفن" rules={[{ required: true, message: 'شماره تلفن الزامی است' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="vehicleType" label="نوع وسیله نقلیه">
              <Select>
                <Option value="motorcycle">موتورسیکلت</Option>
                <Option value="bicycle">دوچرخه</Option>
                <Option value="car">خودرو</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="وضعیت">
              <Select>
                <Option value="AVAILABLE">آماده</Option>
                <Option value="BUSY">مشغول</Option>
                <Option value="OFFLINE">غیرفعال</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="افزودن پیک جدید"
          open={addModalVisible}
          onOk={handleAddCourier}
          onCancel={() => setAddModalVisible(false)}
          width={600}
        >
          <Form form={addForm} layout="vertical">
            <Form.Item name="name" label="نام پیک" rules={[{ required: true, message: 'نام پیک الزامی است' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="شماره تلفن" rules={[{ required: true, message: 'شماره تلفن الزامی است' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="vehicleType" label="نوع وسیله نقلیه" initialValue="motorcycle">
              <Select>
                <Option value="motorcycle">موتورسیکلت</Option>
                <Option value="bicycle">دوچرخه</Option>
                <Option value="car">خودرو</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="تغییر وضعیت تحویل"
          open={statusModalVisible}
          onOk={handleStatusUpdate}
          onCancel={() => setStatusModalVisible(false)}
          width={400}
        >
          {selectedDelivery && (
            <div>
              <p><strong>سفارش:</strong> #{selectedDelivery.orderId}</p>
              <p><strong>وضعیت فعلی:</strong> {selectedDelivery.status}</p>
              <Divider />
              <Form.Item label="وضعیت جدید">
                <Select value={newStatus} onChange={setNewStatus}>
                  <Option value="PENDING">در انتظار</Option>
                  <Option value="ASSIGNED">اختصاص داده شده</Option>
                  <Option value="DISPATCHED">در راه</Option>
                  <Option value="DELIVERED">تحویل شده</Option>
                  <Option value="CANCELLED">لغو شده</Option>
                </Select>
              </Form.Item>
            </div>
          )}
        </Modal>

        {/* Modal for Courier Assignment */}
        <Modal
          title="اختصاص پیک به سفارش"
          open={isAssignModalVisible}
          onCancel={() => {
            setIsAssignModalVisible(false)
            setSelectedOrderForAssign(null)
            courierAssignForm.resetFields()
          }}
          onOk={() => courierAssignForm.submit()}
          confirmLoading={loading}
          width={600}
        >
          <Form
            form={courierAssignForm}
            layout="vertical"
            onFinish={handleCourierAssign}
          >
            <Form.Item
              name="courierId"
              label="انتخاب پیک"
              rules={[{ required: true, message: 'لطفا یک پیک انتخاب کنید' }]}
            >
              <Select
                placeholder="پیک مورد نظر را انتخاب کنید"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {couriers
                  .filter(courier => courier.status === 'AVAILABLE')
                  .map(courier => (
                    <Select.Option key={courier.id} value={courier.id}>
                      {courier.name} - {courier.phone}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="notes"
              label="یادداشت (اختیاری)"
            >
              <Input.TextArea
                rows={3}
                placeholder="یادداشت برای پیک..."
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal for Delivery Details */}
        <Modal
          title="جزئیات سفارش تحویل"
          open={isDetailsModalVisible}
          onCancel={() => {
            setIsDetailsModalVisible(false)
            setSelectedDeliveryForDetails(null)
          }}
          footer={[
            <Button key="close" onClick={() => setIsDetailsModalVisible(false)}>
              بستن
            </Button>
          ]}
          width={800}
        >
          {selectedDeliveryForDetails && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="اطلاعات سفارش">
                    <p><strong>شماره سفارش:</strong> #{selectedDeliveryForDetails.orderId}</p>
                    <p><strong>آدرس تحویل:</strong> {typeof selectedDeliveryForDetails.deliveryAddress === 'string' 
                      ? selectedDeliveryForDetails.deliveryAddress 
                      : `${selectedDeliveryForDetails.deliveryAddress.street}, ${selectedDeliveryForDetails.deliveryAddress.city}`}</p>
                    <p><strong>مبلغ:</strong> {selectedDeliveryForDetails.totalAmount?.toLocaleString()} تومان</p>
                    {selectedDeliveryForDetails.customer && (
                      <p><strong>تلفن مشتری:</strong> {selectedDeliveryForDetails.customer.phone}</p>
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="وضعیت تحویل">
                    <p><strong>وضعیت:</strong> 
                      <Tag color={
                        selectedDeliveryForDetails.status === 'PENDING' ? 'orange' :
                        selectedDeliveryForDetails.status === 'ASSIGNED' ? 'blue' :
                        selectedDeliveryForDetails.status === 'DISPATCHED' ? 'purple' :
                        selectedDeliveryForDetails.status === 'DELIVERED' ? 'green' :
                        selectedDeliveryForDetails.status === 'CANCELLED' ? 'red' : 'default'
                      } style={{ marginRight: '8px' }}>
                        {selectedDeliveryForDetails.status === 'PENDING' ? 'در انتظار' :
                         selectedDeliveryForDetails.status === 'ASSIGNED' ? 'اختصاص داده شده' :
                         selectedDeliveryForDetails.status === 'DISPATCHED' ? 'در راه' :
                         selectedDeliveryForDetails.status === 'DELIVERED' ? 'تحویل شده' :
                         selectedDeliveryForDetails.status === 'CANCELLED' ? 'لغو شده' : selectedDeliveryForDetails.status}
                      </Tag>
                    </p>
                    <p><strong>تاریخ ایجاد:</strong> {new Date(selectedDeliveryForDetails.createdAt).toLocaleDateString('fa-IR')}</p>
                    {selectedDeliveryForDetails.estimatedDeliveryTime && (
                      <p><strong>زمان تخمینی تحویل:</strong> {new Date(selectedDeliveryForDetails.estimatedDeliveryTime).toLocaleDateString('fa-IR')}</p>
                    )}
                    {selectedDeliveryForDetails.actualDeliveryTime && (
                      <p><strong>زمان واقعی تحویل:</strong> {new Date(selectedDeliveryForDetails.actualDeliveryTime).toLocaleDateString('fa-IR')}</p>
                    )}
                  </Card>
                </Col>
                <Col span={24}>
                  <Card size="small" title="اطلاعات پیک">
                    {selectedDeliveryForDetails.courier ? (
                      <div>
                        <p><strong>نام پیک:</strong> {selectedDeliveryForDetails.courier.name}</p>
                        <p><strong>تلفن پیک:</strong> {selectedDeliveryForDetails.courier.phone}</p>
                        <p><strong>وضعیت پیک:</strong> 
                          <Tag color={selectedDeliveryForDetails.courier.status === 'AVAILABLE' ? 'green' : 'orange'} style={{ marginRight: '8px' }}>
                            {selectedDeliveryForDetails.courier.status === 'AVAILABLE' ? 'آزاد' : 'مشغول'}
                          </Tag>
                        </p>
                      </div>
                    ) : (
                      <p style={{ color: '#999' }}>هنوز پیکی اختصاص داده نشده است</p>
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </AntdHydrationSafe>
  )
}

const WrappedDeliveryPage: React.FC = () => {
  return (
    <App>
      <DeliveryPage />
    </App>
  )
}

export default WrappedDeliveryPage
