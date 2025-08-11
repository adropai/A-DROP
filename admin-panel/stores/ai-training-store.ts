// Zustand store for AI Training
import { create } from 'zustand';
import { AIModel, TrainingDataset, SystemPrompt, ConversationLog, AIStats } from '../types/ai-training';

interface AITrainingState {
  models: AIModel[];
  datasets: TrainingDataset[];
  prompts: SystemPrompt[];
  conversations: ConversationLog[];
  stats: AIStats | null;
  loading: boolean;
  error: string | null;
  fetchModels: () => Promise<void>;
  fetchDatasets: () => Promise<void>;
  fetchPrompts: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addModel: (data: Partial<AIModel>) => Promise<void>;
  updateModel: (id: string, data: Partial<AIModel>) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
  addDataset: (data: Partial<TrainingDataset>) => Promise<void>;
  updateDataset: (id: string, data: Partial<TrainingDataset>) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  addPrompt: (data: Partial<SystemPrompt>) => Promise<void>;
  updatePrompt: (id: string, data: Partial<SystemPrompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAITrainingStore = create<AITrainingState>((set) => ({
  models: [],
  datasets: [],
  prompts: [],
  conversations: [],
  stats: null,
  loading: false,
  error: null,
  async fetchModels() {
    set({ loading: true });
    try {
      const res = await fetch('/api/ai-training/models');
      const data = await res.json();
      set({ models: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت مدل‌ها', loading: false });
    }
  },
  async fetchDatasets() {
    set({ loading: true });
    try {
      const res = await fetch('/api/ai-training/datasets');
      const data = await res.json();
      set({ datasets: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت دیتاست‌ها', loading: false });
    }
  },
  async fetchPrompts() {
    set({ loading: true });
    try {
      const res = await fetch('/api/ai-training/prompts');
      const data = await res.json();
      set({ prompts: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت prompt ها', loading: false });
    }
  },
  async fetchConversations() {
    set({ loading: true });
    try {
      const res = await fetch('/api/ai-training/conversations');
      const data = await res.json();
      set({ conversations: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت مکالمات', loading: false });
    }
  },
  async fetchStats() {
    set({ loading: true });
    try {
      const res = await fetch('/api/ai-training/stats');
      const data = await res.json();
      set({ stats: data, loading: false });
    } catch (e) {
      set({ error: 'خطا در دریافت آمار', loading: false });
    }
  },
  async addModel(data) {
    set({ loading: true });
    try {
      await fetch('/api/ai-training/models', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useAITrainingStore.getState().fetchModels());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ثبت مدل', loading: false });
    }
  },
  async updateModel(id, data) {
    set({ loading: true });
    try {
      await fetch(`/api/ai-training/models/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useAITrainingStore.getState().fetchModels());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ویرایش مدل', loading: false });
    }
  },
  async deleteModel(id) {
    set({ loading: true });
    try {
      await fetch(`/api/ai-training/models/${id}`, { method: 'DELETE' });
      await (useAITrainingStore.getState().fetchModels());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در حذف مدل', loading: false });
    }
  },
  async addDataset(data) {
    set({ loading: true });
    try {
      await fetch('/api/ai-training/datasets', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useAITrainingStore.getState().fetchDatasets());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ثبت دیتاست', loading: false });
    }
  },
  async updateDataset(id, data) {
    set({ loading: true });
    try {
      await fetch(`/api/ai-training/datasets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useAITrainingStore.getState().fetchDatasets());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ویرایش دیتاست', loading: false });
    }
  },
  async deleteDataset(id) {
    set({ loading: true });
    try {
      await fetch(`/api/ai-training/datasets/${id}`, { method: 'DELETE' });
      await (useAITrainingStore.getState().fetchDatasets());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در حذف دیتاست', loading: false });
    }
  },
  async addPrompt(data) {
    set({ loading: true });
    try {
      await fetch('/api/ai-training/prompts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useAITrainingStore.getState().fetchPrompts());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ثبت prompt', loading: false });
    }
  },
  async updatePrompt(id, data) {
    set({ loading: true });
    try {
      await fetch(`/api/ai-training/prompts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      await (useAITrainingStore.getState().fetchPrompts());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در ویرایش prompt', loading: false });
    }
  },
  async deletePrompt(id) {
    set({ loading: true });
    try {
      await fetch(`/api/ai-training/prompts/${id}`, { method: 'DELETE' });
      await (useAITrainingStore.getState().fetchPrompts());
      set({ loading: false });
    } catch (e) {
      set({ error: 'خطا در حذف prompt', loading: false });
    }
  },
  setLoading(loading) {
    set({ loading });
  },
  setError(error) {
    set({ error });
  },
}));
