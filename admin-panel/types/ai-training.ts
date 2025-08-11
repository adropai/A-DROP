// TypeScript types for AI Training
export interface AIModel {
  id: string;
  name: string;
  type: 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | 'local';
  status: 'active' | 'inactive' | 'training';
  version: string;
  accuracy: number;
  lastTraining: string;
  parameters: ModelParameters;
}

export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface TrainingDataset {
  id: string;
  name: string;
  description: string;
  type: 'conversation' | 'menu' | 'orders' | 'support';
  size: number; // number of records
  format: 'json' | 'csv' | 'txt';
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  filePath: string;
}

export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  category: 'customer_service' | 'order_taking' | 'menu_recommendation' | 'general';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationLog {
  id: string;
  timestamp: string;
  userMessage: string;
  aiResponse: string;
  model: string;
  responseTime: number;
  satisfaction?: number; // 1-5 rating
  category: string;
}

export interface AIStats {
  totalConversations: number;
  averageResponseTime: number;
  averageSatisfaction: number;
  popularTopics: { topic: string; count: number }[];
  modelUsage: { model: string; usage: number }[];
  dailyInteractions: { date: string; count: number }[];
}
