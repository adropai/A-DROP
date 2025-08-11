'use client'

import React from 'react'
import { Result, Button, Alert } from 'antd'
import { ReloadOutlined, BugOutlined } from '@ant-design/icons'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onRetry?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{ padding: '24px' }}>
          <Result
            status="error"
            title="خطا در نمایش داده‌ها"
            subTitle="متأسفانه خطایی در نمایش این بخش رخ داده است."
            extra={[
              <Button 
                type="primary" 
                key="retry"
                icon={<ReloadOutlined />}
                onClick={() => {
                  this.setState({ hasError: false, error: undefined })
                  this.props.onRetry?.()
                }}
              >
                تلاش مجدد
              </Button>,
              <Button key="details" icon={<BugOutlined />}>
                گزارش خطا
              </Button>
            ]}
          />
          
          {this.state.error && (
            <Alert
              message="جزئیات خطا"
              description={this.state.error.message}
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Hook برای مدیریت خطاهای async
export const useErrorHandler = () => {
  const [error, setError] = React.useState<string | null>(null)

  const handleError = (error: unknown, customMessage?: string) => {
    const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص'
    setError(customMessage || errorMessage)
    console.error('Dashboard Error:', error)
  }

  const clearError = () => setError(null)

  return { error, handleError, clearError }
}

export default ErrorBoundary
