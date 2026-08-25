import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/src/prisma/db';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get the current logged-in user session from Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json(
        { error: 'No autorizado o token inválido' },
        { status: 401 }
      );
    }

    // Check if the user already exists in the Prisma PostgreSQL database
    let user = await db.orm.public.User
      .where({ email: supabaseUser.email! })
      .first();

    if (!user) {
      // Determine user role (e.g. mateo@autoprod.io is ADMIN)
      const role = supabaseUser.email === 'mateo@autoprod.io' ? 'ADMIN' : 'USER';

      // Sync/Create the user record in Prisma using Supabase User ID (UUID)
      user = await db.orm.public.User.create({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata.full_name || supabaseUser.email!.split('@')[0],
        role: role,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (err: any) {
    console.error('Error in auth sync:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
