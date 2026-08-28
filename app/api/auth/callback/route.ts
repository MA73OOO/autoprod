import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/src/prisma/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    // Exchange the authorization code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const supabaseUser = data.user;

      // Sync the user to your Prisma PostgreSQL database
      let user = await db.user.findUnique({
        where: { email: supabaseUser.email! }
      });

      if (!user) {
        await db.user.create({
          data: {
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata.full_name || supabaseUser.email!.split('@')[0],
          }
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error, redirect back to login page with error
  return NextResponse.redirect(`${origin}/login?error=No se pudo iniciar sesión con Google`);
}
