// Integration Hub System
export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  credentials: any;
  settings: any;
  lastSync?: Date;
  syncFrequency: number; // minutes
  autoSync: boolean;
  webhookUrl?: string;
  apiVersion: string;
  rateLimit?: {
    requests: number;
    period: number; // seconds
  };
}

export type IntegrationType = 
  | 'payment' 
  | 'delivery' 
  | 'pos' 
  | 'accounting' 
  | 'inventory' 
  | 'crm' 
  | 'marketing' 
  | 'analytics' 
  | 'notification' 
  | 'social_media' 
  | 'loyalty' 
  | 'booking';

export interface SyncLog {
  id: string;
  integrationId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errors: string[];
  duration?: number; // seconds
  trigger: 'manual' | 'scheduled' | 'webhook';
}

export interface WebhookConfig {
  id: string;
  integrationId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retryAttempts: number;
  retryDelay: number; // seconds
  lastTriggered?: Date;
  totalRequests: number;
  successfulRequests: number;
}

export interface APIMapping {
  id: string;
  integrationId: string;
  localField: string;
  externalField: string;
  transformFunction?: string;
  direction: 'import' | 'export' | 'bidirectional';
  required: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  provider: string;
  type: IntegrationType;
  description: string;
  logo: string;
  documentation: string;
  requiredFields: string[];
  optionalFields: string[];
  supportedFeatures: string[];
  defaultMappings: APIMapping[];
}

