import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db as prisma } from '@/src/prisma/db';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const [payments, consumptions, totalPaymentsSum, totalCreditsUsedSum] = await Promise.all([
      prisma.paymentLedger.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.creditConsumption.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      }),
      prisma.paymentLedger.aggregate({
        _sum: { amountUsd: true },
        _count: { id: true }
      }),
      prisma.creditConsumption.aggregate({
        _sum: { creditsUsed: true },
        _count: { id: true }
      })
    ]);

    const totalIncomeUsd = totalPaymentsSum._sum.amountUsd || 0;
    const estimatedCommissionsUsd = totalIncomeUsd * 0.10; // 10% estimado de comisión sobre tokens
    const totalCreditsUsed = totalCreditsUsedSum._sum.creditsUsed || 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalIncomeUsd,
        totalPaymentsCount: totalPaymentsSum._count.id || 0,
        estimatedCommissionsUsd,
        totalCreditsUsed,
        totalConsumptionsCount: totalCreditsUsedSum._count.id || 0,
      },
      payments,
      consumptions
    });
  } catch (error: any) {
    console.error('Error in ledger GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
