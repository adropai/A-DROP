'use client'

import React from 'react'
import { Card, Typography, Space, Tag, Avatar } from 'antd'
import { 
  ShopOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  StarOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

interface RestaurantBrandingProps {
  restaurant?: {
    name: string
    logo?: string
    address: string
    phone: string
    website?: string
    rating: number
    operatingHours: string
    description: string
    specialties: string[]
  }
}

const RestaurantBranding: React.FC<RestaurantBrandingProps> = ({ 
  restaurant = {
    name: "رستوران عطرسیب",
    address: "تهران، خیابان ولیعصر، نرسیده به پارک ملت",
    phone: "021-88776655",
    website: "www.atresib.com",
    rating: 4.8,
    operatingHours: "شنبه تا پنج‌شنبه: 11:00 - 23:00",
    description: "رستوران عطرسیب با بیش از 15 سال تجربه در ارائه غذاهای سنتی و مدرن ایرانی",
    specialties: ["کباب کوبیده", "جوجه کباب", "قورمه سبزی", "فسنجان"]
  }
}) => {
  return (
    <Card
      title={
        <Space>
          <ShopOutlined />
          <span>برندینگ رستوران</span>
        </Space>
      }
      extra={
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <Text strong>{restaurant.rating}</Text>
        </Space>
      }
      style={{ height: '100%' }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          {restaurant.logo ? (
            <Avatar size={64} src={restaurant.logo} />
          ) : (
            <Avatar size={64} icon={<ShopOutlined />} style={{ backgroundColor: '#1890ff' }} />
          )}
          <Title level={4} style={{ margin: '8px 0 4px' }}>
            {restaurant.name}
          </Title>
        </div>
        
        <div>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Space>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <Text type="secondary">{restaurant.address}</Text>
              </Space>
            </div>
            
            <div>
              <Space>
                <PhoneOutlined style={{ color: '#52c41a' }} />
                <Text copyable>{restaurant.phone}</Text>
              </Space>
            </div>
            
            {restaurant.website && (
              <div>
                <Space>
                  <GlobalOutlined style={{ color: '#722ed1' }} />
                  <Text copyable code>{restaurant.website}</Text>
                </Space>
              </div>
            )}
            
            <div>
              <Space>
                <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                <Text type="secondary">{restaurant.operatingHours}</Text>
              </Space>
            </div>
          </Space>
        </div>
        
        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {restaurant.description}
          </Text>
        </div>
        
        <div>
          <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
            تخصص‌ها:
          </Text>
          <Space wrap>
            {restaurant.specialties.map((specialty, index) => (
              <Tag key={index} color="blue" style={{ fontSize: '11px' }}>
                {specialty}
              </Tag>
            ))}
          </Space>
        </div>
      </Space>
    </Card>
  )
}

export { RestaurantBranding }
export default RestaurantBranding
