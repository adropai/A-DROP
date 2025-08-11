// Integration Hub API Routes
import { IntegrationHub, IntegrationConfig, SyncLog, WebhookConfig, APIMapping, DataFlow } from '../../../lib/integration-hub';
import { NextRequest, NextResponse } from 'next/server';

const integrationHub = new IntegrationHub();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'integrations':
        const integrationType = searchParams.get('integrationType') as any;
        return NextResponse.json(integrationHub.getIntegrations(integrationType));
      
      case 'integration':
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        const integration = integrationHub.getIntegration(id);
        if (!integration) return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
        return NextResponse.json(integration);
      
      case 'sync-logs':
        const integrationId = searchParams.get('integrationId');
        return NextResponse.json(integrationHub.getSyncLogs(integrationId || undefined));
      
      case 'webhooks':
        const webhookIntegrationId = searchParams.get('integrationId');
        return NextResponse.json(integrationHub.getWebhooks(webhookIntegrationId || undefined));
      
      case 'mappings':
        const mappingIntegrationId = searchParams.get('integrationId');
        return NextResponse.json(integrationHub.getMappings(mappingIntegrationId || undefined));
      
      case 'templates':
        const templateType = searchParams.get('templateType') as any;
        return NextResponse.json(integrationHub.getTemplates(templateType));
      
      case 'template':
        const templateId = searchParams.get('id');
        if (!templateId) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        const template = integrationHub.getTemplate(templateId);
        if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        return NextResponse.json(template);
      
      case 'data-flows':
        return NextResponse.json(integrationHub.getDataFlows());
      
      case 'stats':
        return NextResponse.json(integrationHub.getIntegrationStats());
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch integration data', details: (error as Error).message },
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
      case 'integration':
        const integration = integrationHub.createIntegration(body);
        return NextResponse.json(integration);
      
      case 'test-connection':
        const { id } = body;
        const result = await integrationHub.testConnection(id);
        return NextResponse.json(result);
      
      case 'sync':
        const { integrationId, trigger } = body;
        const syncLog = await integrationHub.syncIntegration(integrationId, trigger);
        return NextResponse.json(syncLog);
      
      case 'webhook':
        const webhook = integrationHub.createWebhook(body);
        return NextResponse.json(webhook);
      
      case 'mapping':
        const mapping = integrationHub.createMapping(body);
        return NextResponse.json(mapping);
      
      case 'data-flow':
        const dataFlow = integrationHub.createDataFlow(body);
        return NextResponse.json(dataFlow);
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create integration resource', details: (error as Error).message },
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

    if (!id && type !== 'bulk-update') {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    switch (type) {
      case 'integration':
        const updatedIntegration = integrationHub.updateIntegration(id!, body);
        if (!updatedIntegration) return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
        return NextResponse.json(updatedIntegration);
      
      case 'webhook':
        const updatedWebhook = integrationHub.updateWebhook(id!, body);
        if (!updatedWebhook) return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
        return NextResponse.json(updatedWebhook);
      
      case 'mapping':
        const updatedMapping = integrationHub.updateMapping(id!, body);
        if (!updatedMapping) return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
        return NextResponse.json(updatedMapping);
      
      case 'data-flow':
        const updatedDataFlow = integrationHub.updateDataFlow(id!, body);
        if (!updatedDataFlow) return NextResponse.json({ error: 'Data flow not found' }, { status: 404 });
        return NextResponse.json(updatedDataFlow);
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update integration resource', details: (error as Error).message },
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
      case 'integration':
        const deletedIntegration = integrationHub.deleteIntegration(id);
        if (!deletedIntegration) return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
        return NextResponse.json({ success: true });
      
      case 'webhook':
        const deletedWebhook = integrationHub.deleteWebhook(id);
        if (!deletedWebhook) return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
        return NextResponse.json({ success: true });
      
      case 'mapping':
        const deletedMapping = integrationHub.deleteMapping(id);
        if (!deletedMapping) return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
        return NextResponse.json({ success: true });
      
      case 'data-flow':
        const deletedDataFlow = integrationHub.deleteDataFlow(id);
        if (!deletedDataFlow) return NextResponse.json({ error: 'Data flow not found' }, { status: 404 });
        return NextResponse.json({ success: true });
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete integration resource', details: (error as Error).message },
      { status: 500 }
    );
  }
}
