'use client'

import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Button, Badge, Avatar, Tooltip } from 'antd'
import { 
  InstagramOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  ShareAltOutlined,
  EyeOutlined,
  HeartOutlined,
  MessageOutlined,
  ReloadOutlined
} from '@ant-design/icons'

const { Text, Link } = Typography

interface SocialPost {
  id: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
  content: string
  likes: number
  comments: number
  shares: number
  views: number
  timestamp: string
}

interface SocialStats {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
  followers: number
  engagement: number
  growth: number
}

interface SocialMediaWidgetProps {
  restaurantHandle?: string
}

const SocialMediaWidget: React.FC<SocialMediaWidgetProps> = ({ 
  restaurantHandle = "@atresib_restaurant" 
}) => {
  const [stats, setStats] = useState<SocialStats[]>([])
  const [recentPosts, setRecentPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const mockStats: SocialStats[] = [
    {
      platform: 'instagram',
      followers: 5420,
      engagement: 8.2,
      growth: 12
    },
    {
      platform: 'facebook',
      followers: 3200,
      engagement: 5.7,
      growth: 8
    },
    {
      platform: 'twitter',
      followers: 1800,
      engagement: 4.1,
      growth: 15
    }
  ]

  const mockPosts: SocialPost[] = [
    {
      id: '1',
      platform: 'instagram',
      content: 'کباب کوبیده تازه تهیه شده با بهترین گوشت گوسفندی',
      likes: 234,
      comments: 18,
      shares: 12,
      views: 1205,
      timestamp: '2 ساعت پیش'
    },
    {
      id: '2',
      platform: 'facebook',
      content: 'منوی ویژه آخر هفته - تخفیف 20 درصدی برای خانواده‌ها',
      likes: 89,
      comments: 7,
      shares: 23,
      views: 567,
      timestamp: '5 ساعت پیش'
    }
  ]

  const fetchSocialData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setStats(mockStats)
      setRecentPosts(mockPosts)
    } catch (error) {
      console.error('خطا در دریافت اطلاعات شبکه‌های اجتماعی:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSocialData()
  }, [])

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <InstagramOutlined style={{ color: '#E4405F' }} />
      case 'facebook':
        return <FacebookOutlined style={{ color: '#1877F2' }} />
      case 'twitter':
        return <TwitterOutlined style={{ color: '#1DA1F2' }} />
      case 'linkedin':
        return <LinkedinOutlined style={{ color: '#0A66C2' }} />
      default:
        return <ShareAltOutlined />
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <Card
      title={
        <Space>
          <ShareAltOutlined />
          <span>شبکه‌های اجتماعی</span>
        </Space>
      }
      extra={
        <Button 
          type="text" 
          size="small" 
          icon={<ReloadOutlined spin={loading} />}
          onClick={fetchSocialData}
        />
      }
      style={{ height: '100%' }}
      loading={loading}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Platform Stats */}
        <div>
          <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
            آمار دنبال‌کنندگان:
          </Text>
          <Space wrap>
            {stats.map((stat) => (
              <Tooltip 
                key={stat.platform}
                title={`نرخ تعامل: ${stat.engagement}% | رشد: +${stat.growth}%`}
              >
                <Badge 
                  count={`+${stat.growth}%`} 
                  size="small"
                  style={{ backgroundColor: '#52c41a' }}
                >
                  <div style={{ 
                    border: '1px solid #f0f0f0', 
                    borderRadius: 6, 
                    padding: '8px 12px',
                    textAlign: 'center',
                    minWidth: 80
                  }}>
                    <div style={{ marginBottom: 4 }}>
                      {getPlatformIcon(stat.platform)}
                    </div>
                    <Text strong style={{ fontSize: '14px' }}>
                      {formatNumber(stat.followers)}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '10px' }}>
                      دنبال‌کننده
                    </Text>
                  </div>
                </Badge>
              </Tooltip>
            ))}
          </Space>
        </div>

        {/* Recent Posts */}
        <div>
          <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
            آخرین پست‌ها:
          </Text>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {recentPosts.map((post) => (
              <div 
                key={post.id}
                style={{ 
                  border: '1px solid #f0f0f0', 
                  borderRadius: 6, 
                  padding: 12,
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  {getPlatformIcon(post.platform)}
                  <Text type="secondary" style={{ fontSize: '11px', marginLeft: 8 }}>
                    {post.timestamp}
                  </Text>
                </div>
                
                <Text style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
                  {post.content}
                </Text>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space size="middle">
                    <Space size="small">
                      <HeartOutlined style={{ color: '#ff4d4f' }} />
                      <Text style={{ fontSize: '11px' }}>{post.likes}</Text>
                    </Space>
                    
                    <Space size="small">
                      <MessageOutlined style={{ color: '#1890ff' }} />
                      <Text style={{ fontSize: '11px' }}>{post.comments}</Text>
                    </Space>
                    
                    <Space size="small">
                      <ShareAltOutlined style={{ color: '#52c41a' }} />
                      <Text style={{ fontSize: '11px' }}>{post.shares}</Text>
                    </Space>
                  </Space>
                  
                  <Space size="small">
                    <EyeOutlined style={{ color: '#8c8c8c' }} />
                    <Text style={{ fontSize: '11px' }} type="secondary">
                      {formatNumber(post.views)}
                    </Text>
                  </Space>
                </div>
              </div>
            ))}
          </Space>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="#" style={{ fontSize: '11px' }}>
            مشاهده همه پست‌ها
          </Link>
        </div>
      </Space>
    </Card>
  )
}

export { SocialMediaWidget }
export default SocialMediaWidget
