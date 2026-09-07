import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { isOrchestratorFreeForUser } from '@/lib/pricing-config';

interface ApiKeyResolution {
  apiKey: string;
  isSystemKey: boolean;
}

async function resolveOpenAiKey(userId: string): Promise<ApiKeyResolution> {
  const supabase = await createClient();

  // 1. PRIORIDAD 1: BYOK en User Vault (openaiVaultId)
  try {
    const userRecord = await db.user.findUnique({
      where: { id: userId },
      select: { openaiVaultId: true }
    });
    if (userRecord?.openaiVaultId) {
      const { data: secretData } = await supabase.rpc('get_decrypted_secret', { p_secret_id: userRecord.openaiVaultId });
      if (secretData) {
        const key = typeof secretData === 'string' ? secretData : secretData.get_decrypted_secret || secretData;
        if (key && key.trim()) {
          return { apiKey: key.trim(), isSystemKey: false };
        }
      }
    }
  } catch (e) {
    console.warn('Error reading user openaiVaultId:', e);
  }

  // 1b. PRIORIDAD 2: BYOK vía RPC get_api_key
  try {
    const { data: rpcKey } = await supabase.rpc('get_api_key', { p_user_id: userId, p_provider: 'openai' });
    if (rpcKey && typeof rpcKey === 'string' && rpcKey.trim() !== '') {
      return { apiKey: rpcKey.trim(), isSystemKey: false };
    }
  } catch (e) {
    console.warn('Error fetching key from Vault via RPC:', e);
  }

  // 2. PRIORIDAD 3: Llave Maestra del Sistema (Admin / Servidor)
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
    return { apiKey: process.env.OPENAI_API_KEY.trim(), isSystemKey: true };
  }

  // 2b. Buscar en SystemSettings Vault
  try {
    const sysSettings = await db.systemSettings.findUnique({ where: { id: 'global' } });
    if (sysSettings?.openaiVaultId) {
      const { data: sysKey } = await supabase.rpc('get_decrypted_secret', { p_secret_id: sysSettings.openaiVaultId });
      if (sysKey) {
        const key = typeof sysKey === 'string' ? sysKey : sysKey.get_decrypted_secret || sysKey;
        if (key && key.trim()) {
          return { apiKey: key.trim(), isSystemKey: true };
        }
      }
    }
  } catch (e) {
    console.warn('Error reading systemSettings vault for openai:', e);
  }

  throw new Error('No se encontró ninguna clave de OpenAI (OPENAI_API_KEY) configurada ni en BYOK ni en el servidor.');
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const body = await req.json();
    const { imageBase64, userIntent } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Se requiere la imagen de referencia (imageBase64)' }, { status: 400 });
    }

    const { apiKey, isSystemKey } = await resolveOpenAiKey(user.id);

    // Obtener plan de suscripción del usuario
    const userWithSub = await db.user.findUnique({
      where: { id: user.id },
      include: { subscription: { include: { plan: true } } }
    });
    const userPlanName = userWithSub?.subscription?.plan?.name || 'FREE';

    // Determinar créditos requeridos para análisis visual con gpt-4o-mini
    let requiredCredits = 0;
    if (isSystemKey) {
      const isFree = isOrchestratorFreeForUser(userPlanName, 'gpt-4o-mini');
      requiredCredits = isFree ? 0 : 1; // 1 crédito para cuentas FREE, 0 para planes de pago
    }

    let wallet = null;
    if (isSystemKey && requiredCredits > 0) {
      wallet = await db.wallet.findUnique({ where: { userId: user.id } });
      if (!wallet) {
        wallet = await db.wallet.create({ data: { userId: user.id, balance: 50 } });
      }

      if (wallet.balance < requiredCredits) {
        return NextResponse.json({
          error: `Has agotado tus créditos de prueba gratuita. Para continuar analizando imágenes y usando AutoProd, suscríbete a un plan o añade créditos.`,
          requiresUpgrade: true
        }, { status: 402 });
      }
    }

    const formattedImage = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const systemPrompt = `Eres un Director de Arte y Co-pilot experto en Miniaturas de YouTube y Dirección Visual para videos en AutoProd.
Tu trabajo es analizar la imagen de referencia que el usuario subió y desglosarla para que juntos construyan la mejor miniatura o arte visual.

Debes responder SIEMPRE en formato JSON estricto con las siguientes claves:
{
  "style": "Descripción concisa del estilo artístico (ej. 3D Render Pixar, Anime Studio Ghibli, Hiperrealismo Cinematográfico, Ilustración Vectorial Plana, Cyberpunk Neón)",
  "lighting": "Tipo de iluminación y atmósfera (ej. Luz dorada dramática de atardecer con contrastes altos, Luz volumétrica suave)",
  "palette": "Paleta cromática dominante (ej. Tonos morados profundos, cian brillante y toques de amarillo neón)",
  "composition": "Encuadre y composición visual (ej. Primer plano centrado con ángulo bajo y desenfoque de fondo bokeh)",
  "summary": "Resumen técnico de 2-3 oraciones describiendo la imagen para el usuario.",
  "suggestedQuestions": [
    "Pregunta 1 directa y creativa para aterrizar el sujeto o personaje principal",
    "Pregunta 2 sobre si desea adaptar los colores o el estilo a su canal específico",
    "Pregunta 3 sobre la emoción central o el texto/gancho de miniatura"
  ],
  "draftPrompt": "Un prompt en inglés ultra optimizado para DALL-E 3 que recrea este estilo artístico de base."
}`;

    const promptUser = userIntent
      ? `El usuario tiene la siguiente intención preliminar: "${userIntent}". Analiza la imagen de referencia y formula las preguntas adecuadas teniendo esto en cuenta.`
      : `Analiza detalladamente esta imagen de referencia y formula preguntas para ayudar al usuario a crear una miniatura o arte visual basado en ella.`;

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: promptUser },
              {
                type: 'image_url',
                image_url: { url: formattedImage, detail: 'low' },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openAiRes.ok) {
      const err = await openAiRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || 'Error analizando la imagen con OpenAI' },
        { status: 500 }
      );
    }

    const openAiData = await openAiRes.json();
    const content = openAiData.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    // Descuento de créditos para usuarios FREE que usan la plataforma
    let newBalance: number | null = null;
    if (isSystemKey && wallet && requiredCredits > 0) {
      try {
        const [updatedWallet] = await db.$transaction([
          db.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: requiredCredits } }
          }),
          db.creditConsumption.create({
            data: {
              walletId: wallet.id,
              creditsUsed: requiredCredits,
              serviceType: 'TOOL',
              modelName: 'gpt-4o-mini-vision',
              description: 'Análisis multimodal de imagen de referencia con GPT-4o-mini'
            }
          })
        ]);
        newBalance = updatedWallet.balance;
      } catch (e: any) {
        console.warn('Error debiting analyze credits:', e.message);
      }
    }

    return NextResponse.json({
      success: true,
      analysis: parsed,
      newBalance
    });
  } catch (err: any) {
    console.error('Error analyzing image:', err);
    return NextResponse.json({ error: err.message || 'Error al analizar la imagen' }, { status: 500 });
  }
}
