// React hooks for Integration Hub
import { useState, useCallback } from 'react';
import { 
  IntegrationConfig, 
  SyncLog, 
  WebhookConfig, 
  APIMapping, 
  IntegrationTemplate, 
  DataFlow,
  IntegrationType 
} from '../lib/integration-hub';

export function useIntegrations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Integration Management
  const fetchIntegrations = useCallback(async (type?: IntegrationType): Promise<IntegrationConfig[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'integrations' });
      if (type) params.append('integrationType', type);
      
      const res = await fetch(`/api/integrations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch integrations');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIntegration = useCallback(async (id: string): Promise<IntegrationConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=integration&id=${id}`);
      if (!res.ok) throw new Error('Failed to fetch integration');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createIntegration = useCallback(async (config: Omit<IntegrationConfig, 'id' | 'status'>): Promise<IntegrationConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/integrations?type=integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error('Failed to create integration');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIntegration = useCallback(async (id: string, updates: Partial<IntegrationConfig>): Promise<IntegrationConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=integration&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update integration');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIntegration = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=integration&id=${id}`, {
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

  const testConnection = useCallback(async (id: string): Promise<{ success: boolean; message: string; latency?: number } | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/integrations?type=test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Failed to test connection');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Synchronization
  const syncIntegration = useCallback(async (integrationId: string, trigger?: 'manual' | 'scheduled' | 'webhook'): Promise<SyncLog | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/integrations?type=sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId, trigger: trigger || 'manual' })
      });
      if (!res.ok) throw new Error('Failed to sync integration');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSyncLogs = useCallback(async (integrationId?: string): Promise<SyncLog[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'sync-logs' });
      if (integrationId) params.append('integrationId', integrationId);
      
      const res = await fetch(`/api/integrations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch sync logs');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Webhooks
  const fetchWebhooks = useCallback(async (integrationId?: string): Promise<WebhookConfig[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'webhooks' });
      if (integrationId) params.append('integrationId', integrationId);
      
      const res = await fetch(`/api/integrations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch webhooks');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createWebhook = useCallback(async (webhook: Omit<WebhookConfig, 'id' | 'totalRequests' | 'successfulRequests'>): Promise<WebhookConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/integrations?type=webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook)
      });
      if (!res.ok) throw new Error('Failed to create webhook');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWebhook = useCallback(async (id: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=webhook&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update webhook');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWebhook = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=webhook&id=${id}`, {
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

  // API Mappings
  const fetchMappings = useCallback(async (integrationId?: string): Promise<APIMapping[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'mappings' });
      if (integrationId) params.append('integrationId', integrationId);
      
      const res = await fetch(`/api/integrations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch mappings');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createMapping = useCallback(async (mapping: Omit<APIMapping, 'id'>): Promise<APIMapping | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/integrations?type=mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapping)
      });
      if (!res.ok) throw new Error('Failed to create mapping');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMapping = useCallback(async (id: string, updates: Partial<APIMapping>): Promise<APIMapping | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=mapping&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update mapping');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMapping = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=mapping&id=${id}`, {
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

  // Templates
  const fetchTemplates = useCallback(async (type?: IntegrationType): Promise<IntegrationTemplate[]> => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'templates' });
      if (type) params.append('templateType', type);
      
      const res = await fetch(`/api/integrations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplate = useCallback(async (id: string): Promise<IntegrationTemplate | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=template&id=${id}`);
      if (!res.ok) throw new Error('Failed to fetch template');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Data Flows
  const fetchDataFlows = useCallback(async (): Promise<DataFlow[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/integrations?type=data-flows');
      if (!res.ok) throw new Error('Failed to fetch data flows');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createDataFlow = useCallback(async (flow: Omit<DataFlow, 'id'>): Promise<DataFlow | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/integrations?type=data-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flow)
      });
      if (!res.ok) throw new Error('Failed to create data flow');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDataFlow = useCallback(async (id: string, updates: Partial<DataFlow>): Promise<DataFlow | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=data-flow&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update data flow');
      return await res.json();
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDataFlow = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/integrations?type=data-flow&id=${id}`, {
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

  // Analytics
  const fetchIntegrationStats = useCallback(async (): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/integrations?type=stats');
      if (!res.ok) throw new Error('Failed to fetch integration stats');
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
    
    // Integration Management
    fetchIntegrations,
    fetchIntegration,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    
    // Synchronization
    syncIntegration,
    fetchSyncLogs,
    
    // Webhooks
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    
    // API Mappings
    fetchMappings,
    createMapping,
    updateMapping,
    deleteMapping,
    
    // Templates
    fetchTemplates,
    fetchTemplate,
    
    // Data Flows
    fetchDataFlows,
    createDataFlow,
    updateDataFlow,
    deleteDataFlow,
    
    // Analytics
    fetchIntegrationStats
  };
}
