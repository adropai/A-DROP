'use client'

import React, { useState } from 'react'
import { Modal, Form, Select, Button, message, Input } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, FireOutlined, TruckOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface UpdateOrderStatusProps {
  order: any
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

const UpdateOrderStatus: React.FC<UpdateOrderStatusProps> = ({ order, visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const statusOptions = [
    { value: 'pending', label: 'در انتظار', icon: <ClockCircleOutlined />, color: '#fa8c16' },
    { value: 'confirmed', label: 'تأیید شده', icon: <CheckCircleOutlined />, color: '#1890ff' },
    { value: 'preparing', label: 'در حال آماده‌سازی', icon: <FireOutlined />, color: '#722ed1' },
    { value: 'ready', label: 'آماده', icon: <CheckCircleOutlined />, color: '#52c41a' },
    { value: 'delivered', label: 'تحویل داده شده', icon: <TruckOutlined />, color: '#13c2c2' },
    { value: 'completed', label: 'تکمیل شده', icon: <CheckCircleOutlined />, color: '#52c41a' },
    { value: 'cancelled', label: 'لغو شده', icon: <ClockCircleOutlined />, color: '#ff4d4f' }
  ]

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: values.status,
          notes: values.notes
        })
      })

      if (response.ok) {
        message.success('وضعیت سفارش با موفقیت بروزرسانی شد')
        form.resetFields()
        onSuccess()
      } else {
        const error = await response.json()
        message.error(error.message || 'خطا در بروزرسانی وضعیت')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      message.error('خطا در بروزرسانی وضعیت')
    } finally {
      setLoading(false)
    }
  }

  const getAvailableStatuses = (currentStatus: string) => {
    const statusFlow: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['delivered', 'completed'],
      'delivered': ['completed'],
      'completed': [],
      'cancelled': []
    }

    return statusFlow[currentStatus] || []
  }

  const availableStatuses = getAvailableStatuses(order?.status || 'pending')

  return (
    <Modal
      title={`بروزرسانی وضعیت سفارش #${order?.orderNumber}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: order?.status
        }}
      >
        <Form.Item
          name="status"
          label="وضعیت جدید"
          rules={[{ required: true, message: 'انتخاب وضعیت الزامی است' }]}
        >
          <Select placeholder="وضعیت جدید را انتخاب کنید">
            {statusOptions
              .filter(option => availableStatuses.includes(option.value))
              .map(option => (
                <Option key={option.value} value={option.value}>
                  <span style={{ color: option.color }}>
                    {option.icon} {option.label}
                  </span>
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="notes"
          label="یادداشت (اختیاری)"
        >
          <TextArea
            rows={3}
            placeholder="دلیل تغییر وضعیت یا یادداشت اضافی..."
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button onClick={onCancel} style={{ marginLeft: 8 }}>
            انصراف
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            بروزرسانی
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default UpdateOrderStatus
