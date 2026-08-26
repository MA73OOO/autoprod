import { NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

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
