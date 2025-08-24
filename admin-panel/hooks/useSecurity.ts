// React hooks for Security & Backup System with Database Integration
import { useState, useCallback } from 'react';
import { 
  SecuritySettings, 
  BackupConfig, 
  BackupHistory, 
  SecurityAudit, 
  SecurityIncident, 
  DataEncryption 
} from '../lib/security-system';

export function useSecurity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security Settings
  const fetchSecuritySettings = useCallback(async (): Promise<SecuritySettings | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security-db?type=settings');
      if (!res.ok) throw new Error('Failed to fetch security settings');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSecuritySettings = useCallback(async (settings: Partial<SecuritySettings>): Promise<SecuritySettings | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security-db?type=settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to update security settings');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Audit Logs
  const fetchAuditLogs = useCallback(async (startDate?: Date, endDate?: Date, userId?: string): Promise<SecurityAudit[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'audits' });
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (userId) params.append('userId', userId);
      
      const res = await fetch(`/api/security-db?${params}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const logAudit = useCallback(async (action: string, userId: string, details?: any, status?: 'success' | 'failed' | 'warning'): Promise<boolean> => {
    try {
      setError(null);
      const res = await fetch('/api/security-db?type=audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          userId, 
          details, 
          status: status || 'success',
          resource: 'system',
          ipAddress: window.location.hostname
        })
      });
      return res.ok;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, []);

  // Backup Management
  const fetchBackupConfigs = useCallback(async (): Promise<BackupConfig[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security-db?type=backup-configs');
      if (!res.ok) throw new Error('Failed to fetch backup configs');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createBackupConfig = useCallback(async (config: Omit<BackupConfig, 'id' | 'status'>): Promise<BackupConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security-db?type=backup-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error('Failed to create backup config');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBackupConfig = useCallback(async (id: string, updates: Partial<BackupConfig>): Promise<BackupConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/security-db?type=backup-config&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update backup config');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBackupConfig = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/security-db?type=backup-config&id=${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeBackup = useCallback(async (configId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security-db?type=backup-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId })
      });
      if (!res.ok) throw new Error('Failed to execute backup');
      const result = await res.json();
      return result.success;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Backup History
  const fetchBackupHistory = useCallback(async (configId?: string): Promise<BackupHistory[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'backup-history' });
      if (configId) params.append('configId', configId);
      
      const res = await fetch(`/api/security-db?${params}`);
      if (!res.ok) throw new Error('Failed to fetch backup history');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Security Incidents
  const fetchIncidents = useCallback(async (status?: string): Promise<SecurityIncident[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'incidents' });
      if (status) params.append('status', status);
      
      const res = await fetch(`/api/security-db?${params}`);
      if (!res.ok) throw new Error('Failed to fetch incidents');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncident = useCallback(async (incident: Omit<SecurityIncident, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>): Promise<SecurityIncident | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security-db?type=incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });
      if (!res.ok) throw new Error('Failed to create incident');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncident = useCallback(async (id: string, updates: Partial<SecurityIncident>): Promise<SecurityIncident | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/security-db?type=incident&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update incident');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Dashboard Statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security-db?type=dashboard-stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Security Report Generation
  const generateSecurityReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await fetchDashboardStats();
      
      return {
        summary: {
          securityScore: stats?.securityScore || 85,
          riskLevel: stats?.securityScore > 80 ? 'low' : stats?.securityScore > 60 ? 'medium' : 'high',
          totalIncidents: stats?.openIncidents || 0,
          criticalIssues: stats?.criticalIncidents || 0
        },
        recommendations: [
          'Enable two-factor authentication for all admin accounts',
          'Review and update password policies',
          'Implement regular security audits',
          'Setup automated backup schedules'
        ],
        recentActivity: await fetchAuditLogs(),
        backupStatus: await fetchBackupConfigs()
      };
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats, fetchAuditLogs, fetchBackupConfigs]);

  return {
    loading,
    error,
    // Settings
    fetchSecuritySettings,
    updateSecuritySettings,
    // Audits
    fetchAuditLogs,
    logAudit,
    // Backups
    fetchBackupConfigs,
    createBackupConfig,
    updateBackupConfig,
    deleteBackupConfig,
    executeBackup,
    fetchBackupHistory,
    // Incidents
    fetchIncidents,
    createIncident,
    updateIncident,
    // Dashboard
    fetchDashboardStats,
    generateSecurityReport
  };
}
