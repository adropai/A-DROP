'use client'

import React from 'react'
import { Bar } from 'react-chartjs-2'

const AnalyticsChart: React.FC<any> = ({ data, ...props }) => {
  const chartData = {
    labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
    datasets: [
      {
        label: 'درآمد ماهانه (میلیون تومان)',
        data: [120, 150, 180, 200, 160, 140],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
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

  return <Bar data={chartData} options={options} {...props} />
}

export default AnalyticsChart
