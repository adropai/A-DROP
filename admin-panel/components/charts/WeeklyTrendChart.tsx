'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface WeeklyTrendChartProps {
  data?: Array<{
    day: string
    sales: number
    orders: number
    customers: number
  }>
  loading?: boolean
}

const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ 
  data = [
    { day: 'شنبه', sales: 12500000, orders: 85, customers: 45 },
    { day: 'یکشنبه', sales: 8900000, orders: 62, customers: 38 },
    { day: 'دوشنبه', sales: 15200000, orders: 95, customers: 52 },
    { day: 'سه‌شنبه', sales: 18700000, orders: 118, customers: 67 },
    { day: 'چهارشنبه', sales: 22100000, orders: 142, customers: 78 },
    { day: 'پنج‌شنبه', sales: 26800000, orders: 168, customers: 89 },
    { day: 'جمعه', sales: 31200000, orders: 195, customers: 102 }
  ],
  loading = false 
}) => {
  const formatSales = (value: number) => `${(value / 1000000).toFixed(1)}M`

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d9d9d9' }}
            tickLine={{ stroke: '#d9d9d9' }}
          />
          <YAxis 
            yAxisId="sales"
            orientation="left"
            tickFormatter={formatSales}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d9d9d9' }}
            tickLine={{ stroke: '#d9d9d9' }}
          />
          <YAxis 
            yAxisId="count"
            orientation="right"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d9d9d9' }}
            tickLine={{ stroke: '#d9d9d9' }}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'sales' ? `${formatSales(Number(value))} تومان` : `${value} ${name === 'orders' ? 'سفارش' : 'نفر'}`,
              name === 'sales' ? 'فروش' : name === 'orders' ? 'سفارشات' : 'مشتریان'
            ]}
            labelFormatter={(label) => `روز: ${label}`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Legend 
            formatter={(value) => 
              value === 'sales' ? 'فروش (میلیون تومان)' : 
              value === 'orders' ? 'تعداد سفارشات' : 
              'تعداد مشتریان'
            }
            wrapperStyle={{ paddingTop: '10px' }}
          />
          <Line 
            yAxisId="sales"
            type="monotone" 
            dataKey="sales" 
            stroke="#1890ff" 
            strokeWidth={3}
            dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#1890ff', strokeWidth: 2 }}
          />
          <Line 
            yAxisId="count"
            type="monotone" 
            dataKey="orders" 
            stroke="#52c41a" 
            strokeWidth={2}
            dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#52c41a', strokeWidth: 2 }}
          />
          <Line 
            yAxisId="count"
            type="monotone" 
            dataKey="customers" 
            stroke="#fa8c16" 
            strokeWidth={2}
            dot={{ fill: '#fa8c16', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#fa8c16', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeeklyTrendChart
