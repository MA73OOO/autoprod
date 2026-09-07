import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db as prisma } from '@/src/prisma/db';
import { PLANS_CONFIG, calculatePlanCredits } from '@/lib/pricing-config';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const adminCheck = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true, email: true }
    });

    if (adminCheck?.role !== 'ADMIN' && adminCheck?.email !== 'mateo@autoprod.io') {
      return NextResponse.json({ error: 'Acceso restringido a Administradores' }, { status: 403 });
    }

    const body = await req.json();
    const {
      userId,
      planName = 'PRO',
      months = 1,
      customCredits,
      paymentMethod = 'NEQUI',
      amountUsd,
      referenceId = '',
      notes = ''
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId es obligatorio' }, { status: 400 });
    }

    const planConfig = PLANS_CONFIG[planName as 'STARTER' | 'PRO' | 'ENTERPRISE'] || PLANS_CONFIG.PRO;

    // Buscar o crear plan en DB
    let dbPlan = await prisma.plan.findUnique({
      where: { name: planConfig.name }
    });

    if (!dbPlan) {
      dbPlan = await prisma.plan.create({
        data: {
          name: planConfig.name,
          limits: {
            create: {
              maxChannels: planConfig.maxChannels,
              maxVideosPerChannel: planDataMax(planConfig),
              canRenderInCloud: planConfig.canRenderInCloud,
              hasAdvancedTemplates: planConfig.hasAdvancedTemplates,
              maxMonthlyRenderMinutes: planConfig.whisperCloudMinutes,
            }
          }
        }
      });
    }

    // Calcular créditos netos a otorgar
    let creditsToGrant: number;
    if (typeof customCredits === 'number' && customCredits >= 0) {
      creditsToGrant = customCredits;
    } else {
      const calculated = calculatePlanCredits(planConfig.tokenBudgetUsd);
      creditsToGrant = calculated.creditsToGrant * Number(months || 1);
    }

    // Calcular fecha de vencimiento
    const numMonths = Number(months) || 1;
    const currentPeriodEnd = new Date(Date.now() + numMonths * 30 * 24 * 60 * 60 * 1000);

    const finalAmountUsd = typeof amountUsd === 'number' ? amountUsd : (planConfig.priceUsd * numMonths);

    // Transacción atómica en Prisma
    const [updatedSub, updatedWallet, newLedger] = await prisma.$transaction([
      prisma.userSubscription.upsert({
        where: { userId },
        update: {
          planId: dbPlan.id,
          status: 'active',
          currentPeriodEnd,
        },
        create: {
          userId,
          planId: dbPlan.id,
          status: 'active',
          currentPeriodEnd,
        }
      }),
      prisma.wallet.upsert({
        where: { userId },
        update: {
          balance: { increment: creditsToGrant }
        },
        create: {
          userId,
          balance: creditsToGrant
        }
      }),
      prisma.paymentLedger.create({
        data: {
          userId,
          amountUsd: finalAmountUsd,
          paymentType: `MANUAL_${paymentMethod.toUpperCase()}`,
          referenceId: referenceId || `MANUAL-${Date.now()}`,
          description: notes || `Activación manual ${planConfig.displayName} (${numMonths} mes/es) vía ${paymentMethod}. Acreditados: ${creditsToGrant} tokens.`
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
      wallet: updatedWallet,
      ledger: newLedger,
      message: `¡Suscripción ${planConfig.displayName} activada con éxito! Se acreditaron ${creditsToGrant} créditos.`
    });
  } catch (error: any) {
    console.error('Error in manual subscription activation:', error);
    return NextResponse.json({ error: error.message || 'Error al activar suscripción' }, { status: 500 });
  }
}

function planDataMax(planConfig: any) {
  return planConfig.maxVideosPerChannel || 10;
}
