'use client'

import React from 'react'
import { Line } from 'react-chartjs-2'

const WeeklyTrendChart: React.FC<any> = ({ data, ...props }) => {
  const chartData = {
    labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
    datasets: [
      {
        label: 'فروش هفتگی',
        data: [65, 78, 66, 44, 56, 67, 75],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  return <Line data={chartData} options={options} {...props} />
}

export default WeeklyTrendChart
