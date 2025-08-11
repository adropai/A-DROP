// Zustand store for Staff Management
import { create } from 'zustand';
import { Staff, Shift, StaffStats } from '../types/staff';

interface StaffState {
  staff: Staff[];
  shifts: Shift[];
  stats: StaffStats | null;
  loading: boolean;
  error: string | null;
  fetchStaff: () => Promise<void>;
  fetchShifts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addStaff: (data: Partial<Staff>) => Promise<void>;
  updateStaff: (id: string, data: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  addShift: (data: Partial<Shift>) => Promise<void>;
  updateShift: (id: string, data: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStaffStore = create<StaffState>((set) => ({
  staff: [],
  shifts: [],
  stats: null,
  loading: false,
  error: null,
  async fetchStaff() {
    set({ loading: true });
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      set({ staff: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت کارکنان', loading: false });
    }
  },
  async fetchShifts() {
    set({ loading: true });
    try {
      const res = await fetch('/api/staff/shifts');
      const data = await res.json();
      set({ shifts: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت شیفت‌ها', loading: false });
    }
  },
  async fetchStats() {
    set({ loading: true });
    try {
      const res = await fetch('/api/staff/stats');
      const data = await res.json();
      set({ stats: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت آمار', loading: false });
    }
  },
  async addStaff(data) {
    set({ loading: true });
    try {
      await fetch('/api/staff', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useStaffStore.getState().fetchStaff());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ثبت کارمند', loading: false });
    }
  },
  async updateStaff(id, data) {
    set({ loading: true });
    try {
      await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useStaffStore.getState().fetchStaff());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ویرایش کارمند', loading: false });
    }
  },
  async deleteStaff(id) {
    set({ loading: true });
    try {
      await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      await (useStaffStore.getState().fetchStaff());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در حذف کارمند', loading: false });
    }
  },
  async addShift(data) {
    set({ loading: true });
    try {
      await fetch('/api/staff/shifts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useStaffStore.getState().fetchShifts());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ثبت شیفت', loading: false });
    }
  },
  async updateShift(id, data) {
    set({ loading: true });
    try {
      await fetch(`/api/staff/shifts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useStaffStore.getState().fetchShifts());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ویرایش شیفت', loading: false });
    }
  },
  async deleteShift(id) {
    set({ loading: true });
    try {
      await fetch(`/api/staff/shifts/${id}`, { method: 'DELETE' });
      await (useStaffStore.getState().fetchShifts());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در حذف شیفت', loading: false });
    }
  },
  setLoading(loading) {
    set({ loading });
  },
  setError(error) {
    set({ error });
  },
}));
