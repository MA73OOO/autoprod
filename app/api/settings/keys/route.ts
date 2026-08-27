import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API Key are required' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Idealmente usar SERVICE_ROLE_KEY si tienes RLS restrictivo
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener la sesión activa del usuario
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: '',
      });
    }
    
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // Since this is local dev and might not have strict auth headers passed from the client,
    // we fallback to a hardcoded dev UUID if no user is found for testing purposes.
    let userId = userData?.user?.id;
    if (!userId) {
      // Intento de fallback o retorno de 401
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      
      // FIX TEMPORAL LOCAL: Si tu app no usa Supabase Auth en el front, 
      // necesitarás pasar el userId desde el front o leerlo de la base de datos de Prisma
      console.warn("No Supabase user found in request headers. Make sure to pass the JWT.");
      return NextResponse.json({ error: 'Unauthorized. Missing JWT in Authorization header.' }, { status: 401 });
    }

    // Call the RPC function created in Supabase Vault setup
    const { error: rpcError } = await supabase.rpc('save_api_key', {
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
      return NextResponse.json({ configured: [] });
    }

    const { data, error } = await supabase
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
