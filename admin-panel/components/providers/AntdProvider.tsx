'use client'

import React from 'react'
import { ConfigProvider, theme, App } from 'antd'
import faIR from 'antd/lib/locale/fa_IR'

const AntdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConfigProvider
      locale={faIR}
      direction="rtl"
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          fontSize: 14,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        algorithm: theme.defaultAlgorithm
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  )
}

export default AntdProvider
