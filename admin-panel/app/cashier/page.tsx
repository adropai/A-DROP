'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Tag,
  Tabs,
  Descriptions,
  Badge,
  Timeline,
  DatePicker,
  Tooltip,
  Divider,
  Alert,
  Radio,
  Input,
  Progress
} from 'antd';
import {
  CreditCardOutlined,
  MoneyCollectOutlined,
  DollarCircleOutlined,
  ShoppingCartOutlined,
  PrinterOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  BankOutlined,
  WalletOutlined,
  GiftOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  EyeOutlined,
  ClearOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { useCashier } from '../../hooks/useCashier';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface PaymentSummary {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

interface DailyReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentMethods: PaymentSummary[];
  hourlyBreakdown: Array<{
    hour: number;
    sales: number;
    orders: number;
  }>;
}

const CashierPage: React.FC = () => {
  const {
    dailyStats = { totalSales: 0, totalTax: 0, totalDiscount: 0, orderCount: 0, avgOrderValue: 0 },
    pendingOrders = [],
    transactions = [],
    paymentMethods = [],
    loading = false,
    refresh,
    processCheckout,
    applyDiscount,
    processRefund,
    printReceipt
  } = useCashier() || {};

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [paymentForm] = Form.useForm();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [registerStatus, setRegisterStatus] = useState<'closed' | 'open'>('closed');

  useEffect(() => {
    refresh();
    // Check register status
    checkRegisterStatus();
  }, []);

  const checkRegisterStatus = async () => {
    try {
      const response = await fetch('/api/cashier/registers');
      const data = await response.json();
      if (data.success) {
        setRegisterStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking register status:', error);
    }
  };

  const handleOpenRegister = async () => {
    try {
      // await openRegister();
      setRegisterStatus('open');
      message.success('صندوق با موفقیت باز شد');
    } catch (error) {
      message.error('خطا در باز کردن صندوق');
    }
  };

  const handleCloseRegister = async () => {
    try {
      // await closeRegister();
      setRegisterStatus('closed');
      message.success('صندوق با موفقیت بسته شد');
    } catch (error) {
      message.error('خطا در بستن صندوق');
    }
  };

  const handleProcessPayment = async (values: any) => {
    if (!selectedOrder) return;

    try {
      const paymentData = {
        orderId: selectedOrder.id,
        paymentMethod: selectedPaymentMethod,
        amountPaid: values.amountPaid,
        discountAmount,
        notes: values.notes
      };

      await processCheckout(selectedOrder.id, paymentData);
      message.success('پرداخت با موفقیت پردازش شد');
      setPaymentModalVisible(false);
      setSelectedOrder(null);
      paymentForm.resetFields();
      setDiscountAmount(0);
    } catch (error) {
      message.error('خطا در پردازش پرداخت');
    }
  };

  const handleGenerateReport = async () => {
    try {
      // Generate mock report for now
      const report = {
        date: dayjs().format('YYYY-MM-DD'),
        totalSales: dailyStats.totalSales,
        totalOrders: dailyStats.orderCount,
        averageOrderValue: dailyStats.avgOrderValue,
        paymentMethods: paymentMethods.map(pm => ({
          method: pm.method,
          amount: pm.amount,
          count: pm.count,
          percentage: (pm.amount / dailyStats.totalSales) * 100
        })),
        hourlyBreakdown: []
      };
      setDailyReport(report);
      setReportModalVisible(true);
    } catch (error) {
      message.error('خطا در تولید گزارش');
    }
  };

  const calculateTotal = (order: any) => {
    return order.subtotal - discountAmount;
  };

  const calculateChange = (amountPaid: number, total: number) => {
    return amountPaid - total;
  };

  const pendingOrderColumns = [
    {
      title: 'شماره سفارش',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (orderNumber: string) => (
        <Tag color="blue">{orderNumber}</Tag>
      ),
    },
    {
      title: 'میز/مشتری',
      key: 'customer',
      render: (record: any) => (
        <div>
          {record.tableNumber && <div>میز {record.tableNumber}</div>}
          {record.customerName && <Text type="secondary">{record.customerName}</Text>}
        </div>
      ),
    },
    {
      title: 'اقلام',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div>
          <Text>{items.length} قلم</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {items.slice(0, 2).map(item => item.name).join(', ')}
            {items.length > 2 && '...'}
          </Text>
        </div>
      ),
    },
    {
      title: 'مبلغ کل',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <Text strong>{total.toLocaleString()} تومان</Text>
      ),
    },
    {
      title: 'زمان سفارش',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('HH:mm'),
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<MoneyCollectOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              paymentForm.setFieldsValue({
                amountPaid: record.total
              });
              setPaymentModalVisible(true);
            }}
            disabled={registerStatus === 'closed'}
          >
            پرداخت
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              // Show order details
            }}
          >
            جزئیات
          </Button>
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'شماره سفارش',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'مبلغ',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `${total.toLocaleString()} تومان`,
    },
    {
      title: 'روش پرداخت',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => {
        const methodMap = {
          cash: { text: 'نقدی', color: 'green' },
          card: { text: 'کارت', color: 'blue' },
          online: { text: 'آنلاین', color: 'purple' },
          wallet: { text: 'کیف پول', color: 'orange' }
        };
        const methodInfo = methodMap[method as keyof typeof methodMap] || { text: method, color: 'default' };
        return <Tag color={methodInfo.color}>{methodInfo.text}</Tag>;
      },
    },
    {
      title: 'زمان',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date: string) => dayjs(date).format('HH:mm:ss'),
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => {
              // Print receipt
            }}
          >
            فاکتور
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>
            <CreditCardOutlined /> صندوق فروش
          </Title>
          <Text type="secondary">
            مدیریت پرداخت‌ها و تراکنش‌های مالی
          </Text>
        </div>
        <Space>
          <Badge 
            status={registerStatus === 'open' ? 'success' : 'error'} 
            text={registerStatus === 'open' ? 'صندوق باز' : 'صندوق بسته'}
          />
          {registerStatus === 'closed' ? (
            <Button type="primary" onClick={handleOpenRegister}>
              باز کردن صندوق
            </Button>
          ) : (
            <Button danger onClick={handleCloseRegister}>
              بستن صندوق
            </Button>
          )}
        </Space>
      </div>

      {/* Register Status Alert */}
      {registerStatus === 'closed' && (
        <Alert
          message="صندوق بسته است"
          description="برای شروع فروش و پردازش پرداخت‌ها، ابتدا صندوق را باز کنید."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="فروش امروز"
              value={dailyStats.totalSales}
              suffix="تومان"
              prefix={<DollarCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="تعداد سفارشات"
              value={dailyStats.orderCount}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="میانگین سفارش"
              value={dailyStats.avgOrderValue}
              suffix="تومان"
              prefix={<CalculatorOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="مالیات کل"
              value={dailyStats.totalTax}
              suffix="تومان"
              prefix={<PercentageOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Methods Summary */}
      <Card title="روش‌های پرداخت امروز" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          {paymentMethods.map((method, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {method.method === 'cash' && <MoneyCollectOutlined style={{ color: '#52c41a' }} />}
                    {method.method === 'card' && <CreditCardOutlined style={{ color: '#1890ff' }} />}
                    {method.method === 'online' && <BankOutlined style={{ color: '#722ed1' }} />}
                    {method.method === 'wallet' && <WalletOutlined style={{ color: '#fa8c16' }} />}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {method.amount.toLocaleString()} تومان
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    {method.count} تراکنش
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Pending Orders */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                سفارشات در انتظار پرداخت ({pendingOrders.length})
              </Space>
            }
            extra={
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={refresh}
                  loading={loading}
                >
                  بروزرسانی
                </Button>
              </Space>
            }
          >
            <Table
              columns={pendingOrderColumns}
              dataSource={pendingOrders}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>

        {/* Recent Transactions */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <CheckCircleOutlined />
                تراکنش‌های اخیر
              </Space>
            }
            extra={
              <Button 
                icon={<FileTextOutlined />}
                onClick={handleGenerateReport}
              >
                گزارش روزانه
              </Button>
            }
          >
            <Table
              columns={transactionColumns}
              dataSource={transactions.slice(0, 10)}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Processing Modal */}
      <Modal
        title={
          <Space>
            <MoneyCollectOutlined />
            پردازش پرداخت
            {selectedOrder && <Tag color="blue">{selectedOrder.orderNumber}</Tag>}
          </Space>
        }
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          setSelectedOrder(null);
          paymentForm.resetFields();
          setDiscountAmount(0);
        }}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <Form
            form={paymentForm}
            layout="vertical"
            onFinish={handleProcessPayment}
          >
            {/* Order Summary */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="شماره سفارش">{selectedOrder.orderNumber}</Descriptions.Item>
                <Descriptions.Item label="میز">{selectedOrder.tableNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label="مشتری">{selectedOrder.customerName || 'نامشخص'}</Descriptions.Item>
                <Descriptions.Item label="تعداد اقلام">{selectedOrder.items.length}</Descriptions.Item>
                <Descriptions.Item label="جمع فرعی">{selectedOrder.subtotal.toLocaleString()} تومان</Descriptions.Item>
                <Descriptions.Item label="مالیات">{selectedOrder.tax.toLocaleString()} تومان</Descriptions.Item>
              </Descriptions>
              
              <Divider />
              
              <Row justify="space-between" align="middle">
                <Col>
                  <Text>تخفیف:</Text>
                </Col>
                <Col>
                  <InputNumber
                    value={discountAmount}
                    onChange={(value) => setDiscountAmount(value || 0)}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                    suffix="تومان"
                    min={0}
                    max={selectedOrder.subtotal}
                  />
                </Col>
              </Row>
              
              <Divider />
              
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={4}>مبلغ قابل پرداخت:</Title>
                </Col>
                <Col>
                  <Title level={4} style={{ color: '#1890ff' }}>
                    {calculateTotal(selectedOrder).toLocaleString()} تومان
                  </Title>
                </Col>
              </Row>
            </Card>

            {/* Payment Method */}
            <Form.Item label="روش پرداخت">
              <Radio.Group 
                value={selectedPaymentMethod} 
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="cash">
                  <MoneyCollectOutlined /> نقدی
                </Radio.Button>
                <Radio.Button value="card">
                  <CreditCardOutlined /> کارت
                </Radio.Button>
                <Radio.Button value="online">
                  <BankOutlined /> آنلاین
                </Radio.Button>
                <Radio.Button value="wallet">
                  <WalletOutlined /> کیف پول
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            {/* Amount Paid */}
            <Form.Item
              name="amountPaid"
              label="مبلغ دریافتی"
              rules={[{ required: true, message: 'مبلغ دریافتی الزامی است' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                suffix="تومان"
                min={calculateTotal(selectedOrder)}
                onChange={(value) => {
                  if (value && value > calculateTotal(selectedOrder)) {
                    const change = calculateChange(value, calculateTotal(selectedOrder));
                    // Show change amount
                  }
                }}
              />
            </Form.Item>

            {/* Change Calculation */}
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const amountPaid = getFieldValue('amountPaid') || 0;
                const total = calculateTotal(selectedOrder);
                const change = amountPaid > total ? amountPaid - total : 0;
                
                return change > 0 ? (
                  <Alert
                    message={`باقی‌مانده: ${change.toLocaleString()} تومان`}
                    type="info"
                    style={{ marginBottom: '16px' }}
                  />
                ) : null;
              }}
            </Form.Item>

            {/* Notes */}
            <Form.Item name="notes" label="یادداشت">
              <Input.TextArea placeholder="یادداشت (اختیاری)" rows={2} />
            </Form.Item>

            {/* Actions */}
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                <Button size="large" onClick={() => setPaymentModalVisible(false)}>
                  انصراف
                </Button>
                <Button type="primary" size="large" htmlType="submit">
                  <CheckCircleOutlined /> تأیید پرداخت
                </Button>
                <Button icon={<PrinterOutlined />} size="large">
                  چاپ فاکتور
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Daily Report Modal */}
      <Modal
        title={
          <Space>
            <BarChartOutlined />
            گزارش روزانه
            <Tag color="blue">{dayjs().format('YYYY/MM/DD')}</Tag>
          </Space>
        }
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>
            چاپ گزارش
          </Button>,
          <Button key="close" onClick={() => setReportModalVisible(false)}>
            بستن
          </Button>
        ]}
        width={800}
      >
        {dailyReport && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <Statistic
                  title="کل فروش"
                  value={dailyReport.totalSales}
                  suffix="تومان"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="تعداد سفارشات"
                  value={dailyReport.totalOrders}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="میانگین سفارش"
                  value={dailyReport.averageOrderValue}
                  suffix="تومان"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>

            <Divider />

            <Title level={4}>روش‌های پرداخت</Title>
            <Row gutter={[16, 16]}>
              {dailyReport.paymentMethods.map((method, index) => (
                <Col span={12} key={index}>
                  <Card size="small">
                    <div>{method.method}: {method.amount.toLocaleString()} تومان ({method.count} تراکنش)</div>
                    <Progress 
                      percent={method.percentage} 
                      size="small" 
                      strokeColor="#1890ff"
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CashierPage;
