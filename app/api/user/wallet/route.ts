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

    // Buscar o asegurar usuario y su suscripción en Prisma
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: {
              include: { limits: true }
            }
          }
        },
        wallet: true
      }
    });

    // Si el usuario existe por email pero con otro ID o no ha sido sincronizado
    if (!user && userData.user.email) {
      user = await prisma.user.findUnique({
        where: { email: userData.user.email },
        include: {
          subscription: {
            include: {
              plan: { include: { limits: true } }
            }
          },
          wallet: true
        }
      });
    }

    // Si aún no existe, crearlo
    if (!user && userData.user.email) {
      const role = userData.user.email === 'mateo@autoprod.io' ? 'ADMIN' : 'USER';
      user = await prisma.user.create({
        data: {
          id: userId,
          email: userData.user.email,
          name: userData.user.user_metadata?.full_name || userData.user.email.split('@')[0],
          role
        },
        include: {
          subscription: { include: { plan: { include: { limits: true } } } },
          wallet: true
        }
      });
    }

    // Asegurar Suscripción FREE si no tiene ninguna
    let subscription = user?.subscription;
    if (!subscription && user) {
      let freePlan = await prisma.plan.findUnique({ where: { name: 'FREE' } });
      if (!freePlan) {
        freePlan = await prisma.plan.create({
          data: {
            name: 'FREE',
            limits: {
              create: {
                maxChannels: 1,
                maxVideosPerChannel: 5,
                canRenderInCloud: false,
                hasAdvancedTemplates: false,
                maxMonthlyRenderMinutes: 0
              }
            }
          }
        });
      }

      subscription = await prisma.userSubscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: 'active'
        },
        include: {
          plan: { include: { limits: true } }
        }
      });
    }

    // Asegurar Wallet
    let wallet = user?.wallet;
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user ? user.id : userId,
          balance: 50 // 50 créditos de cortesía para pruebas iniciales
        }
      });
    }

    const planName = subscription?.plan?.name || 'FREE';
    const planStatus = subscription?.status || 'active';
    const maxChannels = subscription?.plan?.limits?.maxChannels || 1;

    return NextResponse.json({
      balance: wallet.balance,
      planName,
      planStatus,
      maxChannels,
      currentPeriodEnd: subscription?.currentPeriodEnd
    });
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
