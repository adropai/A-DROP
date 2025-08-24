/**
 * Hydration Error Fixer for A-DROP Admin Panel
 */

'use client'

import React, { useEffect, useState } from 'react'
import { ConfigProvider } from 'antd'
import type { ThemeConfig } from 'antd'

interface HydrationSafeProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const HydrationSafe: React.FC<HydrationSafeProps> = ({ 
  children, 
  fallback = null 
}) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return React.createElement(React.Fragment, null, fallback)
  }

  return React.createElement(React.Fragment, null, children)
}

// Enhanced Hydration Safe Component for Ant Design
export const AntdHydrationSafe: React.FC<HydrationSafeProps> = ({ 
  children, 
  fallback = null 
}) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    
    // Fix any remaining hydration issues after mount
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        // Force re-render of Ant Design components that might have hydration issues
        const antdElements = document.querySelectorAll('[class*="ant-"]')
        antdElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            const currentClass = el.className
            el.className = currentClass
          }
        })
      }, 100)
    }
  }, [])

  if (!hasMounted) {
    return React.createElement(React.Fragment, null, fallback)
  }

  return React.createElement(React.Fragment, null, children)
}

export const HydrationSafeConfigProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const theme: ThemeConfig = {
    token: {
      borderRadius: 6,
      colorPrimary: '#1890ff',
      wireframe: false,
    },
    components: {
      Table: {
        borderRadiusLG: 6,
        padding: 16,
        paddingXS: 8,
      },
      Card: {
        borderRadiusLG: 6,
        padding: 24,
        paddingLG: 24,
      },
      Form: {
        itemMarginBottom: 24,
        verticalLabelPadding: '0 0 8px',
      },
    },
  }

  return React.createElement(
    ConfigProvider,
    {
      theme: theme,
      direction: "rtl",
    },
    React.createElement(HydrationSafe, null, children)
  )
}

export const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}

interface ProTableWrapperProps {
  children: React.ReactNode
  loading?: boolean
}

export const ProTableWrapper: React.FC<ProTableWrapperProps> = ({ 
  children, 
  loading = false 
}) => {
  const hasMounted = useHasMounted()

  if (!hasMounted) {
    return React.createElement(
      'div',
      {
        style: {
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          borderRadius: '6px',
          border: '1px solid #d9d9d9'
        }
      },
      React.createElement(
        'div', 
        {
          style: {
            textAlign: 'center',
            color: '#8c8c8c',
            fontSize: '14px'
          }
        }, 
        'در حال بارگذاری جدول...'
      )
    )
  }

  return React.createElement(AntdHydrationSafe, null, children)
}

export const getConsistentProTableProps = () => {
  return {
    pagination: {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} از ${total} مورد`,
    },
    search: {
      labelWidth: 'auto' as const,
      searchText: 'جستجو',
      resetText: 'پاک کردن',
      collapseRender: (collapsed: boolean) => 
        collapsed ? 'نمایش فیلترها' : 'پنهان کردن فیلترها',
    },
    options: {
      search: true,
      reload: true,
      setting: true,
      density: true,
    },
    dateFormatter: 'string' as const,
    headerTitle: false,
    size: 'middle' as const,
    scroll: { x: 800 }
  }
}

export const ConsistentLoadingSkeleton: React.FC<{ 
  rows?: number
  columns?: number 
}> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  const skeletonItems: React.ReactElement[] = []
  
  for (let i = 0; i < rows; i++) {
    const rowItems: React.ReactElement[] = []
    for (let j = 0; j < columns; j++) {
      rowItems.push(
        React.createElement('div', {
          key: j,
          style: {
            flex: 1,
            height: '32px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
          }
        })
      )
    }
    
    skeletonItems.push(
      React.createElement('div', {
        key: i,
        style: {
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
        }
      }, ...rowItems)
    )
  }

  return React.createElement('div', {
    style: { padding: '24px' }
  }, ...skeletonItems)
}

export const withHydrationSafety = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const hasMounted = useHasMounted()
    
    if (!hasMounted) {
      return React.createElement(ConsistentLoadingSkeleton)
    }
    
    return React.createElement(Component, props)
  }
  
  WrappedComponent.displayName = `withHydrationSafety(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default {
  HydrationSafe,
  AntdHydrationSafe,
  HydrationSafeConfigProvider,
  ProTableWrapper,
  useHasMounted,
  ConsistentLoadingSkeleton,
  getConsistentProTableProps,
  withHydrationSafety
}
