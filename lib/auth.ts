import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type AuthSuccess = { ok: true; user: { id: string; email: string } };
type AuthFailure = { ok: false; response: ReturnType<typeof NextResponse.json> };

/**
 * Parses the Supabase SSR auth cookie format from the cookie store.
 */
function getSupabaseAccessToken(cookieStore: any): string | null {
  const allCookies = cookieStore.getAll();
  
  // Find all chunks of the auth cookie (sorted by name extension, e.g. .0, .1)
  const authCookies = allCookies
    .filter((c: any) => c.name.includes('-auth-token'))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  if (authCookies.length === 0) return null;

  // Concatenate cookie values in case Supabase chunked the session
  const rawValue = authCookies.map((c: any) => c.value).join('');

  try {
    // If the cookie is prefixed with "base64-", strip it and decode the base64 JSON string
    if (rawValue.startsWith('base64-')) {
      const base64Data = rawValue.substring(7);
      const jsonStr = Buffer.from(base64Data, 'base64').toString('utf8');
      const parsed = JSON.parse(jsonStr);
      return parsed?.access_token || parsed?.[0] || null;
    }

    // Otherwise, try standard URL decoding and JSON parsing
    const decodedVal = decodeURIComponent(rawValue);
    const parsed = JSON.parse(decodedVal);
    return parsed?.access_token || parsed?.[0] || null;
  } catch {
    // Fallback: If it's stored flat or raw, decode URL component directly
    try {
      const decodedDirect = decodeURIComponent(rawValue);
      // Clean up base64- prefix if present here too
      if (decodedDirect.startsWith('base64-')) {
        const base64Data = decodedDirect.substring(7);
        const jsonStr = Buffer.from(base64Data, 'base64').toString('utf8');
        const parsed = JSON.parse(jsonStr);
        return parsed?.access_token || parsed?.[0] || null;
      }
      return decodedDirect;
    } catch {
      return rawValue;
    }
  }
}

/**
 * Synchronously decodes a JWT payload in memory without verifying signature.
 * Safe to use because the Middleware (middleware.ts) already validates the signature
 * on every request using Supabase Auth before routing to the API endpoints.
 */
function decodeJwt(token: string): { sub: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    
    const payload = JSON.parse(jsonPayload);
    if (payload.sub && payload.email) {
      return { sub: payload.sub, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Lightweight, 0ms latency auth guard for API routes.
 * Decodes the user session síncronamente from the JWT cookie.
 */
export async function getAuthUser(): Promise<AuthSuccess | AuthFailure> {
  try {
    const cookieStore = await cookies();
    const token = getSupabaseAccessToken(cookieStore);

    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        return {
          ok: true,
          user: {
            id: payload.sub,
            email: payload.email
          }
        };
      }
    }

    // Fallback: If local sync decode fails or token is not found/chunked differently,
    // call the secure async Supabase network check so it never fails.
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'No autorizado: Sesión inválida' }, { status: 401 }),
      };
    }

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email!
      }
    };
  } catch (err) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Error en autenticación interna' }, { status: 401 }),
    };
  }
}
