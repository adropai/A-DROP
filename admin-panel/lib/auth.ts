// Authentication utilities
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

export async function verifyAuth(request: NextRequest): Promise<{ success: boolean; user?: AuthUser }> {
  try {
    // دریافت token از cookie یا header
    const token = request.cookies.get('auth_token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return { success: false };
    }

    // تایید JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    return { 
      success: true, 
      user: {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || []
      }
    };

  } catch (error) {
    console.error('Token verification failed:', error);
    return { success: false };
  }
}

export function hasPermission(user: AuthUser, permission: string): boolean {
  // Super admin has all permissions
  if (user.role === 'SUPER_ADMIN' || user.permissions.includes('*')) {
    return true;
  }
  
  // Check specific permission
  return user.permissions.includes(permission);
}

export function hasRole(user: AuthUser, role: string): boolean {
  return user.role === role;
}
