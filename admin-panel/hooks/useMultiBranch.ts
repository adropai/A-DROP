// React Hook for Multi-Branch Management
import { useState, useEffect } from 'react';
import { Branch, BranchMenu, BranchSettings, BranchStaff } from '../lib/multi-branch-system';

export function useMultiBranch() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // دریافت لیست تمام شعب
  async function fetchBranches() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branches');
      if (!response.ok) throw new Error('خطا در دریافت شعب');
      
      const data = await response.json();
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
    } finally {
      setLoading(false);
    }
  }

  // دریافت شعبه خاص
  async function fetchBranch(branchId: string): Promise<Branch | null> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/branches?branchId=${branchId}`);
      if (!response.ok) throw new Error('شعبه یافت نشد');
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return null;
    } finally {
      setLoading(false);
    }
  }

  // ایجاد شعبه جدید
  async function createBranch(branchData: Partial<Branch>): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در ایجاد شعبه');
      }

      const result = await response.json();
      await fetchBranches(); // بروزرسانی لیست
      return result.branchId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return null;
    } finally {
      setLoading(false);
    }
  }

  // بروزرسانی شعبه
  async function updateBranch(branchId: string, updates: Partial<Branch>): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId, updates })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در بروزرسانی شعبه');
      }

      await fetchBranches(); // بروزرسانی لیست
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return false;
    } finally {
      setLoading(false);
    }
  }

  // حذف شعبه
  async function deleteBranch(branchId: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/branches?branchId=${branchId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در حذف شعبه');
      }

      await fetchBranches(); // بروزرسانی لیست
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBranches();
  }, []);

  return {
    branches,
    loading,
    error,
    fetchBranches,
    fetchBranch,
    createBranch,
    updateBranch,
    deleteBranch
  };
}

export function useBranchMenu(branchId: string) {
  const [menu, setMenu] = useState<BranchMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // دریافت منوی شعبه
  async function fetchMenu() {
    if (!branchId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/branches/menu?branchId=${branchId}`);
      if (!response.ok) throw new Error('منوی شعبه یافت نشد');
      
      const data = await response.json();
      setMenu(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
    } finally {
      setLoading(false);
    }
  }

  // بروزرسانی منوی شعبه
  async function updateMenu(menuData: Partial<BranchMenu>): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branches/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId, ...menuData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در بروزرسانی منو');
      }

      await fetchMenu(); // بروزرسانی منو
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return false;
    } finally {
      setLoading(false);
    }
  }

  // بروزرسانی قیمت آیتم
  async function updateItemPrice(itemId: string, price: number): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branches/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId, itemId, price })
      });

      if (!response.ok) throw new Error('خطا در بروزرسانی قیمت');

      await fetchMenu(); // بروزرسانی منو
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMenu();
  }, [branchId]);

  return {
    menu,
    loading,
    error,
    fetchMenu,
    updateMenu,
    updateItemPrice
  };
}

export function useBranchStaff(branchId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // افزودن کارمند
  async function addStaff(staffData: BranchStaff): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branches/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId, ...staffData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در افزودن کارمند');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return false;
    } finally {
      setLoading(false);
    }
  }

  // حذف کارمند
  async function removeStaff(userId: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/branches/staff?branchId=${branchId}&userId=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در حذف کارمند');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return false;
    } finally {
      setLoading(false);
    }
  }

  // بروزرسانی دسترسی‌ها
  async function updatePermissions(userId: string, permissions: string[]): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/branches/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId, userId, permissions })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در بروزرسانی دسترسی‌ها');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    addStaff,
    removeStaff,
    updatePermissions
  };
}
