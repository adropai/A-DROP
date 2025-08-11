// API route for system prompts
import { NextResponse } from 'next/server';
import { SystemPrompt } from '../../../../types/ai-training';

let prompts: SystemPrompt[] = [
  {
    id: '1',
    name: 'Default Customer Service',
    content: 'شما یک دستیار مجازی رستوران A-DROP هستید. وظیفه شما کمک به مشتریان در سفارش غذا و پاسخ به سوالات آنها است.',
    category: 'customer_service',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
];

export async function GET() {
  return NextResponse.json(prompts);
}

export async function POST(req: Request) {
  const data = await req.json();
  const newPrompt: SystemPrompt = {
    ...data,
    id: Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  prompts.push(newPrompt);
  return NextResponse.json(newPrompt);
}
