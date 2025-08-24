'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Card, Table, Tag, Space, Typography, Row, Col, Statistic, Button, message, Modal, 
  Descriptions, Divider, Switch, Badge, Tooltip, 
  Alert, Progress, Timeline, Steps, notification, Popconfirm, Drawer, Tabs
} from 'antd'
import { 
  ShoppingCartOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, 
  EyeOutlined, EditOutlined, PlusOutlined, PrinterOutlined, ReloadOutlined,
  PhoneOutlined, EnvironmentOutlined, DollarOutlined, FireOutlined, CarOutlined
} from '@ant-design/icons'
import CreateOrderForm from '@/components/orders/CreateOrderForm'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal'
import OrderStats from '@/components/orders/OrderStats'
import PrintOrderModal from '@/components/orders/PrintOrderModal'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Step } = Steps

interface OrderItem {
  id: string;
  menuId: string; // ارتباط با Menu
  menuItem?: { // اطلاعات آیتم منو
    id: string;
    name: string;
    category: string;
    price: number;
    image?: string;
    preparationTime?: number;
  };
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  category?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: { 
    id?: string;
    name: string; 
    phone: string; 
    address?: string;
    email?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  discount?: number;
  tax?: number;
  deliveryFee?: number;
  status: string;
  type: string;
  tableNumber?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  kitchenStatus?: string;
  deliveryStatus?: string;
  estimatedTime?: number;
  actualTime?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  assignedChef?: string;
  assignedDelivery?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [isCreateOrderVisible, setIsCreateOrderVisible] = useState(false)
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false)
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const printRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to check permissions
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.permissions.includes('*')) return true
    return currentUser.permissions.includes(permission)
  }

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('No auth token found')
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData.user)
      } else if (response.status === 401) {
        console.log('Token expired or invalid')
        // Token is invalid, redirect to login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        window.location.href = '/auth/login'
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
    fetchOrders()
    
    // Auto refresh every 30 seconds if enabled
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchOrders()
      }, 30000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh])

  useEffect(() => {
    if (activeStatusFilter === 'ALL') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(order => order.status === activeStatusFilter))
    }
  }, [orders, activeStatusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // Strong cache busting
      const timestamp = new Date().getTime()
      const random = Math.random().toString(36).substring(7)
      const response = await fetch(`/api/orders?t=${timestamp}&r=${random}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const data = await response.json()
      console.log('📦 Orders data received:', data)
      console.log('📊 Orders count received:', data.orders?.length || 0)
      
      if (data.orders && Array.isArray(data.orders)) {
        // Show notification for new orders if real-time updates enabled
        if (realTimeUpdates && orders.length > 0 && data.orders.length > orders.length) {
          notification.success({
            message: 'سفارش جدید!',
            description: `${data.orders.length - orders.length} سفارش جدید دریافت شد`,
            placement: 'topRight',
          })
        }
        setOrders(data.orders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      message.error('خطا در دریافت سفارشات')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const sendToKitchen = async (orderId: string) => {
    try {
      await fetch('/api/kitchen/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'pending' })
      })
      message.success('سفارش به آشپزخانه ارسال شد')
    } catch (error) {
      console.error('Error sending to kitchen:', error)
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        await fetchOrders()
        message.success(result.message || 'سفارش حذف شد')
      } else {
        const error = await response.json()
        message.error(error.error || 'خطا در حذف سفارش')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      message.error('خطا در حذف سفارش')
    }
  }

  const handleCreateOrderSuccess = async () => {
    setIsCreateOrderVisible(false)
    // Force refresh the orders list
    setLoading(true)
    
    // Clear current orders state first
    setOrders([])
    setFilteredOrders([])
    
    await fetchOrders()
    message.success('سفارش جدید با موفقیت اضافه شد')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'blue'
      case 'Confirmed': return 'cyan'
      case 'Preparing': return 'orange' 
      case 'Ready': return 'green'
      case 'OutForDelivery': return 'purple'
      case 'Delivered': return 'default'
      case 'Cancelled': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'New': return 'جدید'
      case 'Confirmed': return 'تایید شده'
      case 'Preparing': return 'در حال آماده‌سازی'
      case 'Ready': return 'آماده تحویل'
      case 'OutForDelivery': return 'در حال تحویل'
      case 'Delivered': return 'تحویل شده'
      case 'Cancelled': return 'لغو شده'
      default: return status
    }
  }

  const getOrderProgress = (status: string) => {
    switch (status) {
      case 'New': return 0
      case 'Confirmed': return 20
      case 'Preparing': return 40
      case 'Ready': return 70
      case 'OutForDelivery': return 85
      case 'Delivered': return 100
      case 'Cancelled': return 0
      default: return 0
    }
  }

  const orderStats = {
    totalOrders: filteredOrders.length,
    todayOrders: filteredOrders.filter(o => dayjs(o.createdAt).isSame(dayjs(), 'day')).length,
    pendingOrders: filteredOrders.filter(o => o.status === 'PENDING').length,
    preparingOrders: filteredOrders.filter(o => o.status === 'PREPARING').length,
    readyOrders: filteredOrders.filter(o => o.status === 'READY').length,
    completedOrders: filteredOrders.filter(o => o.status === 'COMPLETED').length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    todayRevenue: filteredOrders
      .filter(o => dayjs(o.createdAt).isSame(dayjs(), 'day'))
      .reduce((sum, order) => sum + order.totalAmount, 0),
    averageOrderValue: filteredOrders.length > 0 ? 
      filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0) / filteredOrders.length : 0,
    completionRate: filteredOrders.length > 0 ? 
      (filteredOrders.filter(o => o.status === 'COMPLETED').length / filteredOrders.length) * 100 : 0
  }

  const columns = [
    {
      title: 'شماره سفارش',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string, record: Order) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(record.createdAt).format('HH:mm')}
          </Text>
        </Space>
      )
    },
    {
      title: 'مشتری',
      key: 'customer',
      render: (record: Order) => (
        <Space direction="vertical" size="small">
          <Text>{record.customer.name}</Text>
          <Space>
            <PhoneOutlined style={{ color: '#1890ff' }} />
            <Text type="secondary">{record.customer.phone}</Text>
          </Space>
          {record.customer.address && (
            <Space>
              <EnvironmentOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.customer.address}
              </Text>
            </Space>
          )}
        </Space>
      )
    },
    {
      title: 'نوع سفارش',
      dataIndex: 'type',
      key: 'type',
      render: (type: string, record: Order) => (
        <Space direction="vertical" size="small">
          <Tag color={type === 'dine-in' ? 'green' : type === 'takeaway' ? 'blue' : 'orange'}>
            {type === 'dine-in' ? 'حضوری' : type === 'takeaway' ? 'بیرون‌بر' : 'ارسالی'}
          </Tag>
          {record.tableNumber && (
            <Text type="secondary">میز {record.tableNumber}</Text>
          )}
        </Space>
      )
    },
    {
      title: 'مبلغ',
      key: 'amount',
      render: (record: Order) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ color: '#52c41a' }}>
            {record.totalAmount.toLocaleString()} ﷼
          </Text>
          {record.discount && record.discount > 0 && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              تخفیف: {record.discount.toLocaleString()} ﷼
            </Text>
          )}
          {record.paymentMethod && (
            <Tag style={{ fontSize: '10px' }}>
              {record.paymentMethod === 'cash' ? 'نقدی' : 'کارتی'}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Order) => (
        <Space direction="vertical" size="small">
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          <Progress 
            percent={getOrderProgress(status)} 
            size="small"
            strokeColor={getStatusColor(status)}
            showInfo={false}
          />
          {record.estimatedTime && (
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.estimatedTime} دقیقه
              </Text>
            </Space>
          )}
        </Space>
      )
    },
    {
      title: 'اقدامات',
      key: 'actions',
      render: (record: Order) => (
        <Space direction="vertical" size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => {
              setSelectedOrder(record)
              setIsViewModalVisible(true)
            }}
            size="small"
          >
            مشاهده
          </Button>
          <Button 
            type="link" 
            icon={<PrinterOutlined />} 
            onClick={() => {
              setSelectedOrder(record)
              setIsPrintModalVisible(true)
            }}
            size="small"
          >
            پرینت
          </Button>
          {/* فقط مدیران می‌توانند سفارش حذف کنند */}
          {hasPermission('orders.delete') && (
            <Popconfirm
              title="آیا مطمئن هستید؟"
              description="این عمل قابل بازگشت نیست"
              onConfirm={() => deleteOrder(record.id)}
              okText="بله"
              cancelText="خیر"
            >
              <Button 
                type="link" 
                danger 
                size="small"
              >
                حذف
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <ShoppingCartOutlined /> مدیریت سفارشات
          </Title>
        </Col>
        <Col>
          <Space>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
            />
            <Switch
              checked={realTimeUpdates}
              onChange={setRealTimeUpdates}
              checkedChildren="Real-time"
              unCheckedChildren="Static"
            />
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchOrders}
              loading={loading}
            >
              بروزرسانی
            </Button>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateOrderVisible(true)}
            >
              سفارش جدید
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Order Statistics */}
      <OrderStats stats={orderStats} />

      {/* Role-based Access Alert */}
      {currentUser && !hasPermission('orders.delete') && (
        <Alert
          message={`دسترسی محدود - ${currentUser.role === 'CHEF' ? 'سرآشپز' : currentUser.role === 'CASHIER' ? 'صندوقدار' : currentUser.role === 'WAITER' ? 'کاپیتان' : currentUser.role}`}
          description="شما فقط اجازه مشاهده و چاپ سفارشات را دارید. برای تغییر وضعیت سفارش، از قسمت آشپزخانه استفاده کنید."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Real-time Alert */}
      {realTimeUpdates && (
        <Alert
          message="بروزرسانی خودکار فعال است"
          description="سفارشات جدید به صورت خودکار نمایش داده می‌شوند"
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Status Filter Tabs */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={activeStatusFilter}
          onChange={setActiveStatusFilter}
          items={[
            {
              key: 'ALL',
              label: `همه (${orders.length})`,
            },
            {
              key: 'PENDING',
              label: `در انتظار (${orders.filter(o => o.status === 'PENDING').length})`,
            },
            {
              key: 'CONFIRMED',
              label: `تایید شده (${orders.filter(o => o.status === 'CONFIRMED').length})`,
            },
            {
              key: 'PREPARING',
              label: `در حال آماده‌سازی (${orders.filter(o => o.status === 'PREPARING').length})`,
            },
            {
              key: 'READY',
              label: `آماده (${orders.filter(o => o.status === 'READY').length})`,
            },
            {
              key: 'COMPLETED',
              label: `تحویل شده (${orders.filter(o => o.status === 'COMPLETED').length})`,
            },
            {
              key: 'CANCELLED',
              label: `لغو شده (${orders.filter(o => o.status === 'CANCELLED').length})`,
            }
          ]}
        />
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredOrders.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} از ${total} سفارش`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* View Order Modal */}
      <Modal
        title={`جزئیات سفارش ${selectedOrder?.orderNumber}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            بستن
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => {
              setIsPrintModalVisible(true)
              setIsViewModalVisible(false)
            }}
          >
            پرینت
          </Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="شماره سفارش">
                {selectedOrder.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="تاریخ">
                {dayjs(selectedOrder.createdAt).format('YYYY/MM/DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="نام مشتری">
                {selectedOrder.customer.name}
              </Descriptions.Item>
              <Descriptions.Item label="تلفن">
                {selectedOrder.customer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="نوع سفارش">
                <Tag color={getStatusColor(selectedOrder.type)}>
                  {selectedOrder.type === 'dine-in' ? 'حضوری' : 
                   selectedOrder.type === 'takeaway' ? 'بیرون‌بر' : 'ارسالی'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="وضعیت">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              {selectedOrder.tableNumber && (
                <Descriptions.Item label="شماره میز">
                  {selectedOrder.tableNumber}
                </Descriptions.Item>
              )}
              {selectedOrder.estimatedTime && (
                <Descriptions.Item label="زمان تخمینی">
                  {selectedOrder.estimatedTime} دقیقه
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>آیتم‌های سفارش</Divider>
            <Table
              dataSource={selectedOrder.items}
              columns={[
                { title: 'نام', dataIndex: 'name', key: 'name' },
                { title: 'تعداد', dataIndex: 'quantity', key: 'quantity' },
                { 
                  title: 'قیمت واحد', 
                  dataIndex: 'price', 
                  key: 'price',
                  render: (price: number) => `${price.toLocaleString()} ﷼`
                },
                { 
                  title: 'جمع', 
                  key: 'total',
                  render: (record: OrderItem) => 
                    `${(record.quantity * record.price).toLocaleString()} ﷼`
                }
              ]}
              pagination={false}
              size="small"
            />

            <Divider>خلاصه مالی</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions size="small">
                  <Descriptions.Item label="جمع آیتم‌ها">
                    {selectedOrder.items.reduce((sum, item) => 
                      sum + (item.quantity * item.price), 0
                    ).toLocaleString()} ﷼
                  </Descriptions.Item>
                  {selectedOrder.discount && selectedOrder.discount > 0 && (
                    <Descriptions.Item label="تخفیف">
                      {selectedOrder.discount.toLocaleString()} ﷼
                    </Descriptions.Item>
                  )}
                  {selectedOrder.tax && selectedOrder.tax > 0 && (
                    <Descriptions.Item label="مالیات">
                      {selectedOrder.tax.toLocaleString()} ﷼
                    </Descriptions.Item>
                  )}
                  {selectedOrder.deliveryFee && selectedOrder.deliveryFee > 0 && (
                    <Descriptions.Item label="هزینه ارسال">
                      {selectedOrder.deliveryFee.toLocaleString()} ﷼
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="مبلغ نهایی">
                    <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                      {selectedOrder.totalAmount.toLocaleString()} ﷼
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            {selectedOrder.notes && (
              <>
                <Divider>یادداشت</Divider>
                <Text>{selectedOrder.notes}</Text>
              </>
            )}

            <Divider>مراحل سفارش</Divider>
            <Steps
              current={
                selectedOrder.status === 'New' ? 0 :
                selectedOrder.status === 'Confirmed' ? 1 :
                selectedOrder.status === 'Preparing' ? 2 :
                selectedOrder.status === 'Ready' ? 3 :
                selectedOrder.status === 'OutForDelivery' ? 4 :
                selectedOrder.status === 'Delivered' ? 5 : 0
              }
              status={selectedOrder.status === 'Cancelled' ? 'error' : 'process'}
            >
              <Step title="ثبت سفارش" />
              <Step title="تایید سفارش" />
              <Step title="آماده‌سازی" />
              <Step title="آماده تحویل" />
              <Step title="در حال ارسال" />
              <Step title="تحویل شده" />
            </Steps>
          </div>
        )}
      </Modal>

      {/* Print Modal */}
      <Modal
        title="پرینت فاکتور"
        open={isPrintModalVisible}
        onCancel={() => setIsPrintModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPrintModalVisible(false)}>
            بستن
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => {
              const printContent = document.getElementById('print-content')
              if (printContent) {
                const printWindow = window.open('', '_blank')
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>فاکتور سفارش ${selectedOrder?.orderNumber}</title>
                        <style>
                          body { font-family: Arial, sans-serif; direction: rtl; }
                          .header { text-align: center; margin-bottom: 20px; }
                          .order-info { margin-bottom: 20px; }
                          .items-table { width: 100%; border-collapse: collapse; }
                          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; }
                          .total { font-weight: bold; font-size: 16px; }
                        </style>
                      </head>
                      <body>
                        ${printContent.innerHTML}
                      </body>
                    </html>
                  `)
                  printWindow.document.close()
                  printWindow.print()
                }
              }
            }}
          >
            پرینت
          </Button>
        ]}
        width={600}
      >
        <div id="print-content">
          {selectedOrder && (
            <div>
              <div className="header">
                <h2>رستوران A-DROP</h2>
                <p>فاکتور سفارش</p>
              </div>
              
              <div className="order-info">
                <p><strong>شماره سفارش:</strong> {selectedOrder.orderNumber}</p>
                <p><strong>تاریخ:</strong> {dayjs(selectedOrder.createdAt).format('YYYY/MM/DD HH:mm')}</p>
                <p><strong>مشتری:</strong> {selectedOrder.customer.name}</p>
                <p><strong>تلفن:</strong> {selectedOrder.customer.phone}</p>
                <p><strong>نوع سفارش:</strong> {
                  selectedOrder.type === 'dine-in' ? 'حضوری' : 
                  selectedOrder.type === 'takeaway' ? 'بیرون‌بر' : 'ارسالی'
                }</p>
              </div>

              <table className="items-table">
                <thead>
                  <tr>
                    <th>ردیف</th>
                    <th>نام محصول</th>
                    <th>تعداد</th>
                    <th>قیمت واحد</th>
                    <th>جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price.toLocaleString()} ﷼</td>
                      <td>{(item.quantity * item.price).toLocaleString()} ﷼</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                {selectedOrder.discount && selectedOrder.discount > 0 && (
                  <p>تخفیف: {selectedOrder.discount.toLocaleString()} ﷼</p>
                )}
                {selectedOrder.tax && selectedOrder.tax > 0 && (
                  <p>مالیات: {selectedOrder.tax.toLocaleString()} ﷼</p>
                )}
                {selectedOrder.deliveryFee && selectedOrder.deliveryFee > 0 && (
                  <p>هزینه ارسال: {selectedOrder.deliveryFee.toLocaleString()} ﷼</p>
                )}
                <p className="total">
                  <strong>مبلغ نهایی: {selectedOrder.totalAmount.toLocaleString()} ﷼</strong>
                </p>
              </div>

              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <p>با تشکر از انتخاب شما</p>
                <p>رستوران A-DROP</p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Create Order Modal */}
      {isCreateOrderVisible && (
        <CreateOrderForm
          onCancel={() => setIsCreateOrderVisible(false)}
          onSuccess={handleCreateOrderSuccess}
          orderSource="orders"
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          visible={isViewModalVisible}
          onCancel={() => {
            setIsViewModalVisible(false)
            setSelectedOrder(null)
          }}
          onPrint={(orderId) => {
            setIsViewModalVisible(false)
            setIsPrintModalVisible(true)
          }}
        />
      )}

      {/* Print Modal */}
      {selectedOrder && (
        <PrintOrderModal
          order={selectedOrder}
          visible={isPrintModalVisible}
          onCancel={() => {
            setIsPrintModalVisible(false)
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}
