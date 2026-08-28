import { NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const channels = await db.channel.findMany({
      where: { userId: user.id },
      include: {
        videos: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json(channels);
  } catch (err: any) {
    console.error('Error fetching channels:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
