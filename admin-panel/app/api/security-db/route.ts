// Security API with Database Integration
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'settings':
        let settings = await prisma.securitySettings.findFirst();
        if (!settings) {
          // Create default settings if none exist
          settings = await prisma.securitySettings.create({
            data: {
              passwordPolicy: JSON.stringify({
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                maxAge: 90,
                preventReuse: 5
              }),
              sessionTimeout: 30,
              maxLoginAttempts: 5,
              lockoutDuration: 15,
              twoFactorAuth: false,
              auditLogging: true,
              encryptionLevel: 'basic',
              dataRetentionDays: 90
            }
          });
        }
        return NextResponse.json({
          ...settings,
          passwordPolicy: JSON.parse(settings.passwordPolicy),
          ipWhitelist: settings.ipWhitelist ? JSON.parse(settings.ipWhitelist) : []
        });

      case 'audits':
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const userId = searchParams.get('userId');
        
        const audits = await prisma.securityAudit.findMany({
          where: {
            ...(userId && { userId }),
            ...(startDate && endDate && {
              timestamp: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            })
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { timestamp: 'desc' },
          take: 100
        });
        
        return NextResponse.json(audits.map(audit => ({
          ...audit,
          details: audit.details ? JSON.parse(audit.details) : null
        })));

      case 'backup-configs':
        const configs = await prisma.backupConfig.findMany({
          include: {
            backupHistory: {
              orderBy: { startTime: 'desc' },
              take: 5
            }
          }
        });
        
        return NextResponse.json(configs.map(config => ({
          ...config,
          schedule: JSON.parse(config.schedule),
          destinations: JSON.parse(config.destinations),
          includeDatabases: JSON.parse(config.includeDatabases)
        })));

      case 'backup-history':
        const configId = searchParams.get('configId');
        const history = await prisma.backupHistory.findMany({
          where: configId ? { configId } : {},
          include: {
            config: true
          },
          orderBy: { startTime: 'desc' },
          take: 50
        });
        
        return NextResponse.json(history);

      case 'incidents':
        const status = searchParams.get('status');
        const incidents = await prisma.securityIncident.findMany({
          where: status ? { status } : {},
          orderBy: { timestamp: 'desc' },
          take: 100
        });
        
        return NextResponse.json(incidents.map(incident => ({
          ...incident,
          affectedUsers: incident.affectedUsers ? JSON.parse(incident.affectedUsers) : []
        })));

      case 'dashboard-stats':
        // Security Dashboard Statistics
        const [
          totalAudits,
          todayAudits,
          openIncidents,
          criticalIncidents,
          activeBackups,
          recentFailedLogins
        ] = await Promise.all([
          prisma.securityAudit.count(),
          prisma.securityAudit.count({
            where: {
              timestamp: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }),
          prisma.securityIncident.count({
            where: { status: 'open' }
          }),
          prisma.securityIncident.count({
            where: { 
              severity: 'critical',
              status: { in: ['open', 'investigating'] }
            }
          }),
          prisma.backupConfig.count({
            where: { status: 'active' }
          }),
          prisma.securityAudit.count({
            where: {
              status: 'failed',
              action: { contains: 'login' },
              timestamp: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          })
        ]);

        return NextResponse.json({
          totalAudits,
          todayAudits,
          openIncidents,
          criticalIncidents,
          activeBackups,
          recentFailedLogins,
          securityScore: Math.max(0, 100 - (openIncidents * 10) - (criticalIncidents * 20) - (recentFailedLogins * 2))
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security data', details: (error as Error).message },
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
      case 'backup-config':
        const newConfig = await prisma.backupConfig.create({
          data: {
            name: body.name,
            schedule: JSON.stringify(body.schedule),
            retentionDays: body.retentionDays,
            compression: body.compression,
            encryption: body.encryption,
            destinations: JSON.stringify(body.destinations),
            includeFiles: body.includeFiles,
            includeDatabases: JSON.stringify(body.includeDatabases),
            status: body.status || 'active'
          }
        });
        
        return NextResponse.json({
          ...newConfig,
          schedule: JSON.parse(newConfig.schedule),
          destinations: JSON.parse(newConfig.destinations),
          includeDatabases: JSON.parse(newConfig.includeDatabases)
        });

      case 'incident':
        const incident = await prisma.securityIncident.create({
          data: {
            type: body.type,
            severity: body.severity,
            description: body.description,
            affectedUsers: body.affectedUsers ? JSON.stringify(body.affectedUsers) : null,
            ipAddress: body.ipAddress,
            status: body.status || 'open',
            assignedTo: body.assignedTo
          }
        });
        
        return NextResponse.json({
          ...incident,
          affectedUsers: incident.affectedUsers ? JSON.parse(incident.affectedUsers) : []
        });

      case 'audit':
        const { action, userId, details, status = 'success', resource, ipAddress, userAgent } = body;
        const audit = await prisma.securityAudit.create({
          data: {
            userId,
            action,
            resource,
            status,
            details: details ? JSON.stringify(details) : null,
            ipAddress,
            userAgent
          }
        });
        
        return NextResponse.json(audit);

      case 'backup-execute':
        const { configId } = body;
        const config = await prisma.backupConfig.findUnique({
          where: { id: configId }
        });
        
        if (!config) {
          return NextResponse.json({ error: 'Backup config not found' }, { status: 404 });
        }

        // Create backup history entry
        const backupHistory = await prisma.backupHistory.create({
          data: {
            configId,
            startTime: new Date(),
            status: 'running'
          }
        });

        // Simulate backup execution (in real app, this would be a background job)
        setTimeout(async () => {
          await prisma.backupHistory.update({
            where: { id: backupHistory.id },
            data: {
              endTime: new Date(),
              status: 'completed',
              size: BigInt(Math.floor(Math.random() * 1000000000)), // Random size
              location: `/backups/${config.name}_${Date.now()}.sql`,
              filesIncluded: Math.floor(Math.random() * 1000),
              duration: Math.floor(Math.random() * 300) // Random duration up to 5 minutes
            }
          });
        }, 2000);

        return NextResponse.json({ success: true, backupId: backupHistory.id });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create security resource', details: (error as Error).message },
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

    switch (type) {
      case 'settings':
        const updatedSettings = await prisma.securitySettings.updateMany({
          data: {
            passwordPolicy: body.passwordPolicy ? JSON.stringify(body.passwordPolicy) : undefined,
            sessionTimeout: body.sessionTimeout,
            maxLoginAttempts: body.maxLoginAttempts,
            lockoutDuration: body.lockoutDuration,
            twoFactorAuth: body.twoFactorAuth,
            auditLogging: body.auditLogging,
            encryptionLevel: body.encryptionLevel,
            ipWhitelist: body.ipWhitelist ? JSON.stringify(body.ipWhitelist) : undefined,
            dataRetentionDays: body.dataRetentionDays
          }
        });
        
        const settings = await prisma.securitySettings.findFirst();
        return NextResponse.json({
          ...settings,
          passwordPolicy: JSON.parse(settings!.passwordPolicy),
          ipWhitelist: settings!.ipWhitelist ? JSON.parse(settings!.ipWhitelist) : []
        });

      case 'backup-config':
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        
        const updatedConfig = await prisma.backupConfig.update({
          where: { id },
          data: {
            name: body.name,
            schedule: body.schedule ? JSON.stringify(body.schedule) : undefined,
            retentionDays: body.retentionDays,
            compression: body.compression,
            encryption: body.encryption,
            destinations: body.destinations ? JSON.stringify(body.destinations) : undefined,
            includeFiles: body.includeFiles,
            includeDatabases: body.includeDatabases ? JSON.stringify(body.includeDatabases) : undefined,
            status: body.status
          }
        });
        
        return NextResponse.json({
          ...updatedConfig,
          schedule: JSON.parse(updatedConfig.schedule),
          destinations: JSON.parse(updatedConfig.destinations),
          includeDatabases: JSON.parse(updatedConfig.includeDatabases)
        });

      case 'incident':
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        
        const updatedIncident = await prisma.securityIncident.update({
          where: { id },
          data: {
            type: body.type,
            severity: body.severity,
            description: body.description,
            affectedUsers: body.affectedUsers ? JSON.stringify(body.affectedUsers) : undefined,
            ipAddress: body.ipAddress,
            status: body.status,
            assignedTo: body.assignedTo,
            resolution: body.resolution,
            resolvedAt: body.status === 'resolved' ? new Date() : undefined
          }
        });
        
        return NextResponse.json({
          ...updatedIncident,
          affectedUsers: updatedIncident.affectedUsers ? JSON.parse(updatedIncident.affectedUsers) : []
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update security resource', details: (error as Error).message },
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
      case 'backup-config':
        await prisma.backupConfig.delete({
          where: { id }
        });
        return NextResponse.json({ success: true });

      case 'incident':
        await prisma.securityIncident.delete({
          where: { id }
        });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete security resource', details: (error as Error).message },
      { status: 500 }
    );
  }
}
