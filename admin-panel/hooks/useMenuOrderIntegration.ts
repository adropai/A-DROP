/**
 * 🔗 Hook برای یکپارچگی Menu و Orders
 * مدیریت ارتباط بین منو و سفارشات
 */

import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  preparationTime?: number;
  image?: string;
  description?: string;
  totalSold?: number;
}

interface OrderItem {
  id: string;
  menuId: string;
  menuItem?: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

interface UseMenuOrderIntegrationReturn {
  // Menu data
  menuItems: MenuItem[];
  menuCategories: string[];
  availableItems: MenuItem[];
  
  // Order cart
  cartItems: OrderItem[];
  cartTotal: number;
  cartCount: number;
  
  // Loading states
  loading: boolean;
  submitting: boolean;
  
  // Functions
  loadMenuItems: () => Promise<void>;
  addToCart: (menuId: string, quantity: number, notes?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  createOrder: (customerData: any, orderData: any) => Promise<boolean>;
  getMenuItemById: (menuId: string) => MenuItem | undefined;
  getPopularItems: () => MenuItem[];
  searchMenuItems: (query: string) => MenuItem[];
  filterByCategory: (category: string) => MenuItem[];
}

export function useMenuOrderIntegration(): UseMenuOrderIntegrationReturn {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cartItems, setCartItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  /**
   * بارگذاری آیتم‌های منو
   */
  const loadMenuItems = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/menu', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMenuItems(result.data)
        } else {
          throw new Error(result.error)
        }
      } else {
        throw new Error('خطا در دریافت منو')
      }
    } catch (error) {
      console.error('خطا در بارگذاری منو:', error)
      message.error('خطا در بارگذاری منو')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * افزودن آیتم به سبد خرید
   */
  const addToCart = useCallback(async (menuId: string, quantity: number, notes?: string) => {
    const menuItem = menuItems.find(item => item.id === menuId)
    
    if (!menuItem) {
      message.error('آیتم منو یافت نشد')
      return
    }

    if (!menuItem.available) {
      message.error('این آیتم در حال حاضر موجود نیست')
      return
    }

    // بررسی وجود در سبد
    const existingItemIndex = cartItems.findIndex(item => item.menuId === menuId)
    
    if (existingItemIndex >= 0) {
      // بروزرسانی آیتم موجود
      const updatedCart = [...cartItems]
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + quantity,
        notes: notes || updatedCart[existingItemIndex].notes
      }
      setCartItems(updatedCart)
    } else {
      // افزودن آیتم جدید
      const newItem: OrderItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        menuId,
        menuItem,
        quantity,
        price: menuItem.price,
        notes
      }
      setCartItems(prev => [...prev, newItem])
    }

    message.success(`${menuItem.name} به سبد خرید اضافه شد`)
  }, [menuItems, cartItems])

  /**
   * بروزرسانی آیتم در سبد
   */
  const updateCartItem = useCallback((itemId: string, quantity: number, notes?: string) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity, notes: notes !== undefined ? notes : item.notes }
        : item
    ))
  }, [])

  /**
   * حذف آیتم از سبد
   */
  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
    message.success('آیتم از سبد خرید حذف شد')
  }, [])

  /**
   * پاک کردن سبد خرید
   */
  const clearCart = useCallback(() => {
    setCartItems([])
    message.info('سبد خرید پاک شد')
  }, [])

  /**
   * ایجاد سفارش
   */
  const createOrder = useCallback(async (customerData: any, orderData: any): Promise<boolean> => {
    if (cartItems.length === 0) {
      message.error('سبد خرید خالی است')
      return false
    }

    setSubmitting(true)
    try {
      // محاسبه کل مبلغ سبد خرید
      const currentCartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      
      // آماده‌سازی داده‌های سفارش
      const orderPayload = {
        customer: customerData,
        items: cartItems.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })),
        totalAmount: currentCartTotal,
        ...orderData
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          message.success('سفارش با موفقیت ثبت شد')
          clearCart()
          return true
        } else {
          throw new Error(result.error)
        }
      } else {
        throw new Error('خطا در ثبت سفارش')
      }
    } catch (error) {
      console.error('خطا در ایجاد سفارش:', error)
      message.error('خطا در ثبت سفارش')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [cartItems, clearCart])

  /**
   * جستجوی آیتم منو با ID
   */
  const getMenuItemById = useCallback((menuId: string): MenuItem | undefined => {
    return menuItems.find(item => item.id === menuId)
  }, [menuItems])

  /**
   * دریافت آیتم‌های محبوب
   */
  const getPopularItems = useCallback((): MenuItem[] => {
    return menuItems
      .filter(item => item.available && item.totalSold)
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, 10)
  }, [menuItems])

  /**
   * جستجو در منو
   */
  const searchMenuItems = useCallback((query: string): MenuItem[] => {
    if (!query.trim()) return menuItems

    const searchTerm = query.toLowerCase().trim()
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    )
  }, [menuItems])

  /**
   * فیلتر بر اساس دسته‌بندی
   */
  const filterByCategory = useCallback((category: string): MenuItem[] => {
    if (!category) return menuItems
    return menuItems.filter(item => item.category === category)
  }, [menuItems])

  // Computed values
  const menuCategories = [...new Set(menuItems.map(item => item.category))]
  const availableItems = menuItems.filter(item => item.available)
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  // بارگذاری اولیه منو
  useEffect(() => {
    loadMenuItems()
  }, [loadMenuItems])

  return {
    // Menu data
    menuItems,
    menuCategories,
    availableItems,
    
    // Order cart
    cartItems,
    cartTotal,
    cartCount,
    
    // Loading states
    loading,
    submitting,
    
    // Functions
    loadMenuItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    createOrder,
    getMenuItemById,
    getPopularItems,
    searchMenuItems,
    filterByCategory
  }
}
