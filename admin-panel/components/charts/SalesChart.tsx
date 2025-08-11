'use client'

import React from 'react'
import { Card } from 'antd'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SalesChartProps {
  data?: Array<{
    month: string
    sales: number
    orders: number
  }>
  loading?: boolean
}

const SalesChart: React.FC<SalesChartProps> = ({ 
  data = [
    { month: 'فروردین', sales: 45000000, orders: 120 },
    { month: 'اردیبهشت', sales: 52000000, orders: 140 },
    { month: 'خرداد', sales: 48000000, orders: 135 },
    { month: 'تیر', sales: 61000000, orders: 165 },
    { month: 'مرداد', sales: 55000000, orders: 150 },
    { month: 'شهریور', sales: 67000000, orders: 180 }
  ],
  loading = false 
}) => {
  const formatSales = (value: number) => `${(value / 1000000).toFixed(0)}M`

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={formatSales}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'sales' ? formatSales(Number(value)) : value,
              name === 'sales' ? 'فروش (تومان)' : 'تعداد سفارش'
            ]}
            labelStyle={{ color: '#000' }}
          />
          <Bar dataKey="sales" fill="#1890ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesChart
