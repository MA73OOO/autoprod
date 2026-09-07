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

    const adminCheck = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true, email: true }
    });

    if (adminCheck?.role !== 'ADMIN' && adminCheck?.email !== 'mateo@autoprod.io') {
      return NextResponse.json({ error: 'Acceso restringido a Administradores' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            status: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                id: true,
                name: true,
                limits: true
              }
            }
          }
        },
        wallet: {
          select: {
            id: true,
            balance: true,
            updatedAt: true
          }
        },
        paymentLedgers: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            amountUsd: true,
            paymentType: true,
            referenceId: true,
            description: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name || u.email.split('@')[0],
      email: u.email,
      role: u.role,
      plan: u.subscription?.plan?.name || 'FREE',
      status: u.subscription?.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE',
      subscriptionStatus: u.subscription?.status || 'active',
      currentPeriodEnd: u.subscription?.currentPeriodEnd || null,
      balance: u.wallet?.balance ?? 0,
      createdAt: u.createdAt,
      recentPayments: u.paymentLedgers
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
