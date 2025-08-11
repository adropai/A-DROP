import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/menu',
  '/orders',
  '/customers',
  '/staff',
  '/inventory',
  '/analytics',
  '/settings',
  '/kitchen',
  '/delivery',
  '/cashier',
  '/tables',
  '/marketing',
  '/reservation',
  '/ai-training',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and other assets
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get token from cookie or Authorization header
  const authToken = request.cookies.get('auth_token')?.value ||
                   request.headers.get('authorization')?.replace('Bearer ', '');
  
  const hasToken = !!authToken;
  
  // Debug log (only in development and for specific paths)
  if (process.env.NODE_ENV === 'development' && (pathname === '/dashboard' || pathname.startsWith('/auth'))) {
    // Debug log - only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Middleware:', pathname, hasToken ? '✅ Auth' : '❌ No Auth');
    }
  }

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route)
  );

  // If it's a protected route and user is not authenticated
  if (isProtectedRoute && !authToken) {
    // Redirect to login page
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token for protected routes
  if (isProtectedRoute && authToken) {
    try {
      jwt.verify(authToken, JWT_SECRET);
      // Token is valid, continue
    } catch (error) {
      // Token is invalid, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      
      // Clear invalid token
      response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0
      });
      
      return response;
    }
  }

  // If user is authenticated and trying to access auth pages
  if (authToken && isPublicRoute && pathname.startsWith('/auth')) {
    // Verify token first
    try {
      jwt.verify(authToken, JWT_SECRET);
      // Token is valid, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Token is invalid, allow access to auth pages
    }
  }

  // Add security headers
  const response = NextResponse.next();

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Security Headers برای production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
