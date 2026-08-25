import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/src/prisma/db';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Lazy sync user to PostgreSQL in case they were dropped from database
    let dbUser = await db.orm.public.User.where({ id: user.id }).first();
    if (!dbUser) {
      const role = user.email === 'mateo@autoprod.io' ? 'ADMIN' : 'USER';
      await db.orm.public.User.create({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split('@')[0],
        role: role,
      });
    }

    // Fetch channels and include videos
    const channels = await db.orm.public.Channel
      .where({ userId: user.id })
      .include('videos', (v) => v.orderBy((video) => video.createdAt.desc()))
      .all();

    return NextResponse.json(channels);
  } catch (err: any) {
    console.error('Error fetching channels:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
