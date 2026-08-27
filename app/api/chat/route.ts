import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

// For now, we will handle text streaming based on the provider and model
export async function POST(req: Request) {
  try {
    const { messages, provider, model } = await req.json();

    if (!messages || !provider) {
      return NextResponse.json({ error: 'Messages and provider are required' }, { status: 400 });
    }

    // Initialize Supabase admin client to access the vault securely
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Note: We need SERVICE_ROLE_KEY to bypass RLS and read decrypted vault secrets
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { createClient: createServerClient } = require('@/lib/supabase/server');
    const supabaseServer = await createServerClient();
    const { data: userData } = await supabaseServer.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      console.warn("No valid session found (no cookies or auth header). This will fail in production.");
    }



    let vaultId = null;
    let userError = null;

    if (provider !== 'ollama' && userId) {
      const { data: keyRecord, error: keyError } = await supabase
        .from('user_api_keys')
        .select('key_id')
        .eq('user_id', userId)
        .eq('provider', provider)
        .single();

      if (keyError) {
        userError = keyError;
      } else {
        vaultId = keyRecord?.key_id;
      }
    }

    if (userError && provider !== 'ollama') {
      console.error('Error fetching user vault IDs:', userError);
      return NextResponse.json({ error: 'Failed to retrieve user settings' }, { status: 500 });
    }

    if (!vaultId && provider !== 'ollama') {
      console.error('User key not found in DB');
      return NextResponse.json({ error: 'Failed to retrieve user settings' }, { status: 500 });
    }

    // 3. Fetch the actual decrypted API key from Supabase Vault via RPC
    let apiKey = '';

    if (provider !== 'ollama') {
      // Query the decrypted secret (Requires Service Role and Vault enabled)
      const { data: secretData, error: secretError } = await supabase
        .from('decrypted_secrets')
        .select('decrypted_secret')
        .eq('id', vaultId)
        .single();

      if (secretError || !secretData) {
        console.error('Error reading from vault:', secretError);
        return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 });
      }

      apiKey = secretData.decrypted_secret;
    }

    // 4. Route to the correct Vercel AI SDK provider
    let aiModel;

    switch (provider) {
      case 'openai':
      case 'chatgpt':
        // The Vercel AI SDK 'openai' provider supports passing a custom api key per request or globally.
        // As of newer ai sdk versions, we use the provider instance:
        const customOpenAI = openai('gpt-4o', { apiKey });
        aiModel = customOpenAI;
        break;
      case 'anthropic':
        const customAnthropic = anthropic(model || 'claude-3-5-sonnet-20240620', { apiKey });
        aiModel = customAnthropic;
        break;
      case 'gemini':
        const customGoogle = google(model || 'models/gemini-1.5-flash', { apiKey });
        aiModel = customGoogle;
        break;
      case 'ollama':
        const { createOpenAI } = require('@ai-sdk/openai');
        const ollamaProvider = createOpenAI({
          baseURL: 'http://127.0.0.1:11434/v1',
          apiKey: 'ollama' // dummy key required by openai provider
        });
        aiModel = ollamaProvider(model || 'llama3.1');
        break;
      default:
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // 5. Stream the response
    const result = await streamText({
      model: aiModel,
      messages,
      system: 'You are a helpful assistant integrated into AutoProd. Be professional and concise.',
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
