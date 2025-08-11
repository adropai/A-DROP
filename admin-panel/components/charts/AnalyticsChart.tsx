'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface AnalyticsChartProps {
  data?: Array<{
    type: string
    value: number
  }>
  loading?: boolean
}

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa8c16']

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  data = [
    { type: 'حضوری', value: 45 },
    { type: 'آنلاین', value: 30 },
    { type: 'تلفنی', value: 15 },
    { type: 'پیک', value: 10 }
  ],
  loading = false 
}) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={5}
            dataKey="value"
            label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [
              `${value} سفارش`,
              name
            ]}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AnalyticsChart
