// CRM System Core
// Advanced customer segmentation, lead management, journey mapping, analytics

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  customerIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCriteria {
  rfmScore?: string;
  lastOrderDays?: number;
  totalOrders?: number;
  totalSpent?: number;
  location?: string;
  ageRange?: string;
  preferredCategories?: string[];
  tags?: string[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  segmentId: string;
  message: string;
  status: 'draft' | 'active' | 'completed';
  metrics: CampaignMetrics;
  scheduledDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
}

export interface CustomerJourney {
  customerId: string;
  steps: JourneyStep[];
  startedAt: Date;
  completedAt?: Date;
}

export interface JourneyStep {
  name: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'skipped';
  notes?: string;
}

export class CRMSystem {
  private segments: Map<string, CustomerSegment> = new Map();
  private leads: Map<string, Lead> = new Map();
  private campaigns: Map<string, MarketingCampaign> = new Map();
  private journeys: Map<string, CustomerJourney> = new Map();

  // Segment Management
  createSegment(segment: Omit<CustomerSegment, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSegment: CustomerSegment = {
      ...segment,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.segments.set(id, newSegment);
    return id;
  }

  getSegment(segmentId: string): CustomerSegment | undefined {
    return this.segments.get(segmentId);
  }

  getAllSegments(): CustomerSegment[] {
    return Array.from(this.segments.values());
  }

  updateSegment(segmentId: string, updates: Partial<CustomerSegment>): boolean {
    const segment = this.segments.get(segmentId);
    if (!segment) return false;
    const updatedSegment = { ...segment, ...updates, updatedAt: new Date() };
    this.segments.set(segmentId, updatedSegment);
    return true;
  }

  deleteSegment(segmentId: string): boolean {
    return this.segments.delete(segmentId);
  }

  // Lead Management
  createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leads.set(id, newLead);
    return id;
  }

  getLead(leadId: string): Lead | undefined {
    return this.leads.get(leadId);
  }

  getAllLeads(): Lead[] {
    return Array.from(this.leads.values());
  }

  updateLead(leadId: string, updates: Partial<Lead>): boolean {
    const lead = this.leads.get(leadId);
    if (!lead) return false;
    const updatedLead = { ...lead, ...updates, updatedAt: new Date() };
    this.leads.set(leadId, updatedLead);
    return true;
  }

  deleteLead(leadId: string): boolean {
    return this.leads.delete(leadId);
  }

  // Campaign Management
  createCampaign(campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCampaign: MarketingCampaign = {
      ...campaign,
      id,
      metrics: campaign.metrics || { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.campaigns.set(id, newCampaign);
    return id;
  }

  getCampaign(campaignId: string): MarketingCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  getAllCampaigns(): MarketingCampaign[] {
    return Array.from(this.campaigns.values());
  }

  updateCampaign(campaignId: string, updates: Partial<MarketingCampaign>): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;
    const updatedCampaign = { ...campaign, ...updates, updatedAt: new Date() };
    this.campaigns.set(campaignId, updatedCampaign);
    return true;
  }

  deleteCampaign(campaignId: string): boolean {
    return this.campaigns.delete(campaignId);
  }

  // Customer Journey
  createJourney(journey: Omit<CustomerJourney, 'startedAt'>): string {
    const id = `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newJourney: CustomerJourney = {
      ...journey,
      startedAt: new Date()
    };
    this.journeys.set(id, newJourney);
    return id;
  }

  getJourney(journeyId: string): CustomerJourney | undefined {
    return this.journeys.get(journeyId);
  }

  getAllJourneys(): CustomerJourney[] {
    return Array.from(this.journeys.values());
  }

  updateJourney(journeyId: string, updates: Partial<CustomerJourney>): boolean {
    const journey = this.journeys.get(journeyId);
    if (!journey) return false;
    const updatedJourney = { ...journey, ...updates };
    this.journeys.set(journeyId, updatedJourney);
    return true;
  }

  deleteJourney(journeyId: string): boolean {
    return this.journeys.delete(journeyId);
  }

  // Behavior Analytics
  getSegmentAnalytics(segmentId: string): any {
    // Mock analytics
    return {
      segmentId,
      totalCustomers: 120,
      avgOrderValue: 175000,
      repeatRate: 68.5,
      conversionRate: 12.3,
      topProducts: ['کباب کوبیده', 'زرشک پلو', 'سالاد شیرازی']
    };
  }

  getLeadAnalytics(): any {
    // Mock analytics
    return {
      totalLeads: 45,
      conversionRate: 22.5,
      avgTimeToConvert: 3.2 // days
    };
  }

  getCampaignAnalytics(campaignId: string): any {
    // Mock analytics
    return {
      campaignId,
      sent: 500,
      delivered: 480,
      opened: 320,
      clicked: 120,
      converted: 35,
      revenue: 8500000
    };
  }
}
