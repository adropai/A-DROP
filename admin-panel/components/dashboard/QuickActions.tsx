'use client'

import React from 'react'
import { Card, Button, Space, message } from 'antd'
import { 
  PlusOutlined, 
  ShoppingCartOutlined, 
  UserAddOutlined,
  TableOutlined,
  PrinterOutlined 
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const QuickActions: React.FC = () => {
  const router = useRouter()

  const handleAction = (action: string) => {
    switch (action) {
      case 'new-order':
        router.push('/orders/new')
        break
      case 'new-customer':
        router.push('/customers/new')
        break
      case 'add-table':
        router.push('/tables/new')
        break
      case 'print-reports':
        message.info('در حال آماده‌سازی گزارش...')
        break
      default:
        message.warning('عملیات در حال توسعه است')
    }
  }

  return (
    <Card title="عملیات سریع" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />} 
          block
          onClick={() => handleAction('new-order')}
        >
          سفارش جدید
        </Button>
        <Button 
          icon={<UserAddOutlined />} 
          block
          onClick={() => handleAction('new-customer')}
        >
          مشتری جدید
        </Button>
        <Button 
          icon={<TableOutlined />} 
          block
          onClick={() => handleAction('add-table')}
        >
          افزودن میز
        </Button>
        <Button 
          icon={<PrinterOutlined />} 
          block
          onClick={() => handleAction('print-reports')}
        >
          چاپ گزارش
        </Button>
      </Space>
    </Card>
  )
}

export default QuickActions
