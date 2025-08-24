// AI Training Datasets API with Database Integration
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const datasets = await prisma.aiDataset.findMany({
      include: {
        model: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(datasets.map(dataset => ({
      ...dataset,
      tags: dataset.tags ? JSON.parse(dataset.tags) : []
    })));
  } catch (error) {
    console.error('AI Datasets API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI datasets', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const newDataset = await prisma.aiDataset.create({
      data: {
        name: data.name,
        type: data.type,
        size: data.size || 0,
        format: data.format || 'json',
        path: data.path,
        status: data.status || 'pending',
        tags: data.tags ? JSON.stringify(data.tags) : null,
        description: data.description,
        modelId: data.modelId || null
      },
      include: {
        model: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({
      ...newDataset,
      tags: newDataset.tags ? JSON.parse(newDataset.tags) : []
    });
  } catch (error) {
    console.error('AI Datasets API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create AI dataset', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Dataset ID required' }, { status: 400 });
    }

    const data = await req.json();
    
    const updatedDataset = await prisma.aiDataset.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        size: data.size,
        format: data.format,
        path: data.path,
        status: data.status,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        description: data.description,
        modelId: data.modelId
      },
      include: {
        model: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({
      ...updatedDataset,
      tags: updatedDataset.tags ? JSON.parse(updatedDataset.tags) : []
    });
  } catch (error) {
    console.error('AI Datasets API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update AI dataset', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Dataset ID required' }, { status: 400 });
    }

    await prisma.aiDataset.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('AI Datasets API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI dataset', details: (error as Error).message },
      { status: 500 }
    );
  }
}
