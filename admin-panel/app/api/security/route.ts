// Security & Backup API Routes
import { SecuritySystem, SecuritySettings, BackupConfig, SecurityIncident, DataEncryption } from '../../../lib/security-system';
import { NextRequest, NextResponse } from 'next/server';

const securitySystem = new SecuritySystem();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'settings':
        return NextResponse.json(securitySystem.getSecuritySettings());
      
      case 'audits':
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
        const userId = searchParams.get('userId') || undefined;
        const audits = securitySystem.getAuditLogs(startDate, endDate, userId);
        return NextResponse.json(audits);
      
      case 'backup-configs':
        return NextResponse.json(securitySystem.getBackupConfigs());
      
      case 'backup-history':
        const configId = searchParams.get('configId') || undefined;
        const history = securitySystem.getBackupHistory(configId);
        return NextResponse.json(history);
      
      case 'incidents':
        const status = searchParams.get('status') as any;
        const incidents = securitySystem.getIncidents(status);
        return NextResponse.json(incidents);
      
      case 'encryption':
        return NextResponse.json(securitySystem.getEncryptionSettings());
      
      case 'report':
        const report = securitySystem.generateSecurityReport();
        return NextResponse.json(report);
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
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
        const config = securitySystem.createBackupConfig(body);
        return NextResponse.json(config);
      
      case 'execute-backup':
        const { configId } = body;
        const backupResult = await securitySystem.executeBackup(configId);
        return NextResponse.json(backupResult);
      
      case 'incident':
        const incident = securitySystem.createIncident(body);
        return NextResponse.json(incident);
      
      case 'audit':
        const { action, userId, details, status } = body;
        securitySystem.logAudit(action, userId, details, status);
        return NextResponse.json({ success: true });
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
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
        const settings = securitySystem.updateSecuritySettings(body);
        return NextResponse.json(settings);
      
      case 'backup-config':
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        const updatedConfig = securitySystem.updateBackupConfig(id, body);
        if (!updatedConfig) return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        return NextResponse.json(updatedConfig);
      
      case 'incident':
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        const updatedIncident = securitySystem.updateIncident(id, body);
        if (!updatedIncident) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        return NextResponse.json(updatedIncident);
      
      case 'encryption':
        const encryption = securitySystem.updateEncryptionSettings(body);
        return NextResponse.json(encryption);
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
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
        const deleted = securitySystem.deleteBackupConfig(id);
        if (!deleted) return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        return NextResponse.json({ success: true });
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete security resource', details: (error as Error).message },
      { status: 500 }
    );
  }
}
