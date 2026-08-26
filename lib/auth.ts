import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

type AuthSuccess = { ok: true; user: User };
type AuthFailure = { ok: false; response: ReturnType<typeof NextResponse.json> };

/**
 * Lightweight auth guard for API routes.
 * Calls supabase.auth.getUser() once and returns the user or a ready-made 401 response.
 * Does NOT perform any DB lazy-sync — that is handled exclusively by /api/auth/sync
 * which runs once on dashboard mount.
 */
export async function getAuthUser(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
  }

  return { ok: true, user };
}
