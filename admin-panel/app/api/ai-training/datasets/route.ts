// API route for AI training datasets
import { NextResponse } from 'next/server';
import { TrainingDataset } from '../../../../types/ai-training';

let datasets: TrainingDataset[] = [
  {
    id: '1',
    name: 'Customer Support Dataset',
    description: 'مجموعه داده‌های مکالمات پشتیبانی مشتری',
    type: 'conversation',
    size: 1500,
    format: 'json',
    uploadDate: '2024-01-10',
    status: 'ready',
    filePath: '/datasets/customer_support.json',
  },
];

export async function GET() {
  return NextResponse.json(datasets);
}

export async function POST(req: Request) {
  const data = await req.json();
  const newDataset: TrainingDataset = {
    ...data,
    id: Math.random().toString(36).slice(2),
    uploadDate: new Date().toISOString().split('T')[0],
    status: 'uploaded',
  };
  datasets.push(newDataset);
  return NextResponse.json(newDataset);
}
