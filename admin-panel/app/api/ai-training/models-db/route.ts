// AI Training Models API with Database Integration
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const models = await prisma.aiModel.findMany({
      include: {
        datasets: {
          select: {
            id: true,
            name: true,
            type: true,
            size: true,
            status: true
          }
        },
        predictions: {
          select: {
            id: true,
            confidence: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(models.map(model => ({
      ...model,
      parameters: JSON.parse(model.parameters || '{}'),
      datasetCount: model.datasets.length,
      predictionCount: model.predictions.length,
      avgConfidence: model.predictions.length > 0 
        ? model.predictions.reduce((sum, p) => sum + p.confidence, 0) / model.predictions.length 
        : 0
    })));
  } catch (error) {
    console.error('AI Models API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI models', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const newModel = await prisma.aiModel.create({
      data: {
        name: data.name,
        type: data.type,
        status: data.status || 'inactive',
        version: data.version || '1.0.0',
        accuracy: data.accuracy || 0.0,
        parameters: JSON.stringify(data.parameters || {}),
        description: data.description,
        lastTraining: data.lastTraining ? new Date(data.lastTraining) : null
      },
      include: {
        datasets: true,
        predictions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      ...newModel,
      parameters: JSON.parse(newModel.parameters || '{}'),
      datasetCount: newModel.datasets.length,
      predictionCount: newModel.predictions.length
    });
  } catch (error) {
    console.error('AI Models API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create AI model', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Model ID required' }, { status: 400 });
    }

    const data = await req.json();
    
    const updatedModel = await prisma.aiModel.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        version: data.version,
        accuracy: data.accuracy,
        parameters: data.parameters ? JSON.stringify(data.parameters) : undefined,
        description: data.description,
        lastTraining: data.lastTraining ? new Date(data.lastTraining) : undefined
      },
      include: {
        datasets: true,
        predictions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      ...updatedModel,
      parameters: JSON.parse(updatedModel.parameters || '{}'),
      datasetCount: updatedModel.datasets.length,
      predictionCount: updatedModel.predictions.length
    });
  } catch (error) {
    console.error('AI Models API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update AI model', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Model ID required' }, { status: 400 });
    }

    await prisma.aiModel.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('AI Models API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI model', details: (error as Error).message },
      { status: 500 }
    );
  }
}
