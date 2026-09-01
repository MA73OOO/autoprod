import { NextResponse } from 'next/server';
import { db as prisma } from '@/src/prisma/db';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      // Auto-create wallet for backwards compatibility
      wallet = await prisma.wallet.create({
        data: { userId, balance: 10 }
      });
    }

    return NextResponse.json({ balance: wallet.balance });
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
