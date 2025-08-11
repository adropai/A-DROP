'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PerformanceChartProps {
  data?: Array<{
    time: string
    cpu: number
    memory: number
    responseTime: number
  }>
  loading?: boolean
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data = [
    { time: '09:00', cpu: 45, memory: 60, responseTime: 120 },
    { time: '10:00', cpu: 52, memory: 65, responseTime: 140 },
    { time: '11:00', cpu: 48, memory: 58, responseTime: 110 },
    { time: '12:00', cpu: 61, memory: 70, responseTime: 180 },
    { time: '13:00', cpu: 55, memory: 62, responseTime: 150 },
    { time: '14:00', cpu: 67, memory: 75, responseTime: 200 },
    { time: '15:00', cpu: 43, memory: 55, responseTime: 100 },
    { time: '16:00', cpu: 38, memory: 50, responseTime: 90 }
  ],
  loading = false 
}) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'cpu' ? `${value}%` : 
              name === 'memory' ? `${value}%` : 
              `${value}ms`,
              name === 'cpu' ? 'CPU' : 
              name === 'memory' ? 'حافظه' : 
              'زمان پاسخ'
            ]}
            labelFormatter={(label) => `زمان: ${label}`}
          />
          <Legend 
            formatter={(value) => 
              value === 'cpu' ? 'CPU' : 
              value === 'memory' ? 'حافظه' : 
              'زمان پاسخ'
            }
          />
          <Line 
            type="monotone" 
            dataKey="cpu" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="memory" 
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="responseTime" 
            stroke="#ffc658" 
            strokeWidth={2}
            dot={{ fill: '#ffc658', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PerformanceChart
