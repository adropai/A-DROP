'use client'

import AntdProvider from '@/components/providers/AntdProvider'
import RootDashboard from '@/components/RootDashboard'
import AuthProvider, { useAuth } from '../components/providers/AuthProvider'
import { usePathname } from 'next/navigation'
import { Spin, App } from 'antd'
import './globals.css'

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  const pathname = usePathname()

  // صفحات عمومی که نیاز به dashboard layout ندارند
  const publicPaths = ['/auth/login', '/auth/register', '/']
  const isPublicPath = publicPaths.includes(pathname)

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  // اگر صفحه عمومی است یا کاربر احراز هویت نشده، فقط children را نمایش بده
  if (isPublicPath || !isAuthenticated) {
    return <>{children}</>
  }

  // اگر کاربر احراز هویت شده، dashboard layout را نمایش بده
  return (
    <RootDashboard>
      {children}
    </RootDashboard>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <title>A-DROP Admin Dashboard</title>
        <meta name="description" content="پنل مدیریت رستوران A-DROP" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1890ff" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        <AntdProvider>
          <App>
            <AuthProvider>
              <LayoutContent>
                {children}
              </LayoutContent>
            </AuthProvider>
          </App>
        </AntdProvider>
      </body>
    </html>
  )
}
