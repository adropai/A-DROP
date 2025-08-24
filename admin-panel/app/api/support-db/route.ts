// Support System API with Database Integration
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'tickets':
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const category = searchParams.get('category');
        const assignedTo = searchParams.get('assignedTo');
        
        const tickets = await prisma.supportTicket.findMany({
          where: {
            ...(status && { status }),
            ...(priority && { priority }),
            ...(category && { category }),
            ...(assignedTo && { assignedTo })
          },
          include: {
            responses: {
              orderBy: { createdAt: 'desc' },
              take: 3
            },
            attachments: true
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 50
        });

        return NextResponse.json(tickets.map(ticket => ({
          ...ticket,
          tags: ticket.tags ? JSON.parse(ticket.tags) : [],
          responseCount: ticket.responses.length
        })));

      case 'ticket-details':
        const ticketId = searchParams.get('id');
        if (!ticketId) {
          return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.findUnique({
          where: { id: ticketId },
          include: {
            responses: {
              orderBy: { createdAt: 'asc' }
            },
            attachments: true
          }
        });

        if (!ticket) {
          return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({
          ...ticket,
          tags: ticket.tags ? JSON.parse(ticket.tags) : []
        });

      case 'knowledge-base':
        const category_kb = searchParams.get('category');
        const published = searchParams.get('published') === 'true';
        
        const articles = await prisma.supportKnowledgeBase.findMany({
          where: {
            ...(category_kb && { category: category_kb }),
            ...(published !== undefined && { isPublished: published })
          },
          orderBy: [
            { viewCount: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 50
        });

        return NextResponse.json(articles.map(article => ({
          ...article,
          tags: article.tags ? JSON.parse(article.tags) : []
        })));

      case 'dashboard-stats':
        const [
          totalTickets,
          openTickets,
          urgentTickets,
          overdueTickets,
          avgResolutionTime,
          satisfactionRating
        ] = await Promise.all([
          prisma.supportTicket.count(),
          prisma.supportTicket.count({ where: { status: 'open' } }),
          prisma.supportTicket.count({ where: { priority: 'urgent', status: { in: ['open', 'in_progress'] } } }),
          prisma.supportTicket.count({
            where: {
              status: { in: ['open', 'in_progress'] },
              createdAt: {
                lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // older than 24 hours
              }
            }
          }),
          prisma.supportTicket.aggregate({
            where: { 
              status: 'resolved',
              resolvedAt: { not: null }
            },
            _avg: { actualHours: true }
          }),
          prisma.supportTicket.aggregate({
            where: { 
              satisfaction: { not: null }
            },
            _avg: { satisfaction: true }
          })
        ]);

        return NextResponse.json({
          totalTickets,
          openTickets,
          urgentTickets,
          overdueTickets,
          avgResolutionTime: avgResolutionTime._avg.actualHours || 0,
          satisfactionRating: satisfactionRating._avg.satisfaction || 0,
          responseTime: 2.5, // mock data - calculate from responses
          firstResponseTime: 1.2 // mock data
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Support API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support data', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const body = await req.json();

    switch (type) {
      case 'ticket':
        const newTicket = await prisma.supportTicket.create({
          data: {
            title: body.title,
            description: body.description,
            priority: body.priority || 'medium',
            status: body.status || 'open',
            category: body.category,
            customerName: body.customerName,
            customerEmail: body.customerEmail,
            customerPhone: body.customerPhone,
            assignedTo: body.assignedTo,
            tags: body.tags ? JSON.stringify(body.tags) : null,
            estimatedHours: body.estimatedHours
          },
          include: {
            responses: true,
            attachments: true
          }
        });

        return NextResponse.json({
          ...newTicket,
          tags: newTicket.tags ? JSON.parse(newTicket.tags) : []
        });

      case 'response':
        const { ticketId, responderId, responderName, responderType, content, isInternal } = body;
        
        const response = await prisma.ticketResponse.create({
          data: {
            ticketId,
            responderId,
            responderName,
            responderType: responderType || 'staff',
            content,
            isInternal: isInternal || false
          }
        });

        // Update ticket status if needed
        if (responderType === 'staff' && !isInternal) {
          await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: 'in_progress' }
          });
        }

        return NextResponse.json(response);

      case 'knowledge-base':
        const article = await prisma.supportKnowledgeBase.create({
          data: {
            title: body.title,
            content: body.content,
            category: body.category,
            tags: body.tags ? JSON.stringify(body.tags) : null,
            isPublished: body.isPublished || false,
            authorId: body.authorId,
            authorName: body.authorName
          }
        });

        return NextResponse.json({
          ...article,
          tags: article.tags ? JSON.parse(article.tags) : []
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Support API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create support resource', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    switch (type) {
      case 'ticket':
        const updatedTicket = await prisma.supportTicket.update({
          where: { id },
          data: {
            title: body.title,
            description: body.description,
            priority: body.priority,
            status: body.status,
            category: body.category,
            assignedTo: body.assignedTo,
            tags: body.tags ? JSON.stringify(body.tags) : undefined,
            resolution: body.resolution,
            resolvedAt: body.status === 'resolved' ? new Date() : undefined,
            closedAt: body.status === 'closed' ? new Date() : undefined,
            actualHours: body.actualHours,
            satisfaction: body.satisfaction
          },
          include: {
            responses: true,
            attachments: true
          }
        });

        return NextResponse.json({
          ...updatedTicket,
          tags: updatedTicket.tags ? JSON.parse(updatedTicket.tags) : []
        });

      case 'knowledge-base':
        const updatedArticle = await prisma.supportKnowledgeBase.update({
          where: { id },
          data: {
            title: body.title,
            content: body.content,
            category: body.category,
            tags: body.tags ? JSON.stringify(body.tags) : undefined,
            isPublished: body.isPublished
          }
        });

        return NextResponse.json({
          ...updatedArticle,
          tags: updatedArticle.tags ? JSON.parse(updatedArticle.tags) : []
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Support API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update support resource', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    switch (type) {
      case 'ticket':
        await prisma.supportTicket.delete({
          where: { id }
        });
        return NextResponse.json({ success: true });

      case 'knowledge-base':
        await prisma.supportKnowledgeBase.delete({
          where: { id }
        });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Support API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete support resource', details: (error as Error).message },
      { status: 500 }
    );
  }
}
