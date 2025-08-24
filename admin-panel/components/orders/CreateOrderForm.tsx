'use client'

import React, { useState, useEffect } from 'react'
import { 
  Modal, Form, Input, Select, Button, InputNumber, Space, Card, Row, Col, 
  message, Divider, Typography, Table, Tag, Switch, DatePicker, TimePicker,
  Radio, Alert, Badge, Empty
} from 'antd'
import { 
  PlusOutlined, MinusCircleOutlined, UserOutlined, ShoppingCartOutlined,
  DollarOutlined, PercentageOutlined, DeleteOutlined, SearchOutlined,
  FilterOutlined, AppstoreOutlined, ReloadOutlined, CheckCircleOutlined,
  PictureOutlined, MinusOutlined, ClockCircleOutlined, CloseOutlined,
  CheckOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

interface CreateOrderFormProps {
  onCancel: () => void
  onSuccess: () => void
  orderSource?: string
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  available: boolean
  description?: string
  image?: string
  discountPrice?: number
}

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
}

const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ onCancel, onSuccess, orderSource = 'ADMIN' }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  
  // Menu and items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([])
  const [displayedItems, setDisplayedItems] = useState<MenuItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  
  // Customer state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isNewCustomer, setIsNewCustomer] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerAddresses, setCustomerAddresses] = useState<string[]>([])
  
  // Order state
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in')
  const [deliveryZone, setDeliveryZone] = useState('')
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(45)
  
  // Financial state
  const [subtotal, setSubtotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('percentage')
  const [tax, setTax] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [serviceFee, setServiceFee] = useState(0)
  const [total, setTotal] = useState(0)

  // Additional states for new features
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])

  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    fetchMenuItems()
    fetchCustomers()
  }, [])

  useEffect(() => {
    calculateTotal()
  }, [selectedItems, discount, discountType, tax, deliveryFee])

  const fetchMenuItems = async () => {
    try {
      console.log('🍽️ Fetching menu items for order form...');
      const response = await fetch('/api/menu/items?limit=1000') // Get all items
      const data = await response.json()
      console.log('📋 Menu items response:', data);
      
      if (data.success && data.data) {
        const availableItems = data.data.filter((item: any) => item.isAvailable)
        console.log('✅ Available items:', availableItems.length);
        
        const formattedItems = availableItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category?.name || 'بدون دسته‌بندی',
          available: item.isAvailable,
          description: item.description,
          discountPrice: item.discountPrice
        }))
        
        setMenuItems(formattedItems)
        setFilteredMenuItems(formattedItems)
        
        // Extract unique categories
        const uniqueCategories = [...new Set(formattedItems.map(item => item.category))] as string[]
        setCategories(uniqueCategories)
      } else {
        console.error('❌ No menu items found');
        message.warning('هیچ آیتم منویی یافت نشد')
      }
    } catch (error) {
      console.error('❌ Error fetching menu items:', error)
      message.error('خطا در دریافت لیست منو')
    }
  }

  // Filter menu items based on search term and category
  const filterMenuItems = () => {
    let filtered = menuItems

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by price range
    if (priceFilter !== 'all') {
      if (priceFilter === 'cheap') {
        filtered = filtered.filter(item => item.price < 50000)
      } else if (priceFilter === 'medium') {
        filtered = filtered.filter(item => item.price >= 50000 && item.price <= 100000)
      } else if (priceFilter === 'expensive') {
        filtered = filtered.filter(item => item.price > 100000)
      }
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredItems(filtered)
    setFilteredMenuItems(filtered)
    setCurrentPage(1) // Reset to first page
    updateDisplayedItems(filtered, 1)
  }

  // Add item to order
  const addToOrder = (item: MenuItem) => {
    const existingItem = selectedItems.find(selected => selected.id === item.id)
    
    if (existingItem) {
      // If item already exists, increase quantity
      setSelectedItems(prev => 
        prev.map(selectedItem => 
          selectedItem.id === item.id 
            ? { ...selectedItem, quantity: selectedItem.quantity + 1 }
            : selectedItem
        )
      )
    } else {
      // Add new item
      setSelectedItems(prev => [...prev, { ...item, quantity: 1 }])
    }
  }

  // Remove item from order
  const removeFromOrder = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(itemId)
      return
    }
    
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    setSelectedCustomer(customer || null)
    
    if (customer?.address) {
      form.setFieldsValue({ customerAddress: customer.address })
      calculateDeliveryFee(customer.address)
    }
  }

  // Calculate final total
  const finalTotal = (() => {
    const itemsTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    let discountAmount = 0
    if (discount > 0) {
      if (discountType === 'percentage') {
        discountAmount = (itemsTotal * discount) / 100
      } else {
        discountAmount = discount
      }
    }
    
    const discountedTotal = itemsTotal - discountAmount
    const taxAmount = tax > 0 ? (discountedTotal * tax) / 100 : 0
    const serviceAmount = serviceFee || 0
    const deliveryAmount = orderType === 'delivery' ? deliveryFee : 0
    
    return Math.max(0, discountedTotal + taxAmount + serviceAmount + deliveryAmount)
  })()

  // Update displayed items based on pagination
  const updateDisplayedItems = (items: MenuItem[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setDisplayedItems(items.slice(startIndex, endIndex))
  }

  // Load more items
  const loadMoreItems = () => {
    const nextPage = currentPage + 1
    const maxPage = Math.ceil(filteredMenuItems.length / ITEMS_PER_PAGE)
    
    if (nextPage <= maxPage) {
      setCurrentPage(nextPage)
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const newItems = filteredMenuItems.slice(startIndex, endIndex)
      setDisplayedItems(prev => [...prev, ...newItems])
    }
  }

  // Update filtered items when search term or category changes
  useEffect(() => {
    filterMenuItems()
  }, [searchTerm, selectedCategory, priceFilter, menuItems])

  // Update subtotal when selected items change
  useEffect(() => {
    const newSubtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setSubtotal(newSubtotal)
  }, [selectedItems])
  useEffect(() => {
    filterMenuItems()
  }, [searchTerm, selectedCategory, menuItems])

  // Update displayed items when filtered items change
  useEffect(() => {
    updateDisplayedItems(filteredMenuItems, currentPage)
  }, [filteredMenuItems])

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + F to focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="جستجو"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('')
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [searchTerm])

  const fetchCustomers = async () => {
    try {
      console.log('🔍 Fetching customers...')
      const response = await fetch('/api/customers')
      const data = await response.json()
      console.log('🔍 Customers API response:', data)
      if (data.customers) {
        setCustomers(data.customers)
        console.log('🔍 Customers set to state:', data.customers.length, 'customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      message.error('خطا در دریافت لیست مشتریان')
    }
  }

  // Calculate delivery fee based on zone/distance
  const calculateDeliveryFee = (address: string) => {
    // Simple zone-based calculation (can be enhanced with actual distance API)
    const baseDeliveryFee = 15000 // 15,000 تومان
    
    if (address.toLowerCase().includes('مرکز شهر')) {
      setDeliveryFee(baseDeliveryFee)
      setEstimatedDeliveryTime(30)
    } else if (address.toLowerCase().includes('حاشیه')) {
      setDeliveryFee(baseDeliveryFee * 1.5)
      setEstimatedDeliveryTime(60)
    } else {
      setDeliveryFee(baseDeliveryFee * 1.2)
      setEstimatedDeliveryTime(45)
    }
  }

  // Handle order type change
  const handleOrderTypeChange = (type: 'dine-in' | 'takeaway' | 'delivery') => {
    setOrderType(type)
    
    // Reset relevant fields
    form.resetFields(['customerName', 'customerPhone', 'customerAddress', 'tableNumber'])
    setSelectedCustomer(null)
    setCustomerAddresses([])
    
    // Set defaults based on order type
    if (type === 'delivery') {
      setDeliveryFee(15000)
      setEstimatedDeliveryTime(45)
    } else {
      setDeliveryFee(0)
      setEstimatedDeliveryTime(type === 'dine-in' ? 20 : 15)
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

    // Validation based on order type
    if (orderType === 'dine-in' && !values.tableNumber) {
      message.error('شماره میز الزامی است')
      return
    }
    
    // برای takeaway و delivery، یا باید مشتری موجود انتخاب شده باشد یا نام مشتری جدید وارد شده باشد
    if (orderType === 'takeaway' || orderType === 'delivery') {
      if (isNewCustomer && !values.customerName?.trim()) {
        message.error('نام مشتری الزامی است')
        return
      }
      if (!isNewCustomer && !values.customerId) {
        message.error('انتخاب مشتری الزامی است')
        return
      }
    }
    
    if (orderType === 'delivery') {
      if (!values.customerPhone?.trim()) {
        message.error('شماره تلفن برای ارسال الزامی است')
        return
      }
      if (!values.customerAddress?.trim()) {
        message.error('آدرس برای ارسال الزامی است')
        return
      }
    }

    setLoading(true)
    try {
      // اگر مشتری موجود انتخاب شده، اطلاعات کامل مشتری را پیدا کن
      let customerData
      if (isNewCustomer) {
        customerData = {
          name: values.customerName?.trim() || '',
          phone: values.customerPhone?.trim() || '',
          email: values.customerEmail?.trim() || '',
          address: values.customerAddress?.trim() || ''
        }
      } else {
        // پیدا کردن مشتری انتخاب شده از لیست customers
        const selectedCustomer = customers.find(customer => customer.id === values.customerId)
        if (selectedCustomer) {
          customerData = {
            id: selectedCustomer.id,
            name: selectedCustomer.name,
            phone: selectedCustomer.phone,
            email: selectedCustomer.email || '',
            address: selectedCustomer.address || ''
          }
        } else {
          message.error('مشتری انتخاب شده یافت نشد')
          setLoading(false)
          return
        }
      }

      const orderData = {
        customer: customerData,
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
        isNewCustomer: isNewCustomer,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const orderResult = await response.json()
        const orderId = parseInt(orderResult.order?.id)
        
        // ایجاد فیش آشپزخانه برای سفارش جدید
        if (orderId) {
          try {
            const kitchenResponse = await fetch('/api/kitchen/tickets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId })
            })
            
            if (kitchenResponse.ok) {
              console.log('✅ Kitchen tickets created successfully')
            } else {
              console.warn('⚠️ Failed to create kitchen tickets, but order was created')
            }
          } catch (kitchenError) {
            console.warn('⚠️ Kitchen ticket creation failed:', kitchenError)
          }
        }
        
        message.success('سفارش با موفقیت ایجاد شد و به آشپزخانه ارسال شد')
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
      title={
        <div style={{ textAlign: 'center' }}>
          <ShoppingCartOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>ثبت سفارش جدید</span>
        </div>
      }
      open={true}
      onCancel={onCancel}
      footer={null}
      width="90%"
      style={{ 
        maxWidth: '1400px',
        top: '20px'
      }}
      destroyOnHidden
      styles={{ 
        body: {
          padding: '16px',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto'
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'dine-in',
          paymentMethod: 'cash',
          priority: 'normal',
          estimatedTime: 30,
          tax: 9
        }}
      >
        {/* بخش 1: انتخاب نوع سفارش */}
        <Card 
          title={
            <Space>
              <ShoppingCartOutlined style={{ color: '#1890ff' }} />
              <span>نوع سفارش</span>
            </Space>
          }
          style={{ marginBottom: '16px', borderRadius: '8px' }}
          styles={{ 
            header: { backgroundColor: '#f8f9fa' },
            body: { padding: '16px' }
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="orderType"
                label="نوع سفارش"
                rules={[{ required: true, message: 'انتخاب نوع سفارش الزامی است' }]}
                initialValue="dine-in"
              >
                <Select
                  placeholder="نوع سفارش را انتخاب کنید"
                  onChange={handleOrderTypeChange}
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Option value="dine-in">
                    <Space>
                      <span style={{ fontSize: '18px' }}>🍽️</span>
                      <div>
                        <div><strong>حضوری</strong></div>
                        <Text type="secondary" style={{ fontSize: '11px' }}>سرو در رستوران</Text>
                      </div>
                    </Space>
                  </Option>
                  <Option value="takeaway">
                    <Space>
                      <span style={{ fontSize: '18px' }}>🥡</span>
                      <div>
                        <div><strong>بیرون‌بر</strong></div>
                        <Text type="secondary" style={{ fontSize: '11px' }}>تحویل در محل</Text>
                      </div>
                    </Space>
                  </Option>
                  <Option value="delivery">
                    <Space>
                      <span style={{ fontSize: '18px' }}>🚚</span>
                      <div>
                        <div><strong>ارسالی</strong></div>
                        <Text type="secondary" style={{ fontSize: '11px' }}>ارسال به آدرس</Text>
                      </div>
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={16}>
              {orderType && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: orderType === 'dine-in' ? '#e6f7ff' : orderType === 'takeaway' ? '#f6ffed' : '#fff7e6',
                  borderRadius: '6px',
                  border: `1px dashed ${orderType === 'dine-in' ? '#1890ff' : orderType === 'takeaway' ? '#52c41a' : '#fa8c16'}`
                }}>
                  <Space>
                    <span style={{ fontSize: '24px' }}>
                      {orderType === 'dine-in' ? '🍽️' : orderType === 'takeaway' ? '🥡' : '🚚'}
                    </span>
                    <div>
                      <Text strong>
                        {orderType === 'dine-in' ? 'سفارش حضوری' : orderType === 'takeaway' ? 'سفارش بیرون‌بر' : 'سفارش ارسالی'}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {orderType === 'dine-in' 
                          ? 'مشتری در رستوران حضور دارد و سفارش در میز سرو می‌شود'
                          : orderType === 'takeaway' 
                          ? 'مشتری سفارش را از رستوران تحویل می‌گیرد'
                          : 'سفارش توسط پیک به آدرس مشتری ارسال می‌شود'
                        }
                      </Text>
                      <br />
                      <Tag color={orderType === 'dine-in' ? 'blue' : orderType === 'takeaway' ? 'green' : 'orange'} style={{ marginTop: '4px' }}>
                        زمان تخمینی: {orderType === 'dine-in' ? '۱۵' : orderType === 'takeaway' ? '۲۰' : '۳۰'} دقیقه
                      </Tag>
                    </div>
                  </Space>
                </div>
              )}
            </Col>
          </Row>
        </Card>

        {/* بخش 2: اطلاعات مشتری و سفارش */}
        <Row gutter={[16, 12]} style={{ marginTop: '12px' }}>
          
          {/* اطلاعات مشتری */}
          <Col xs={24} lg={14}>
            <Card 
              title={
                <Space>
                  <UserOutlined style={{ color: '#52c41a' }} />
                  <span>اطلاعات مشتری</span>
                  {orderType === 'delivery' && <Tag color="red">الزامی</Tag>}
                  {orderType === 'takeaway' && <Tag color="orange">توصیه شده</Tag>}
                  {orderType === 'dine-in' && <Tag color="green">اختیاری</Tag>}
                </Space>
              }
              style={{ height: '100%' }}
              styles={{
                header: { backgroundColor: '#f8f9fa' },
                body: { padding: '16px' }
              }}
            >
              <Row gutter={[12, 12]}>
                
                {/* برای سفارش حضوری */}
                {orderType === 'dine-in' && (
                  <>
                    <Col span={12}>
                      <Form.Item
                        name="tableNumber"
                        label={<Text strong>شماره میز <Text style={{ color: 'red' }}>*</Text></Text>}
                        rules={[{ required: true, message: 'شماره میز الزامی است' }]}
                      >
                        <InputNumber
                          placeholder="شماره میز"
                          style={{ width: '100%' }}
                          min={1}
                          max={100}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="customerName" label="نام مشتری (اختیاری)">
                        <Input placeholder="نام مشتری" size="large" />
                      </Form.Item>
                    </Col>
                  </>
                )}

                {/* برای سفارش بیرون‌بر */}
                {orderType === 'takeaway' && (
                  <>
                    <Col span={12}>
                      <Form.Item name="customerName" label="نام مشتری">
                        <Input placeholder="نام مشتری برای صدا زدن" size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="customerPhone"
                        label="شماره تلفن (توصیه می‌شود)"
                        rules={[
                          { pattern: /^09\d{9}$/, message: 'شماره تلفن باید با 09 شروع شود و 11 رقم باشد' }
                        ]}
                      >
                        <Input placeholder="09xxxxxxxxx" size="large" />
                      </Form.Item>
                    </Col>
                  </>
                )}

                {/* برای سفارش ارسالی */}
                {orderType === 'delivery' && (
                  <>
                    <Col span={24}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>نحوه ثبت اطلاعات:</Text>
                        <Switch
                          checked={isNewCustomer}
                          onChange={setIsNewCustomer}
                          checkedChildren="مشتری جدید"
                          unCheckedChildren="مشتری موجود"
                          size="default"
                        />
                      </Space>
                    </Col>

                    {!isNewCustomer ? (
                      <Col span={24}>
                        <Form.Item
                          name="customerId"
                          label={<Text strong>انتخاب مشتری <Text style={{ color: 'red' }}>*</Text></Text>}
                          rules={[{ required: true, message: 'انتخاب مشتری الزامی است' }]}
                        >
                          <Select 
                            placeholder="مشتری را جستجو کنید..."
                            showSearch
                            size="large"
                            onChange={handleCustomerSelect}
                            filterOption={(input, option) =>
                              (option?.children as unknown as string)
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {customers.map(customer => (
                              <Option key={customer.id} value={customer.id}>
                                <div>
                                  <Text strong>{customer.name}</Text>
                                  <Text type="secondary"> - {customer.phone}</Text>
                                  {customer.address && (
                                    <div style={{ fontSize: '11px', color: '#999' }}>
                                      📍 {customer.address.length > 35 ? `${customer.address.substring(0, 35)}...` : customer.address}
                                    </div>
                                  )}
                                </div>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        
                        {selectedCustomer && (
                          <div style={{ 
                            padding: '12px', 
                            backgroundColor: '#f6ffed', 
                            borderRadius: '6px',
                            border: '1px solid #b7eb8f'
                          }}>
                            <Text strong style={{ color: '#52c41a' }}>مشتری انتخاب شده:</Text>
                            <div style={{ marginTop: '6px', fontSize: '12px' }}>
                              <Text>📞 {selectedCustomer.phone}</Text><br />
                              {selectedCustomer.email && <><Text>📧 {selectedCustomer.email}</Text><br /></>}
                              {selectedCustomer.address && <Text>📍 {selectedCustomer.address}</Text>}
                            </div>
                          </div>
                        )}
                      </Col>
                    ) : (
                      <>
                        <Col span={12}>
                          <Form.Item
                            name="customerName"
                            label={<Text strong>نام کامل <Text style={{ color: 'red' }}>*</Text></Text>}
                            rules={[{ required: true, message: 'نام کامل الزامی است' }]}
                          >
                            <Input placeholder="نام و نام خانوادگی" size="large" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="customerPhone"
                            label={<Text strong>شماره تلفن <Text style={{ color: 'red' }}>*</Text></Text>}
                            rules={[
                              { required: true, message: 'شماره تلفن الزامی است' },
                              { pattern: /^09\d{9}$/, message: 'شماره تلفن باید با 09 شروع شود و 11 رقم باشد' }
                            ]}
                          >
                            <Input placeholder="09xxxxxxxxx" size="large" />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item
                            name="customerAddress"
                            label={<Text strong>آدرس کامل <Text style={{ color: 'red' }}>*</Text></Text>}
                            rules={[{ required: true, message: 'آدرس کامل الزامی است' }]}
                          >
                            <Input.TextArea 
                              rows={2} 
                              placeholder="آدرس کامل شامل: شهر، منطقه، خیابان، کوچه، پلاک، طبقه، واحد"
                              size="large"
                              onChange={(e) => calculateDeliveryFee(e.target.value)}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="recipientName" label="نام گیرنده (در صورت تفاوت)">
                            <Input placeholder="نام شخص گیرنده سفارش" size="large" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="deliveryNotes" label="راهنمای دسترسی">
                            <Input placeholder="نشانه‌های مهم برای پیک" size="large" />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                  </>
                )}
              </Row>
            </Card>
          </Col>

          {/* اطلاعات سفارش */}
          <Col xs={24} lg={10}>
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  <span>تنظیمات سفارش</span>
                </Space>
              }
              style={{ height: '100%' }}
              styles={{
                header: { backgroundColor: '#f8f9fa' },
                body: { padding: '16px' }
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                
                <Form.Item name="estimatedTime" label="زمان آماده‌سازی (دقیقه)">
                  <InputNumber
                    min={5}
                    max={120}
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="زمان تخمینی"
                  />
                </Form.Item>

                <Form.Item name="paymentMethod" label="روش پرداخت">
                  <Select size="large" style={{ width: '100%' }}>
                    <Option value="cash">💰 نقدی</Option>
                    <Option value="card">💳 کارتی</Option>
                    <Option value="online">🌐 آنلاین</Option>
                  </Select>
                </Form.Item>

                {orderType === 'delivery' && (
                  <Form.Item label="هزینه ارسال">
                    <div style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      <Text strong style={{ fontSize: '14px' }}>
                        {deliveryFee.toLocaleString()} تومان
                      </Text>
                    </div>
                  </Form.Item>
                )}

                <Form.Item name="priority" label="اولویت سفارش">
                  <Select size="large" style={{ width: '100%' }}>
                    <Option value="low">🟢 عادی</Option>
                    <Option value="normal">🟡 متوسط</Option>
                    <Option value="high">🔴 فوری</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="orderNotes" label="یادداشت سفارش">
                  <Input.TextArea 
                    rows={2}
                    placeholder="یادداشت‌های خاص برای سفارش..."
                    size="large"
                  />
                </Form.Item>

              </Space>
            </Card>
          </Col>
        </Row>

        {/* بخش 3: انتخاب محصولات */}
        <Card 
          title={
            <Space>
              <ShoppingCartOutlined style={{ color: '#fa8c16' }} />
              <span>انتخاب محصولات</span>
              <Badge count={selectedItems.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          style={{ marginTop: '16px' }}
          styles={{
            header: { backgroundColor: '#f8f9fa' },
            body: { padding: '16px' }
          }}
        >
          
          {/* نوار جستجو و فیلتر */}
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8} lg={8}>
              <Input.Search
                placeholder="جستجو در منو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                size="large"
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={12} sm={6} md={4} lg={4}>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
                size="large"
                placeholder="دسته‌بندی"
              >
                <Option value="all">همه دسته‌ها</Option>
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4} lg={4}>
              <Select
                value={priceFilter}
                onChange={setPriceFilter}
                style={{ width: '100%' }}
                size="large"
                placeholder="قیمت"
              >
                <Option value="all">همه قیمت‌ها</Option>
                <Option value="cheap">ارزان</Option>
                <Option value="medium">متوسط</Option>
                <Option value="expensive">گران</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8}>
              <Button 
                type="dashed" 
                icon={<ReloadOutlined />} 
                size="large"
                style={{ width: '100%' }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceFilter('all');
                }}
              >
                پاک کردن فیلترها
              </Button>
            </Col>
          </Row>

          {/* نمایش تعداد نتایج */}
          {(searchTerm || selectedCategory !== 'all' || priceFilter !== 'all') && (
            <div style={{ 
              marginBottom: '12px', 
              padding: '6px 12px', 
              backgroundColor: '#f0f8ff', 
              borderRadius: '4px',
              border: '1px dashed #1890ff'
            }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                🔍 {filteredItems.length} محصول یافت شد
                {searchTerm && ` برای "${searchTerm}"`}
                {selectedCategory !== 'all' && ` در دسته "${selectedCategory}"`}
              </Text>
            </div>
          )}

          {/* نمایش محصولات */}
          {filteredItems.length > 0 ? (
            <Row gutter={[16, 16]} style={{ marginTop: '8px' }}>
              {filteredItems.map((item) => (
                <Col key={item.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    hoverable
                    size="small"
                    actions={[
                      <Button
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => addToOrder(item)}
                        style={{ 
                          backgroundColor: '#52c41a',
                          borderColor: '#52c41a'
                        }}
                      >
                        افزودن
                      </Button>
                    ]}
                    style={{
                      border: selectedItems.some(selected => selected.id === item.id) 
                        ? '2px solid #52c41a' 
                        : '1px solid #f0f0f0',
                      borderRadius: '8px',
                      height: '150px',
                      marginBottom: '8px'
                    }}
                    styles={{
                      body: { padding: '12px', height: '100px', overflow: 'hidden' }
                    }}
                  >
                    <Card.Meta
                      title={
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '6px'
                        }}>
                          <Text 
                            strong 
                            style={{ 
                              fontSize: '13px', 
                              lineHeight: '16px',
                              maxWidth: '140px',
                              wordBreak: 'break-word'
                            }}
                          >
                            {item.name}
                          </Text>
                          {selectedItems.some(selected => selected.id === item.id) && (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                          )}
                        </div>
                      }
                      description={
                        <div style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Text 
                            type="secondary" 
                            style={{ 
                              fontSize: '11px',
                              lineHeight: '14px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {item.description || 'بدون توضیحات'}
                          </Text>
                          <div style={{ 
                            marginTop: '8px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}>
                            <Text strong style={{ color: '#fa8c16', fontSize: '14px' }}>
                              {item.price.toLocaleString()}
                            </Text>
                            <Tag color="blue" style={{ margin: 0, fontSize: '10px', padding: '2px 6px' }}>
                              {item.category}
                            </Tag>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description="محصولی یافت نشد"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '40px 20px', margin: '20px 0' }}
            />
          )}
        </Card>

        {/* بخش 4: سبد خرید و محاسبات */}
        {selectedItems.length > 0 && (
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined style={{ color: '#fa8c16' }} />
                <span>سبد خرید</span>
                <Badge count={selectedItems.length} style={{ backgroundColor: '#52c41a' }} />
                <Tag color="blue">{selectedItems.reduce((sum, item) => sum + item.quantity, 0)} قلم</Tag>
              </Space>
            }
            style={{ marginTop: '16px' }}
            styles={{
              header: { backgroundColor: '#f8f9fa' },
              body: { padding: '16px' }
            }}
            extra={
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => setSelectedItems([])}
                size="small"
              >
                خالی کردن سبد
              </Button>
            }
          >
            
            {/* آیتم‌های انتخاب شده */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedItems.map((item, index) => (
                <div key={item.id} style={{ 
                  padding: '10px', 
                  border: '1px solid #f0f0f0',
                  borderRadius: '6px',
                  backgroundColor: '#fafafa',
                  marginBottom: '8px'
                }}>
                  <Row align="middle" gutter={[12, 0]}>
                    
                    {/* نام محصول */}
                    <Col flex="auto">
                      <div>
                        <Text strong style={{ fontSize: '14px' }}>{item.name}</Text>
                        <Tag color="blue" style={{ marginLeft: '6px', fontSize: '10px' }}>{item.category}</Tag>
                      </div>
                      {item.description && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {item.description.length > 60 
                            ? `${item.description.substring(0, 60)}...` 
                            : item.description
                          }
                        </Text>
                      )}
                    </Col>
                    
                    {/* قیمت واحد */}
                    <Col>
                      <div style={{ textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>قیمت واحد</Text>
                        <Text strong style={{ color: '#fa8c16', fontSize: '12px' }}>
                          {item.price.toLocaleString()}
                        </Text>
                      </div>
                    </Col>
                    
                    {/* تعداد */}
                    <Col>
                      <div style={{ textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>تعداد</Text>
                        <Space size={4}>
                          <Button 
                            type="primary"
                            size="small" 
                            icon={<MinusOutlined />}
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            style={{ minWidth: '24px', height: '24px' }}
                          />
                          <Text strong style={{ minWidth: '20px', textAlign: 'center', display: 'inline-block', fontSize: '12px' }}>
                            {item.quantity}
                          </Text>
                          <Button 
                            type="primary"
                            size="small" 
                            icon={<PlusOutlined />}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ minWidth: '24px', height: '24px' }}
                          />
                        </Space>
                      </div>
                    </Col>
                    
                    {/* قیمت کل */}
                    <Col>
                      <div style={{ textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>قیمت کل</Text>
                        <Text strong style={{ color: '#52c41a', fontSize: '13px' }}>
                          {(item.price * item.quantity).toLocaleString()}
                        </Text>
                      </div>
                    </Col>
                    
                    {/* حذف */}
                    <Col>
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromOrder(item.id)}
                        size="small"
                        style={{ minWidth: '24px', height: '24px' }}
                      />
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* محاسبات مالی */}
            <Row gutter={[16, 12]}>
              
              {/* تنظیمات مالی */}
              <Col xs={24} lg={12}>
                <Card 
                  title="تنظیمات مالی" 
                  size="small"
                  styles={{
                    header: { backgroundColor: '#f0f8ff' },
                    body: { padding: '12px' }
                  }}
                >
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Form.Item label="نوع تخفیف" style={{ marginBottom: '6px' }}>
                        <Select
                          value={discountType}
                          onChange={setDiscountType}
                          style={{ width: '100%' }}
                          size="small"
                        >
                          <Option value="percentage">درصدی</Option>
                          <Option value="amount">مبلغی</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="میزان تخفیف" style={{ marginBottom: '6px' }}>
                        <InputNumber
                          value={discount}
                          onChange={(value) => setDiscount(value || 0)}
                          style={{ width: '100%' }}
                          size="small"
                          min={0}
                          max={discountType === 'percentage' ? 100 : undefined}
                          placeholder={discountType === 'percentage' ? '%' : 'تومان'}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="مالیات (%)" style={{ marginBottom: '6px' }}>
                        <InputNumber
                          value={tax}
                          onChange={(value) => setTax(value || 0)}
                          style={{ width: '100%' }}
                          size="small"
                          min={0}
                          max={50}
                          placeholder="%"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="هزینه خدمات" style={{ marginBottom: '6px' }}>
                        <InputNumber
                          value={serviceFee}
                          onChange={(value) => setServiceFee(value || 0)}
                          style={{ width: '100%' }}
                          size="small"
                          min={0}
                          placeholder="تومان"
                        />
                      </Form.Item>
                    </Col>
                    {orderType === 'delivery' && (
                      <Col span={24}>
                        <Form.Item label="هزینه ارسال" style={{ marginBottom: '6px' }}>
                          <InputNumber
                            value={deliveryFee}
                            onChange={(value) => setDeliveryFee(value || 0)}
                            style={{ width: '100%' }}
                            size="small"
                            min={0}
                            placeholder="تومان"
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Col>

              {/* خلاصه مالی */}
              <Col xs={24} lg={12}>
                <Card 
                  title="خلاصه مالی" 
                  size="small"
                  styles={{
                    header: { backgroundColor: '#f6ffed' },
                    body: { padding: '12px' }
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size={6}>
                    
                    <Row justify="space-between" align="middle">
                      <Text style={{ fontSize: '12px' }}>جمع اولیه:</Text>
                      <Text style={{ fontSize: '13px' }}>
                        {subtotal.toLocaleString()} تومان
                      </Text>
                    </Row>
                    
                    {discount > 0 && (
                      <Row justify="space-between" align="middle">
                        <Text style={{ fontSize: '12px' }}>تخفیف:</Text>
                        <Text style={{ color: '#ff4d4f', fontSize: '12px' }}>
                          -{discountType === 'percentage' 
                            ? `${((subtotal * discount) / 100).toLocaleString()}`
                            : discount.toLocaleString()
                          } تومان
                        </Text>
                      </Row>
                    )}
                    
                    {tax > 0 && (
                      <Row justify="space-between" align="middle">
                        <Text style={{ fontSize: '12px' }}>مالیات ({tax}%):</Text>
                        <Text style={{ color: '#fa8c16', fontSize: '12px' }}>
                          +{Math.round((subtotal * tax) / 100).toLocaleString()} تومان
                        </Text>
                      </Row>
                    )}
                    
                    {serviceFee > 0 && (
                      <Row justify="space-between" align="middle">
                        <Text style={{ fontSize: '12px' }}>هزینه خدمات:</Text>
                        <Text style={{ color: '#fa8c16', fontSize: '12px' }}>
                          +{serviceFee.toLocaleString()} تومان
                        </Text>
                      </Row>
                    )}
                    
                    {orderType === 'delivery' && deliveryFee > 0 && (
                      <Row justify="space-between" align="middle">
                        <Text style={{ fontSize: '12px' }}>هزینه ارسال:</Text>
                        <Text style={{ color: '#1890ff', fontSize: '12px' }}>
                          +{deliveryFee.toLocaleString()} تومان
                        </Text>
                      </Row>
                    )}
                    
                    <Divider style={{ margin: '6px 0' }} />
                    
                    <Row justify="space-between" align="middle">
                      <Text strong style={{ fontSize: '15px' }}>مجموع نهایی:</Text>
                      <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                        {finalTotal.toLocaleString()} تومان
                      </Text>
                    </Row>
                    
                    <div style={{ 
                      textAlign: 'center', 
                      marginTop: '8px',
                      padding: '6px',
                      backgroundColor: '#f0f8ff',
                      borderRadius: '4px'
                    }}>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        📦 {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} قلم
                        در {selectedItems.length} نوع محصول
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        )}

        {/* بخش 5: یادداشت نهایی */}
        <Card 
          title="یادداشت سفارش"
          style={{ marginTop: '20px' }}
          styles={{
            header: { backgroundColor: '#f8f9fa' }
          }}
        >
          <Form.Item 
            name="orderNotes" 
            label={orderType === 'delivery' ? 'یادداشت سفارش و راهنمای تحویل' : 'یادداشت سفارش'}
          >
            <Input.TextArea 
              rows={orderType === 'delivery' ? 4 : 3} 
              placeholder={
                orderType === 'delivery' 
                  ? "راهنمای دسترسی، نشانه‌های ویژه محل تحویل و یادداشت‌های اضافی..." 
                  : "یادداشت اضافی برای سفارش..."
              }
              size="large"
            />
          </Form.Item>
        </Card>

        {/* بخش 6: دکمه‌های نهایی */}
        <Row justify="end" style={{ marginTop: 24 }}>
          <Space size={16}>
            <Button 
              size="large"
              onClick={onCancel}
              icon={<CloseOutlined />}
            >
              انصراف
            </Button>
            <Button 
              type="primary" 
              size="large"
              htmlType="submit" 
              loading={loading}
              icon={<CheckOutlined />}
              disabled={selectedItems.length === 0}
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                fontSize: '16px',
                height: '45px',
                minWidth: '120px'
              }}
            >
              {loading ? 'در حال ثبت...' : 'ثبت سفارش'}
            </Button>
          </Space>
        </Row>
      </Form>
    </Modal>
  )
}

export default CreateOrderForm
