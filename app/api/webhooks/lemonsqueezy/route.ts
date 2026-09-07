import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db as prisma } from '@/src/prisma/db';
import { PLANS_CONFIG, calculatePlanCredits } from '@/lib/pricing-config';

const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone();
    const eventType = req.headers.get('X-Event-Name');
    const signature = req.headers.get('X-Signature');

    // 1. Verificar firma HMAC SHA-256 si el secreto está configurado
    const bodyText = await clonedReq.text();
    if (LEMONSQUEEZY_WEBHOOK_SECRET) {
      const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET);
      const digest = Buffer.from(hmac.update(bodyText).digest('hex'), 'utf8');
      const signatureBuffer = Buffer.from(signature || '', 'utf8');

      if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = await req.json();
    const customData = payload.meta?.custom_data;
    const userId = customData?.user_id;

    if (!userId) {
      return NextResponse.json({ error: 'No user_id found in custom_data metadata' }, { status: 400 });
    }

    const planName = (customData?.plan_name || 'PRO').toUpperCase();
    const planConfig = PLANS_CONFIG[planName as 'STARTER' | 'PRO' | 'ENTERPRISE'] || PLANS_CONFIG.PRO;

    // 2. Procesar eventos de suscripción creada o compra de orden
    if (eventType === 'order_created' || eventType === 'subscription_created') {
      const amountUsd = payload.data?.attributes?.total_usd 
        ? payload.data.attributes.total_usd / 100 
        : planConfig.priceUsd;

      // Buscar plan en base de datos
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
                maxVideosPerChannel: planConfig.maxVideosPerChannel,
                canRenderInCloud: planConfig.canRenderInCloud,
                hasAdvancedTemplates: planConfig.hasAdvancedTemplates,
                maxMonthlyRenderMinutes: planConfig.whisperCloudMinutes,
              }
            }
          }
        });
      }

      // 30 días de vigencia
      const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // A. Actualizar o crear suscripción
      await prisma.userSubscription.upsert({
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
      });

      // B. Calcular créditos netos aplicando la comisión de plataforma (ej. 10%)
      const { creditsToGrant, feeAmountUsd } = calculatePlanCredits(planConfig.tokenBudgetUsd);

      // C. Acreditar en Wallet
      await prisma.wallet.upsert({
        where: { userId },
        update: { balance: { increment: creditsToGrant } },
        create: { userId, balance: creditsToGrant }
      });

      // D. Registrar en Libro Mayor (PaymentLedger)
      await prisma.paymentLedger.create({
        data: {
          userId,
          amountUsd,
          paymentType: 'LEMONSQUEEZY_SUBSCRIPTION',
          referenceId: String(payload.data?.id || `ls_${Date.now()}`),
          description: `Suscripción ${planConfig.displayName} Lemon Squeezy (Retención comisión: $${feeAmountUsd} USD)`
        }
      });
    } else if (eventType === 'subscription_cancelled') {
      await prisma.userSubscription.updateMany({
        where: { userId },
        data: { status: 'cancelled' }
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error in Lemon Squeezy:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
