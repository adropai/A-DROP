// React Hook for CRM System
import { useState } from 'react';
import { CustomerSegment, Lead, MarketingCampaign, CustomerJourney } from '../lib/crm-system';

export function useCRM() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch segments
  async function fetchSegments(): Promise<CustomerSegment[]> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm?type=segments');
      if (!res.ok) throw new Error('خطا در دریافت سگمنت‌ها');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return [];
    } finally {
      setLoading(false);
    }
  }

  // Fetch leads
  async function fetchLeads(): Promise<Lead[]> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm?type=leads');
      if (!res.ok) throw new Error('خطا در دریافت لیدها');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return [];
    } finally {
      setLoading(false);
    }
  }

  // Fetch campaigns
  async function fetchCampaigns(): Promise<MarketingCampaign[]> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm?type=campaigns');
      if (!res.ok) throw new Error('خطا در دریافت کمپین‌ها');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return [];
    } finally {
      setLoading(false);
    }
  }

  // Fetch journeys
  async function fetchJourneys(): Promise<CustomerJourney[]> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm?type=journeys');
      if (!res.ok) throw new Error('خطا در دریافت سفر مشتری');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return [];
    } finally {
      setLoading(false);
    }
  }

  // Create segment
  async function createSegment(segment: Partial<CustomerSegment>): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'segment', segment })
      });
      if (!res.ok) throw new Error('خطا در ایجاد سگمنت');
      const data = await res.json();
      return data.segmentId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Create lead
  async function createLead(lead: Partial<Lead>): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lead', lead })
      });
      if (!res.ok) throw new Error('خطا در ایجاد لید');
      const data = await res.json();
      return data.leadId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Create campaign
  async function createCampaign(campaign: Partial<MarketingCampaign>): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'campaign', campaign })
      });
      if (!res.ok) throw new Error('خطا در ایجاد کمپین');
      const data = await res.json();
      return data.campaignId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Create journey
  async function createJourney(journey: Partial<CustomerJourney>): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'journey', journey })
      });
      if (!res.ok) throw new Error('خطا در ایجاد سفر مشتری');
      const data = await res.json();
      return data.journeyId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    fetchSegments,
    fetchLeads,
    fetchCampaigns,
    fetchJourneys,
    createSegment,
    createLead,
    createCampaign,
    createJourney
  };
}
