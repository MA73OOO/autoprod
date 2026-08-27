import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API Key are required' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = await createClient();
    
    const { data: userData, error: userError } = await supabase.auth.getUser();

    let userId = userData?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Missing valid session.' }, { status: 401 });
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
    const supabase = await createClient();

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
