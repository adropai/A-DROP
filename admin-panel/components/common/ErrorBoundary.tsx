'use client'

import React, { Component, ReactNode } from 'react'
import { Result, Button } from 'antd'

interface Props {
  children: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="خطای غیرمنتظره"
          subTitle="متأسفانه خطایی رخ داده است. لطفاً صفحه را بازخوانی کنید."
          extra={[
            <Button 
              type="primary" 
              key="retry"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                this.props.onRetry?.()
              }}
            >
              تلاش مجدد
            </Button>,
            <Button key="reload" onClick={() => window.location.reload()}>
              بازخوانی صفحه
            </Button>
          ]}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
