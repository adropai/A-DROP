// CRM API Endpoints
import { CRMSystem, CustomerSegment, Lead, MarketingCampaign, CustomerJourney } from '../../../lib/crm-system';
import { NextRequest, NextResponse } from 'next/server';

const crm = new CRMSystem();

// GET - دریافت سگمنت‌ها، لیدها، کمپین‌ها، سفر مشتری
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  switch (type) {
    case 'segments':
      return NextResponse.json(crm.getAllSegments());
    case 'segment':
      if (!id) return NextResponse.json({ error: 'شناسه سگمنت الزامی است' }, { status: 400 });
      return NextResponse.json(crm.getSegment(id));
    case 'leads':
      return NextResponse.json(crm.getAllLeads());
    case 'lead':
      if (!id) return NextResponse.json({ error: 'شناسه لید الزامی است' }, { status: 400 });
      return NextResponse.json(crm.getLead(id));
    case 'campaigns':
      return NextResponse.json(crm.getAllCampaigns());
    case 'campaign':
      if (!id) return NextResponse.json({ error: 'شناسه کمپین الزامی است' }, { status: 400 });
      return NextResponse.json(crm.getCampaign(id));
    case 'journeys':
      return NextResponse.json(crm.getAllJourneys());
    case 'journey':
      if (!id) return NextResponse.json({ error: 'شناسه سفر الزامی است' }, { status: 400 });
      return NextResponse.json(crm.getJourney(id));
    default:
      return NextResponse.json({ error: 'نوع درخواست نامعتبر است' }, { status: 400 });
  }
}

// POST - ایجاد سگمنت، لید، کمپین، سفر مشتری
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  switch (type) {
    case 'segment':
      const segmentId = crm.createSegment(body.segment);
      return NextResponse.json({ success: true, segmentId });
    case 'lead':
      const leadId = crm.createLead(body.lead);
      return NextResponse.json({ success: true, leadId });
    case 'campaign':
      const campaignId = crm.createCampaign(body.campaign);
      return NextResponse.json({ success: true, campaignId });
    case 'journey':
      const journeyId = crm.createJourney(body.journey);
      return NextResponse.json({ success: true, journeyId });
    default:
      return NextResponse.json({ error: 'نوع عملیات نامعتبر است' }, { status: 400 });
  }
}

// PUT - بروزرسانی سگمنت، لید، کمپین، سفر مشتری
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { type, id, updates } = body;

  switch (type) {
    case 'segment':
      const segSuccess = crm.updateSegment(id, updates);
      return NextResponse.json({ success: segSuccess });
    case 'lead':
      const leadSuccess = crm.updateLead(id, updates);
      return NextResponse.json({ success: leadSuccess });
    case 'campaign':
      const campSuccess = crm.updateCampaign(id, updates);
      return NextResponse.json({ success: campSuccess });
    case 'journey':
      const journeySuccess = crm.updateJourney(id, updates);
      return NextResponse.json({ success: journeySuccess });
    default:
      return NextResponse.json({ error: 'نوع عملیات نامعتبر است' }, { status: 400 });
  }
}

// DELETE - حذف سگمنت، لید، کمپین، سفر مشتری
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  switch (type) {
    case 'segment':
      const segDel = crm.deleteSegment(id);
      return NextResponse.json({ success: segDel });
    case 'lead':
      const leadDel = crm.deleteLead(id);
      return NextResponse.json({ success: leadDel });
    case 'campaign':
      const campDel = crm.deleteCampaign(id);
      return NextResponse.json({ success: campDel });
    case 'journey':
      const journeyDel = crm.deleteJourney(id);
      return NextResponse.json({ success: journeyDel });
    default:
      return NextResponse.json({ error: 'نوع عملیات نامعتبر است' }, { status: 400 });
  }
}
