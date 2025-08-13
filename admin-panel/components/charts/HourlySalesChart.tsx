'use client'

import React from 'react'
import { Line } from 'react-chartjs-2'

const HourlySalesChart: React.FC<any> = ({ data, ...props }) => {
  const chartData = {
    labels: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    datasets: [
      {
        label: 'فروش ساعتی امروز',
        data: [5, 15, 35, 25, 20, 40, 45, 30],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true
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
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return <Line data={chartData} options={options} {...props} />
}

export default HourlySalesChart
