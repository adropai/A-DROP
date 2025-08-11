// Zustand store for Reservation System
import { create } from 'zustand';
import { Reservation, Table, ReservationStats } from '../types/reservation';

interface ReservationState {
  reservations: Reservation[];
  tables: Table[];
  stats: ReservationStats | null;
  loading: boolean;
  error: string | null;
  fetchReservations: () => Promise<void>;
  fetchTables: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addReservation: (data: Partial<Reservation>) => Promise<void>;
  updateReservation: (id: string, data: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  reservations: [],
  tables: [],
  stats: null,
  loading: false,
  error: null,
  async fetchReservations() {
    set({ loading: true });
    try {
      const res = await fetch('/api/reservation');
      const data = await res.json();
      set({ reservations: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت رزروها', loading: false });
    }
  },
  async fetchTables() {
    set({ loading: true });
    try {
      const res = await fetch('/api/reservation/tables');
      const data = await res.json();
      set({ tables: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت میزها', loading: false });
    }
  },
  async fetchStats() {
    set({ loading: true });
    try {
      const res = await fetch('/api/reservation/stats');
      const data = await res.json();
      set({ stats: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت آمار', loading: false });
    }
  },
  async addReservation(data) {
    set({ loading: true });
    try {
      await fetch('/api/reservation', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useReservationStore.getState().fetchReservations());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ثبت رزرو', loading: false });
    }
  },
  async updateReservation(id, data) {
    set({ loading: true });
    try {
      await fetch(`/api/reservation/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useReservationStore.getState().fetchReservations());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ویرایش رزرو', loading: false });
    }
  },
  async deleteReservation(id) {
    set({ loading: true });
    try {
      await fetch(`/api/reservation/${id}`, { method: 'DELETE' });
      await (useReservationStore.getState().fetchReservations());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در حذف رزرو', loading: false });
    }
  },
  setLoading(loading) {
    set({ loading });
  },
  setError(error) {
    set({ error });
  },
}));
