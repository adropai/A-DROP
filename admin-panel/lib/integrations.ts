// Integration Hub System
export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'payment' | 'delivery' | 'pos' | 'accounting' | 'marketing' | 'analytics' | 'inventory';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  apiKey: string;
  endpoint: string;
  webhookUrl?: string;
  settings: Record<string, any>;
  lastSync?: Date;
  errorCount: number;
}

export interface WebhookEvent {
  id: string;
  integrationId: string;
  event: string;
  payload: any;
  timestamp: Date;
  processed: boolean;
  error?: string;
}

export interface SyncJob {
  id: string;
  integrationId: string;
  type: 'full' | 'incremental';
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  errors: string[];
}

export class IntegrationHub {
  private integrations: IntegrationConfig[] = [];
  private webhooks: WebhookEvent[] = [];
  private syncJobs: SyncJob[] = [];

  // Integration Management
  createIntegration(config: Omit<IntegrationConfig, 'id' | 'status' | 'errorCount'>): IntegrationConfig {
    const integration: IntegrationConfig = {
      ...config,
      id: Date.now().toString(),
      status: 'pending',
      errorCount: 0
    };
    this.integrations.push(integration);
    return integration;
  }

  updateIntegration(id: string, updates: Partial<IntegrationConfig>): IntegrationConfig | null {
    const index = this.integrations.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.integrations[index] = { ...this.integrations[index], ...updates };
    return this.integrations[index];
  }

  deleteIntegration(id: string): boolean {
    const index = this.integrations.findIndex(i => i.id === id);
    if (index === -1) return false;
    this.integrations.splice(index, 1);
    return true;
  }

  getIntegrations(): IntegrationConfig[] {
    return this.integrations;
  }

  // Webhook Handling
  processWebhook(integrationId: string, event: string, payload: any): WebhookEvent {
    const webhook: WebhookEvent = {
      id: Date.now().toString(),
      integrationId,
      event,
      payload,
      timestamp: new Date(),
      processed: false
    };
    this.webhooks.push(webhook);
    return webhook;
  }

  // Data Sync
  async syncData(integrationId: string, type: 'full' | 'incremental' = 'incremental'): Promise<SyncJob> {
    const job: SyncJob = {
      id: Date.now().toString(),
      integrationId,
      type,
      status: 'running',
      startTime: new Date(),
      recordsProcessed: 0,
      errors: []
    };
    this.syncJobs.push(job);

    // Simulate sync process
    setTimeout(() => {
      job.endTime = new Date();
      job.status = 'completed';
      job.recordsProcessed = Math.floor(Math.random() * 1000);
    }, 2000);

    return job;
  }

  getSyncJobs(integrationId?: string): SyncJob[] {
    return integrationId 
      ? this.syncJobs.filter(j => j.integrationId === integrationId)
      : this.syncJobs;
  }

  // Test Connection
  async testConnection(id: string): Promise<boolean> {
    const integration = this.integrations.find(i => i.id === id);
    if (!integration) return false;
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.2; // 80% success rate
  }
}
