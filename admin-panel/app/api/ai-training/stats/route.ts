// API route for AI statistics
import { NextResponse } from 'next/server';
import { AIStats } from '../../../../types/ai-training';

const stats: AIStats = {
  totalConversations: 2547,
  averageResponseTime: 1.2,
  averageSatisfaction: 4.3,
  popularTopics: [
    { topic: 'سفارش غذا', count: 856 },
    { topic: 'منو', count: 623 },
    { topic: 'قیمت', count: 412 },
    { topic: 'تحویل', count: 324 },
  ],
  modelUsage: [
    { model: 'GPT-4', usage: 65 },
    { model: 'GPT-3.5', usage: 35 },
  ],
  dailyInteractions: [
    { date: '2024-01-10', count: 145 },
    { date: '2024-01-11', count: 167 },
    { date: '2024-01-12', count: 134 },
    { date: '2024-01-13', count: 189 },
    { date: '2024-01-14', count: 156 },
  ],
};

export async function GET() {
  return NextResponse.json(stats);
}
