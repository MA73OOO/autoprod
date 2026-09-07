import { NextRequest, NextResponse } from 'next/server';
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
    const { imageBase64, userIntent } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Se requiere la imagen de referencia (imageBase64)' }, { status: 400 });
    }

    const apiKey = await getApiKey(user.id);

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

    return NextResponse.json({
      success: true,
      analysis: parsed,
    });
  } catch (err: any) {
    console.error('Error analyzing image:', err);
    return NextResponse.json({ error: err.message || 'Error al analizar la imagen' }, { status: 500 });
  }
}
