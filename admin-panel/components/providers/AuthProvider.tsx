'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/auth-store';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Only check auth if we don't have user data already
          if (!user) {
            await checkAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [checkAuth, logout, user]);

  useEffect(() => {
    // Handle route protection after loading is complete
    if (!loading) {
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if not authenticated and accessing protected route
        const redirectUrl = pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
        router.push(`/auth/login${redirectUrl}`);
      } else if (isAuthenticated && pathname.startsWith('/auth')) {
        // Redirect to dashboard if authenticated and accessing auth pages
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, isPublicRoute, pathname, router]);

  // Show loading spinner during authentication check
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <p style={{ color: '#666', fontSize: '14px' }}>در حال بارگذاری...</p>
      </div>
    );
  }

  // For public routes, always show content
  if (isPublicRoute) {
    return (
      <AuthContext.Provider value={{ user, loading, isAuthenticated }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // For protected routes, only show content if authenticated
  if (isAuthenticated) {
    return (
      <AuthContext.Provider value={{ user, loading, isAuthenticated }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Show loading while redirecting
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <Spin size="large" />
      <p style={{ color: '#666', fontSize: '14px' }}>در حال هدایت به صفحه ورود...</p>
    </div>
  );
}
