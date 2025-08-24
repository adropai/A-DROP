'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  const [currentTime, setCurrentTime] = useState<string>('')

  // حل مشکل Hydration Error
  useEffect(() => {
    setCurrentTime(dayjs().format('YYYY/MM/DD HH:mm'))
  }, [])

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
        <Col span={8}>
          <Text strong>شماره سفارش: </Text>
          <Text>#{order.orderNumber || order.id}</Text>
        </Col>
        <Col span={8}>
          <Text strong>تاریخ و زمان: </Text>
          <Text>{dayjs(order.createdAt).format('YYYY/MM/DD - HH:mm')}</Text>
        </Col>
        <Col span={8}>
          <Text strong>نوع سفارش: </Text>
          <Text style={{ 
            fontWeight: 'bold',
            color: order.type === 'dine-in' ? '#1890ff' : order.type === 'takeaway' ? '#52c41a' : '#fa8c16' 
          }}>
            {order.type === 'dine-in' && '🍽️ حضوری'}
            {order.type === 'takeaway' && '🥡 بیرون‌بر'}
            {order.type === 'delivery' && '🚚 ارسالی'}
          </Text>
        </Col>
        <Col span={8}>
          <Text strong>روش پرداخت: </Text>
          <Text>
            {order.paymentMethod === 'cash' && '💰 نقدی'}
            {order.paymentMethod === 'card' && '💳 کارتی'}
            {order.paymentMethod === 'online' && '🌐 آنلاین'}
          </Text>
        </Col>
        {order.priority && (
          <Col span={8}>
            <Text strong>اولویت: </Text>
            <Text style={{ 
              fontWeight: 'bold',
              color: order.priority === 'high' ? '#ff4d4f' : order.priority === 'normal' ? '#fa8c16' : '#52c41a'
            }}>
              {order.priority === 'high' && '🔴 فوری'}
              {order.priority === 'normal' && '🟡 متوسط'}
              {order.priority === 'low' && '🟢 عادی'}
            </Text>
          </Col>
        )}
        <Col span={8}>
          <Text strong>تعداد اقلام: </Text>
          <Text>{order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0} قلم</Text>
        </Col>
      </Row>

      {/* Customer Info */}
      <div style={{ marginBottom: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
        <Title level={4} style={{ color: 'black', marginBottom: '10px' }}>
          اطلاعات مشتری - 
          <span style={{ 
            color: order.type === 'dine-in' ? '#1890ff' : order.type === 'takeaway' ? '#52c41a' : '#fa8c16' 
          }}>
            {order.type === 'dine-in' && '🍽️ حضوری'}
            {order.type === 'takeaway' && '🥡 بیرون‌بر'}
            {order.type === 'delivery' && '🚚 ارسالی'}
          </span>
        </Title>
        <Row gutter={[16, 8]}>
          
          {/* نام مشتری */}
          <Col span={12}>
            <Text strong>نام مشتری: </Text>
            <Text>{order.customer?.name || order.customerName || 'نامشخص'}</Text>
          </Col>
          
          {/* شماره تلفن */}
          {(order.customer?.phone || order.customerPhone) && (
            <Col span={12}>
              <Text strong>شماره تلفن: </Text>
              <Text>{order.customer?.phone || order.customerPhone}</Text>
            </Col>
          )}
          
          {/* شماره میز برای حضوری */}
          {order.type === 'dine-in' && order.tableNumber && (
            <Col span={12}>
              <Text strong>شماره میز: </Text>
              <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>میز {order.tableNumber}</Text>
            </Col>
          )}
          
          {/* تعداد نفرات برای حضوری */}
          {order.type === 'dine-in' && order.guestCount && (
            <Col span={12}>
              <Text strong>تعداد نفرات: </Text>
              <Text>{order.guestCount} نفر</Text>
            </Col>
          )}
          
          {/* آدرس برای ارسالی */}
          {order.type === 'delivery' && (order.customer?.address || order.customerAddress) && (
            <Col span={24} style={{ marginTop: '10px' }}>
              <Text strong>آدرس تحویل: </Text>
              <div style={{ 
                marginTop: '5px',
                padding: '10px', 
                backgroundColor: '#f9f9f9', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <Text>📍 {order.customer?.address || order.customerAddress}</Text>
              </div>
            </Col>
          )}
          
          {/* نام گیرنده */}
          {order.recipientName && order.recipientName !== (order.customer?.name || order.customerName) && (
            <Col span={12}>
              <Text strong>نام گیرنده: </Text>
              <Text>{order.recipientName}</Text>
            </Col>
          )}
          
          {/* راهنمای دسترسی */}
          {order.deliveryNotes && (
            <Col span={24} style={{ marginTop: '8px' }}>
              <Text strong>راهنمای دسترسی برای پیک: </Text>
              <div style={{ 
                marginTop: '5px',
                padding: '8px', 
                backgroundColor: '#fffbe6', 
                border: '1px dashed #fadb14',
                borderRadius: '4px'
              }}>
                <Text style={{ fontSize: '13px' }}>{order.deliveryNotes}</Text>
              </div>
            </Col>
          )}
          
          {/* نام مشتری */}
          <Col span={12}>
            <Text strong>نام مشتری: </Text>
            <Text>{order.customer?.name || order.customerName || 'نامشخص'}</Text>
          </Col>
          
          {/* شماره تلفن */}
          {(order.customer?.phone || order.customerPhone) && (
            <Col span={12}>
              <Text strong>شماره تلفن: </Text>
              <Text>{order.customer?.phone || order.customerPhone}</Text>
            </Col>
          )}
          
          {/* شماره میز برای حضوری */}
          {order.type === 'dine-in' && order.tableNumber && (
            <Col span={12}>
              <Text strong>شماره میز: </Text>
              <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>میز {order.tableNumber}</Text>
            </Col>
          )}
          
          {/* تعداد نفرات برای حضوری */}
          {order.type === 'dine-in' && order.guestCount && (
            <Col span={12}>
              <Text strong>تعداد نفرات: </Text>
              <Text>{order.guestCount} نفر</Text>
            </Col>
          )}
          
          {/* آدرس برای ارسالی */}
          {order.type === 'delivery' && (order.customer?.address || order.customerAddress) && (
            <Col span={24} style={{ marginTop: '10px' }}>
              <Text strong>آدرس تحویل: </Text>
              <div style={{ 
                marginTop: '5px',
                padding: '10px', 
                backgroundColor: '#f9f9f9', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <Text>📍 {order.customer?.address || order.customerAddress}</Text>
              </div>
            </Col>
          )}
          
          {/* نام گیرنده */}
          {order.recipientName && order.recipientName !== (order.customer?.name || order.customerName) && (
            <Col span={12}>
              <Text strong>نام گیرنده: </Text>
              <Text>{order.recipientName}</Text>
            </Col>
          )}
          
          {/* راهنمای دسترسی */}
          {order.deliveryNotes && (
            <Col span={24} style={{ marginTop: '8px' }}>
              <Text strong>راهنمای دسترسی برای پیک: </Text>
              <div style={{ 
                marginTop: '5px',
                padding: '8px', 
                backgroundColor: '#fffbe6', 
                border: '1px dashed #fadb14',
                borderRadius: '4px'
              }}>
                <Text style={{ fontSize: '13px' }}>{order.deliveryNotes}</Text>
              </div>
            </Col>
          )}
          
        </Row>
      </div>

      {/* Order Items */}
      <div style={{ marginBottom: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
        <Title level={4} style={{ color: 'black', marginBottom: '15px' }}>آیتم‌های سفارش</Title>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>محصول</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>تعداد</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>قیمت واحد</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>قیمت کل</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any, index: number) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <Text strong>{item.name || item.menuItem?.name}</Text>
                  {item.notes && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      یادداشت: {item.notes}
                    </div>
                  )}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  {item.quantity || 1}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  {(item.price || item.menuItem?.price || 0).toLocaleString()} تومان
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  {((item.price || item.menuItem?.price || 0) * (item.quantity || 1)).toLocaleString()} تومان
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div style={{ marginTop: '20px', borderTop: '2px solid #000', paddingTop: '15px' }}>
        <Title level={4} style={{ color: 'black', marginBottom: '15px' }}>خلاصه مالی</Title>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text>جمع اولیه آیتم‌ها:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'left' }}>
            <Text>{(order.subtotal || 0).toLocaleString()} تومان</Text>
          </Col>
          
          {order.discount > 0 && (
            <>
              <Col span={12}>
                <Text>تخفیف:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'left' }}>
                <Text style={{ color: '#ff4d4f' }}>-{order.discount.toLocaleString()} تومان</Text>
              </Col>
            </>
          )}
          
          {order.tax > 0 && (
            <>
              <Col span={12}>
                <Text>مالیات:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'left' }}>
                <Text>+{order.tax.toLocaleString()} تومان</Text>
              </Col>
            </>
          )}
          
          {order.serviceFee > 0 && (
            <>
              <Col span={12}>
                <Text>هزینه خدمات:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'left' }}>
                <Text>+{order.serviceFee.toLocaleString()} تومان</Text>
              </Col>
            </>
          )}
          
          {order.deliveryFee > 0 && (
            <>
              <Col span={12}>
                <Text>هزینه ارسال:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'left' }}>
                <Text>+{order.deliveryFee.toLocaleString()} تومان</Text>
              </Col>
            </>
          )}
          
          <Col span={24}>
            <Divider style={{ margin: '10px 0', borderColor: '#000' }} />
          </Col>
          
          <Col span={12}>
            <Text strong style={{ fontSize: '18px' }}>مبلغ نهایی:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'left' }}>
            <Text strong style={{ fontSize: '18px', color: '#000' }}>
              {(order.totalAmount || order.total || 0).toLocaleString()} تومان
            </Text>
          </Col>
        </Row>
      </div>

      {/* Notes */}
      {(order.notes || order.orderNotes) && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
          <Title level={4} style={{ color: 'black', marginBottom: '10px' }}>یادداشت سفارش</Title>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f9f9f9', 
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <Text>{order.notes || order.orderNotes}</Text>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
        <Text style={{ fontSize: '14px', color: '#666' }}>
          تشکر از خرید شما - رستوران A-DROP
        </Text>
        <br />
        <Text style={{ fontSize: '12px', color: '#999' }}>
          چاپ شده در: {currentTime || 'در حال بارگذاری...'}
        </Text>
      </div>
    </div>
  )

  return (
    <Modal
      title="پیش‌نمایش چاپ سفارش"
      open={visible}
      onCancel={onCancel}
      width="90%"
      style={{ 
        maxWidth: '800px',
        top: '20px'
      }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          بستن
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          چاپ
        </Button>
      ]}
      styles={{
        body: {
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          padding: '16px'
        }
      }}
    >
      <PrintContent />
    </Modal>
  )
}

export default PrintOrderModal
