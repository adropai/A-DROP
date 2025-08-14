'use client'

import React, { useState, useRef } from 'react'
import { Modal, Button, Card, Row, Col, Typography, Divider, Space } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import { useReactToPrint } from 'react-to-print'
import dayjs from 'dayjs'

const { Text, Title } = Typography

interface PrintOrderModalProps {
  order: any
  visible: boolean
  onCancel: () => void
}

const PrintOrderModal: React.FC<PrintOrderModalProps> = ({ order, visible, onCancel }) => {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Order-${order?.orderNumber}`,
    onAfterPrint: () => {
      onCancel()
    }
  })

  if (!order) return null

  const PrintContent = () => (
    <div ref={printRef} style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '15px' }}>
        <Title level={2} style={{ margin: 0, color: 'black' }}>رستوران A-DROP</Title>
        <Text style={{ fontSize: '16px' }}>رسید سفارش</Text>
      </div>

      {/* Order Info */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={12}>
          <Text strong>شماره سفارش: </Text>
          <Text>{order.orderNumber}</Text>
        </Col>
        <Col span={12}>
          <Text strong>تاریخ: </Text>
          <Text>{dayjs(order.createdAt).format('YYYY/MM/DD HH:mm')}</Text>
        </Col>
        <Col span={12}>
          <Text strong>نوع سفارش: </Text>
          <Text>
            {order.type === 'dine-in' && 'حضوری'}
            {order.type === 'takeaway' && 'بیرون‌بر'}
            {order.type === 'delivery' && 'ارسالی'}
          </Text>
        </Col>
        {order.tableNumber && (
          <Col span={12}>
            <Text strong>شماره میز: </Text>
            <Text>{order.tableNumber}</Text>
          </Col>
        )}
      </Row>

      {/* Customer Info */}
      <div style={{ marginBottom: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
        <Title level={4} style={{ color: 'black', marginBottom: '10px' }}>اطلاعات مشتری</Title>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>نام: </Text>
            <Text>{order.customer?.name || 'نامشخص'}</Text>
          </Col>
          <Col span={12}>
            <Text strong>تلفن: </Text>
            <Text>{order.customer?.phone || '-'}</Text>
          </Col>
          {order.customer?.address && (
            <Col span={24}>
              <Text strong>آدرس: </Text>
              <Text>{order.customer.address}</Text>
            </Col>
          )}
        </Row>
      </div>

      {/* Items */}
      <div style={{ marginBottom: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
        <Title level={4} style={{ color: 'black', marginBottom: '15px' }}>آیتم‌های سفارش</Title>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ textAlign: 'right', padding: '8px', width: '40%' }}>محصول</th>
              <th style={{ textAlign: 'center', padding: '8px', width: '15%' }}>تعداد</th>
              <th style={{ textAlign: 'center', padding: '8px', width: '20%' }}>قیمت واحد</th>
              <th style={{ textAlign: 'center', padding: '8px', width: '25%' }}>جمع</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any, index: number) => (
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <div>
                    <Text strong>{item.name}</Text>
                    {item.notes && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        یادداشت: {item.notes}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{item.price.toLocaleString()} ﷼</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <Text strong>{(item.price * item.quantity).toLocaleString()} ﷼</Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ marginTop: '20px', borderTop: '2px solid #000', paddingTop: '15px' }}>
        <Row justify="end">
          <Col span={8}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '8px' }}>
                <Text>جمع آیتم‌ها: </Text>
                <Text>{order.subtotal?.toLocaleString()} ﷼</Text>
              </div>
              
              {order.discount > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <Text>تخفیف: </Text>
                  <Text style={{ color: '#ff4d4f' }}>-{order.discount.toLocaleString()} ﷼</Text>
                </div>
              )}
              
              {order.tax > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <Text>مالیات: </Text>
                  <Text>{order.tax.toLocaleString()} ﷼</Text>
                </div>
              )}
              
              {order.deliveryFee > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <Text>هزینه ارسال: </Text>
                  <Text>{order.deliveryFee.toLocaleString()} ﷼</Text>
                </div>
              )}
              
              <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginTop: '8px' }}>
                <Text strong style={{ fontSize: '16px' }}>مبلغ نهایی: </Text>
                <Text strong style={{ fontSize: '16px' }}>{order.totalAmount.toLocaleString()} ﷼</Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Payment Method */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Text>روش پرداخت: </Text>
        <Text strong>
          {order.paymentMethod === 'cash' && 'نقدی'}
          {order.paymentMethod === 'card' && 'کارتی'}
          {order.paymentMethod === 'online' && 'آنلاین'}
        </Text>
      </div>

      {/* Notes */}
      {order.notes && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
          <Text strong>یادداشت: </Text>
          <Text>{order.notes}</Text>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
        <Text style={{ fontSize: '14px' }}>
          از خرید شما متشکریم
        </Text>
        <br />
        <Text style={{ fontSize: '12px', color: '#666' }}>
          تاریخ چاپ: {dayjs().format('YYYY/MM/DD HH:mm')}
        </Text>
      </div>
    </div>
  )

  return (
    <Modal
      title="پیش‌نمایش چاپ"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          انصراف
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          چاپ
        </Button>
      ]}
    >
      <div style={{ maxHeight: '600px', overflow: 'auto' }}>
        <PrintContent />
      </div>
    </Modal>
  )
}

export default PrintOrderModal
