'use client'

import React, { useEffect, useState } from 'react'
import { 
  ProTable, 
  ProCard, 
  Statistic, 
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProFormDigit,
  QueryFilter
} from '@ant-design/pro-components'
import { 
  Button, 
  Tag, 
  Space, 
  Tooltip, 
  Modal, 
  message, 
  Drawer,
  Steps,
  Row,
  Col,
  Badge,
  Avatar,
  Typography,
  Alert,
  App
} from 'antd'
import { 
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  StarFilled,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { useDeliveryStore } from '@/stores/delivery-store'
import { 
  Delivery, 
  Courier, 
  DeliveryStatus,
  CourierStatus,
  CourierForm,
  getDeliveryStatusLabel,
  getDeliveryStatusColor,
  getCourierStatusLabel,
  getCourierStatusColor
} from '@/types/delivery'
import { ProTableWrapper, AntdHydrationSafe, getConsistentProTableProps } from '@/lib/hydration-fix'

const { Title, Text } = Typography

const DeliveryPage: React.FC = () => {
  const { modal } = App.useApp()
  const {
    deliveries,
    couriers,
    stats,
    loading,
    error,
    fetchDeliveries,
    fetchCouriers,
    fetchStats,
    createDelivery,
    updateDelivery,
    assignCourier,
    updateDeliveryStatus,
    createCourier,
    updateCourier
  } = useDeliveryStore()

  const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false)
  const [isCourierModalVisible, setIsCourierModalVisible] = useState(false)
  const [isCourierEditVisible, setIsCourierEditVisible] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null)
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false)
  const [deliveryForm] = ProForm.useForm()
  const [courierForm] = ProForm.useForm()
  const [courierEditForm] = ProForm.useForm()

  // Load data on mount
  useEffect(() => {
    fetchDeliveries()
    fetchCouriers()
    fetchStats()
  }, [fetchDeliveries, fetchCouriers, fetchStats])

  // Handle delivery status change
  const handleStatusChange = async (deliveryId: string, newStatus: DeliveryStatus) => {
    try {
      await updateDeliveryStatus(deliveryId, newStatus)
      message.success('وضعیت تحویل به‌روزرسانی شد')
    } catch (error) {
      message.error('خطا در به‌روزرسانی وضعیت')
    }
  }

  // Handle courier assignment
  const handleAssignCourier = async (deliveryId: string, courierId: string) => {
    try {
      await assignCourier({ deliveryId, courierId })
      message.success('پیک با موفقیت تخصیص داده شد')
    } catch (error) {
      message.error('خطا در تخصیص پیک')
    }
  }

  // Handle courier edit
  const handleEditCourier = (courier: Courier) => {
    setSelectedCourier(courier)
    courierEditForm.setFieldsValue(courier)
    setIsCourierEditVisible(true)
  }

  // Handle courier edit submit
  const handleCourierEditSubmit = async (values: any) => {
    if (!selectedCourier) return

    try {
      await updateCourier(selectedCourier.id, values)
      message.success('اطلاعات پیک به‌روزرسانی شد')
      setSelectedCourier(null)
      setIsCourierEditVisible(false)
      courierEditForm.resetFields()
      fetchCouriers()
    } catch (error) {
      message.error('خطا در به‌روزرسانی اطلاعات پیک')
      console.error('Error updating courier:', error)
    }
  }

  // Handle courier delete
  const handleDeleteCourier = (courierId: string) => {
    modal.confirm({
      title: 'حذف پیک',
      content: 'آیا مطمئن هستید که می‌خواهید این پیک را حذف کنید؟',
      okText: 'بله، حذف کن',
      cancelText: 'انصراف',
      okType: 'danger',
      onOk: async () => {
        try {
          // await deleteCourier(courierId)
          message.success('پیک با موفقیت حذف شد')
          fetchCouriers()
        } catch (error) {
          message.error('خطا در حذف پیک')
        }
      }
    })
  }

  // Delivery table columns
  const deliveryColumns = [
    {
      title: 'کد تحویل',
      dataIndex: 'trackingCode',
      key: 'trackingCode',
      width: 120,
      render: (code: string) => (
        <Text strong style={{ color: '#1890ff' }}>{code}</Text>
      )
    },
    {
      title: 'مشتری',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 150,
      render: (_: any, record: Delivery) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{record.customer?.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.customer?.phone}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'سفارش',
      dataIndex: 'orderId',
      key: 'order',
      width: 100,
      render: (_: any, record: Delivery) => (
        <div>
          <Text>#{record.orderId}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.totalAmount?.toLocaleString()} تومان
          </Text>
        </div>
      )
    },
    {
      title: 'پیک',
      dataIndex: ['courier', 'name'],
      key: 'courier',
      width: 150,
      render: (_: any, record: Delivery) => {
        if (!record.courier) {
          return (
            <Button 
              size="small" 
              type="dashed"
              onClick={() => {
                modal.confirm({
                  title: 'انتخاب پیک',
                  content: (
                    <ProFormSelect
                      name="courierId"
                      placeholder="پیک را انتخاب کنید"
                      options={couriers
                        .filter(c => c.status === 'AVAILABLE')
                        .map(c => ({
                          label: `${c.name} (${getCourierStatusLabel(c.status)})`,
                          value: c.id
                        }))}
                    />
                  ),
                  onOk: (courierId) => {
                    if (courierId) {
                      handleAssignCourier(record.id, courierId)
                    }
                  }
                })
              }}
            >
              تخصیص پیک
            </Button>
          )
        }
        return (
          <Space>
            <Avatar size="small" icon={<CarOutlined />} />
            <div>
              <Text strong>{record.courier.name}</Text>
              <br />
              <Tag color={getCourierStatusColor(record.courier.status)}>
                {getCourierStatusLabel(record.courier.status)}
              </Tag>
            </div>
          </Space>
        )
      }
    },
    {
      title: 'آدرس تحویل',
      dataIndex: ['deliveryAddress', 'street'],
      key: 'address',
      width: 200,
      ellipsis: true,
      render: (_: any, record: Delivery) => (
        <Tooltip title={`${record.deliveryAddress?.street}, ${record.deliveryAddress?.city}`}>
          <Text>{record.deliveryAddress?.street}</Text>
        </Tooltip>
      )
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: DeliveryStatus, record: Delivery) => (
        <Tag color={getDeliveryStatusColor(status)}>
          {getDeliveryStatusLabel(status)}
        </Tag>
      )
    },
    {
      title: 'زمان ایجاد',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('fa-IR')
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 150,
      render: (_: any, record: Delivery) => (
        <Space>
          <Tooltip title="جزئیات">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedDelivery(record)
                setIsDetailDrawerVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="ویرایش">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedDelivery(record)
                setIsDeliveryModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                modal.confirm({
                  title: 'حذف تحویل',
                  content: 'آیا از حذف این تحویل اطمینان دارید؟',
                  okText: 'حذف',
                  cancelText: 'انصراف',
                  onOk: () => {
                    message.success('تحویل حذف شد')
                  }
                })
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  // Status steps for delivery tracking
  const getStatusSteps = (status: DeliveryStatus) => {
    const statuses: DeliveryStatus[] = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']
    const currentIndex = statuses.indexOf(status)
    const stepStatus = (index: number): "wait" | "error" | "finish" | "process" => {
      if (index < currentIndex) return "finish"
      if (index === currentIndex) return "process"
      return "wait"
    }
    return statuses.map((s, index) => ({
      title: getDeliveryStatusLabel(s),
      status: stepStatus(index)
    }))
  }

  return (
    <AntdHydrationSafe>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>🚚 مدیریت تحویل</Title>
          <Text type="secondary">
            مدیریت تحویلات، پیک‌ها و ردیابی سفارشات
          </Text>
        </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="خطا"
          description={error}
          type="error"
          closable
          style={{ marginBottom: '16px' }}
          onClose={() => useDeliveryStore.getState().clearError()}
        />
      )}

      {/* Stats Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <ProCard>
              <Statistic
                title="کل تحویلات"
                value={stats.total}
                prefix={<CarOutlined style={{ color: '#1890ff' }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard>
              <Statistic
                title="در انتظار"
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard>
              <Statistic
                title="تحویل داده شده"
                value={stats.delivered}
                prefix={<Badge status="success" />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard>
              <Statistic
                title="درآمد کل"
                value={stats.totalRevenue}
                suffix="تومان"
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              />
            </ProCard>
          </Col>
        </Row>
      )}

      {/* Deliveries Table */}
      <ProCard
        title="لیست تحویلات"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedDelivery(null)
                setIsDeliveryModalVisible(true)
              }}
            >
              تحویل جدید
            </Button>
            <Button
              icon={<UserOutlined />}
              onClick={() => setIsCourierModalVisible(true)}
            >
              مدیریت پیک‌ها
            </Button>
          </Space>
        }
      >
        <ProTableWrapper>
          <ProTable
            columns={deliveryColumns}
            dataSource={deliveries}
            rowKey="id"
            loading={loading}
            {...getConsistentProTableProps()}
          />
        </ProTableWrapper>
      </ProCard>

      {/* Create/Edit Delivery Modal */}
      <Modal
        title={selectedDelivery ? 'ویرایش تحویل' : 'تحویل جدید'}
        open={isDeliveryModalVisible}
        onCancel={() => {
          setIsDeliveryModalVisible(false)
          setSelectedDelivery(null)
          deliveryForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <ProForm
          form={deliveryForm}
          onFinish={async (values) => {
            try {
              if (selectedDelivery) {
                await updateDelivery(selectedDelivery.id, values)
                message.success('تحویل به‌روزرسانی شد')
              } else {
                await createDelivery(values)
                message.success('تحویل جدید ایجاد شد')
              }
              setIsDeliveryModalVisible(false)
              deliveryForm.resetFields()
              setSelectedDelivery(null)
            } catch (error) {
              message.error('خطا در ذخیره تحویل')
            }
          }}
          initialValues={selectedDelivery}
        >
          <ProFormText
            name="orderId"
            label="شماره سفارش"
            placeholder="شماره سفارش را وارد کنید"
            rules={[{ required: true, message: 'شماره سفارش الزامی است' }]}
          />
          <ProFormText
            name="customerId"
            label="شناسه مشتری"
            placeholder="شناسه مشتری را وارد کنید"
            rules={[{ required: true, message: 'شناسه مشتری الزامی است' }]}
          />
          <ProFormSelect
            name="type"
            label="نوع تحویل"
            placeholder="نوع تحویل را انتخاب کنید"
            options={[
              { label: 'پیک فرستی', value: 'DELIVERY' },
              { label: 'تحویل حضوری', value: 'PICKUP' },
              { label: 'صرف در محل', value: 'DINE_IN' }
            ]}
            rules={[{ required: true, message: 'نوع تحویل الزامی است' }]}
          />
          <ProFormDigit
            name="deliveryFee"
            label="هزینه تحویل"
            placeholder="هزینه تحویل (تومان)"
            min={0}
            rules={[{ required: true, message: 'هزینه تحویل الزامی است' }]}
          />
          <ProFormSelect
            name="priority"
            label="اولویت"
            placeholder="اولویت را انتخاب کنید"
            options={[
              { label: 'عادی', value: 1 },
              { label: 'سریع', value: 2 },
              { label: 'فوری', value: 3 }
            ]}
            initialValue={1}
          />
          <ProFormTextArea
            name="instructions"
            label="توضیحات"
            placeholder="توضیحات تکمیلی برای تحویل"
          />
        </ProForm>
      </Modal>

      {/* Courier Management Modal */}
      <Modal
        title="مدیریت پیک‌ها"
        open={isCourierModalVisible}
        onCancel={() => setIsCourierModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProTable
          columns={[
            {
              title: 'نام',
              dataIndex: 'name',
              key: 'name'
            },
            {
              title: 'تلفن',
              dataIndex: 'phone',
              key: 'phone'
            },
            {
              title: 'وسیله نقلیه',
              dataIndex: 'vehicleType',
              key: 'vehicleType',
              render: (type: string) => {
                const labels = {
                  BIKE: 'دوچرخه',
                  MOTORCYCLE: 'موتورسیکلت',
                  CAR: 'ماشین',
                  WALKING: 'پیاده'
                }
                return labels[type as keyof typeof labels] || type
              }
            },
            {
              title: 'وضعیت',
              dataIndex: 'status',
              key: 'status',
              render: (status: CourierStatus, record: Courier) => {
                const statusOptions = [
                  { label: 'آماده', value: 'AVAILABLE', color: 'success' },
                  { label: 'مشغول', value: 'BUSY', color: 'processing' },
                  { label: 'آفلاین', value: 'OFFLINE', color: 'default' }
                ]
                
                return (
                  <Tag 
                    color={getCourierStatusColor(status)}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      // چرخش وضعیت: AVAILABLE -> BUSY -> OFFLINE -> AVAILABLE
                      const currentIndex = statusOptions.findIndex(opt => opt.value === status)
                      const nextIndex = (currentIndex + 1) % statusOptions.length
                      const newStatus = statusOptions[nextIndex].value as CourierStatus
                      
                      // فراخوانی API برای تغییر وضعیت
                      updateCourier(record.id, { status: newStatus } as Partial<CourierForm>)
                        .then(() => {
                          message.success(`وضعیت پیک به "${statusOptions[nextIndex].label}" تغییر یافت`)
                          fetchCouriers()
                        })
                        .catch(() => {
                          message.error('خطا در تغییر وضعیت پیک')
                        })
                    }}
                  >
                    {getCourierStatusLabel(status)}
                  </Tag>
                )
              }
            },
            {
              title: 'امتیاز',
              dataIndex: 'rating',
              key: 'rating',
              render: (rating: number) => (
                <Space>
                  <StarFilled style={{ color: '#faad14' }} />
                  <Text>{rating?.toFixed(1)}</Text>
                </Space>
              )
            },
            {
              title: 'عملیات',
              key: 'actions',
              render: (_: any, record: Courier) => (
                <Space>
                  <Tooltip title="ویرایش پیک">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => handleEditCourier(record)}
                    />
                  </Tooltip>
                  <Tooltip title="حذف پیک">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleDeleteCourier(record.id)}
                    />
                  </Tooltip>
                </Space>
              )
            }
          ]}
          dataSource={couriers}
          rowKey="id"
          pagination={false}
          size="small"
          search={false}
          toolBarRender={() => [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                modal.confirm({
                  title: 'افزودن پیک جدید',
                  content: (
                    <ProForm
                      onFinish={async (values: any) => {
                        try {
                          await createCourier(values as CourierForm)
                          message.success('پیک جدید اضافه شد')
                          return true
                        } catch (error) {
                          message.error('خطا در افزودن پیک')
                          return false
                        }
                      }}
                    >
                      <ProFormText
                        name="name"
                        label="نام"
                        rules={[{ required: true }]}
                      />
                      <ProFormText
                        name="phone"
                        label="تلفن"
                        rules={[{ required: true }]}
                      />
                      <ProFormSelect
                        name="vehicleType"
                        label="وسیله نقلیه"
                        placeholder="وسیله نقلیه را انتخاب کنید"
                        options={[
                          { label: 'دوچرخه', value: 'BIKE' },
                          { label: 'موتورسیکلت', value: 'MOTORCYCLE' },
                          { label: 'ماشین', value: 'CAR' },
                          { label: 'پیاده', value: 'WALKING' }
                        ]}
                        rules={[{ required: true }]}
                      />
                    </ProForm>
                  ),
                  width: 500
                })
              }}
            >
              افزودن پیک
            </Button>
          ]}
        />
      </Modal>

      {/* Delivery Detail Drawer */}
      <Drawer
        title="جزئیات تحویل"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={500}
      >
        {selectedDelivery && (
          <div>
            <Steps
              direction="vertical"
              size="small"
              current={getStatusSteps(selectedDelivery.status).findIndex(s => s.status === 'process')}
              items={getStatusSteps(selectedDelivery.status)}
              style={{ marginBottom: '24px' }}
            />
            
            <ProCard title="اطلاعات مشتری" size="small" style={{ marginBottom: '16px' }}>
              <Space direction="vertical">
                <Text><UserOutlined /> {selectedDelivery.customer?.name}</Text>
                <Text><PhoneOutlined /> {selectedDelivery.customer?.phone}</Text>
              </Space>
            </ProCard>

            {selectedDelivery.courier && (
              <ProCard title="اطلاعات پیک" size="small" style={{ marginBottom: '16px' }}>
                <Space direction="vertical">
                  <Text><UserOutlined /> {selectedDelivery.courier.name}</Text>
                  <Text><PhoneOutlined /> {selectedDelivery.courier.phone}</Text>
                  <Text><CarOutlined /> {selectedDelivery.courier.vehicleType}</Text>
                </Space>
              </ProCard>
            )}

            <ProCard title="آدرس تحویل" size="small" style={{ marginBottom: '16px' }}>
              <Text>
                <EnvironmentOutlined /> {selectedDelivery.deliveryAddress?.street}, {selectedDelivery.deliveryAddress?.city}
              </Text>
            </ProCard>

            <ProCard title="جزئیات مالی" size="small">
              <Space direction="vertical">
                <Text>هزینه تحویل: {selectedDelivery.deliveryFee?.toLocaleString()} تومان</Text>
                <Text>مبلغ کل: {selectedDelivery.totalAmount?.toLocaleString()} تومان</Text>
              </Space>
            </ProCard>
          </div>
        )}
      </Drawer>

      {/* Drawer ویرایش پیک */}
      <Drawer
        title="ویرایش اطلاعات پیک"
        width={500}
        open={isCourierEditVisible}
        onClose={() => {
          setIsCourierEditVisible(false)
          setSelectedCourier(null)
          courierEditForm.resetFields()
        }}
        destroyOnClose
      >
        <ProForm
          form={courierEditForm}
          layout="vertical"
          onFinish={handleCourierEditSubmit}
          submitter={{
            searchConfig: {
              submitText: 'ذخیره تغییرات',
              resetText: 'انصراف'
            },
            resetButtonProps: {
              onClick: () => {
                setIsCourierEditVisible(false)
                setSelectedCourier(null)
                courierEditForm.resetFields()
              }
            }
          }}
        >
          <ProFormText
            name="name"
            label="نام پیک"
            placeholder="نام پیک را وارد کنید"
            rules={[{ required: true, message: 'نام الزامی است' }]}
          />
          <ProFormText
            name="phone"
            label="شماره تلفن"
            placeholder="شماره تلفن را وارد کنید"
            rules={[
              { required: true, message: 'شماره تلفن الزامی است' },
              { pattern: /^09\d{9}$/, message: 'شماره تلفن نامعتبر است' }
            ]}
          />
          <ProFormText
            name="email"
            label="ایمیل"
            placeholder="آدرس ایمیل را وارد کنید"
            rules={[
              { type: 'email', message: 'فرمت ایمیل نامعتبر است' }
            ]}
          />
          <ProFormSelect
            name="vehicleType"
            label="نوع وسیله نقلیه"
            placeholder="نوع وسیله نقلیه را انتخاب کنید"
            options={[
              { label: 'دوچرخه', value: 'BIKE' },
              { label: 'موتورسیکلت', value: 'MOTORCYCLE' },
              { label: 'ماشین', value: 'CAR' },
              { label: 'پیاده', value: 'WALKING' }
            ]}
            rules={[{ required: true, message: 'نوع وسیله نقلیه الزامی است' }]}
          />
          <ProFormText
            name="vehicleNumber"
            label="شماره پلاک"
            placeholder="شماره پلاک وسیله نقلیه"
          />
          <ProFormSelect
            name="status"
            label="وضعیت پیک"
            placeholder="وضعیت پیک را انتخاب کنید"
            options={[
              { label: 'آماده', value: 'AVAILABLE' },
              { label: 'مشغول', value: 'BUSY' },
              { label: 'آفلاین', value: 'OFFLINE' }
            ]}
            rules={[{ required: true, message: 'وضعیت الزامی است' }]}
          />
        </ProForm>
      </Drawer>

      </div>
    </AntdHydrationSafe>
  )
}

export default DeliveryPage
