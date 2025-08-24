import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, action, details, entityType, entityId } = await request.json()

    const logEntry = await prisma.activityLog.create({
      data: {
        userId: userId,
        action: action,
        entityType: entityType || 'ORDER',
        entityId: entityId,
        details: JSON.stringify(details),
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      logId: logEntry.id
    })

  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در ثبت لاگ' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = {}
    if (userId) whereClause.userId = userId
    if (action) whereClause.action = action

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: JSON.parse(log.details || '{}'),
        user: log.user,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt
      }))
    })

  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت لاگ‌ها' },
      { status: 500 }
    )
  }
}
