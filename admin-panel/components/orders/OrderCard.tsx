import React from 'react'
import { Card, Badge, Button, Space, Tag, Typography, Divider } from 'antd'
import { 
  EyeOutlined, 
  EditOutlined, 
  PrinterOutlined, 
  UserOutlined, 
  PhoneOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined 
} from '@ant-design/icons'
import { Order, OrderStatus } from '../../types/orders'

const { Text, Title } = Typography

interface OrderCardProps {
  order: Order
  onView: (order: Order) => void
  onStatusChange: (order: Order) => void
  onPrint: (order: Order) => void
}

const statusConfig = {
  New: { label: 'جدید', color: 'orange', status: 'warning' as const },
  Confirmed: { label: 'تایید شده', color: 'blue', status: 'processing' as const },
  Preparing: { label: 'در حال آماده‌سازی', color: 'cyan', status: 'processing' as const },
  Ready: { label: 'آماده تحویل', color: 'green', status: 'success' as const },
  Delivering: { label: 'در حال ارسال', color: 'purple', status: 'processing' as const },
  Delivered: { label: 'تحویل شده', color: 'default', status: 'default' as const },
  Cancelled: { label: 'لغو شده', color: 'red', status: 'error' as const }
}

export default function OrderCard({ order, onView, onStatusChange, onPrint }: OrderCardProps) {
  const status = statusConfig[order.status]
  
  return (
    <Card
      size="small"
      className="mb-4 hover:shadow-md transition-shadow"
      title={
        <div className="flex justify-between items-center">
          <span className="font-semibold">#{order.id}</span>
          <Badge status={status.status} text={status.label} />
        </div>
      }
      extra={
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(order)}
          >
            مشاهده
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onStatusChange(order)}
            disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
          >
            تغییر وضعیت
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => onPrint(order)}
          >
            پرینت
          </Button>
        </Space>
      }
    >
      <div className="space-y-2">
        {/* اطلاعات مشتری */}
        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          <Text strong>{order.customer.name}</Text>
          <PhoneOutlined className="text-gray-400 mr-2" />
          <Text type="secondary">{order.customer.phone}</Text>
        </div>

        {/* اقلام سفارش */}
        <div className="flex items-center gap-2">
          <ShoppingCartOutlined className="text-gray-400" />
          <Text>{order.items.length} قلم</Text>
          <Divider type="vertical" />
          <Text strong className="text-green-600">
            {order.amount.toLocaleString()} تومان
          </Text>
        </div>

        {/* زمان سفارش */}
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-gray-400" />
          <Text type="secondary">
            {new Date(order.createdAt).toLocaleString('fa-IR')}
          </Text>
        </div>

        {/* خلاصه اقلام */}
        <div className="bg-gray-50 p-2 rounded">
          <Text type="secondary" className="text-xs">
            {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
          </Text>
        </div>
      </div>
    </Card>
  )
}
