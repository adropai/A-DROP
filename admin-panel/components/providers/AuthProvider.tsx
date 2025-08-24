'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  user: any
  login: (token: string, userData: any) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // صفحات عمومی که نیاز به احراز هویت ندارند
  const publicPaths = ['/auth/login', '/auth/register', '/']

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')

      if (token && userData) {
        try {
          // بررسی معتبر بودن token با API
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const result = await response.json()
            setIsAuthenticated(true)
            setUser(result.user)
          } else {
            // Token معتبر نیست، پاک کن
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            setIsAuthenticated(false)
            setUser(null)
          }
        } catch (error) {
          console.error('Token validation failed:', error)
          // خطا در validation، پاک کن
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          setIsAuthenticated(false)
          setUser(null)
        }
      }

      setLoading(false)
    }

    validateToken()
  }, [])

  useEffect(() => {
    if (!loading) {
      const isPublicPath = publicPaths.includes(pathname)
      
      if (!isAuthenticated && !isPublicPath) {
        // اگر کاربر احراز هویت نشده و صفحه عمومی نیست، به login هدایت کن
        router.push('/auth/login')
      } else if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/')) {
        // اگر کاربر احراز هویت شده و در صفحه login است، به dashboard هدایت کن
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, pathname, loading, router])

  const login = (token: string, userData: any) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_data', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
    router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/auth/login')
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
