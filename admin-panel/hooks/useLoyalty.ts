// React Hook for Loyalty System
import { useState } from 'react';
import { LoyaltyProfile, LoyaltyAction } from '../lib/loyalty-system';

export function useLoyalty(customerId: string) {
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchProfile() {
    setLoading(true);
    const res = await fetch(`/api/loyalty?customerId=${customerId}`);
    const data = await res.json();
    setProfile(data);
    setLoading(false);
  }

  async function createProfile(profile: LoyaltyProfile) {
    setLoading(true);
    await fetch('/api/loyalty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setLoading(false);
    fetchProfile();
  }

  async function handleAction(action: LoyaltyAction) {
    setLoading(true);
    await fetch('/api/loyalty', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, action }),
    });
    setLoading(false);
    fetchProfile();
  }

  return { profile, loading, fetchProfile, createProfile, handleAction };
}
