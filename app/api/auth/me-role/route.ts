import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/src/prisma/db';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ role: 'USER' }, { status: 401 });
    }

    const dbUser = await db.orm.public.User
      .where({ email: user.email! })
      .first();

    return NextResponse.json({ role: dbUser?.role ?? 'USER' });
  } catch {
    return NextResponse.json({ role: 'USER' }, { status: 500 });
  }
}
