import { NextResponse } from 'next/server';
import crypto from 'crypto';

const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone();
    const eventType = req.headers.get('X-Event-Name');
    const signature = req.headers.get('X-Signature');

    // 1. Verificar firma
    const bodyText = await clonedReq.text();
    const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET);
    const digest = Buffer.from(hmac.update(bodyText).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature || '', 'utf8');

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = await req.json();
    const customData = payload.meta.custom_data;
    const userId = customData?.user_id;

    if (!userId) {
      return NextResponse.json({ error: 'No user_id found in metadata' }, { status: 400 });
    }

    // 2. Procesar eventos de pago exitoso (suscripciones o compra de créditos)
    if (eventType === 'order_created' || eventType === 'subscription_created') {
      const amountUsd = payload.data.attributes.total_usd / 100;
      const isSubscription = eventType === 'subscription_created';
      
      // A. Registrar en Libro Mayor (Dinero Real)
      // TODO: Migrar a Supabase
      /* await prisma.paymentLedger.create({
        data: {
          userId,
          amountUsd,
          paymentType: isSubscription ? 'SUBSCRIPTION' : 'CREDIT_PACK',
          referenceId: payload.data.id,
          description: payload.data.attributes.first_order_item?.product_name || 'Compra en AutoProd'
        }
      }); */

      // B. Acreditar Capacidades (Créditos) en Wallet
      // TODO: Determinar cuántos créditos otorgar según el monto pagado
      const creditsToAdd = amountUsd * 10; // Ejemplo: 1 USD = 10 créditos

      /* await prisma.wallet.upsert({
        where: { userId },
        update: { balance: { increment: creditsToAdd } },
        create: { userId, balance: creditsToAdd }
      }); */
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
