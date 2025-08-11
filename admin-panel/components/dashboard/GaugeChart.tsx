'use client'

import React from 'react'
import { Card, Progress, Statistic, Space } from 'antd'
import { TrophyOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'

interface GaugeChartProps {
  title?: string
  current: number
  target: number
  unit?: string
  period?: string
}

const GaugeChart: React.FC<GaugeChartProps> = ({ 
  title = "هدف ماهانه",
  current = 75000000,
  target = 100000000,
  unit = "تومان",
  period = "شهریور 1403"
}) => {
  const percentage = Math.round((current / target) * 100)
  const remaining = target - current
  const isOnTrack = percentage >= 75 // اگر بالای 75% باشد، در مسیر درستی است

  const getColor = () => {
    if (percentage >= 90) return '#52c41a'
    if (percentage >= 75) return '#faad14'
    if (percentage >= 50) return '#1890ff'
    return '#ff4d4f'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }

  return (
    <Card 
      title={
        <Space>
          <TrophyOutlined />
          <span>{title}</span>
        </Space>
      }
      style={{ borderRadius: '12px', height: '100%' }}
      styles={{ body: { padding: '20px' } }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        height: '100%',
        justifyContent: 'space-between'
      }}>
        
        {/* نمودار دایره‌ای اصلی */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Progress
            type="circle"
            percent={percentage}
            size={120}
            strokeColor={getColor()}
            strokeWidth={8}
            format={() => (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: getColor() 
                }}>
                  {percentage}%
                </div>
                <div style={{ 
                  fontSize: 12, 
                  color: '#8c8c8c',
                  marginTop: 4
                }}>
                  تحقق هدف
                </div>
              </div>
            )}
          />
        </div>

        {/* آمار تفصیلی */}
        <div style={{ 
          width: '100%', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginTop: 16
        }}>
          <div style={{ textAlign: 'center' }}>
            <Statistic
              title="فروش فعلی"
              value={formatNumber(current)}
              suffix={unit}
              valueStyle={{ 
                fontSize: 16, 
                color: '#1890ff',
                fontWeight: 600
              }}
            />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Statistic
              title="هدف ماه"
              value={formatNumber(target)}
              suffix={unit}
              valueStyle={{ 
                fontSize: 16, 
                color: '#595959',
                fontWeight: 600
              }}
            />
          </div>
        </div>

        {/* وضعیت و باقی‌مانده */}
        <div style={{ 
          width: '100%', 
          backgroundColor: '#f6f8ff',
          padding: 12,
          borderRadius: 8,
          marginTop: 16
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 8
          }}>
            <span style={{ fontSize: 12, color: '#595959' }}>باقی‌مانده:</span>
            <span style={{ 
              fontSize: 14, 
              fontWeight: 'bold',
              color: remaining > 0 ? '#faad14' : '#52c41a'
            }}>
              {remaining > 0 ? formatNumber(remaining) : 'هدف محقق شد'} {unit}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <span style={{ fontSize: 12, color: '#595959' }}>وضعیت:</span>
            <Space>
              {isOnTrack ? (
                <RiseOutlined style={{ color: '#52c41a' }} />
              ) : (
                <FallOutlined style={{ color: '#ff4d4f' }} />
              )}
              <span style={{ 
                fontSize: 12, 
                color: isOnTrack ? '#52c41a' : '#ff4d4f',
                fontWeight: 500
              }}>
                {isOnTrack ? 'در مسیر درست' : 'نیاز به تلاش بیشتر'}
              </span>
            </Space>
          </div>
        </div>

        {/* دوره زمانی */}
        <div style={{ 
          marginTop: 12,
          fontSize: 11,
          color: '#8c8c8c',
          textAlign: 'center'
        }}>
          {period}
        </div>
      </div>
    </Card>
  )
}

export default GaugeChart
