'use client'

import { Inter } from 'next/font/google'
import AntdProvider from '@/components/providers/AntdProvider'
import RootDashboard from '@/components/RootDashboard'
import AuthProvider from '../components/providers/AuthProvider'
import './globals.css'

// Suppress Ant Design warnings and setup comprehensive error handling
if (typeof window !== 'undefined') {
  import('@/lib/suppress-warnings')
  import('@/lib/metamask-suppressor')
  import('@/lib/comprehensive-error-handler')
}

const inter = Inter({ subsets: ['latin'] })

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
      </head>
      <body className={inter.className}>
        <AntdProvider>
          <AuthProvider>
            <RootDashboard>
              {children}
            </RootDashboard>
          </AuthProvider>
        </AntdProvider>
      </body>
    </html>
  )
}
