'use client'

import React, { useState, useEffect } from 'react'
import { 
  Modal, Form, Input, Select, Button, InputNumber, Space, Card, Row, Col, 
  message, Divider, Typography, Table, Tag, Switch, DatePicker, TimePicker
} from 'antd'
import { 
  PlusOutlined, MinusCircleOutlined, UserOutlined, ShoppingCartOutlined,
  DollarOutlined, PercentageOutlined, DeleteOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

interface CreateOrderFormProps {
  onCancel: () => void
  onSuccess: () => void
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  available: boolean
}

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
}

const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ onCancel, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('percentage')
  const [tax, setTax] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [total, setTotal] = useState(0)
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in')
  const [isNewCustomer, setIsNewCustomer] = useState(false)

  useEffect(() => {
    fetchMenuItems()
    fetchCustomers()
  }, [])

  useEffect(() => {
    calculateTotal()
  }, [selectedItems, discount, discountType, tax, deliveryFee])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu')
      const data = await response.json()
      if (data.items) {
        setMenuItems(data.items.filter((item: MenuItem) => item.available))
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      message.error('خطا در دریافت لیست منو')
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      if (data.customers) {
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      message.error('خطا در دریافت لیست مشتریان')
    }
  }

  const calculateTotal = () => {
    const newSubtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setSubtotal(newSubtotal)

    let discountAmount = 0
    if (discountType === 'percentage') {
      discountAmount = (newSubtotal * discount) / 100
    } else {
      discountAmount = discount
    }

    const taxAmount = ((newSubtotal - discountAmount) * tax) / 100
    const newTotal = newSubtotal - discountAmount + taxAmount + deliveryFee
    setTotal(Math.max(0, newTotal))
  }

  const addMenuItem = (menuItemId: string) => {
    const menuItem = menuItems.find(item => item.id === menuItemId)
    if (!menuItem) return

    const existingItem = selectedItems.find(item => item.menuItemId === menuItemId)
    if (existingItem) {
      setSelectedItems(prev => 
        prev.map(item => 
          item.menuItemId === menuItemId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setSelectedItems(prev => [...prev, {
        menuItemId: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        notes: ''
      }])
    }
  }

  const updateItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId)
      return
    }

    setSelectedItems(prev => 
      prev.map(item => 
        item.menuItemId === menuItemId 
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeItem = (menuItemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.menuItemId !== menuItemId))
  }

  const updateItemNotes = (menuItemId: string, notes: string) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.menuItemId === menuItemId 
          ? { ...item, notes }
          : item
      )
    )
  }

  const handleSubmit = async (values: any) => {
    if (selectedItems.length === 0) {
      message.error('لطفاً حداقل یک آیتم انتخاب کنید')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        customer: isNewCustomer ? {
          name: values.customerName,
          phone: values.customerPhone,
          email: values.customerEmail,
          address: values.customerAddress
        } : values.customerId,
        items: selectedItems,
        type: orderType,
        tableNumber: orderType === 'dine-in' ? values.tableNumber : null,
        discount: discount,
        discountType: discountType,
        tax: tax,
        deliveryFee: deliveryFee,
        totalAmount: total,
        notes: values.notes,
        estimatedTime: values.estimatedTime,
        paymentMethod: values.paymentMethod,
        isNewCustomer: isNewCustomer
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        message.success('سفارش با موفقیت ایجاد شد')
        form.resetFields()
        setSelectedItems([])
        onSuccess()
      } else {
        const error = await response.json()
        message.error(error.message || 'خطا در ایجاد سفارش')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      message.error('خطا در ایجاد سفارش')
    } finally {
      setLoading(false)
    }
  }

  const itemColumns = [
    {
      title: 'محصول',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'قیمت واحد',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} ﷼`
    },
    {
      title: 'تعداد',
      key: 'quantity',
      render: (record: any) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => updateItemQuantity(record.menuItemId, value || 1)}
          style={{ width: '80px' }}
        />
      )
    },
    {
      title: 'جمع',
      key: 'total',
      render: (record: any) => (
        <Text strong>{(record.price * record.quantity).toLocaleString()} ﷼</Text>
      )
    },
    {
      title: 'یادداشت',
      key: 'notes',
      render: (record: any) => (
        <Input
          placeholder="یادداشت..."
          value={record.notes}
          onChange={(e) => updateItemNotes(record.menuItemId, e.target.value)}
          style={{ width: '120px' }}
        />
      )
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (record: any) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.menuItemId)}
        >
          حذف
        </Button>
      )
    }
  ]

  return (
    <Modal
      title="ایجاد سفارش جدید"
      open={true}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'dine-in',
          paymentMethod: 'cash',
          estimatedTime: 30,
          tax: 9
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Customer Information */}
          <Col span={12}>
            <Card title="اطلاعات مشتری" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Switch
                  checked={isNewCustomer}
                  onChange={setIsNewCustomer}
                  checkedChildren="مشتری جدید"
                  unCheckedChildren="مشتری موجود"
                />

                {!isNewCustomer ? (
                  <Form.Item
                    name="customerId"
                    label="انتخاب مشتری"
                    rules={[{ required: true, message: 'انتخاب مشتری الزامی است' }]}
                  >
                    <Select 
                      placeholder="مشتری را انتخاب کنید"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {customers.map(customer => (
                        <Option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item
                      name="customerName"
                      label="نام مشتری"
                      rules={[{ required: true, message: 'نام مشتری الزامی است' }]}
                    >
                      <Input placeholder="نام مشتری" />
                    </Form.Item>
                    <Form.Item
                      name="customerPhone"
                      label="شماره تلفن"
                      rules={[{ required: true, message: 'شماره تلفن الزامی است' }]}
                    >
                      <Input placeholder="شماره تلفن" />
                    </Form.Item>
                    <Form.Item name="customerEmail" label="ایمیل">
                      <Input placeholder="ایمیل (اختیاری)" />
                    </Form.Item>
                    <Form.Item name="customerAddress" label="آدرس">
                      <TextArea placeholder="آدرس (اختیاری)" rows={2} />
                    </Form.Item>
                  </>
                )}
              </Space>
            </Card>
          </Col>

          {/* Order Information */}
          <Col span={12}>
            <Card title="اطلاعات سفارش" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item label="نوع سفارش">
                    <Select
                      value={orderType}
                      onChange={setOrderType}
                    >
                      <Option value="dine-in">حضوری</Option>
                      <Option value="takeaway">بیرون‌بر</Option>
                      <Option value="delivery">ارسالی</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                {orderType === 'dine-in' && (
                  <Col span={12}>
                    <Form.Item name="tableNumber" label="شماره میز">
                      <InputNumber 
                        placeholder="شماره میز"
                        min={1}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                )}

                <Col span={12}>
                  <Form.Item name="estimatedTime" label="زمان تخمینی (دقیقه)">
                    <InputNumber
                      min={5}
                      max={120}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="paymentMethod" label="روش پرداخت">
                    <Select>
                      <Option value="cash">نقدی</Option>
                      <Option value="card">کارتی</Option>
                      <Option value="online">آنلاین</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Divider>انتخاب محصولات</Divider>

        {/* Menu Items Selection */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="منو" size="small" style={{ height: '400px', overflow: 'auto' }}>
              {menuItems.map(item => (
                <Card
                  key={item.id}
                  size="small"
                  style={{ marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => addMenuItem(item.id)}
                  hoverable
                >
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong>{item.name}</Text>
                      <br />
                      <Tag color="blue">{item.category}</Tag>
                    </Col>
                    <Col>
                      <Text style={{ color: '#52c41a' }}>
                        {item.price.toLocaleString()} ﷼
                      </Text>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Card>
          </Col>

          <Col span={12}>
            <Card title="سبد خرید" size="small" style={{ height: '400px' }}>
              {selectedItems.length > 0 ? (
                <Table
                  dataSource={selectedItems}
                  columns={itemColumns}
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                  rowKey="menuItemId"
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '50px', color: '#ccc' }}>
                  هیچ محصولی انتخاب نشده است
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Divider>محاسبات مالی</Divider>

        {/* Financial Calculations */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="تنظیمات مالی" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text>نوع تخفیف:</Text>
                  <Select
                    value={discountType}
                    onChange={setDiscountType}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    <Option value="percentage">درصد</Option>
                    <Option value="amount">مبلغ</Option>
                  </Select>
                </Col>
                <Col span={12}>
                  <Text>میزان تخفیف:</Text>
                  <InputNumber
                    value={discount}
                    onChange={(value) => setDiscount(value || 0)}
                    style={{ width: '100%', marginTop: 4 }}
                    min={0}
                    suffix={discountType === 'percentage' ? '%' : '﷼'}
                  />
                </Col>
                <Col span={12}>
                  <Text>مالیات (%):</Text>
                  <InputNumber
                    value={tax}
                    onChange={(value) => setTax(value || 0)}
                    style={{ width: '100%', marginTop: 4 }}
                    min={0}
                    max={50}
                    suffix="%"
                  />
                </Col>
                {orderType === 'delivery' && (
                  <Col span={12}>
                    <Text>هزینه ارسال:</Text>
                    <InputNumber
                      value={deliveryFee}
                      onChange={(value) => setDeliveryFee(value || 0)}
                      style={{ width: '100%', marginTop: 4 }}
                      min={0}
                      suffix="﷼"
                    />
                  </Col>
                )}
              </Row>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="خلاصه مالی" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row justify="space-between">
                  <Text>جمع آیتم‌ها:</Text>
                  <Text>{subtotal.toLocaleString()} ﷼</Text>
                </Row>
                {discount > 0 && (
                  <Row justify="space-between">
                    <Text>تخفیف:</Text>
                    <Text style={{ color: '#ff4d4f' }}>
                      -{discountType === 'percentage' 
                        ? ((subtotal * discount) / 100).toLocaleString()
                        : discount.toLocaleString()} ﷼
                    </Text>
                  </Row>
                )}
                {tax > 0 && (
                  <Row justify="space-between">
                    <Text>مالیات:</Text>
                    <Text>{(((subtotal - (discountType === 'percentage' ? (subtotal * discount) / 100 : discount)) * tax) / 100).toLocaleString()} ﷼</Text>
                  </Row>
                )}
                {deliveryFee > 0 && (
                  <Row justify="space-between">
                    <Text>هزینه ارسال:</Text>
                    <Text>{deliveryFee.toLocaleString()} ﷼</Text>
                  </Row>
                )}
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between">
                  <Text strong style={{ fontSize: '16px' }}>مبلغ نهایی:</Text>
                  <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                    {total.toLocaleString()} ﷼
                  </Text>
                </Row>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Notes */}
        <Form.Item name="notes" label="یادداشت سفارش">
          <TextArea rows={3} placeholder="یادداشت اضافی برای سفارش..." />
        </Form.Item>

        {/* Submit Buttons */}
        <Row justify="end" style={{ marginTop: 24 }}>
          <Space>
            <Button onClick={onCancel}>
              انصراف
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<ShoppingCartOutlined />}
              disabled={selectedItems.length === 0}
            >
              ثبت سفارش
            </Button>
          </Space>
        </Row>
      </Form>
    </Modal>
  )
}

export default CreateOrderForm
