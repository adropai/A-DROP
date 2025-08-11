'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface HourlySalesChartProps {
  data?: Array<{
    hour: string
    sales: number
    orders: number
  }>
  loading?: boolean
}

const HourlySalesChart: React.FC<HourlySalesChartProps> = ({ 
  data = [
    { hour: '09:00', sales: 850000, orders: 5 },
    { hour: '10:00', sales: 1200000, orders: 8 },
    { hour: '11:00', sales: 1800000, orders: 12 },
    { hour: '12:00', sales: 3200000, orders: 22 },
    { hour: '13:00', sales: 4100000, orders: 28 },
    { hour: '14:00', sales: 2800000, orders: 18 },
    { hour: '15:00', sales: 1500000, orders: 10 },
    { hour: '16:00', sales: 900000, orders: 6 },
    { hour: '17:00', sales: 1100000, orders: 7 },
    { hour: '18:00', sales: 2200000, orders: 15 },
    { hour: '19:00', sales: 3800000, orders: 25 },
    { hour: '20:00', sales: 4500000, orders: 30 },
    { hour: '21:00', sales: 3600000, orders: 24 },
    { hour: '22:00', sales: 2100000, orders: 14 }
  ],
  loading = false 
}) => {
  const formatSales = (value: number) => `${(value / 1000000).toFixed(1)}M`

  const getBarColor = (value: number) => {
    if (value > 4000000) return '#ff4d4f' // قرمز - اوج فروش
    if (value > 3000000) return '#fa8c16' // نارنجی - فروش بالا
    if (value > 2000000) return '#faad14' // زرد - فروش متوسط
    if (value > 1000000) return '#52c41a' // سبز - فروش پایین
    return '#1890ff' // آبی - فروش خیلی پایین
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
            axisLine={{ stroke: '#d9d9d9' }}
            tickLine={{ stroke: '#d9d9d9' }}
          />
          <YAxis 
            tickFormatter={formatSales}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d9d9d9' }}
            tickLine={{ stroke: '#d9d9d9' }}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'sales' ? `${formatSales(Number(value))} تومان` : `${value} سفارش`,
              name === 'sales' ? 'فروش' : 'تعداد سفارشات'
            ]}
            labelFormatter={(label) => `ساعت: ${label}`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="sales" 
            fill="#1890ff"
            radius={[4, 4, 0, 0]}
            stroke="#096dd9"
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HourlySalesChart
