import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API Key are required' }, { status: 400 });
    }

    // Initialize Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    const { createClient: createServerClient } = require('@/lib/supabase/server');
    const supabaseServer = await createServerClient();
    const { data: userData } = await supabaseServer.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Missing valid session.' }, { status: 401 });
    }

    // Call the RPC function created in Supabase Vault setup
    const { error: rpcError } = await supabaseAdmin.rpc('save_api_key', {
      p_user_id: userId,
      p_provider: provider,
      p_api_key: apiKey
    });

    if (rpcError) {
      console.error('Error saving API Key to Vault:', rpcError);
      return NextResponse.json({ error: 'Failed to save API Key safely' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `${provider} key saved successfully in Vault` });
  } catch (error) {
    console.error('API Key Save Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    // Initialize Supabase admin client to bypass RLS on user_api_keys
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error) throw error;
      userId = user?.id;
    } else {
      // Fallback a la sesión del servidor para cuando se llama directo en la app de Next.js
      const { createClient: createServerClient } = require('@/lib/supabase/server');
      const supabaseServer = await createServerClient();
      const { data: userData } = await supabaseServer.auth.getUser();
      userId = userData?.user?.id;
    }

    if (!userId) {
      console.warn("No auth header provided. This will fail in production.");
      return NextResponse.json({ configured: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('user_api_keys')
      .select('provider')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching configured keys:', error);
      return NextResponse.json({ configured: [] });
    }

    return NextResponse.json({ configured: data.map((d: any) => d.provider) });
  } catch (error) {
    console.error('API Key Fetch Error:', error);
    return NextResponse.json({ configured: [] });
  }
}
