'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Card, Row, Col, Typography, Tag, Space, Button, Divider, Timeline, Table, App } from 'antd'
import { 
  PrinterOutlined, DownloadOutlined, WhatsAppOutlined, 
  ClockCircleOutlined, CheckCircleOutlined, FireOutlined,
  TruckOutlined, DollarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text, Title } = Typography

interface OrderDetailsModalProps {
  order: any
  visible: boolean
  onCancel: () => void
  onPrint: (orderId: string) => void
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, visible, onCancel, onPrint }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false)

  if (!order) return null

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'orange',
      'confirmed': 'blue',
      'preparing': 'purple',
      'ready': 'green',
      'delivered': 'cyan',
      'completed': 'success',
      'cancelled': 'error'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts = {
      'pending': 'در انتظار',
      'confirmed': 'تأیید شده',
      'preparing': 'در حال آماده‌سازی',
      'ready': 'آماده',
      'delivered': 'تحویل داده شده',
      'completed': 'تکمیل شده',
      'cancelled': 'لغو شده'
    }
    return texts[status as keyof typeof texts] || status
  }

  const itemColumns = [
    {
      title: 'آیتم',
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
      dataIndex: 'quantity',
      key: 'quantity',
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
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes || '-'
    }
  ]

  const handleSendWhatsApp = async () => {
    if (!order.customer?.phone) {
      message.error('شماره تلفن مشتری موجود نیست')
      return
    }

    const orderMessage = `
سلام ${order.customer.name} عزیز،

سفارش شما با شماره ${order.orderNumber} در حال آماده‌سازی است.

وضعیت: ${getStatusText(order.status)}
مبلغ کل: ${order.totalAmount.toLocaleString()} ﷼
${order.estimatedTime ? `زمان تخمینی: ${order.estimatedTime} دقیقه` : ''}

از صبر شما متشکریم 🙏
    `.trim()

    const whatsappUrl = `https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(orderMessage)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleDownloadReceipt = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/order/${order.id}/receipt`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `receipt-${order.orderNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        message.success('رسید دانلود شد')
      } else {
        throw new Error('خطا در دانلود رسید')
      }
    } catch (error) {
      console.error('Error downloading receipt:', error)
      message.error('خطا در دانلود رسید')
    } finally {
      setLoading(false)
    }
  }

  const timelineItems = [
    {
      color: 'blue',
      children: (
        <div>
          <Text strong>سفارش ایجاد شد</Text>
          <br />
          <Text type="secondary">{dayjs(order.createdAt).format('YYYY/MM/DD HH:mm')}</Text>
        </div>
      )
    }
  ]

  if (order.confirmedAt) {
    timelineItems.push({
      color: 'green',
      children: (
        <div>
          <Text strong>سفارش تأیید شد</Text>
          <br />
          <Text type="secondary">{dayjs(order.confirmedAt).format('YYYY/MM/DD HH:mm')}</Text>
        </div>
      )
    })
  }

  if (order.preparingAt) {
    timelineItems.push({
      color: 'purple',
      children: (
        <div>
          <Text strong>شروع آماده‌سازی</Text>
          <br />
          <Text type="secondary">{dayjs(order.preparingAt).format('YYYY/MM/DD HH:mm')}</Text>
        </div>
      )
    })
  }

  if (order.readyAt) {
    timelineItems.push({
      color: 'orange',
      children: (
        <div>
          <Text strong>آماده برای تحویل</Text>
          <br />
          <Text type="secondary">{dayjs(order.readyAt).format('YYYY/MM/DD HH:mm')}</Text>
        </div>
      )
    })
  }

  if (order.deliveredAt) {
    timelineItems.push({
      color: 'cyan',
      children: (
        <div>
          <Text strong>تحویل داده شد</Text>
          <br />
          <Text type="secondary">{dayjs(order.deliveredAt).format('YYYY/MM/DD HH:mm')}</Text>
        </div>
      )
    })
  }

  return (
    <Modal
      title={
        <Space>
          <Text>جزئیات سفارش #{order.orderNumber}</Text>
          <Tag color={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="whatsapp" icon={<WhatsAppOutlined />} onClick={handleSendWhatsApp}>
          ارسال واتساپ
        </Button>,
        <Button key="download" icon={<DownloadOutlined />} onClick={handleDownloadReceipt} loading={loading}>
          دانلود رسید
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => onPrint(order.id)}>
          چاپ
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          بستن
        </Button>
      ]}
    >
      <Row gutter={[16, 16]}>
        {/* Customer Information */}
        <Col span={12}>
          <Card 
            title={
              <Space>
                <span>اطلاعات مشتری</span>
                <Tag color="blue">
                  {order.type === 'dine-in' && '🍽️ حضوری'}
                  {order.type === 'takeaway' && '🥡 بیرون‌بر'}
                  {order.type === 'delivery' && '🚚 ارسالی'}
                </Tag>
              </Space>
            } 
            size="small"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* نام مشتری */}
              <Row justify="space-between">
                <Text>نام مشتری:</Text>
                <Text strong>{order.customer?.name || order.customerName || 'نامشخص'}</Text>
              </Row>
              
              {/* شماره تلفن */}
              {(order.customer?.phone || order.customerPhone) && (
                <Row justify="space-between">
                  <Text>تلفن:</Text>
                  <Text copyable>{order.customer?.phone || order.customerPhone}</Text>
                </Row>
              )}
              
              {/* ایمیل */}
              {(order.customer?.email || order.customerEmail) && (
                <Row justify="space-between">
                  <Text>ایمیل:</Text>
                  <Text>{order.customer?.email || order.customerEmail}</Text>
                </Row>
              )}
              
              {/* آدرس برای ارسالی */}
              {order.type === 'delivery' && (order.customer?.address || order.customerAddress) && (
                <>
                  <Row justify="space-between">
                    <Text>آدرس تحویل:</Text>
                  </Row>
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f6ffed', 
                    borderRadius: '4px',
                    border: '1px solid #b7eb8f'
                  }}>
                    <Text style={{ fontSize: '13px' }}>
                      📍 {order.customer?.address || order.customerAddress}
                    </Text>
                  </div>
                </>
              )}
              
              {/* شماره میز برای حضوری */}
              {order.type === 'dine-in' && order.tableNumber && (
                <Row justify="space-between">
                  <Text>شماره میز:</Text>
                  <Tag color="blue" style={{ fontSize: '14px' }}>میز {order.tableNumber}</Tag>
                </Row>
              )}
              
              {/* نام گیرنده (در صورت تفاوت) */}
              {order.recipientName && order.recipientName !== (order.customer?.name || order.customerName) && (
                <Row justify="space-between">
                  <Text>نام گیرنده:</Text>
                  <Text strong>{order.recipientName}</Text>
                </Row>
              )}
              
              {/* راهنمای دسترسی */}
              {order.deliveryNotes && (
                <>
                  <Row justify="space-between">
                    <Text>راهنمای دسترسی:</Text>
                  </Row>
                  <div style={{ 
                    padding: '6px', 
                    backgroundColor: '#fffbe6', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {order.deliveryNotes}
                  </div>
                </>
              )}
            </Space>
          </Card>
        </Col>

        {/* Order Information */}
        <Col span={12}>
          <Card title="اطلاعات سفارش" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              
              {/* شماره سفارش */}
              <Row justify="space-between">
                <Text>شماره سفارش:</Text>
                <Text strong copyable>#{order.orderNumber || order.id}</Text>
              </Row>
              
              {/* نوع سفارش */}
              <Row justify="space-between">
                <Text>نوع سفارش:</Text>
                <Tag 
                  color={order.type === 'dine-in' ? 'blue' : order.type === 'takeaway' ? 'green' : 'orange'}
                  style={{ fontSize: '13px' }}
                >
                  {order.type === 'dine-in' && '🍽️ حضوری'}
                  {order.type === 'takeaway' && '🥡 بیرون‌بر'}
                  {order.type === 'delivery' && '🚚 ارسالی'}
                </Tag>
              </Row>
              
              {/* زمان ایجاد */}
              <Row justify="space-between">
                <Text>زمان ثبت:</Text>
                <Text>{dayjs(order.createdAt).format('YYYY/MM/DD - HH:mm')}</Text>
              </Row>
              
              {/* زمان تخمینی */}
              {order.estimatedTime && (
                <Row justify="space-between">
                  <Text>زمان تخمینی:</Text>
                  <Tag color="purple">{order.estimatedTime} دقیقه</Tag>
                </Row>
              )}
              
              {/* روش پرداخت */}
              <Row justify="space-between">
                <Text>روش پرداخت:</Text>
                <Tag color="cyan">
                  {order.paymentMethod === 'cash' && '💰 نقدی'}
                  {order.paymentMethod === 'card' && '💳 کارتی'}
                  {order.paymentMethod === 'online' && '🌐 آنلاین'}
                </Tag>
              </Row>
              
              {/* اولویت سفارش */}
              {order.priority && (
                <Row justify="space-between">
                  <Text>اولویت:</Text>
                  <Tag color={order.priority === 'high' ? 'red' : order.priority === 'normal' ? 'orange' : 'green'}>
                    {order.priority === 'high' && '🔴 فوری'}
                    {order.priority === 'normal' && '🟡 متوسط'}
                    {order.priority === 'low' && '🟢 عادی'}
                  </Tag>
                </Row>
              )}
              
              {/* تعداد کل اقلام */}
              <Row justify="space-between">
                <Text>تعداد اقلام:</Text>
                <Text strong>
                  {order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0} قلم
                </Text>
              </Row>
              
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider>آیتم‌های سفارش</Divider>

      <Table
        dataSource={order.items}
        columns={itemColumns}
        pagination={false}
        size="small"
        rowKey="id"
      />

      <Divider>محاسبات مالی</Divider>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between">
                <Text>جمع آیتم‌ها:</Text>
                <Text>{order.subtotal?.toLocaleString()} ﷼</Text>
              </Row>
              {order.discount > 0 && (
                <Row justify="space-between">
                  <Text>تخفیف:</Text>
                  <Text style={{ color: '#ff4d4f' }}>-{order.discount.toLocaleString()} ﷼</Text>
                </Row>
              )}
              {order.tax > 0 && (
                <Row justify="space-between">
                  <Text>مالیات:</Text>
                  <Text>{order.tax.toLocaleString()} ﷼</Text>
                </Row>
              )}
              {order.deliveryFee > 0 && (
                <Row justify="space-between">
                  <Text>هزینه ارسال:</Text>
                  <Text>{order.deliveryFee.toLocaleString()} ﷼</Text>
                </Row>
              )}
              <Divider style={{ margin: '8px 0' }} />
              <Row justify="space-between">
                <Text strong style={{ fontSize: '16px' }}>مبلغ نهایی:</Text>
                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                  {order.totalAmount.toLocaleString()} ﷼
                </Text>
              </Row>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="تایم لاین سفارش" size="small">
            <Timeline items={timelineItems} />
          </Card>
        </Col>
      </Row>

      {order.notes && (
        <>
          <Divider>یادداشت</Divider>
          <Card size="small">
            <Text>{order.notes}</Text>
          </Card>
        </>
      )}
    </Modal>
  )
}

export default OrderDetailsModal
