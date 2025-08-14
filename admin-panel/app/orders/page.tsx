'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Card, Table, Tag, Space, Typography, Row, Col, Statistic, Button, message, Modal, 
  Descriptions, Select, Divider, Input, DatePicker, Switch, Badge, Tooltip, 
  Alert, Progress, Timeline, Steps, notification, Popconfirm, Drawer
} from 'antd'
import type { Dayjs } from 'dayjs'
import { 
  ShoppingCartOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, 
  EyeOutlined, EditOutlined, PlusOutlined, PrinterOutlined, ReloadOutlined,
  SearchOutlined, FilterOutlined, ExportOutlined, PhoneOutlined, 
  EnvironmentOutlined, DollarOutlined, FireOutlined, CarOutlined
} from '@ant-design/icons'
import CreateOrderForm from '@/components/orders/CreateOrderForm'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal'
import UpdateOrderStatus from '@/components/orders/UpdateOrderStatus'
import OrderStats from '@/components/orders/OrderStats'
import PrintOrderModal from '@/components/orders/PrintOrderModal'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
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
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false)
  const [isCreateOrderVisible, setIsCreateOrderVisible] = useState(false)
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null])
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const printRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
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
    filterOrders()
  }, [orders, searchText, statusFilter, typeFilter, dateRange])

  const filterOrders = () => {
    let filtered = [...orders]

    // Search filter
    if (searchText) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer.phone.includes(searchText)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter)
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(order => {
        const orderDate = dayjs(order.createdAt)
        return orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1])
      })
    }

    setFilteredOrders(filtered)
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      const data = await response.json()
      console.log('📦 Orders data received:', data)
      
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedAt: new Date() })
      })

      if (response.ok) {
        await fetchOrders()
        message.success('وضعیت سفارش بروزرسانی شد')
        setIsStatusModalVisible(false)

        // Send to kitchen if status is preparing
        if (status === 'Preparing') {
          await sendToKitchen(orderId)
        }
      } else {
        message.error('خطا در بروزرسانی وضعیت')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      message.error('خطا در بروزرسانی وضعیت')
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
        await fetchOrders()
        message.success('سفارش حذف شد')
      } else {
        message.error('خطا در حذف سفارش')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      message.error('خطا در حذف سفارش')
    }
  }

  const handleCreateOrderSuccess = () => {
    setIsCreateOrderVisible(false)
    fetchOrders()
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
    pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
    preparingOrders: filteredOrders.filter(o => o.status === 'preparing').length,
    readyOrders: filteredOrders.filter(o => o.status === 'ready').length,
    completedOrders: filteredOrders.filter(o => o.status === 'completed').length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    todayRevenue: filteredOrders
      .filter(o => dayjs(o.createdAt).isSame(dayjs(), 'day'))
      .reduce((sum, order) => sum + order.totalAmount, 0),
    averageOrderValue: filteredOrders.length > 0 ? 
      filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0) / filteredOrders.length : 0,
    completionRate: filteredOrders.length > 0 ? 
      (filteredOrders.filter(o => o.status === 'completed').length / filteredOrders.length) * 100 : 0
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
            icon={<EditOutlined />} 
            onClick={() => {
              setSelectedOrder(record)
              setNewStatus(record.status)
              setIsStatusModalVisible(true)
            }}
            size="small"
          >
            تغییر وضعیت
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
          <Popconfirm
            title="آیا مطمئن هستید؟"
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

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="جستجو (شماره، نام، تلفن)"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="وضعیت"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">همه وضعیت‌ها</Option>
              <Option value="New">جدید</Option>
              <Option value="Confirmed">تایید شده</Option>
              <Option value="Preparing">در حال آماده‌سازی</Option>
              <Option value="Ready">آماده</Option>
              <Option value="OutForDelivery">در حال تحویل</Option>
              <Option value="Delivered">تحویل شده</Option>
              <Option value="Cancelled">لغو شده</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="نوع سفارش"
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="all">همه انواع</Option>
              <Option value="dine-in">حضوری</Option>
              <Option value="takeaway">بیرون‌بر</Option>
              <Option value="delivery">ارسالی</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['از تاریخ', 'تا تاریخ']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<ExportOutlined />}
              onClick={() => {
                const csvData = filteredOrders.map(order => ({
                  'شماره سفارش': order.orderNumber,
                  'مشتری': order.customer.name,
                  'تلفن': order.customer.phone,
                  'نوع': order.type,
                  'وضعیت': getStatusText(order.status),
                  'مبلغ': order.totalAmount,
                  'تاریخ': dayjs(order.createdAt).format('YYYY/MM/DD HH:mm')
                }))
                
                const csvContent = Object.keys(csvData[0]).join(',') + '\n' +
                  csvData.map(row => Object.values(row).join(',')).join('\n')
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = `orders-${dayjs().format('YYYY-MM-DD')}.csv`
                link.click()
              }}
              style={{ width: '100%' }}
            >
              خروجی Excel
            </Button>
          </Col>
        </Row>
      </Card>

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

      {/* Status Update Modal */}
      <Modal
        title="تغییر وضعیت سفارش"
        open={isStatusModalVisible}
        onOk={() => {
          if (selectedOrder && newStatus) {
            updateOrderStatus(selectedOrder.id, newStatus)
          }
        }}
        onCancel={() => setIsStatusModalVisible(false)}
        okText="بروزرسانی"
        cancelText="انصراف"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>سفارش: {selectedOrder?.orderNumber}</Text>
          <Text>وضعیت فعلی: {selectedOrder && getStatusText(selectedOrder.status)}</Text>
          <Select
            style={{ width: '100%' }}
            placeholder="وضعیت جدید را انتخاب کنید"
            value={newStatus}
            onChange={setNewStatus}
          >
            <Option value="New">جدید</Option>
            <Option value="Confirmed">تایید شده</Option>
            <Option value="Preparing">در حال آماده‌سازی</Option>
            <Option value="Ready">آماده تحویل</Option>
            <Option value="OutForDelivery">در حال تحویل</Option>
            <Option value="Delivered">تحویل شده</Option>
            <Option value="Cancelled">لغو شده</Option>
          </Select>
        </Space>
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

      {/* Update Status Modal */}
      {selectedOrder && (
        <UpdateOrderStatus
          order={selectedOrder}
          visible={isStatusModalVisible}
          onCancel={() => {
            setIsStatusModalVisible(false)
            setSelectedOrder(null)
          }}
          onSuccess={() => {
            setIsStatusModalVisible(false)
            setSelectedOrder(null)
            fetchOrders()
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
