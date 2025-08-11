// Security & Backup System
export interface SecuritySettings {
  id: string;
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  twoFactorAuth: boolean;
  auditLogging: boolean;
  encryptionLevel: 'basic' | 'advanced' | 'enterprise';
  ipWhitelist: string[];
  dataRetentionDays: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // last N passwords
}

export interface SecurityAudit {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  resource: string;
  status: 'success' | 'failed' | 'warning';
  details: any;
}

export interface BackupConfig {
  id: string;
  name: string;
  schedule: BackupSchedule;
  retentionDays: number;
  compression: boolean;
  encryption: boolean;
  destinations: BackupDestination[];
  includeFiles: boolean;
  includeDatabases: string[];
  status: 'active' | 'inactive' | 'error';
}

export interface BackupSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
}

export interface BackupDestination {
  type: 'local' | 's3' | 'ftp' | 'cloud';
  config: any;
  priority: number;
}

export interface BackupHistory {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  size: number; // bytes
  location: string;
  error?: string;
  filesIncluded: number;
  duration: number; // seconds
}

export interface SecurityIncident {
  id: string;
  type: 'suspicious_login' | 'multiple_failures' | 'unauthorized_access' | 'data_breach' | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  affectedUsers: string[];
  ipAddress: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: Date;
}

export interface DataEncryption {
  algorithm: string;
  keyRotationDays: number;
  encryptInTransit: boolean;
  encryptAtRest: boolean;
  fieldLevelEncryption: string[]; // field names to encrypt
}

export class SecuritySystem {
  private settings: SecuritySettings;
  private audits: SecurityAudit[] = [];
  private backupConfigs: BackupConfig[] = [];
  private backupHistory: BackupHistory[] = [];
  private incidents: SecurityIncident[] = [];
  private encryption: DataEncryption;

  constructor() {
    this.settings = this.getDefaultSecuritySettings();
    this.encryption = this.getDefaultEncryption();
  }

  // Security Settings Management
  getSecuritySettings(): SecuritySettings {
    return this.settings;
  }

  updateSecuritySettings(settings: Partial<SecuritySettings>): SecuritySettings {
    this.settings = { ...this.settings, ...settings };
    this.logAudit('security_settings_updated', 'system', { changes: settings });
    return this.settings;
  }

  validatePassword(password: string, policy: PasswordPolicy = this.settings.passwordPolicy): boolean {
    if (password.length < policy.minLength) return false;
    if (policy.requireUppercase && !/[A-Z]/.test(password)) return false;
    if (policy.requireLowercase && !/[a-z]/.test(password)) return false;
    if (policy.requireNumbers && !/\d/.test(password)) return false;
    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  }

  // Audit Logging
  logAudit(action: string, userId: string, details: any = {}, status: 'success' | 'failed' | 'warning' = 'success'): void {
    const audit: SecurityAudit = {
      id: Date.now().toString(),
      userId,
      action,
      timestamp: new Date(),
      ipAddress: '0.0.0.0', // Should be populated from request
      userAgent: 'system',
      resource: details.resource || 'unknown',
      status,
      details
    };
    this.audits.push(audit);
  }

