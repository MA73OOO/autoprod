import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db as prisma } from '@/src/prisma/db';
import { PLANS_CONFIG, DEFAULT_PLATFORM_FEE_PERCENT, CREDITS_PER_USD } from '@/lib/pricing-config';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const pricings = await prisma.servicePricing.findMany({
      orderBy: [{ serviceType: 'asc' }, { modelName: 'asc' }]
    });

    return NextResponse.json({
      success: true,
      pricings,
      platformFeePercent: DEFAULT_PLATFORM_FEE_PERCENT,
      creditsPerUsd: CREDITS_PER_USD,
      plans: PLANS_CONFIG
    });
  } catch (error: any) {
    console.error('Error in pricing GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { serviceType, modelName, costPerUnit, unitType = 'PER_REQUEST', isActive = true } = body;

    if (!serviceType || !modelName || typeof costPerUnit !== 'number') {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const created = await prisma.servicePricing.upsert({
      where: {
        serviceType_modelName: {
          serviceType,
          modelName
        }
      },
      update: {
        costPerUnit,
        unitType,
        isActive
      },
      create: {
        serviceType,
        modelName,
        costPerUnit,
        unitType,
        isActive
      }
    });

    return NextResponse.json({ success: true, pricing: created });
  } catch (error: any) {
    console.error('Error in pricing POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
