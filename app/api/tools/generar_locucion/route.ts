import { NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { createClient } from '@/lib/supabase/server';
import { getControladorUrl } from '@/lib/controlador-client';

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

  // 2. PRIORIDAD 2: BYOK vía RPC get_api_key
  try {
    const { data: rpcKey } = await supabase.rpc('get_api_key', { p_user_id: userId, p_provider: 'openai' });
    if (rpcKey && typeof rpcKey === 'string' && rpcKey.trim() !== '') {
      return { apiKey: rpcKey.trim(), isSystemKey: false };
    }
  } catch (e) {
    console.warn('Error fetching key from Vault via RPC:', e);
  }

  // 3. PRIORIDAD 3: Llave Maestra del Sistema (Admin / Servidor)
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
    return { apiKey: process.env.OPENAI_API_KEY.trim(), isSystemKey: true };
  }

  throw new Error('No se encontró ninguna clave de OpenAI (OPENAI_API_KEY) configurada ni en Vault ni en el servidor.');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      texto,
      canal,
      video,
      ruta_destino,
      proveedor = 'edge_tts',
      voz,
      _userContext
    } = body;

    const userId = _userContext?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado: Falta contexto de usuario' }, { status: 401 });
    }

    if (!texto || typeof texto !== 'string' || !texto.trim()) {
      return NextResponse.json({ error: 'El parámetro "texto" es requerido para generar la locución.' }, { status: 400 });
    }

    const cleanText = texto.trim();
    const selectedProvider = proveedor === 'openai' ? 'openai' : 'edge_tts';
    const selectedVoice = voz || (selectedProvider === 'openai' ? 'onyx' : 'es-ES-AlvaroNeural');

    // ──────────────────────────────────────────────
    // 1. ESCENARIO A: Opción Gratuita ($0) con Edge-TTS Local
    // ──────────────────────────────────────────────
    if (selectedProvider === 'edge_tts') {
      const motorUrl = getControladorUrl();
      const motorRes = await fetch(`${motorUrl}/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'edge_tts',
          voice: selectedVoice,
          text: cleanText,
          target_path: ruta_destino || null,
          channel_name: canal || null,
          video_title: video || null,
        })
      });

      if (!motorRes.ok) {
        const errData = await motorRes.json().catch(() => ({}));
        throw new Error(errData.detail || 'Fallo en la síntesis de Edge-TTS en el motor local.');
      }

      const motorData = await motorRes.json();
      return NextResponse.json({
        success: true,
        provider: 'edge_tts',
        voice: selectedVoice,
        costCredits: 0,
        message: `¡Locución gratuita generada exitosamente con la voz ${selectedVoice}! ($0 costo)`,
        file_name: motorData.file_name,
        file_path: motorData.file_path,
        duration_seconds: motorData.duration_seconds,
        next_step_tip: 'Ahora puedes sincronizar subtítulos palabra por palabra con Faster-Whisper a costo $0.'
      });
    }

    // ──────────────────────────────────────────────
    // 2. ESCENARIO B: Opción OpenAI TTS (tts-1)
    // ──────────────────────────────────────────────
    const { apiKey, isSystemKey } = await resolveOpenAiKey(userId);

    // Calcular créditos si usa la llave del sistema (1 crédito por cada 1.000 caracteres)
    const requiredCredits = isSystemKey ? Math.max(1, Math.ceil(cleanText.length / 1000)) : 0;
    let wallet = null;

    if (isSystemKey) {
      wallet = await db.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await db.wallet.create({ data: { userId, balance: 50 } });
      }

      if (wallet.balance < requiredCredits) {
        return NextResponse.json({
          error: `Créditos insuficientes (${wallet.balance} disponibles, necesitas ${requiredCredits} créditos para sintetizar ${cleanText.length} caracteres con OpenAI TTS). Puedes usar Edge-TTS gratuitamente o recargar saldo.`,
          requiresUpgrade: true,
          freeAlternativeAvailable: true
        }, { status: 402 });
      }
    }

    // Delegar síntesis al Motor Local pasando la API key resuelta
    const motorUrl = getControladorUrl();
    const motorRes = await fetch(`${motorUrl}/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        voice: selectedVoice,
        text: cleanText,
        target_path: ruta_destino || null,
        channel_name: canal || null,
        video_title: video || null,
        api_key: apiKey
      })
    });

    if (!motorRes.ok) {
      const errData = await motorRes.json().catch(() => ({}));
      throw new Error(errData.detail || 'Fallo generando audio con OpenAI TTS en el motor local.');
    }

    const motorData = await motorRes.json();

    // Descontar créditos si usó la llave de plataforma
    let remainingBalance: number | null = null;
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
              modelName: 'openai-tts-1',
              description: `Locución de voz con OpenAI (${selectedVoice}): ${motorData.file_name}`
            }
          })
        ]);
        remainingBalance = updatedWallet.balance;
      } catch (e: any) {
        console.warn('Error debiting TTS credits:', e.message);
      }
    }

    return NextResponse.json({
      success: true,
      provider: 'openai',
      voice: selectedVoice,
      costCredits: requiredCredits,
      remainingBalance,
      message: `¡Locución con OpenAI TTS (${selectedVoice}) generada y guardada exitosamente!`,
      file_name: motorData.file_name,
      file_path: motorData.file_path,
      duration_seconds: motorData.duration_seconds,
      next_step_tip: 'Ahora puedes sincronizar subtítulos palabra por palabra con Faster-Whisper a costo $0.'
    });

  } catch (err: any) {
    console.error('Error in generar_locucion tool:', err);
    return NextResponse.json({ error: err.message || 'Error interno generando locución' }, { status: 500 });
  }
}
