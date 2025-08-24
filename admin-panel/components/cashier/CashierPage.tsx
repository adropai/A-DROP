import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Card,
  Statistic,
  Space,
  message,
  Table,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Divider,
  Badge,
  Tag,
  Drawer,
  List,
  Avatar,
  Tabs,
  Radio,
  Tooltip
} from 'antd';
import { 
  DollarOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  UserOutlined,
  CreditCardOutlined,
  WalletOutlined,
  BarcodeOutlined,
  CalculatorOutlined,
  ShoppingOutlined,
  GiftOutlined,
  PercentageOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import CreateOrderForm from '@/components/orders/CreateOrderForm';

const { Content, Header } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface CashierStats {
  totalOrders: number;
  totalSales: number;
  avgOrderValue: number;
  cashInRegister: number;
}

interface OrderFromSystem {
  id: string;
  orderNumber: string;
  tableNumber: number;
  waiterName: string;
  customerInfo?: {
    name?: string;
    phone?: string;
  };
  items: OrderItem[];
  orderTime: string;
  status: 'ready' | 'preparing' | 'pending';
  specialNotes?: string;
  kitchenNotes?: string;
  readyTime?: string;
  orderSource?: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  kitchenNotes?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  category: string;
  stock: number;
  isAvailable: boolean;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  discount?: number;
  orderId?: string; // برای ردیابی سفارش اصلی
}

interface PaymentMethod {
  type: 'cash' | 'card' | 'digital' | 'loyalty';
  amount: number;
  reference?: string;
}

const CashierPage: React.FC = () => {
  const [stats, setStats] = useState<CashierStats>({
    totalOrders: 0,
    totalSales: 0,
    avgOrderValue: 0,
    cashInRegister: 0
  });
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<OrderFromSystem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderFromSystem | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent] = useState(9); // مالیات 9%
  const [barcode, setBarcode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [orderDetailsModalVisible, setOrderDetailsModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [activeTab, setActiveTab] = useState('ready-orders');
  const [cashAmount, setCashAmount] = useState<number | null>(null);
  const [cardAmount, setCardAmount] = useState<number | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [paidOrders, setPaidOrders] = useState<OrderFromSystem[]>([]);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/cashier/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || {
          totalOrders: 25,
          totalSales: 1250000,
          avgOrderValue: 50000,
          cashInRegister: 500000
        });
      }

      // Fetch ALL unpaid orders from DB (from any source/department)
      const ordersResponse = await fetch('/api/orders?paymentStatus=PENDING&limit=100');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        // map server orders to OrderFromSystem shape
        const mapped: OrderFromSystem[] = (ordersData.orders || []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          tableNumber: o.tableNumber || 0,
          waiterName: o.type === 'DELIVERY' ? 'سیستم تحویل' : 
                     o.type === 'TAKEAWAY' ? 'سیستم بیرون‌بر' : 
                     'گارسون',
          customerInfo: { name: o.customer?.name || 'مشتری ناشناس', phone: o.customer?.phone || '' },
          items: (o.items || []).map((it: any) => ({
            productId: it.id || it.menuItemId,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            category: it.category || 'عمومی'
          })),
          orderTime: new Date(o.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          status: String(o.status).toLowerCase() as any,
          specialNotes: o.notes,
          readyTime: o.updatedAt ? new Date(o.updatedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : undefined,
        }))
        setUnpaidOrders(mapped);
      } else {
        message.error('خطا در بارگذاری سفارشات');
        setUnpaidOrders([]);
      }

      // Fetch available products for direct ordering from Menu Items API
      const productsResponse = await fetch('/api/menu/items?isAvailable=true&limit=100');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const list = productsData.data || [];
        const mappedProducts: Product[] = list.map((m: any) => ({
          id: m.id,
          name: m.name,
          price: m.price,
          barcode: undefined,
          category: m.category?.name || 'عمومی',
          stock: m.isAvailable ? 999 : 0,
          isAvailable: !!m.isAvailable,
          image: Array.isArray(m.images) ? m.images[0] : undefined
        }));
        setProducts(mappedProducts);
      } else {
        message.error('خطا در بارگذاری محصولات منو');
        setProducts([]);
      }

      // Fetch paid orders (completed payments) for history
      const paidOrdersResponse = await fetch('/api/orders?paymentStatus=COMPLETED&limit=50');
      if (paidOrdersResponse.ok) {
        const paidOrdersData = await paidOrdersResponse.json();
        const mappedPaidOrders: OrderFromSystem[] = (paidOrdersData.orders || []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          tableNumber: o.tableNumber || 0,
          waiterName: o.type === 'DELIVERY' ? 'سیستم تحویل' : 
                     o.type === 'TAKEAWAY' ? 'سیستم بیرون‌بر' : 
                     'گارسون',
          customerInfo: { name: o.customer?.name || 'مشتری ناشناس', phone: o.customer?.phone || '' },
          items: (o.items || []).map((it: any) => ({
            productId: it.id || it.menuItemId,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            category: it.category || 'عمومی'
          })),
          orderTime: new Date(o.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          status: 'completed' as any,
          specialNotes: o.notes,
          readyTime: o.updatedAt ? new Date(o.updatedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : undefined,
        }))
        setPaidOrders(mappedPaidOrders);
      } else {
        setPaidOrders([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('خطا در بارگذاری اطلاعات از پایگاه داده');
      setStats({
        totalOrders: 0,
        totalSales: 0,
        avgOrderValue: 0,
        cashInRegister: 0
      });
      setUnpaidOrders([]);
      setProducts([]);
      setPaidOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders based on search term
  const filteredOrders = unpaidOrders.filter(order => {
    if (!orderSearchTerm) return true;
    const searchLower = orderSearchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerInfo?.name?.toLowerCase().includes(searchLower) ||
      order.customerInfo?.phone?.includes(orderSearchTerm) ||
      order.tableNumber.toString().includes(orderSearchTerm) ||
      order.waiterName.toLowerCase().includes(searchLower) ||
      order.items.some(item => item.name.toLowerCase().includes(searchLower))
    );
  });

  // Load order to cart for payment
  const loadOrderToCart = (order: OrderFromSystem) => {
    const cartItems: CartItem[] = order.items.map(item => ({
      product: {
        id: item.productId,
        name: item.name,
        price: item.price,
        category: item.category,
        stock: 999, // Stock doesn't matter for ready orders
        isAvailable: true,
        barcode: `BC-${item.productId}`
      },
      quantity: item.quantity,
      orderId: order.id
    }));
    
    setCart(cartItems);
    setSelectedOrder(order);
    setActiveTab('cart');
    
    message.success(`سفارش ${order.orderNumber} بارگذاری شد`);
  };

  // Cart functions
  const addToCart = (product: Product, quantity: number = 1) => {
    if (!product.isAvailable) {
      message.error('این محصول در حال حاضر موجود نیست');
      return;
    }
    
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity }]);
    }
    message.success(`${product.name} به سبد خرید اضافه شد`);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedOrder(null);
    setDiscountPercent(0);
    setPaymentMethods([]);
  };

  const clearPaymentFields = () => {
    setCashAmount(null);
    setCardAmount(null);
    setTransactionRef('');
  };

  // Order total calculation
  const calculateOrderTotal = (order: OrderFromSystem) => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const totalAmount = taxableAmount + taxAmount;

  // Barcode scanner
  const handleBarcodeSearch = () => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcode('');
    } else {
      message.error('محصول یافت نشد');
    }
  };

  // Payment processing
  const processPayment = async () => {
    if (cart.length === 0) {
      message.error('سبد خرید خالی است');
      return;
    }

    // محاسبه مبلغ کل پرداختی
    const totalCash = cashAmount || 0;
    const totalCard = cardAmount || 0;
    const totalPaid = totalCash + totalCard;
    
    if (totalPaid < totalAmount) {
      message.error(`مبلغ پرداختی کافی نیست. مبلغ کل: ${new Intl.NumberFormat('fa-IR').format(totalAmount)} تومان، پرداخت شده: ${new Intl.NumberFormat('fa-IR').format(totalPaid)} تومان`);
      return;
    }

    // ساخت آرایه روش‌های پرداخت
    const paymentMethodsArray: PaymentMethod[] = [];
    if (totalCash > 0) {
      paymentMethodsArray.push({
        type: 'cash',
        amount: totalCash
      });
    }
    if (totalCard > 0) {
      paymentMethodsArray.push({
        type: 'card',
        amount: totalCard,
        reference: transactionRef
      });
    }

    try {
      let orderForPayment: OrderFromSystem | null = selectedOrder

      // اگر سفارش انتخاب نشده باشد، ابتدا سفارش واقعی بساز
      if (!orderForPayment) {
        // استفاده از همان ساختار صفحه سفارشات
        const orderData = {
          customer: { 
            name: 'مشتری صندوق', 
            phone: '',
            email: '',
            address: ''
          },
          items: cart.map(ci => ({
            id: ci.product.id,
            menuId: ci.product.id,
            name: ci.product.name,
            quantity: ci.quantity,
            price: ci.product.price,
            category: ci.product.category || 'عمومی'
          })),
          type: 'dine-in',
          tableNumber: null,
          discount: discountAmount,
          discountType: 'amount',
          tax: taxAmount,
          deliveryFee: 0,
          totalAmount: totalAmount,
          notes: 'ثبت شده از صندوق',
          estimatedTime: null,
          paymentMethod: null,
          isNewCustomer: true
        }

        const createRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })

        if (!createRes.ok) {
          message.error('خطا در ایجاد سفارش جدید');
          return
        }

        const created = await createRes.json()
        // ساختار برگشتی orders POST دارای order است
        const o = created.order
        orderForPayment = {
          id: o.id,
          orderNumber: o.orderNumber,
          tableNumber: o.tableNumber || 0,
          waiterName: 'سیستم',
          customerInfo: { name: o.customer?.name, phone: o.customer?.phone },
          items: (o.items || []).map((it: any) => ({
            productId: it.id || it.menuItemId,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            category: 'عمومی'
          })),
          orderTime: new Date(o.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          status: 'pending',
        }
      }

      // Create payment record
      const paymentData = {
        orderId: orderForPayment?.id,
        orderNumber: orderForPayment?.orderNumber,
        tableNumber: orderForPayment?.tableNumber,
        waiterName: orderForPayment?.waiterName,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: totalAmount,
        paymentMethods: paymentMethodsArray,
        customerInfo: orderForPayment?.customerInfo,
        cashierName: 'صندوقدار فعلی' // This should come from auth
      };

      const response = await fetch('/api/cashier/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        // Update order payment/status with UPPERCASE enums
        if (orderForPayment) {
          await fetch(`/api/orders/${orderForPayment.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'COMPLETED' })
          });
        }

        message.success('پرداخت با موفقیت انجام شد');
        printReceipt();
        clearCart();
        clearPaymentFields();
        setPaymentModalVisible(false);
        fetchData(); // Refresh data
      } else {
        message.error('خطا در ثبت پرداخت');
      }
    } catch (error) {
      console.error('Payment error:', error);
      message.error('خطا در پردازش پرداخت');
    }
  };

  const printReceipt = () => {
    // Print receipt logic
    message.info('رسید در حال چاپ...');
  };

  // Product search and filtering
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header style={{ 
        backgroundColor: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            💰 سیستم صندوق - مدیریت پرداخت
          </Title>
          <Space>
            <Badge count={unpaidOrders.length} showZero>
              <Button icon={<ShoppingCartOutlined />}>
                سفارشات آماده
              </Button>
            </Badge>
            <Badge count={cart.length} showZero>
              <Button icon={<ShoppingCartOutlined />}>
                سبد خرید
              </Button>
            </Badge>
            {selectedOrder && (
              <Tag color="blue">
                میز {selectedOrder.tableNumber} - {selectedOrder.waiterName}
              </Tag>
            )}
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              loading={loading}
            >
              بروزرسانی
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="تعداد سفارشات امروز"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="فروش امروز"
                value={stats.totalSales}
                prefix={<DollarOutlined />}
                suffix="تومان"
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => 
                  new Intl.NumberFormat('fa-IR').format(Number(value))
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="میانگین سفارش"
                value={stats.avgOrderValue}
                prefix={<CalculatorOutlined />}
                suffix="تومان"
                valueStyle={{ color: '#faad14' }}
                formatter={(value) => 
                  new Intl.NumberFormat('fa-IR').format(Number(value))
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="موجودی صندوق"
                value={stats.cashInRegister}
                prefix={<WalletOutlined />}
                suffix="تومان"
                valueStyle={{ color: '#722ed1' }}
                formatter={(value) => 
                  new Intl.NumberFormat('fa-IR').format(Number(value))
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Left Panel - Ready Orders & Products */}
          <Col xs={24} lg={16}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                  key: 'ready-orders',
                  label: (
                    <span>
                      <CheckCircleOutlined />
                      سفارشات پرداخت نشده ({unpaidOrders.length})
                    </span>
                  ),
                  children: (
                    <div>
                      {/* Search and Filter Section */}
                      <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={12}>
                          <Input
                            placeholder="جستجو بر اساس شماره سفارش، نام مشتری، شماره میز، گارسون یا آیتم..."
                            prefix={<SearchOutlined />}
                            value={orderSearchTerm}
                            onChange={(e) => setOrderSearchTerm(e.target.value)}
                            allowClear
                          />
                        </Col>
                        <Col span={12}>
                          <Space>
                            <Button 
                              icon={<ReloadOutlined />} 
                              onClick={fetchData}
                              loading={loading}
                            >
                              بروزرسانی
                            </Button>
                          </Space>
                        </Col>
                      </Row>

                      {/* Orders Grid */}
                      <Row gutter={[16, 16]} style={{ minHeight: 500 }}>
                        {filteredOrders.length === 0 ? (
                          <Col span={24}>
                            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
                              <ShoppingCartOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                              <div style={{ fontSize: 16, color: '#666' }}>
                                {orderSearchTerm ? 'هیچ سفارشی با این جستجو یافت نشد' : 'هیچ سفارش پرداخت نشده‌ای وجود ندارد'}
                              </div>
                            </Card>
                          </Col>
                        ) : (
                          filteredOrders.map((order) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={order.id}>
                              <Card
                                size="small"
                                style={{ 
                                  height: '100%',
                                  borderLeft: `4px solid ${
                                    order.orderSource === 'delivery' ? '#ff7875' :
                                    order.orderSource === 'phone' ? '#36cfc9' :
                                    order.orderSource === 'waiter' ? '#52c41a' : '#1890ff'
                                  }`
                                }}
                                title={
                                  <Space size="small">
                                    <Avatar 
                                      size="small" 
                                      style={{ 
                                        backgroundColor: order.tableNumber > 0 ? '#1890ff' : '#52c41a',
                                        fontSize: '12px'
                                      }}
                                    >
                                      {order.tableNumber > 0 ? order.tableNumber : 'C'}
                                    </Avatar>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                      {order.orderNumber}
                                    </span>
                                  </Space>
                                }
                                extra={
                                  <Space size="small">
                                    {order.tableNumber > 0 ? (
                                      <Tag color="blue">میز {order.tableNumber}</Tag>
                                    ) : (
                                      <Tag color="green">
                                        صندوق
                                      </Tag>
                                    )}
                                  </Space>
                                }
                                actions={[
                                  <Button 
                                    type="primary" 
                                    size="small"
                                    icon={<CreditCardOutlined />}
                                    onClick={() => loadOrderToCart(order)}
                                    block
                                  >
                                    پرداخت
                                  </Button>,
                                  <Button 
                                    size="small"
                                    icon={<ShoppingOutlined />}
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setOrderDetailsModalVisible(true);
                                    }}
                                    block
                                  >
                                    جزئیات
                                  </Button>
                                ]}
                              >
                                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                  {/* Customer Info */}
                                  {order.customerInfo?.name && (
                                    <div style={{ marginBottom: 4 }}>
                                      <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                      <strong>{order.customerInfo.name}</strong>
                                    </div>
                                  )}
                                  
                                  {/* Phone */}
                                  {order.customerInfo?.phone && (
                                    <div style={{ marginBottom: 4, color: '#666' }}>
                                      <PhoneOutlined style={{ marginRight: 4 }} />
                                      {order.customerInfo.phone}
                                    </div>
                                  )}

                                  {/* Waiter */}
                                  <div style={{ marginBottom: 4, color: '#666' }}>
                                    مسئول: <strong>{order.waiterName}</strong>
                                  </div>

                                  {/* Time */}
                                  <div style={{ marginBottom: 8, color: '#666' }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    {order.orderTime}
                                  </div>

                                  {/* Items */}
                                  <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#262626' }}>آیتم‌ها:</div>
                                    {order.items.slice(0, 3).map((item, index) => (
                                      <div key={index} style={{ fontSize: '11px', color: '#666', marginBottom: 2 }}>
                                        • {item.name} ({item.quantity}عدد)
                                      </div>
                                    ))}
                                    {order.items.length > 3 && (
                                      <div style={{ fontSize: '11px', color: '#1890ff' }}>
                                        + {order.items.length - 3} آیتم دیگر
                                      </div>
                                    )}
                                  </div>

                                  {/* Total */}
                                  <div style={{ 
                                    borderTop: '1px solid #f0f0f0', 
                                    paddingTop: 8, 
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: '#52c41a'
                                  }}>
                                    مجموع: {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} تومان
                                  </div>

                                  {/* Special Notes */}
                                  {order.specialNotes && (
                                    <div style={{ 
                                      marginTop: 8, 
                                      padding: '4px 8px', 
                                      backgroundColor: '#fff7e6', 
                                      border: '1px solid #ffd591',
                                      borderRadius: 4,
                                      fontSize: '11px'
                                    }}>
                                      <strong>نکته:</strong> {order.specialNotes}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            </Col>
                          ))
                        )}
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'paid-orders',
                  label: (
                    <span>
                      <CheckCircleOutlined />
                      فاکتورهای پرداخت شده ({paidOrders.length})
                    </span>
                  ),
                  children: (
                    <div>
                      {/* Header */}
                      <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={16}>
                          <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                            <div style={{ textAlign: 'center' }}>
                              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18, marginRight: 8 }} />
                              <strong>فاکتورهای پرداخت شده امروز</strong>
                            </div>
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small">
                            <Statistic
                              title="مجموع فروش امروز"
                              value={paidOrders.reduce((sum, order) => 
                                sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0
                              )}
                              suffix="تومان"
                              valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                              formatter={(value) => new Intl.NumberFormat('fa-IR').format(Number(value))}
                            />
                          </Card>
                        </Col>
                      </Row>

                      {/* Paid Orders Grid */}
                      <Row gutter={[16, 16]} style={{ minHeight: 400 }}>
                        {paidOrders.length === 0 ? (
                          <Col span={24}>
                            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
                              <CheckCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                              <div style={{ fontSize: 16, color: '#666' }}>
                                هنوز هیچ فاکتور پرداخت شده‌ای وجود ندارد
                              </div>
                            </Card>
                          </Col>
                        ) : (
                          paidOrders.map((order) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={order.id}>
                              <Card
                                size="small"
                                style={{ 
                                  height: '100%',
                                  borderLeft: `4px solid #52c41a`,
                                  opacity: 0.85
                                }}
                                title={
                                  <Space size="small">
                                    <Avatar 
                                      size="small" 
                                      style={{ 
                                        backgroundColor: '#52c41a',
                                        fontSize: '12px'
                                      }}
                                    >
                                      ✓
                                    </Avatar>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                      {order.orderNumber}
                                    </span>
                                  </Space>
                                }
                                extra={
                                  <Tag color="success">پرداخت شده</Tag>
                                }
                              >
                                <div style={{ fontSize: '12px' }}>
                                  {/* Customer & Table Info */}
                                  <div style={{ marginBottom: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span>
                                        <UserOutlined style={{ marginRight: 4 }} />
                                        {order.customerInfo?.name || 'مشتری ناشناس'}
                                      </span>
                                      {order.tableNumber > 0 && (
                                        <span style={{ fontSize: '11px', color: '#666' }}>میز {order.tableNumber}</span>
                                      )}
                                    </div>
                                    {order.customerInfo?.phone && (
                                      <div style={{ color: '#666', fontSize: '11px' }}>
                                        <PhoneOutlined style={{ marginRight: 4 }} />
                                        {order.customerInfo.phone}
                                      </div>
                                    )}
                                  </div>

                                  {/* Time Info */}
                                  <div style={{ marginBottom: 8, fontSize: '11px', color: '#666' }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    زمان سفارش: {order.orderTime}
                                    {order.readyTime && (
                                      <div>پرداخت شده: {order.readyTime}</div>
                                    )}
                                  </div>

                                  {/* Items */}
                                  <div style={{ marginBottom: 8 }}>
                                    {order.items.slice(0, 3).map((item, idx) => (
                                      <div key={idx} style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        fontSize: '11px',
                                        marginBottom: 2
                                      }}>
                                        <span>{item.quantity}× {item.name}</span>
                                        <span>{(item.price * item.quantity).toLocaleString()} ت</span>
                                      </div>
                                    ))}
                                    {order.items.length > 3 && (
                                      <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
                                        و {order.items.length - 3} آیتم دیگر...
                                      </div>
                                    )}
                                  </div>

                                  {/* Total */}
                                  <div style={{ 
                                    borderTop: '1px solid #f0f0f0', 
                                    paddingTop: 8, 
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: '#52c41a'
                                  }}>
                                    مجموع: {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} تومان
                                  </div>

                                  {/* Action Buttons */}
                                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                                    <Space size="small">
                                      <Button 
                                        size="small" 
                                        type="text"
                                        icon={<PrinterOutlined />}
                                        onClick={() => {
                                          message.info('چاپ مجدد رسید...');
                                        }}
                                      >
                                        چاپ مجدد
                                      </Button>
                                    </Space>
                                  </div>
                                </div>
                              </Card>
                            </Col>
                          ))
                        )}
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'new-order',
                  label: (
                    <span>
                      <PlusOutlined />
                      سفارش جدید
                    </span>
                  ),
                  children: (
                    <Card title="ثبت سفارش جدید از صندوق" style={{ minHeight: 600 }}>
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          size="large"
                          onClick={() => setShowCreateOrder(true)}
                          style={{ 
                            width: '300px', 
                            height: '60px', 
                            fontSize: '16px'
                          }}
                        >
                          سفارش جدید
                        </Button>
                      </div>
                    </Card>
                  )
                }
              ]}
            />
          </Col>

          {/* Right Panel - Cart & Checkout */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {selectedOrder ? 
                      `پرداخت سفارش ${selectedOrder.orderNumber}` : 
                      'سبد خرید'
                    }
                  </span>
                  <Button 
                    type="text" 
                    danger 
                    icon={<ClearOutlined />}
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    پاک کردن
                  </Button>
                </div>
              }
              style={{ minHeight: 600 }}
            >
              {cart.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '80px 20px',
                  color: '#999'
                }}>
                  <ShoppingCartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>سبد خرید خالی است</div>
                  <div style={{ marginTop: 8, fontSize: '12px' }}>
                    سفارش آماده انتخاب کنید یا محصول جدید اضافه کنید
                  </div>
                </div>
              ) : (
                <div>
                  {selectedOrder && (
                    <div style={{ 
                      backgroundColor: '#e6f7ff', 
                      padding: 12, 
                      borderRadius: 8,
                      marginBottom: 16,
                      border: '1px solid #91d5ff'
                    }}>
                      <Space>
                        <Tag color="blue">
                          صندوق
                        </Tag>
                        {selectedOrder.tableNumber > 0 && (
                          <span>میز {selectedOrder.tableNumber}</span>
                        )}
                        <span>مسئول: {selectedOrder.waiterName}</span>
                        {selectedOrder.customerInfo?.name && (
                          <span>مشتری: {selectedOrder.customerInfo.name}</span>
                        )}
                      </Space>
                    </div>
                  )}
                
                  <List
                    dataSource={cart}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => removeFromCart(item.product.id)}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar size="large" style={{ backgroundColor: '#f56a00' }}>
                              {item.product.image}
                            </Avatar>
                          }
                          title={item.product.name}
                          description={
                            <div>
                              <div>
                                قیمت واحد: {new Intl.NumberFormat('fa-IR').format(item.product.price)} تومان
                              </div>
                              <Space style={{ marginTop: 8 }}>
                                <span>تعداد:</span>
                                <InputNumber
                                  size="small"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(value) => updateQuantity(item.product.id, value || 1)}
                                  style={{ width: 60 }}
                                />
                              </Space>
                            </div>
                          }
                        />
                        <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
                          {new Intl.NumberFormat('fa-IR').format(item.product.price * item.quantity)} تومان
                        </div>
                      </List.Item>
                    )}
                  />

                  <Divider />

                  {/* Discount Section */}
                  <div style={{ marginBottom: 16 }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span>تخفیف (%):</span>
                      <InputNumber
                        min={0}
                        max={100}
                        value={discountPercent}
                        onChange={(value) => setDiscountPercent(value || 0)}
                        addonAfter={<PercentageOutlined />}
                        style={{ width: 100 }}
                      />
                    </Space>
                  </div>

                  {/* Order Summary */}
                  <div style={{ backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>جمع کل:</span>
                      <span>{new Intl.NumberFormat('fa-IR').format(subtotal)} تومان</span>
                    </div>
                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#ff4d4f' }}>
                        <span>تخفیف:</span>
                        <span>-{new Intl.NumberFormat('fa-IR').format(discountAmount)} تومان</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>مالیات ({taxPercent}%):</span>
                      <span>{new Intl.NumberFormat('fa-IR').format(taxAmount)} تومان</span>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: '#1890ff'
                    }}>
                      <span>مبلغ نهایی:</span>
                      <span>{new Intl.NumberFormat('fa-IR').format(totalAmount)} تومان</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<CreditCardOutlined />}
                      onClick={() => setPaymentModalVisible(true)}
                    >
                      پرداخت و تسویه
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Payment Modal */}
      <Modal
        title="پرداخت سفارش"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPaymentModalVisible(false)}>
            انصراف
          </Button>,
          <Button key="print" icon={<PrinterOutlined />} onClick={printReceipt}>
            چاپ رسید
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={processPayment}
          >
            تایید پرداخت
          </Button>
        ]}
        width={600}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            backgroundColor: '#f0f0f0', 
            padding: 16, 
            borderRadius: 8,
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: 16
          }}>
            مبلغ قابل پرداخت: {new Intl.NumberFormat('fa-IR').format(totalAmount)} تومان
          </div>
          <div style={{ textAlign: 'center' }}>
            <Space>
              <Button 
                type="dashed" 
                onClick={() => setCashAmount(totalAmount)}
                icon={<WalletOutlined />}
              >
                پرداخت کامل نقدی
              </Button>
              <Button 
                type="dashed" 
                onClick={() => setCardAmount(totalAmount)}
                icon={<CreditCardOutlined />}
              >
                پرداخت کامل کارتی
              </Button>
              <Button 
                onClick={clearPaymentFields}
                icon={<ClearOutlined />}
              >
                پاک کردن
              </Button>
            </Space>
          </div>
        </div>

        <Tabs defaultActiveKey="cash">
          <TabPane tab={<span><WalletOutlined /> نقدی</span>} key="cash">
            <InputNumber
              placeholder="مبلغ نقدی"
              style={{ width: '100%' }}
              size="large"
              value={cashAmount}
              onChange={(value) => setCashAmount(value)}
              formatter={(value) => value ? new Intl.NumberFormat('fa-IR').format(Number(value)) : ''}
              parser={(value) => value ? Number(value.replace(/[^\d]/g, '')) : 0}
              addonAfter="تومان"
              min={0}
              max={99999999}
            />
          </TabPane>
          <TabPane tab={<span><CreditCardOutlined /> کارتی</span>} key="card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber
                placeholder="مبلغ کارتی"
                style={{ width: '100%' }}
                size="large"
                value={cardAmount}
                onChange={(value) => setCardAmount(value)}
                formatter={(value) => value ? new Intl.NumberFormat('fa-IR').format(Number(value)) : ''}
                parser={(value) => value ? Number(value.replace(/[^\d]/g, '')) : 0}
                addonAfter="تومان"
                min={0}
                max={99999999}
              />
              <Input 
                placeholder="شماره مرجع تراکنش" 
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </Space>
          </TabPane>
        </Tabs>

        {/* نمایش وضعیت پرداخت */}
        {(cashAmount || cardAmount) && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>خلاصه پرداخت:</strong>
            </div>
            {cashAmount && cashAmount > 0 && (
              <div>💰 نقدی: {new Intl.NumberFormat('fa-IR').format(cashAmount)} تومان</div>
            )}
            {cardAmount && cardAmount > 0 && (
              <div>💳 کارتی: {new Intl.NumberFormat('fa-IR').format(cardAmount)} تومان</div>
            )}
            <div style={{ marginTop: 8, fontWeight: 'bold' }}>
              {(() => {
                const totalPaid = (cashAmount || 0) + (cardAmount || 0);
                const difference = totalPaid - totalAmount;
                if (difference > 0) {
                  return <span style={{ color: '#52c41a' }}>باقی مانده برای مشتری: {new Intl.NumberFormat('fa-IR').format(difference)} تومان</span>;
                } else if (difference < 0) {
                  return <span style={{ color: '#ff4d4f' }}>کمبود: {new Intl.NumberFormat('fa-IR').format(Math.abs(difference))} تومان</span>;
                } else {
                  return <span style={{ color: '#1890ff' }}>✅ مبلغ کامل پرداخت شده</span>;
                }
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Order Details Modal */}
      <Modal
        title={selectedOrder ? `جزئیات سفارش ${selectedOrder.orderNumber}` : 'جزئیات سفارش'}
        open={orderDetailsModalVisible}
        onCancel={() => setOrderDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setOrderDetailsModalVisible(false)}>
            بستن
          </Button>,
          selectedOrder?.status === 'ready' && (
            <Button 
              key="load" 
              type="primary" 
              icon={<CreditCardOutlined />}
              onClick={() => {
                if (selectedOrder) {
                  loadOrderToCart(selectedOrder);
                  setOrderDetailsModalVisible(false);
                }
              }}
            >
              دریافت برای پرداخت
            </Button>
          )
        ].filter(Boolean)}
        width={600}
      >
        {selectedOrder && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card size="small" title="اطلاعات سفارش">
                  <div><strong>شماره سفارش:</strong> {selectedOrder.orderNumber}</div>
                  <div><strong>شماره میز:</strong> {selectedOrder.tableNumber}</div>
                  <div><strong>گارسون:</strong> {selectedOrder.waiterName}</div>
                  <div><strong>زمان سفارش:</strong> {selectedOrder.orderTime}</div>
                  {selectedOrder.readyTime && (
                    <div><strong>زمان آماده‌سازی:</strong> {selectedOrder.readyTime}</div>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="اطلاعات مشتری">
                  {selectedOrder.customerInfo ? (
                    <div>
                      <div><strong>نام:</strong> {selectedOrder.customerInfo.name || 'نامشخص'}</div>
                      {selectedOrder.customerInfo.phone && (
                        <div><strong>تلفن:</strong> {selectedOrder.customerInfo.phone}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#999' }}>اطلاعات مشتری ثبت نشده</div>
                  )}
                </Card>
              </Col>
            </Row>

            <Card size="small" title="آیتم‌های سفارش" style={{ marginBottom: 16 }}>
              <Table
                dataSource={selectedOrder.items}
                pagination={false}
                size="small"
                columns={[
                  { title: 'نام محصول', dataIndex: 'name', key: 'name' },
                  { title: 'تعداد', dataIndex: 'quantity', key: 'quantity', width: 80 },
                  { 
                    title: 'قیمت واحد', 
                    dataIndex: 'price', 
                    key: 'price',
                    width: 120,
                    render: (price) => `${new Intl.NumberFormat('fa-IR').format(price)} تومان`
                  },
                  { 
                    title: 'جمع', 
                    key: 'total',
                    width: 120,
                    render: (_, record) => `${new Intl.NumberFormat('fa-IR').format(record.price * record.quantity)} تومان`
                  }
                ]}
              />
              <div style={{ 
                textAlign: 'left', 
                marginTop: 16, 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#52c41a'
              }}>
                جمع کل: {new Intl.NumberFormat('fa-IR').format(calculateOrderTotal(selectedOrder))} تومان
              </div>
            </Card>

            {selectedOrder.specialNotes && (
              <Card size="small" title="نکات ویژه">
                <div style={{ color: '#ff8c00' }}>
                  {selectedOrder.specialNotes}
                </div>
              </Card>
            )}
            
            {selectedOrder.kitchenNotes && (
              <Card size="small" title="نکات آشپزخانه" style={{ marginTop: 16 }}>
                <div style={{ color: '#1890ff' }}>
                  {selectedOrder.kitchenNotes}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Customer Drawer - Removed as we're using order-based approach */}
      
      {/* Create Order Modal */}
      <Modal
        title="ثبت سفارش جدید از صندوق"
        open={showCreateOrder}
        onCancel={() => setShowCreateOrder(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        {showCreateOrder && (
          <CreateOrderForm
            onCancel={() => setShowCreateOrder(false)}
            onSuccess={() => {
              setShowCreateOrder(false);
              fetchData(); // Refresh orders after creating new one
              message.success('سفارش جدید با موفقیت از صندوق ثبت شد');
            }}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default CashierPage;
