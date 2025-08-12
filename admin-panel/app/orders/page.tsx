'use client'

import { useState, useEffect } from 'react'
import { Card, Table, Tag, Space, Typography, Row, Col, Statistic, Button, message, Modal, Descriptions, Select, Divider } from 'antd'
import { ShoppingCartOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, EyeOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import CreateOrderForm from '@/components/orders/CreateOrderForm'

const { Title } = Typography
const { Option } = Select

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; phone: string };
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: string;
  type: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false)
  const [isCreateOrderVisible, setIsCreateOrderVisible] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      const data = await response.json()
      console.log('📦 Orders data received:', data)
      
      if (data.orders && Array.isArray(data.orders)) {
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

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewModalVisible(true)
  }

  const handleChangeStatus = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setIsStatusModalVisible(true)
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      // API call to update status
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        message.success('وضعیت سفارش به‌روزرسانی شد')
        // Update local state
        setOrders(orders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: newStatus }
            : order
        ))
        setIsStatusModalVisible(false)
        setSelectedOrder(null)
      } else {
        throw new Error('خطا در به‌روزرسانی')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      message.error('خطا در به‌روزرسانی وضعیت')
    }
  }

  const handleCreateOrderSuccess = () => {
    fetchOrders() // Refresh orders list after creating new order
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'blue'
      case 'Preparing': return 'orange' 
      case 'Ready': return 'green'
      case 'Delivered': return 'default'
      case 'Cancelled': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'New': return 'جدید'
      case 'Preparing': return 'در حال آماده‌سازی'
      case 'Ready': return 'آماده تحویل'
      case 'Delivered': return 'تحویل شده'
      case 'Cancelled': return 'لغو شده'
      default: return status
    }
  }

  const orderSummary = {
    total: orders.length,
    new: orders.filter(o => o.status === 'New').length,
    preparing: orders.filter(o => o.status === 'Preparing').length,
    ready: orders.filter(o => o.status === 'Ready').length
  }

  const columns = [
    {
      title: 'شماره سفارش',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'مشتری',
      dataIndex: ['customer', 'name'],
      key: 'customer',
    },
    {
      title: 'تلفن',
      dataIndex: ['customer', 'phone'],
      key: 'phone',
    },
    {
      title: 'مبلغ کل',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount.toLocaleString()} تومان`
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'نوع سفارش',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeColors: { [key: string]: string } = {
          'Dine-in': 'blue',
          'Takeaway': 'orange', 
          'Delivery': 'green'
        }
        
        const typeTexts: { [key: string]: string } = {
          'Dine-in': 'حضوری',
          'Takeaway': 'بیرون بر',
          'Delivery': 'پیک'
        }
        
        return (
          <Tag color={typeColors[type] || 'default'}>
            {typeTexts[type] || type}
          </Tag>
        )
      }
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, order: Order) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(order)}
          >
            مشاهده
          </Button>
          <Button 
            size="small" 
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleChangeStatus(order)}
          >
            تغییر وضعیت
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>مدیریت سفارشات</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsCreateOrderVisible(true)}
        >
          ثبت سفارش جدید
        </Button>
      </div>
      
      {/* آمار خلاصه */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic 
              title="کل سفارشات" 
              value={orderSummary.total} 
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="سفارشات جدید" 
              value={orderSummary.new} 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="در حال آماده‌سازی" 
              value={orderSummary.preparing} 
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="آماده تحویل" 
              value={orderSummary.ready} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* جدول سفارشات */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `نمایش ${range[0]} تا ${range[1]} از ${total} سفارش`
          }}
        />
      </Card>

      {/* Modal مشاهده جزئیات سفارش */}
      <Modal
        title={`جزئیات سفارش - ${selectedOrder?.orderNumber}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            بستن
          </Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="شماره سفارش" span={1}>
                {selectedOrder.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="وضعیت" span={1}>
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="نام مشتری" span={1}>
                {selectedOrder.customer.name}
              </Descriptions.Item>
              <Descriptions.Item label="شماره تلفن" span={1}>
                {selectedOrder.customer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="نوع سفارش" span={1}>
                {selectedOrder.type}
              </Descriptions.Item>
              <Descriptions.Item label="مبلغ کل" span={1}>
                {selectedOrder.totalAmount.toLocaleString('fa-IR')} تومان
              </Descriptions.Item>
              <Descriptions.Item label="تاریخ سفارش" span={2}>
                {new Date(selectedOrder.createdAt).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="right">آیتم‌های سفارش</Divider>
            <Table
              size="small"
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'نام آیتم', dataIndex: 'name', key: 'name' },
                { title: 'تعداد', dataIndex: 'quantity', key: 'quantity' },
                { 
                  title: 'قیمت واحد', 
                  dataIndex: 'price', 
                  key: 'price',
                  render: (price: number) => `${price.toLocaleString('fa-IR')} تومان`
                },
                { 
                  title: 'قیمت کل', 
                  key: 'total',
                  render: (_, item: any) => `${(item.quantity * item.price).toLocaleString('fa-IR')} تومان`
                }
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Modal تغییر وضعیت */}
      <Modal
        title={`تغییر وضعیت سفارش - ${selectedOrder?.orderNumber}`}
        open={isStatusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setIsStatusModalVisible(false)}
        okText="تأیید تغییر"
        cancelText="انصراف"
      >
        {selectedOrder && (
          <div>
            <p>وضعیت فعلی: <Tag color={getStatusColor(selectedOrder.status)}>{getStatusText(selectedOrder.status)}</Tag></p>
            <Divider />
            <p>انتخاب وضعیت جدید:</p>
            <Select
              style={{ width: '100%' }}
              value={newStatus}
              onChange={setNewStatus}
              placeholder="وضعیت جدید را انتخاب کنید"
            >
              <Option value="New">جدید</Option>
              <Option value="Preparing">در حال آماده‌سازی</Option>
              <Option value="Ready">آماده تحویل</Option>
              <Option value="Delivered">تحویل شده</Option>
              <Option value="Cancelled">لغو شده</Option>
            </Select>
          </div>
        )}
      </Modal>
      
      {/* فرم ثبت سفارش جدید */}
      <CreateOrderForm
        visible={isCreateOrderVisible}
        onCancel={() => setIsCreateOrderVisible(false)}
        onSuccess={handleCreateOrderSuccess}
      />
    </div>
  )
}
