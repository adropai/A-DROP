'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { ProTable, ProDescriptions, ProForm, ProFormSelect, LightFilter } from '@ant-design/pro-components'
import { Button, Modal, message, Tag, Drawer, Card, Typography, Space, Badge, Row, Col, Segmented } from 'antd'
import { EyeOutlined, EditOutlined, PrinterOutlined, CheckCircleOutlined, ShoppingCartOutlined, UserOutlined, ClockCircleOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { useOrdersStore } from '../../stores/orders-store'
import { Order, OrderStatus } from '../../types/orders'
import OrderCard from '../../components/orders/OrderCard'
import { ProTableWrapper, AntdHydrationSafe, getConsistentProTableProps } from '@/lib/hydration-fix'

const { Title, Text } = Typography

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const actionRef = useRef<ActionType>()
  
  // استفاده از Zustand store
  const { orders, loading, fetchOrders, setStatus } = useOrdersStore()

  // بارگذاری سفارشات هنگام شروع
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Memoized status options برای بهبود performance
  const statusOptions = useMemo(() => [
    { value: 'New', label: 'جدید', color: 'orange' },
    { value: 'Confirmed', label: 'تایید شده', color: 'blue' },
    { value: 'Preparing', label: 'در حال آماده‌سازی', color: 'cyan' },
    { value: 'Ready', label: 'آماده تحویل', color: 'green' },
    { value: 'Delivering', label: 'در حال ارسال', color: 'purple' },
    { value: 'Delivered', label: 'تحویل شده', color: 'default' },
    { value: 'Cancelled', label: 'لغو شده', color: 'red' }
  ], [])

  // Memoized order summary for performance
  const orderSummary = useMemo(() => {
    const totalOrders = orders.length
    const newOrders = orders.filter(o => o.status === 'New').length
    const preparingOrders = orders.filter(o => o.status === 'Preparing').length
    const readyOrders = orders.filter(o => o.status === 'Ready').length
    
    return { totalOrders, newOrders, preparingOrders, readyOrders }
  }, [orders])

  const columns: ProColumns<Order>[] = [
    {
      title: 'شماره سفارش',
      dataIndex: 'id',
      copyable: true,
      width: 120,
      render: (text) => `#${text}`,
    },
    {
      title: 'مشتری',
      dataIndex: 'customer',
      search: false,
      render: (_: any, record: Order) => (
        <div>
          <div className="flex items-center gap-1">
            <UserOutlined className="text-gray-400" />
            <span>{record.customer.name}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.customer.phone}</div>
        </div>
      ),
    },
    {
      title: 'مبلغ کل',
      dataIndex: 'amount',
      valueType: 'money',
      search: false,
      render: (_: any, record: Order) => (
        <span className="font-semibold text-green-600">
          {record.amount.toLocaleString()} تومان
        </span>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        New: { text: 'جدید', status: 'Warning' },
        Confirmed: { text: 'تایید شده', status: 'Processing' },
        Preparing: { text: 'در حال آماده‌سازی', status: 'Processing' },
        Ready: { text: 'آماده تحویل', status: 'Success' },
        Delivering: { text: 'در حال ارسال', status: 'Processing' },
        Delivered: { text: 'تحویل شده', status: 'Default' },
        Cancelled: { text: 'لغو شده', status: 'Error' }
      },
      render: (_: any, record: Order) => {
        const statusConfig = statusOptions.find(s => s.value === record.status)
        return <Badge status={getStatusType(record.status)} text={statusConfig?.label} />
      }
    },
    {
      title: 'تعداد اقلام',
      dataIndex: 'items',
      search: false,
      render: (_: any, record: Order) => (
        <div className="flex items-center gap-1">
          <ShoppingCartOutlined className="text-gray-400" />
          <span>{record.items.length} قلم</span>
        </div>
      ),
    },
    {
      title: 'زمان سفارش',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      render: (_: any, record: Order) => (
        <div className="flex items-center gap-1">
          <ClockCircleOutlined className="text-gray-400" />
          <span>{new Date(record.createdAt).toLocaleString('fa-IR')}</span>
        </div>
      ),
    },
    {
      title: 'عملیات',
      valueType: 'option',
      width: 180,
      render: (_: any, record: Order) => [
        <Button
          key="view"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrder(record)}
        >
          مشاهده
        </Button>,
        <Button
          key="status"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleChangeStatus(record)}
          disabled={record.status === 'Delivered' || record.status === 'Cancelled'}
        >
          تغییر وضعیت
        </Button>,
        <Button
          key="print"
          type="link"
          size="small"
          icon={<PrinterOutlined />}
          onClick={() => handlePrintReceipt(record)}
        >
          پرینت
        </Button>,
      ],
    },
  ]

  const getStatusType = (status: OrderStatus): any => {
    switch (status) {
      case 'New': return 'warning'
      case 'Confirmed': return 'processing'
      case 'Preparing': return 'processing'
      case 'Ready': return 'success'
      case 'Delivering': return 'processing'
      case 'Delivered': return 'default'
      case 'Cancelled': return 'error'
      default: return 'default'
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setDrawerVisible(true)
  }

  const handleChangeStatus = (order: Order) => {
    setSelectedOrder(order)
    setStatusModalVisible(true)
  }

  const handlePrintReceipt = (order: Order) => {
    message.success('فاکتور در حال پرینت است...')
    // Logic for printing receipt
  }

  const handleStatusUpdate = async (values: { status: OrderStatus }) => {
    try {
      if (selectedOrder) {
        // ارسال درخواست به API
        const response = await fetch(`/api/orders/${selectedOrder.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: values.status }),
        })

        if (response.ok) {
          setStatus(selectedOrder.id, values.status)
          message.success('وضعیت سفارش با موفقیت به‌روزرسانی شد')
          setStatusModalVisible(false)
          setSelectedOrder(null)
          actionRef.current?.reload()
        } else {
          throw new Error('خطا در ارسال درخواست')
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
      message.error('خطا در به‌روزرسانی وضعیت')
    }
  }

  const getOrderSummary = () => {
    return orderSummary
  }

  const { totalOrders, newOrders, preparingOrders, readyOrders } = getOrderSummary()

  return (
    <AntdHydrationSafe>
      <div className="orders-management p-6">
      {/* آمار خلاصه */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
            <div className="text-gray-500">کل سفارشات</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{newOrders}</div>
            <div className="text-gray-500">سفارشات جدید</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">{preparingOrders}</div>
            <div className="text-gray-500">در حال آماده‌سازی</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{readyOrders}</div>
            <div className="text-gray-500">آماده تحویل</div>
          </div>
        </Card>
      </div>

      {/* جدول سفارشات */}
      {viewMode === 'table' && (
        <ProTableWrapper>
          <ProTable<Order>
            columns={columns}
            actionRef={actionRef}
            request={async (params) => {
              // فیلتر کردن بر اساس وضعیت
              let filteredOrders = orders;
              if (params.status) {
                filteredOrders = orders.filter(order => order.status === params.status);
              }
              
              return {
                data: filteredOrders,
                success: true,
                total: filteredOrders.length,
              }
            }}
            rowKey="id"
            {...getConsistentProTableProps()}
            headerTitle="مدیریت سفارشات"
          toolBarRender={() => [
            <Segmented
              key="view-mode"
              value={viewMode}
              onChange={(value) => setViewMode(value as 'table' | 'cards')}
              options={[
                { label: 'جدول', value: 'table', icon: <TableOutlined /> },
                { label: 'کارت', value: 'cards', icon: <AppstoreOutlined /> }
              ]}
            />,
            <LightFilter key="filter">
              <ProFormSelect
                name="status"
                placeholder="فیلتر بر اساس وضعیت"
                options={statusOptions}
              />
            </LightFilter>
          ]}
          />
        </ProTableWrapper>
      )}

      {/* نمایش کارتی سفارشات */}
      {viewMode === 'cards' && (
        <Card className="mt-4" title="نمایش کارتی سفارشات">
          <Row gutter={[16, 16]}>
            {orders.map(order => (
              <Col xs={24} sm={12} lg={8} xl={6} key={order.id}>
                <OrderCard
                  order={order}
                  onView={handleViewOrder}
                  onStatusChange={handleChangeStatus}
                  onPrint={handlePrintReceipt}
                />
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* درا جزئیات سفارش */}
      <Drawer
        title="جزئیات سفارش"
        placement="right"
        size="large"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedOrder && (
          <div>
            <ProDescriptions
              title="اطلاعات سفارش"
              dataSource={selectedOrder}
              columns={[
                {
                  title: 'شماره سفارش',
                  key: 'id',
                  dataIndex: 'id',
                  render: (text) => `#${text}`,
                },
                {
                  title: 'نام مشتری',
                  key: 'customerName',
                  dataIndex: ['customer', 'name'],
                },
                {
                  title: 'شماره تماس',
                  key: 'customerPhone',
                  dataIndex: ['customer', 'phone'],
                },
                {
                  title: 'وضعیت',
                  key: 'status',
                  dataIndex: 'status',
                  render: (status) => {
                    const statusConfig = statusOptions.find(s => s.value === status)
                    return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
                  }
                },
                {
                  title: 'زمان سفارش',
                  key: 'createdAt',
                  dataIndex: 'createdAt',
                  render: (date: string) => new Date(date).toLocaleString('fa-IR'),
                },
              ]}
            />

            <div className="mt-6">
              <Title level={4}>اقلام سفارش</Title>
              <ProTable<Order['items'][0]>
                columns={[
                  {
                    title: 'نام محصول',
                    dataIndex: 'name',
                    search: false,
                  },
                  {
                    title: 'تعداد',
                    dataIndex: 'quantity',
                    valueType: 'digit',
                    search: false,
                  },
                  {
                    title: 'قیمت واحد',
                    dataIndex: 'price',
                    valueType: 'money',
                    search: false,
                    render: (_: any, record: any) => `${record.price.toLocaleString()} تومان`,
                  },
                  {
                    title: 'مجموع',
                    search: false,
                    render: (_: any, record: any) => `${(record.quantity * record.price).toLocaleString()} تومان`,
                  },
                ]}
                dataSource={selectedOrder.items}
                pagination={false}
                search={false}
                toolBarRender={false}
                options={false}
              />
              
              <div className="mt-4 text-right">
                <strong className="text-lg text-green-600">
                  مجموع کل: {selectedOrder.amount.toLocaleString()} تومان
                </strong>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* مودال تغییر وضعیت */}
      <Modal
        title="تغییر وضعیت سفارش"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <div className="mb-4">
              <Text strong>وضعیت فعلی: </Text>
              <Tag color={statusOptions.find(s => s.value === selectedOrder.status)?.color}>
                {statusOptions.find(s => s.value === selectedOrder.status)?.label}
              </Tag>
              
              <div className="mt-4">
                <Text type="secondary">مراحل پردازش سفارش:</Text>
                <div className="flex flex-wrap gap-2 mt-2">
                  {statusOptions.slice(0, -1).map((status, index) => (
                    <div
                      key={status.value}
                      className={`px-3 py-1 rounded text-sm ${
                        statusOptions.findIndex(s => s.value === selectedOrder.status) >= index
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {status.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <ProForm
              onFinish={handleStatusUpdate}
              initialValues={{ status: selectedOrder.status }}
            >
              <ProFormSelect
                name="status"
                label="وضعیت جدید"
                options={statusOptions.filter(s => s.value !== 'Cancelled')}
                rules={[{ required: true, message: 'انتخاب وضعیت الزامی است' }]}
              />
            </ProForm>
          </div>
        )}
      </Modal>
      </div>
    </AntdHydrationSafe>
  )
}
