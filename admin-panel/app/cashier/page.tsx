'use client'
import React, { useState } from 'react'
import { ProTable, ProColumns, ProForm, ProFormText, ProFormSelect, ProFormDigit } from '@ant-design/pro-components'
import { Card, Row, Col, Statistic, Button, Modal, message, Badge, Drawer, Space, Tag, Typography } from 'antd'
import { DollarOutlined, ShoppingCartOutlined, CreditCardOutlined, PrinterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useCashierStore } from '@/stores/cashier-store'
import type { CashierTransaction, CashRegister, DailyReport } from '@/types/cashier'

const { Title, Text } = Typography

export default function CashierPage() {
  const [modalVisible, setModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<CashierTransaction | null>(null)
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null)
  
  const {
    transactions,
    registers,
    dailyReport,
    loading,
    fetchTransactions,
    fetchRegisters,
    fetchDailyReport,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    openRegister,
    closeRegister
  } = useCashierStore()

  // ستون‌های جدول تراکنش‌ها
  const transactionColumns: ProColumns<CashierTransaction>[] = [
    {
      title: 'شماره تراکنش',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => <Text strong>#{text}</Text>
    },
    {
      title: 'نوع تراکنش',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      valueType: 'select',
      valueEnum: {
        sale: { text: 'فروش', status: 'Success' },
        refund: { text: 'برگشت', status: 'Error' },
        expense: { text: 'هزینه', status: 'Warning' },
        cash_in: { text: 'واریز نقدی', status: 'Processing' },
        cash_out: { text: 'برداشت نقدی', status: 'Default' }
      },
      render: (_, record) => {
        const colors = {
          sale: 'green',
          refund: 'red', 
          expense: 'orange',
          cash_in: 'blue',
          cash_out: 'purple'
        }
        return <Tag color={colors[record.type]}>{record.type === 'sale' ? 'فروش' : record.type === 'refund' ? 'برگشت' : record.type === 'expense' ? 'هزینه' : record.type === 'cash_in' ? 'واریز نقدی' : 'برداشت نقدی'}</Tag>
      }
    },
    {
      title: 'مبلغ',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <Text strong style={{ color: record.type === 'refund' || record.type === 'expense' || record.type === 'cash_out' ? '#ff4d4f' : '#52c41a' }}>
          {record.type === 'refund' || record.type === 'expense' || record.type === 'cash_out' ? '-' : '+'}
          {amount?.toLocaleString()} تومان
        </Text>
      )
    },
    {
      title: 'روش پرداخت',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      valueType: 'select',
      valueEnum: {
        cash: { text: 'نقدی' },
        card: { text: 'کارتی' },
        online: { text: 'آنلاین' }
      }
    },
    {
      title: 'شماره سفارش',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (orderId) => orderId ? <Text>#{orderId}</Text> : <Text type="secondary">-</Text>
    },
    {
      title: 'توضیحات',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'صندوق',
      dataIndex: 'registerId',
      key: 'registerId',
      width: 100,
      render: (registerId) => <Badge color="blue" text={`صندوق ${registerId}`} />
    },
    {
      title: 'تاریخ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      valueType: 'dateTime'
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setEditingTransaction(record)
              setDrawerVisible(true)
            }}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTransaction(record)
              setModalVisible(true)
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTransaction(record.id)}
          />
        </Space>
      )
    }
  ]

  // ستون‌های جدول صندوق‌ها
  const registerColumns: ProColumns<CashRegister>[] = [
    {
      title: 'شماره صندوق',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => <Text strong>صندوق {text}</Text>
    },
    {
      title: 'نام صندوق',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge 
          status={status === 'open' ? 'success' : 'default'} 
          text={status === 'open' ? 'باز' : 'بسته'} 
        />
      )
    },
    {
      title: 'موجودی نقدی',
      dataIndex: 'cashBalance',
      key: 'cashBalance',
      width: 150,
      render: (balance) => <Text strong>{balance?.toLocaleString()} تومان</Text>
    },
    {
      title: 'آخرین فعالیت',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      width: 150,
      valueType: 'dateTime'
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type={record.status === 'open' ? 'default' : 'primary'}
            onClick={() => handleToggleRegister(record)}
          >
            {record.status === 'open' ? 'بستن' : 'باز کردن'}
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRegister(record)
              setDrawerVisible(true)
            }}
          />
        </Space>
      )
    }
  ]

  const handleCreateTransaction = async (values: any) => {
    try {
      await createTransaction(values)
      message.success('تراکنش با موفقیت ثبت شد')
      setModalVisible(false)
      fetchTransactions()
      fetchDailyReport()
    } catch (error) {
      message.error('خطا در ثبت تراکنش')
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id)
      message.success('تراکنش حذف شد')
      fetchTransactions()
      fetchDailyReport()
    } catch (error) {
      message.error('خطا در حذف تراکنش')
    }
  }

  const handleToggleRegister = async (register: CashRegister) => {
    try {
      if (register.status === 'open') {
        await closeRegister(register.id)
        message.success('صندوق بسته شد')
      } else {
        await openRegister(register.id)
        message.success('صندوق باز شد')
      }
      fetchRegisters()
    } catch (error) {
      message.error('خطا در تغییر وضعیت صندوق')
    }
  }

  const handlePrintReport = () => {
    // پیاده‌سازی چاپ گزارش
    message.info('در حال چاپ گزارش...')
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>💰 پنل صندوق</Title>
      
      {/* کارت‌های آماری */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="فروش امروز"
              value={dailyReport?.totalSales || 0}
              suffix="تومان"
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="تعداد تراکنش‌ها"
              value={dailyReport?.transactionCount || 0}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="پرداخت نقدی"
              value={dailyReport?.cashPayments || 0}
              suffix="تومان"
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="پرداخت کارتی"
              value={dailyReport?.cardPayments || 0}
              suffix="تومان"
              prefix={<CreditCardOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* جدول صندوق‌ها */}
      <Card title="وضعیت صندوق‌ها" style={{ marginBottom: '24px' }}>
        <ProTable<CashRegister>
          columns={registerColumns}
          dataSource={registers}
          rowKey="id"
          search={false}
          pagination={false}
          toolBarRender={() => [
            <Button
              key="print"
              icon={<PrinterOutlined />}
              onClick={handlePrintReport}
            >
              چاپ گزارش
            </Button>
          ]}
        />
      </Card>

      {/* جدول تراکنش‌ها */}
      <Card title="تراکنش‌های مالی">
        <ProTable<CashierTransaction>
          columns={transactionColumns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false
          }}
          toolBarRender={() => [
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTransaction(null)
                setModalVisible(true)
              }}
            >
              ثبت تراکنش جدید
            </Button>
          ]}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true
          }}
        />
      </Card>

      {/* مودال ثبت/ویرایش تراکنش */}
      <Modal
        title={editingTransaction ? 'ویرایش تراکنش' : 'ثبت تراکنش جدید'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <ProForm
          initialValues={editingTransaction || {}}
          onFinish={handleCreateTransaction}
          layout="vertical"
        >
          <ProFormSelect
            name="type"
            label="نوع تراکنش"
            options={[
              { label: 'فروش', value: 'sale' },
              { label: 'برگشت', value: 'refund' },
              { label: 'هزینه', value: 'expense' },
              { label: 'واریز نقدی', value: 'cash_in' },
              { label: 'برداشت نقدی', value: 'cash_out' }
            ]}
            rules={[{ required: true, message: 'نوع تراکنش الزامی است' }]}
          />
          
          <ProFormDigit
            name="amount"
            label="مبلغ (تومان)"
            min={0}
            fieldProps={{ style: { width: '100%' } }}
            rules={[{ required: true, message: 'مبلغ الزامی است' }]}
          />
          
          <ProFormSelect
            name="paymentMethod"
            label="روش پرداخت"
            options={[
              { label: 'نقدی', value: 'cash' },
              { label: 'کارتی', value: 'card' },
              { label: 'آنلاین', value: 'online' }
            ]}
            rules={[{ required: true, message: 'روش پرداخت الزامی است' }]}
          />
          
          <ProFormText
            name="orderId"
            label="شماره سفارش (اختیاری)"
          />
          
          <ProFormText
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'توضیحات الزامی است' }]}
          />
          
          <ProFormSelect
            name="registerId"
            label="صندوق"
            options={registers.map(reg => ({ 
              label: `صندوق ${reg.id} - ${reg.name}`, 
              value: reg.id 
            }))}
            rules={[{ required: true, message: 'انتخاب صندوق الزامی است' }]}
          />
        </ProForm>
      </Modal>

      {/* درور جزئیات */}
      <Drawer
        title={selectedRegister ? `جزئیات صندوق ${selectedRegister.id}` : 'جزئیات تراکنش'}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        {selectedRegister ? (
          <div>
            <Title level={4}>اطلاعات صندوق</Title>
            <p><strong>نام:</strong> {selectedRegister.name}</p>
            <p><strong>وضعیت:</strong> {selectedRegister.status === 'open' ? 'باز' : 'بسته'}</p>
            <p><strong>موجودی نقدی:</strong> {selectedRegister.cashBalance?.toLocaleString()} تومان</p>
            <p><strong>آخرین فعالیت:</strong> {selectedRegister.lastActivity}</p>
          </div>
        ) : editingTransaction ? (
          <div>
            <Title level={4}>جزئیات تراکنش</Title>
            <p><strong>شماره:</strong> #{editingTransaction.id}</p>
            <p><strong>نوع:</strong> {editingTransaction.type}</p>
            <p><strong>مبلغ:</strong> {editingTransaction.amount?.toLocaleString()} تومان</p>
            <p><strong>روش پرداخت:</strong> {editingTransaction.paymentMethod}</p>
            <p><strong>توضیحات:</strong> {editingTransaction.description}</p>
            {editingTransaction.orderId && (
              <p><strong>شماره سفارش:</strong> #{editingTransaction.orderId}</p>
            )}
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
