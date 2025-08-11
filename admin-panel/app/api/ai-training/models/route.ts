// API route for AI models
import { NextResponse } from 'next/server';
import { AIModel } from '../../../../types/ai-training';

let models: AIModel[] = [
  {
    id: '1',
    name: 'Customer Service AI',
    type: 'gpt-4',
    status: 'active',
    version: '1.0.0',
    accuracy: 0.92,
    lastTraining: '2024-01-15',
    parameters: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
    },
  },
];

export async function GET() {
  return NextResponse.json(models);
}

export async function POST(req: Request) {
  const data = await req.json();
  const newModel: AIModel = {
    ...data,
    id: Math.random().toString(36).slice(2),
    accuracy: 0.0,
    lastTraining: new Date().toISOString().split('T')[0],
  };
  models.push(newModel);
  return NextResponse.json(newModel);
}
