import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db as prisma } from '@/src/prisma/db';
import { PLANS_CONFIG } from '@/lib/pricing-config';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { planName } = body; // 'STARTER' | 'PRO' | 'ENTERPRISE'

    const targetPlan = PLANS_CONFIG[planName as 'STARTER' | 'PRO' | 'ENTERPRISE'];
    if (!targetPlan || targetPlan.name === 'FREE') {
      return NextResponse.json({ error: 'Plan inválido para checkout' }, { status: 400 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    // Obtener variantId según el plan
    let variantId = '';
    if (planName === 'STARTER') {
      variantId = process.env.LEMONSQUEEZY_STARTER_VARIANT_ID || '';
    } else if (planName === 'PRO') {
      variantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID || '';
    } else if (planName === 'ENTERPRISE') {
      variantId = process.env.LEMONSQUEEZY_ENTERPRISE_VARIANT_ID || '';
    }

    // Si las llaves de Lemon Squeezy están configuradas y tenemos variantId, generar el checkout real
    if (apiKey && storeId && variantId) {
      const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: {
              checkout_data: {
                email: supabaseUser.email,
                name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
                custom: {
                  user_id: supabaseUser.id,
                  plan_name: planName
                }
              },
              product_options: {
                redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`,
              }
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: storeId
                }
              },
              variant: {
                data: {
                  type: 'variants',
                  id: variantId
                }
              }
            }
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.data?.attributes?.url) {
        return NextResponse.json({
          success: true,
          url: data.data.attributes.url
        });
      } else {
        console.warn('Lemon Squeezy API response error:', data);
      }
    }

    // Fallback amigable si Lemon Squeezy aún no tiene credenciales en el .env local
    return NextResponse.json({
      success: true,
      isTestMode: true,
      message: 'Las credenciales de Lemon Squeezy no están configuradas en .env. Puedes proceder mediante pago Nequi o transferencia bancaria directa.',
      manualPayment: true,
      plan: targetPlan
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Error al generar checkout' }, { status: 500 });
  }
}
