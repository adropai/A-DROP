'use client'

import { useState, useEffect } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Button, 
  Table, 
  InputNumber, 
  Space,
  message,
  Divider,
  Card,
  Row,
  Col,
  Typography
} from 'antd'
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons'

const { Option } = Select
const { Title, Text } = Typography

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CreateOrderFormProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

export default function CreateOrderForm({ visible, onCancel, onSuccess }: CreateOrderFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([])
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)

  useEffect(() => {
    if (visible) {
      fetchMenuItems()
      form.resetFields()
      setSelectedItems([])
    }
  }, [visible, form])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu/items')
      const data = await response.json()
      console.log('🍽️ Menu items fetched:', data)
      
      if (data.success && data.data) {
        setMenuItems(data.data)
      } else {
        console.error('Invalid menu items response:', data)
        message.error('خطا در دریافت آیتم‌های منو')
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      message.error('خطا در دریافت آیتم‌های منو')
    }
  }

  const addItemToOrder = () => {
    if (!selectedMenuItem) {
      message.warning('لطفاً یک آیتم از منو انتخاب کنید')
      return
    }

    if (quantity <= 0) {
      message.warning('تعداد باید بیشتر از صفر باشد')
      return
    }

    const menuItem = menuItems.find(item => item.id === selectedMenuItem)
    if (!menuItem) return

    // Check if item already exists in order
    const existingItemIndex = selectedItems.findIndex(item => item.id === selectedMenuItem)
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...selectedItems]
      updatedItems[existingItemIndex].quantity += quantity
      setSelectedItems(updatedItems)
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: quantity
      }
      setSelectedItems([...selectedItems, newItem])
    }

    // Reset selection
    setSelectedMenuItem('')
    setQuantity(1)
    message.success('آیتم به سفارش اضافه شد')
  }

  const removeItemFromOrder = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId))
    message.success('آیتم از سفارش حذف شد')
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(itemId)
      return
    }

    setSelectedItems(selectedItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleSubmit = async (values: any) => {
    if (selectedItems.length === 0) {
      message.warning('لطفاً حداقل یک آیتم به سفارش اضافه کنید')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        customer: {
          name: values.customerName,
          phone: values.customerPhone
        },
        items: selectedItems,
        totalAmount: calculateTotal(),
        status: 'New',
        type: values.orderType,
        orderNumber: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString()
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        message.success('سفارش با موفقیت ثبت شد')
        form.resetFields()
        setSelectedItems([])
        onSuccess()
        onCancel()
      } else {
        throw new Error('خطا در ثبت سفارش')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      message.error('خطا در ثبت سفارش')
    } finally {
      setLoading(false)
    }
  }

  const orderItemColumns = [
    {
      title: 'نام آیتم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'قیمت واحد',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString('fa-IR')} تومان`
    },
    {
      title: 'تعداد',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: OrderItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateItemQuantity(record.id, value || 1)}
          size="small"
          style={{ width: 80 }}
        />
      )
    },
    {
      title: 'قیمت کل',
      key: 'total',
      render: (_, record: OrderItem) => 
        `${(record.price * record.quantity).toLocaleString('fa-IR')} تومان`
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record: OrderItem) => (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItemFromOrder(record.id)}
        />
      )
    }
  ]

  return (
    <Modal
      title="ثبت سفارش جدید"
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerName"
              label="نام مشتری"
              rules={[{ required: true, message: 'نام مشتری الزامی است' }]}
            >
              <Input placeholder="نام مشتری را وارد کنید" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="customerPhone"
              label="شماره تلفن"
              rules={[{ required: true, message: 'شماره تلفن الزامی است' }]}
            >
              <Input placeholder="شماره تلفن مشتری" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="orderType"
          label="نوع سفارش"
          rules={[{ required: true, message: 'نوع سفارش الزامی است' }]}
        >
          <Select placeholder="نوع سفارش را انتخاب کنید">
            <Option value="Dine-in">حضوری</Option>
            <Option value="Takeaway">بیرون بر</Option>
            <Option value="Delivery">تحویل</Option>
          </Select>
        </Form.Item>

        <Divider orientation="right">افزودن آیتم به سفارش</Divider>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Select
              style={{ width: '40%' }}
              placeholder="انتخاب آیتم از منو"
              value={selectedMenuItem}
              onChange={setSelectedMenuItem}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {menuItems.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name} - {item.price.toLocaleString('fa-IR')} تومان
                </Option>
              ))}
            </Select>
            <InputNumber
              style={{ width: '20%' }}
              min={1}
              value={quantity}
              onChange={(value) => setQuantity(value || 1)}
              placeholder="تعداد"
            />
            <Button
              style={{ width: '40%' }}
              type="primary"
              icon={<PlusOutlined />}
              onClick={addItemToOrder}
            >
              افزودن به سفارش
            </Button>
          </Space.Compact>
        </Card>

        <Divider orientation="right">آیتم‌های سفارش</Divider>

        <Table
          dataSource={selectedItems}
          columns={orderItemColumns}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: 'هیچ آیتمی به سفارش اضافه نشده' }}
        />

        {selectedItems.length > 0 && (
          <Card style={{ marginTop: 16 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong>تعداد آیتم‌ها: {selectedItems.length}</Text>
              </Col>
              <Col>
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                  جمع کل: {calculateTotal().toLocaleString('fa-IR')} تومان
                </Title>
              </Col>
            </Row>
          </Card>
        )}

        <Divider />

        <Row justify="end" gutter={8}>
          <Col>
            <Button onClick={onCancel}>
              انصراف
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<ShoppingCartOutlined />}
              disabled={selectedItems.length === 0}
            >
              ثبت سفارش
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
