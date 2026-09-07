import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

async function getApiKey(userId: string): Promise<string> {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
    return process.env.OPENAI_API_KEY.trim();
  }
  try {
    const supabase = await createClient();
    const { data: oaiKey } = await supabase.rpc('get_api_key', { p_user_id: userId, p_provider: 'openai' });
    if (oaiKey && typeof oaiKey === 'string' && oaiKey.trim() !== '') {
      return oaiKey.trim();
    }
  } catch (e) {
    console.warn('Error fetching key from Vault:', e);
  }
  throw new Error('No se encontró ninguna clave de OpenAI (OPENAI_API_KEY) configurada.');
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const body = await req.json();
    const {
      prompt,
      aspectRatio = '16:9',
      channelId,
      channelName,
      customFileName,
      type = 'THUMBNAIL',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'El prompt es obligatorio' }, { status: 400 });
    }

    const apiKey = await getApiKey(user.id);

    // Dimensiones según aspecto para DALL-E 3
    let size = '1792x1024'; // 16:9 YouTube Thumbnail
    if (aspectRatio === '9:16') {
      size = '1024x1792'; // 9:16 Shorts
    } else if (aspectRatio === '1:1') {
      size = '1024x1024'; // Cuadrado
    }

    // 1. Llamar a OpenAI DALL-E 3
    const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt.trim(),
        n: 1,
        size,
        response_format: 'b64_json',
        quality: 'standard',
      }),
    });

    if (!openAiRes.ok) {
      const err = await openAiRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || 'Error al generar la imagen con DALL-E 3' },
        { status: 500 }
      );
    }

    const data = await openAiRes.json();
    const b64Data = data.data?.[0]?.b64_json;
    const revisedPrompt = data.data?.[0]?.revised_prompt || prompt;

    if (!b64Data) {
      return NextResponse.json({ error: 'No se recibieron datos de imagen de OpenAI' }, { status: 500 });
    }

    const timestamp = Date.now();
    const cleanName = customFileName
      ? customFileName.replace(/[^a-zA-Z0-9_-]/g, '_')
      : `imagen_${timestamp}`;
    const fileName = `${cleanName}.png`;

    // 2. Guardar físicamente en el disco local a través del Motor de Python
    let localPath: string | null = null;
    let sizeBytes = 0;
    try {
      const subfolder = type === 'THUMBNAIL' ? 'Miniaturas' : 'Imagenes';
      const motorRes = await fetch('http://127.0.0.1:8000/workspace/save_binary_file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64_data: b64Data,
          file_name: fileName,
          channel_name: channelName || null,
          subfolder,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (motorRes.ok) {
        const motorData = await motorRes.json();
        localPath = motorData.path || null;
        sizeBytes = motorData.sizeBytes || 0;
      }
    } catch (e) {
      console.warn('Motor no disponible para guardado local directo:', e);
    }

    const imageBuffer = Buffer.from(b64Data, 'base64');
    if (!sizeBytes) sizeBytes = imageBuffer.length;

    // 3. Subir a Supabase Storage
    let storageUrl: string | null = null;
    try {
      const supabase = await createClient();
      const storagePath = `${user.id}/images/${timestamp}_${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(storagePath, imageBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('assets')
          .getPublicUrl(storagePath);
        storageUrl = publicUrl;
      } else {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (e) {
      console.warn('Could not upload to Supabase storage:', e);
    }

    // 4. Registrar en la base de datos (Prisma Asset)
    const asset = await db.asset.create({
      data: {
        userId: user.id,
        channelId: channelId || null,
        name: fileName,
        type: type || 'THUMBNAIL',
        format: 'png',
        prompt: prompt.trim(),
        storageUrl: storageUrl || null,
        localPath: localPath || null,
        sizeBytes: BigInt(sizeBytes),
        metadata: {
          revisedPrompt,
          aspectRatio,
          dalleResolution: size,
          engine: 'dall-e-3',
        },
      },
      include: {
        channel: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Imagen generada y guardada exitosamente.',
      asset: {
        ...asset,
        sizeBytes: Number(asset.sizeBytes),
        channelName: asset.channel?.name || null,
      },
      revisedPrompt,
    });
  } catch (err: any) {
    console.error('Error in image generation:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno durante la generación de imagen' },
      { status: 500 }
    );
  }
}