  getAuditLogs(startDate?: Date, endDate?: Date, userId?: string): SecurityAudit[] {
    let filtered = this.audits;
    
    if (startDate) {
      filtered = filtered.filter(audit => audit.timestamp >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(audit => audit.timestamp <= endDate);
    }
    if (userId) {
      filtered = filtered.filter(audit => audit.userId === userId);
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Backup Management
  createBackupConfig(config: Omit<BackupConfig, 'id' | 'status'>): BackupConfig {
    const newConfig: BackupConfig = {
      ...config,
      id: Date.now().toString(),
      status: 'active'
    };
    this.backupConfigs.push(newConfig);
    this.logAudit('backup_config_created', 'system', { configId: newConfig.id });
    return newConfig;
  }

  updateBackupConfig(id: string, updates: Partial<BackupConfig>): BackupConfig | null {
    const index = this.backupConfigs.findIndex(config => config.id === id);
    if (index === -1) return null;
    
    this.backupConfigs[index] = { ...this.backupConfigs[index], ...updates };
    this.logAudit('backup_config_updated', 'system', { configId: id, updates });
    return this.backupConfigs[index];
  }

  deleteBackupConfig(id: string): boolean {
    const index = this.backupConfigs.findIndex(config => config.id === id);
    if (index === -1) return false;
    
    this.backupConfigs.splice(index, 1);
    this.logAudit('backup_config_deleted', 'system', { configId: id });
    return true;
  }

  getBackupConfigs(): BackupConfig[] {
    return this.backupConfigs;
  }

  // Backup Execution
  async executeBackup(configId: string): Promise<BackupHistory> {
    const config = this.backupConfigs.find(c => c.id === configId);
    if (!config) throw new Error('Backup config not found');

    const history: BackupHistory = {
      id: Date.now().toString(),
      configId,
      startTime: new Date(),
      status: 'running',
      size: 0,
      location: '',
      filesIncluded: 0,
      duration: 0
    };

    this.backupHistory.push(history);
    this.logAudit('backup_started', 'system', { configId });

    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      history.endTime = new Date();
      history.status = 'completed';
      history.size = Math.floor(Math.random() * 1000000000); // Random size
      history.location = `backup_${configId}_${Date.now()}.tar.gz`;
      history.filesIncluded = Math.floor(Math.random() * 10000);
      history.duration = Math.floor((history.endTime.getTime() - history.startTime.getTime()) / 1000);

      this.logAudit('backup_completed', 'system', { 
        configId, 
        size: history.size, 
        duration: history.duration 
      });
    } catch (error) {
      history.status = 'failed';
      history.error = (error as Error).message;
      this.logAudit('backup_failed', 'system', { configId, error: history.error }, 'failed');
    }

    return history;
  }

  getBackupHistory(configId?: string): BackupHistory[] {
    let filtered = this.backupHistory;
    if (configId) {
      filtered = filtered.filter(h => h.configId === configId);
    }
    return filtered.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  // Security Incidents
  createIncident(incident: Omit<SecurityIncident, 'id' | 'timestamp' | 'status'>): SecurityIncident {
    const newIncident: SecurityIncident = {
      ...incident,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'open'
    };
    this.incidents.push(newIncident);
    this.logAudit('security_incident_created', 'system', { incidentId: newIncident.id, type: incident.type });
    return newIncident;
  }

  updateIncident(id: string, updates: Partial<SecurityIncident>): SecurityIncident | null {
    const index = this.incidents.findIndex(incident => incident.id === id);
    if (index === -1) return null;
    
    this.incidents[index] = { ...this.incidents[index], ...updates };
    this.logAudit('security_incident_updated', 'system', { incidentId: id, updates });
    return this.incidents[index];
  }

  getIncidents(status?: SecurityIncident['status']): SecurityIncident[] {
    let filtered = this.incidents;
    if (status) {
      filtered = filtered.filter(incident => incident.status === status);
    }
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Data Encryption
  updateEncryptionSettings(encryption: Partial<DataEncryption>): DataEncryption {
    this.encryption = { ...this.encryption, ...encryption };
    this.logAudit('encryption_settings_updated', 'system', { changes: encryption });
    return this.encryption;
  }

  getEncryptionSettings(): DataEncryption {
    return this.encryption;
  }

  // Security Reports
  generateSecurityReport(): any {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentAudits = this.getAuditLogs(weekAgo);
    const recentIncidents = this.incidents.filter(i => i.timestamp >= weekAgo);
    const recentBackups = this.backupHistory.filter(b => b.startTime >= weekAgo);

    return {
      period: { start: weekAgo, end: now },
      summary: {
        totalAudits: recentAudits.length,
        failedLogins: recentAudits.filter(a => a.action === 'login_failed').length,
        openIncidents: recentIncidents.filter(i => i.status === 'open').length,
        completedBackups: recentBackups.filter(b => b.status === 'completed').length,
        failedBackups: recentBackups.filter(b => b.status === 'failed').length
      },
      topRisks: this.getTopSecurityRisks(),
      recommendations: this.getSecurityRecommendations()
    };
  }

  private getTopSecurityRisks(): string[] {
    const risks = [];
    if (!this.settings.twoFactorAuth) risks.push('Two-factor authentication disabled');
    if (this.settings.passwordPolicy.minLength < 8) risks.push('Weak password policy');
    if (this.incidents.filter(i => i.status === 'open').length > 5) risks.push('Multiple open security incidents');
    return risks;
  }

  private getSecurityRecommendations(): string[] {
    const recommendations = [];
    if (!this.settings.twoFactorAuth) recommendations.push('Enable two-factor authentication');
    if (this.settings.sessionTimeout > 60) recommendations.push('Reduce session timeout');
    recommendations.push('Regular security training for staff');
    recommendations.push('Update security policies quarterly');
    return recommendations;
  }

  private getDefaultSecuritySettings(): SecuritySettings {
    return {
      id: 'default',
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 5
      },
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      twoFactorAuth: false,
      auditLogging: true,
      encryptionLevel: 'advanced',
      ipWhitelist: [],
      dataRetentionDays: 365
    };
  }

  private getDefaultEncryption(): DataEncryption {
    return {
      algorithm: 'AES-256-GCM',
      keyRotationDays: 90,
      encryptInTransit: true,
      encryptAtRest: true,
      fieldLevelEncryption: ['password', 'creditCard', 'ssn', 'personalData']
    };
  }
}
