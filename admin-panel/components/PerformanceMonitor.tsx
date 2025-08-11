'use client'

import { useEffect, useState } from 'react'
import { Card, Progress, Badge, Tooltip, Button, Modal } from 'antd'
import { 
  ThunderboltOutlined, 
  DatabaseOutlined, 
  CloudOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

interface PerformanceMetrics {
  loadTime: number
  bundleSize: number
  memoryUsage: number
  apiCalls: number
  cacheHitRate: number
  errorRate: number
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    apiCalls: 0,
    cacheHitRate: 0,
    errorRate: 0
  })
  const [isVisible, setIsVisible] = useState(false)
  const [recommendations, setRecommendations] = useState<string[]>([])

  useEffect(() => {
    // Performance measurement
    const measurePerformance = () => {
      // Page load time
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.fetchStart

      // Memory usage (if available)
      const memory = (performance as any).memory
      const memoryUsage = memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0

      // Bundle size estimation
      const resourceEntries = performance.getEntriesByType('resource')
      const bundleSize = resourceEntries
        .filter(entry => entry.name.includes('.js') || entry.name.includes('.css'))
        .reduce((total, entry) => total + (entry as any).transferSize || 0, 0)

      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(loadTime),
        bundleSize: Math.round(bundleSize / 1024), // KB
        memoryUsage: Math.round(memoryUsage)
      }))

      // Generate recommendations
      const newRecommendations: string[] = []
      if (loadTime > 3000) {
        newRecommendations.push('زمان بارگذاری بیش از حد انتظار است - از lazy loading استفاده کنید')
      }
      if (bundleSize / 1024 > 1000) { // > 1MB
        newRecommendations.push('حجم bundle زیاد است - code splitting را فعال کنید')
      }
      if (memoryUsage > 80) {
        newRecommendations.push('مصرف حافظه بالا است - memory leaks را بررسی کنید')
      }
      
      setRecommendations(newRecommendations)
    }

    // Measure after component mount
    setTimeout(measurePerformance, 1000)

    // Track API calls and cache hits
    const originalFetch = window.fetch
    let apiCallCount = 0
    let cacheHits = 0

    window.fetch = async (...args) => {
      apiCallCount++
      const response = await originalFetch(...args)
      
      // Check if response came from cache
      if (response.headers.get('x-cache') === 'HIT') {
        cacheHits++
      }

      setMetrics(prev => ({
        ...prev,
        apiCalls: apiCallCount,
        cacheHitRate: apiCallCount > 0 ? Math.round((cacheHits / apiCallCount) * 100) : 0
      }))

      return response
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  const getPerformanceStatus = (value: number, thresholds: { good: number; average: number }) => {
    if (value <= thresholds.good) return 'success'
    if (value <= thresholds.average) return 'warning'
    return 'error'
  }

  const getLoadTimeStatus = () => getPerformanceStatus(metrics.loadTime, { good: 2000, average: 5000 })
  const getBundleSizeStatus = () => getPerformanceStatus(metrics.bundleSize, { good: 500, average: 1000 })
  const getMemoryStatus = () => getPerformanceStatus(metrics.memoryUsage, { good: 50, average: 80 })

  const performanceScore = () => {
    const loadScore = metrics.loadTime <= 2000 ? 100 : Math.max(0, 100 - (metrics.loadTime - 2000) / 100)
    const bundleScore = metrics.bundleSize <= 500 ? 100 : Math.max(0, 100 - (metrics.bundleSize - 500) / 10)
    const memoryScore = metrics.memoryUsage <= 50 ? 100 : Math.max(0, 100 - (metrics.memoryUsage - 50) * 2)
    const cacheScore = metrics.cacheHitRate
    
    return Math.round((loadScore + bundleScore + memoryScore + cacheScore) / 4)
  }

  const score = performanceScore()

  return (
    <>
      <Tooltip title="نمایش جزئیات عملکرد">
        <Badge 
          count={recommendations.length} 
          size="small"
          className="fixed bottom-4 left-4 z-50"
        >
          <Button
            type="primary"
            shape="circle"
            icon={<ThunderboltOutlined />}
            onClick={() => setIsVisible(true)}
            className="shadow-lg"
          />
        </Badge>
      </Tooltip>

      <Modal
        title="مانیتور عملکرد سیستم"
        open={isVisible}
        onCancel={() => setIsVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          {/* Overall Performance Score */}
          <Card size="small">
            <div className="text-center">
              <Progress
                type="circle"
                percent={score}
                status={score >= 80 ? 'success' : score >= 60 ? 'normal' : 'exception'}
                format={percent => `${percent}%`}
              />
              <div className="mt-2 text-sm text-gray-600">امتیاز کلی عملکرد</div>
            </div>
          </Card>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card size="small" title="زمان بارگذاری">
              <div className="flex items-center justify-between">
                <span>{metrics.loadTime}ms</span>
                <Badge 
                  status={getLoadTimeStatus() as any} 
                  text={getLoadTimeStatus() === 'success' ? 'عالی' : 
                        getLoadTimeStatus() === 'warning' ? 'متوسط' : 'ضعیف'} 
                />
              </div>
            </Card>

            <Card size="small" title="حجم Bundle">
              <div className="flex items-center justify-between">
                <span>{metrics.bundleSize}KB</span>
                <Badge 
                  status={getBundleSizeStatus() as any}
                  text={getBundleSizeStatus() === 'success' ? 'عالی' : 
                        getBundleSizeStatus() === 'warning' ? 'متوسط' : 'ضعیف'}
                />
              </div>
            </Card>

            <Card size="small" title="مصرف حافظه">
              <div className="flex items-center justify-between">
                <span>{metrics.memoryUsage}%</span>
                <Badge 
                  status={getMemoryStatus() as any}
                  text={getMemoryStatus() === 'success' ? 'عالی' : 
                        getMemoryStatus() === 'warning' ? 'متوسط' : 'ضعیف'}
                />
              </div>
            </Card>

            <Card size="small" title="نرخ Cache Hit">
              <div className="flex items-center justify-between">
                <span>{metrics.cacheHitRate}%</span>
                <Badge 
                  status={metrics.cacheHitRate >= 70 ? 'success' : 
                         metrics.cacheHitRate >= 40 ? 'warning' : 'error'}
                  text={metrics.cacheHitRate >= 70 ? 'عالی' : 
                        metrics.cacheHitRate >= 40 ? 'متوسط' : 'ضعیف'}
                />
              </div>
            </Card>
          </div>

          {/* API Calls Counter */}
          <Card size="small">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DatabaseOutlined />
                <span>تعداد درخواست‌های API</span>
              </div>
              <Badge count={metrics.apiCalls} showZero />
            </div>
          </Card>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card 
              size="small" 
              title={
                <div className="flex items-center space-x-2">
                  <WarningOutlined className="text-orange-500" />
                  <span>پیشنهادات بهینه‌سازی</span>
                </div>
              }
            >
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {rec}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Performance Tips */}
          <Card 
            size="small" 
            title={
              <div className="flex items-center space-x-2">
                <CheckCircleOutlined className="text-green-500" />
                <span>نکات بهینه‌سازی</span>
              </div>
            }
          >
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• از Image Optimization استفاده کنید</li>
              <li>• Component های سنگین را lazy load کنید</li>
              <li>• SWR caching را فعال کنید</li>
              <li>• Bundle size را کنترل کنید</li>
              <li>• Database queries را optimize کنید</li>
            </ul>
          </Card>
        </div>
      </Modal>
    </>
  )
}

export default PerformanceMonitor
