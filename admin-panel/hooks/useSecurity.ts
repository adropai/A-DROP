// React hooks for Security & Backup System
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
      const res = await fetch('/api/security?type=settings');
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
      const res = await fetch('/api/security?type=settings', {
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
      
      const res = await fetch(`/api/security?${params}`);
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
      const res = await fetch('/api/security?type=audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, details, status })
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
      const res = await fetch('/api/security?type=backup-configs');
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
      const res = await fetch('/api/security?type=backup-config', {
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
      const res = await fetch(`/api/security?type=backup-config&id=${id}`, {
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
      const res = await fetch(`/api/security?type=backup-config&id=${id}`, {
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

  const executeBackup = useCallback(async (configId: string): Promise<BackupHistory | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security?type=execute-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId })
      });
      if (!res.ok) throw new Error('Failed to execute backup');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBackupHistory = useCallback(async (configId?: string): Promise<BackupHistory[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'backup-history' });
      if (configId) params.append('configId', configId);
      
      const res = await fetch(`/api/security?${params}`);
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
  const fetchIncidents = useCallback(async (status?: SecurityIncident['status']): Promise<SecurityIncident[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'incidents' });
      if (status) params.append('status', status);
      
      const res = await fetch(`/api/security?${params}`);
      if (!res.ok) throw new Error('Failed to fetch incidents');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncident = useCallback(async (incident: Omit<SecurityIncident, 'id' | 'timestamp' | 'status'>): Promise<SecurityIncident | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security?type=incident', {
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
      const res = await fetch(`/api/security?type=incident&id=${id}`, {
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

  // Encryption Settings
  const fetchEncryptionSettings = useCallback(async (): Promise<DataEncryption | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security?type=encryption');
      if (!res.ok) throw new Error('Failed to fetch encryption settings');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEncryptionSettings = useCallback(async (settings: Partial<DataEncryption>): Promise<DataEncryption | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security?type=encryption', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to update encryption settings');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Security Reports
  const generateSecurityReport = useCallback(async (): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/security?type=report');
      if (!res.ok) throw new Error('Failed to generate security report');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    
    // Security Settings
    fetchSecuritySettings,
    updateSecuritySettings,
    
    // Audit Logs
    fetchAuditLogs,
    logAudit,
    
    // Backup Management
    fetchBackupConfigs,
    createBackupConfig,
    updateBackupConfig,
    deleteBackupConfig,
    executeBackup,
    fetchBackupHistory,
    
    // Security Incidents
    fetchIncidents,
    createIncident,
    updateIncident,
    
    // Encryption
    fetchEncryptionSettings,
    updateEncryptionSettings,
    
    // Reports
    generateSecurityReport
  };
}
