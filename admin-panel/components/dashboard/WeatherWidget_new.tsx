'use client'

import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Spin, Button } from 'antd'
import { 
  CloudOutlined,
  SunOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'

const { Text } = Typography

interface WeatherData {
  location: string
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
  feels_like: number
}

interface WeatherWidgetProps {
  city?: string
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  city = "تهران" 
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock weather data for demonstration
  const mockWeatherData: WeatherData = {
    location: city,
    temperature: 22,
    description: "آفتابی",
    humidity: 45,
    windSpeed: 8,
    icon: "sunny",
    feels_like: 24
  }

  const fetchWeather = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWeather(mockWeatherData)
    } catch (err) {
      setError('خطا در دریافت اطلاعات آب و هوا')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [city])

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sunny':
        return <SunOutlined style={{ color: '#faad14', fontSize: '24px' }} />
      case 'cloudy':
        return <CloudOutlined style={{ color: '#8c8c8c', fontSize: '24px' }} />
      case 'rainy':
        return <ThunderboltOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
      default:
        return <SunOutlined style={{ color: '#faad14', fontSize: '24px' }} />
    }
  }

  return (
    <Card
      title={
        <Space>
          <CloudOutlined />
          <span>آب و هوا</span>
        </Space>
      }
      extra={
        <Button 
          type="text" 
          size="small" 
          icon={<ReloadOutlined spin={loading} />}
          onClick={fetchWeather}
        />
      }
      style={{ height: '100%' }}
      loading={loading}
    >
      {error ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="danger">{error}</Text>
          <br />
          <Button type="link" onClick={fetchWeather}>
            تلاش مجدد
          </Button>
        </div>
      ) : weather ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="small">
              <div>
                <Space>
                  <EnvironmentOutlined style={{ color: '#1890ff' }} />
                  <Text strong>{weather.location}</Text>
                </Space>
              </div>
              
              <div style={{ margin: '16px 0' }}>
                {getWeatherIcon(weather.icon)}
                <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
                  {weather.temperature}°C
                </div>
                <Text type="secondary">{weather.description}</Text>
              </div>
            </Space>
          </div>
          
          <div>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">احساس می‌شود:</Text>
                <Text>{weather.feels_like}°C</Text>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">رطوبت:</Text>
                <Text>{weather.humidity}%</Text>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">سرعت باد:</Text>
                <Text>{weather.windSpeed} km/h</Text>
              </div>
            </Space>
          </div>
          
          <div style={{ fontSize: '11px', color: '#999', textAlign: 'center' }}>
            آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
          </div>
        </Space>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      )}
    </Card>
  )
}

export default WeatherWidget