export interface DataFlow {
  id: string;
  name: string;
  sourceIntegration: string;
  targetIntegration: string;
  mappings: APIMapping[];
  filters: any;
  transformations: any;
  schedule?: string; // cron expression
  active: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export class IntegrationHub {
  private integrations: IntegrationConfig[] = [];
  private syncLogs: SyncLog[] = [];
  private webhooks: WebhookConfig[] = [];
  private mappings: APIMapping[] = [];
  private templates: IntegrationTemplate[] = [];
  private dataFlows: DataFlow[] = [];

  constructor() {
    this.loadDefaultTemplates();
  }

  // Integration Management
  createIntegration(config: Omit<IntegrationConfig, 'id' | 'status'>): IntegrationConfig {
    const integration: IntegrationConfig = {
      ...config,
      id: Date.now().toString(),
      status: 'pending'
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

  getIntegrations(type?: IntegrationType): IntegrationConfig[] {
    if (type) {
      return this.integrations.filter(i => i.type === type);
    }
    return this.integrations;
  }

  getIntegration(id: string): IntegrationConfig | null {
    return this.integrations.find(i => i.id === id) || null;
  }

  // Authentication & Connection Testing
  async testConnection(id: string): Promise<{ success: boolean; message: string; latency?: number }> {
    const integration = this.getIntegration(id);
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    const startTime = Date.now();
    
    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      const latency = Date.now() - startTime;
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.2;
      
      if (success) {
        this.updateIntegration(id, { status: 'active' });
        return { 
          success: true, 
          message: 'Connection successful', 
          latency 
        };
      } else {
        this.updateIntegration(id, { status: 'error' });
        return { 
          success: false, 
          message: 'Authentication failed' 
        };
      }
    } catch (error) {
      this.updateIntegration(id, { status: 'error' });
      return { 
        success: false, 
        message: (error as Error).message 
      };
    }
  }

  // Data Synchronization
  async syncIntegration(id: string, trigger: 'manual' | 'scheduled' | 'webhook' = 'manual'): Promise<SyncLog> {
    const integration = this.getIntegration(id);
    if (!integration) {
      throw new Error('Integration not found');
    }

    const syncLog: SyncLog = {
      id: Date.now().toString(),
      integrationId: id,
      startTime: new Date(),
      status: 'running',
      recordsProcessed: 0,
      recordsSucceeded: 0,
      recordsFailed: 0,
      errors: [],
      trigger
    };

    this.syncLogs.push(syncLog);

    try {
      // Simulate sync process
      const totalRecords = Math.floor(Math.random() * 1000) + 100;
      const processingTime = Math.random() * 5000 + 2000; // 2-7 seconds
      
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      const successRate = 0.85 + Math.random() * 0.1; // 85-95% success rate
      const succeeded = Math.floor(totalRecords * successRate);
      const failed = totalRecords - succeeded;

      syncLog.endTime = new Date();
      syncLog.status = 'completed';
      syncLog.recordsProcessed = totalRecords;
      syncLog.recordsSucceeded = succeeded;
      syncLog.recordsFailed = failed;
      syncLog.duration = Math.floor((syncLog.endTime.getTime() - syncLog.startTime.getTime()) / 1000);

      if (failed > 0) {
        syncLog.errors = [
          `${failed} records failed to sync`,
          'Some records had invalid data format',
          'Rate limit exceeded for 3 requests'
        ];
      }

      // Update last sync time
      this.updateIntegration(id, { lastSync: new Date() });

    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errors = [(error as Error).message];
    }

    return syncLog;
  }

  getSyncLogs(integrationId?: string): SyncLog[] {
    let logs = this.syncLogs;
    if (integrationId) {
      logs = logs.filter(log => log.integrationId === integrationId);
    }
    return logs.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  // Webhook Management
  createWebhook(webhook: Omit<WebhookConfig, 'id' | 'totalRequests' | 'successfulRequests'>): WebhookConfig {
    const newWebhook: WebhookConfig = {
      ...webhook,
      id: Date.now().toString(),
      totalRequests: 0,
      successfulRequests: 0
    };
    this.webhooks.push(newWebhook);
    return newWebhook;
  }

  updateWebhook(id: string, updates: Partial<WebhookConfig>): WebhookConfig | null {
    const index = this.webhooks.findIndex(w => w.id === id);
    if (index === -1) return null;
    
    this.webhooks[index] = { ...this.webhooks[index], ...updates };
    return this.webhooks[index];
  }

  deleteWebhook(id: string): boolean {
    const index = this.webhooks.findIndex(w => w.id === id);
    if (index === -1) return false;
    
    this.webhooks.splice(index, 1);
    return true;
  }

  getWebhooks(integrationId?: string): WebhookConfig[] {
    if (integrationId) {
      return this.webhooks.filter(w => w.integrationId === integrationId);
    }
    return this.webhooks;
  }

  // API Mapping Management
  createMapping(mapping: Omit<APIMapping, 'id'>): APIMapping {
    const newMapping: APIMapping = {
      ...mapping,
      id: Date.now().toString()
    };
    this.mappings.push(newMapping);
    return newMapping;
  }

  updateMapping(id: string, updates: Partial<APIMapping>): APIMapping | null {
    const index = this.mappings.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    this.mappings[index] = { ...this.mappings[index], ...updates };
    return this.mappings[index];
  }

  deleteMapping(id: string): boolean {
    const index = this.mappings.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    this.mappings.splice(index, 1);
    return true;
  }

  getMappings(integrationId?: string): APIMapping[] {
    if (integrationId) {
      return this.mappings.filter(m => m.integrationId === integrationId);
    }
    return this.mappings;
  }

  // Templates
  getTemplates(type?: IntegrationType): IntegrationTemplate[] {
    if (type) {
      return this.templates.filter(t => t.type === type);
    }
    return this.templates;
  }

  getTemplate(id: string): IntegrationTemplate | null {
    return this.templates.find(t => t.id === id) || null;
  }

  // Data Flows
  createDataFlow(flow: Omit<DataFlow, 'id'>): DataFlow {
    const newFlow: DataFlow = {
      ...flow,
      id: Date.now().toString()
    };
    this.dataFlows.push(newFlow);
    return newFlow;
  }

  updateDataFlow(id: string, updates: Partial<DataFlow>): DataFlow | null {
    const index = this.dataFlows.findIndex(f => f.id === id);
    if (index === -1) return null;
    
    this.dataFlows[index] = { ...this.dataFlows[index], ...updates };
    return this.dataFlows[index];
  }

  deleteDataFlow(id: string): boolean {
    const index = this.dataFlows.findIndex(f => f.id === id);
    if (index === -1) return false;
    
    this.dataFlows.splice(index, 1);
    return true;
  }

  getDataFlows(): DataFlow[] {
    return this.dataFlows;
  }

  // Analytics & Monitoring
  getIntegrationStats(): any {
    const activeIntegrations = this.integrations.filter(i => i.status === 'active').length;
    const totalIntegrations = this.integrations.length;
    const recentSyncs = this.syncLogs.filter(log => 
      log.startTime.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    const successfulSyncs = recentSyncs.filter(log => log.status === 'completed').length;
    const failedSyncs = recentSyncs.filter(log => log.status === 'failed').length;

    return {
      activeIntegrations,
      totalIntegrations,
      healthScore: totalIntegrations > 0 ? (activeIntegrations / totalIntegrations) * 100 : 0,
      syncStats: {
        last24h: recentSyncs.length,
        successful: successfulSyncs,
        failed: failedSyncs,
        successRate: recentSyncs.length > 0 ? (successfulSyncs / recentSyncs.length) * 100 : 0
      },
      dataVolume: {
        recordsProcessed: recentSyncs.reduce((sum, log) => sum + log.recordsProcessed, 0),
        recordsSucceeded: recentSyncs.reduce((sum, log) => sum + log.recordsSucceeded, 0),
        recordsFailed: recentSyncs.reduce((sum, log) => sum + log.recordsFailed, 0)
      }
    };
  }

  private loadDefaultTemplates(): void {
    this.templates = [
      {
        id: 'stripe',
        name: 'Stripe Payment Gateway',
        provider: 'Stripe',
        type: 'payment',
        description: 'Accept online payments with Stripe',
        logo: '/integrations/stripe.svg',
        documentation: 'https://stripe.com/docs',
        requiredFields: ['api_key', 'webhook_secret'],
        optionalFields: ['currency', 'country'],
        supportedFeatures: ['payments', 'refunds', 'subscriptions', 'webhooks'],
        defaultMappings: []
      },
      {
        id: 'uber_eats',
        name: 'Uber Eats',
        provider: 'Uber',
        type: 'delivery',
        description: 'Integrate with Uber Eats delivery platform',
        logo: '/integrations/uber-eats.svg',
        documentation: 'https://developer.uber.com/docs/eats',
        requiredFields: ['client_id', 'client_secret', 'store_id'],
        optionalFields: ['webhook_url'],
        supportedFeatures: ['orders', 'menu_sync', 'delivery_tracking'],
        defaultMappings: []
      },
      {
        id: 'quickbooks',
        name: 'QuickBooks Online',
        provider: 'Intuit',
        type: 'accounting',
        description: 'Sync financial data with QuickBooks',
        logo: '/integrations/quickbooks.svg',
        documentation: 'https://developer.intuit.com/app/developer/qbo/docs',
        requiredFields: ['client_id', 'client_secret', 'sandbox'],
        optionalFields: ['webhook_url'],
        supportedFeatures: ['invoices', 'payments', 'customers', 'items'],
        defaultMappings: []
      }
    ];
  }
}
