'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Spin, Alert } from 'antd'
import { useAuthStore } from '@/stores/auth-store'

interface AuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

export default function AuthWrapper({ 
  children, 
  requireAuth = true, 
  allowedRoles = [],
  fallback 
}: AuthWrapperProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth, hasRole } = useAuthStore()

  // مسیرهای عمومی که نیاز به احراز هویت ندارند
  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated && requireAuth && !isPublicPath) {
        await checkAuth()
      }
      setIsInitialized(true)
    }

    initAuth()
  }, [pathname, isAuthenticated, requireAuth, isPublicPath, checkAuth])

  // در حال بارگذاری
  if (!isInitialized || isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  // مسیر عمومی - نمایش محتوا
  if (isPublicPath || !requireAuth) {
    return <>{children}</>
  }

  // کاربر احراز هویت نشده
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>
    }

    // هدایت به صفحه ورود
    router.push(`/auth/login?redirect=${pathname}`)
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  // بررسی نقش کاربر
  if (allowedRoles.length > 0 && !allowedRoles.some(role => hasRole(role))) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: '20px'
      }}>
        <Alert
          message="دسترسی محدود"
          description={`شما به این بخش دسترسی ندارید. نقش فعلی: ${user.role?.name || 'نامشخص'}`}
          type="warning"
          showIcon
          action={
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                border: 'none',
                background: '#1890ff',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              بازگشت به داشبورد
            </button>
          }
        />
      </div>
    )
  }

  // نمایش محتوا
  return <>{children}</>
}

// HOC برای صفحات محافظت شده
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    requireAuth?: boolean
    allowedRoles?: string[]
    fallback?: React.ReactNode
  } = {}
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <AuthWrapper {...options}>
        <Component {...props} />
      </AuthWrapper>
    )
  }
}

// Hook برای استفاده در کامپوننت‌ها
export function useAuthGuard(requiredRoles: string[] = []) {
  const { user, isAuthenticated, hasRole } = useAuthStore()
  
  const canAccess = React.useMemo(() => {
    if (!isAuthenticated || !user) return false
    if (requiredRoles.length === 0) return true
    return requiredRoles.some(role => hasRole(role))
  }, [isAuthenticated, user, requiredRoles, hasRole])

  const userRole = user?.role?.name || null
  const userPermissions = user?.permissions || []

  return {
    canAccess,
    user,
    userRole,
    userPermissions,
    isAuthenticated
  }
}
