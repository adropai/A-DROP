// Loyalty API Endpoints
import { LoyaltySystem, LoyaltyProfile, LoyaltyAction } from '../../../lib/loyalty-system';
import { NextRequest, NextResponse } from 'next/server';

const loyalty = new LoyaltySystem();

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('customerId');
  if (!customerId) return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
  const profile = loyalty.getProfile(customerId);
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.customerId) return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
  loyalty.createProfile(body as LoyaltyProfile);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body.customerId || !body.action) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  loyalty.handleAction(body.customerId, body.action as LoyaltyAction);
  return NextResponse.json({ success: true });
}
