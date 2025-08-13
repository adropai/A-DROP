'use client'

import React from 'react'
import { Card, Progress } from 'antd'

interface GaugeChartProps {
  title: string
  value: number
  max?: number
  color?: string
  suffix?: string
}

const GaugeChart: React.FC<GaugeChartProps> = ({ 
  title, 
  value, 
  max = 100, 
  color = '#1890ff',
  suffix = '%'
}) => {
  const percentage = Math.round((value / max) * 100)
  
  const getColor = (percent: number) => {
    if (percent >= 80) return '#52c41a'
    if (percent >= 60) return '#faad14'
    if (percent >= 40) return '#ff7a45'
    return '#ff4d4f'
  }

  return (
    <Card size="small" style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: '14px' }}>{title}</h4>
      </div>
      <Progress
        type="circle"
        percent={percentage}
        size={120}
        strokeColor={color || getColor(percentage)}
        format={() => (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {value.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {suffix}
            </div>
          </div>
        )}
      />
    </Card>
  )
}

export default GaugeChart
