// Zustand store for Authentication & Authorization
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, Permission, AuthState, LoginCredentials } from '../types/auth';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  
  // Permission checks
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  
  // Setters
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      async login(credentials: LoginCredentials) {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'خطا در ورود');
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store token in localStorage
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }

        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message,
          });
        }
      },

      // Logout action
      async logout() {
        set({ isLoading: true });
        
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear all auth data
          localStorage.removeItem('auth_token');
          // Clear cookie as well
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Register action
      async register(userData) {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'خطا در ثبت‌نام');
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          if (data.token) {
            localStorage.setItem('authToken', data.token);
          }

        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message,
          });
        }
      },

      // Update profile
      async updateProfile(userData) {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'خطا در به‌روزرسانی پروفایل');
          }

          set({
            user: data.user,
            isLoading: false,
            error: null,
          });

        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message,
          });
        }
      },

      // Check authentication status
      async checkAuth() {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            localStorage.removeItem('authToken');
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          localStorage.removeItem('authToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Refresh token
      async refreshToken() {
        const token = localStorage.getItem('authToken');
        
        if (!token) return;

        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.token);
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      },

      // Forgot password
      async forgotPassword(email: string) {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'خطا در ارسال ایمیل');
          }

          set({ isLoading: false, error: null });

        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message,
          });
        }
      },

      // Reset password
      async resetPassword(token: string, password: string) {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'خطا در تغییر رمز عبور');
          }

          set({ isLoading: false, error: null });

        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message,
          });
        }
      },

      // Permission checks
      hasPermission(permission: string): boolean {
        const { user } = get();
        if (!user || !user.permissions) return false;
        
        return user.permissions.some(p => p.name === permission);
      },

      hasRole(roleName: string): boolean {
        const { user } = get();
        if (!user || !user.role) return false;
        
        return user.role.name === roleName;
      },

      canAccess(resource: string, action: string): boolean {
        const { user } = get();
        if (!user || !user.permissions) return false;
        
        const permissionName = `${resource}:${action}`;
        return get().hasPermission(permissionName);
      },

      // Setters
      setUser(user: User | null) {
        set({ user, isAuthenticated: !!user });
      },

      setLoading(loading: boolean) {
        set({ isLoading: loading });
      },

      setError(error: string | null) {
        set({ error });
      },

      clearError() {
        set({ error: null });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
