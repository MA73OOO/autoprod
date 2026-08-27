import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { prompt, provider } = await req.json();

    if (!prompt || !provider) {
      return NextResponse.json({ error: 'Prompt and Provider are required' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: '',
      });
    }

    const { data: userData } = await supabase.auth.getUser();
    let userId = userData?.user?.id;
    
    if (!userId) {
      console.warn("No Supabase user found for chat ask.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Obtener la llave desencriptada usando la función RPC
    const { data: apiKey, error: rpcError } = await supabase.rpc('get_api_key', {
      p_user_id: userId,
      p_provider: provider,
    });

    if (rpcError || !apiKey) {
      return NextResponse.json({ error: `API Key for ${provider} not found or invalid.` }, { status: 403 });
    }

    // 2. Hacer la petición a la IA real
    let aiResponseText = '';

    if (provider === 'gemini') {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Gemini API Error');
      aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';

    } else if (provider === 'openai' || provider === 'chatgpt') {
      const openaiUrl = 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(openaiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'OpenAI API Error');
      aiResponseText = data.choices?.[0]?.message?.content || 'Sin respuesta';
      
    } else {
      return NextResponse.json({ error: 'Provider not supported in cloud API' }, { status: 400 });
    }

    return NextResponse.json({ response: aiResponseText });

  } catch (error: any) {
    console.error('Cloud API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
