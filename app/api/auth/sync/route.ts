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
    let user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
      include: {
        subscription: {
          include: {
            plan: {
              include: {
                limits: true
              }
            }
          }
        },
        wallet: true
      }
    });

    if (!user) {
      // Determine user role (e.g. mateo@autoprod.io is ADMIN)
      const role = supabaseUser.email === 'mateo@autoprod.io' ? 'ADMIN' : 'USER';

      // Sync/Create the user record in Prisma using Supabase User ID (UUID)
      user = await db.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata.full_name || supabaseUser.email!.split('@')[0],
          role: role,
        },
        include: {
          subscription: {
            include: { plan: { include: { limits: true } } }
          },
          wallet: true
        }
      });
    }

    // Ensure User has a Wallet (50 free trial credits for new users)
    let wallet = user.wallet;
    if (!wallet) {
      wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 50 // 50 tokens iniciales de cortesía para pruebas
        }
      });
    } else if (wallet.balance < 50 && (!user.subscription || user.subscription.plan.name === 'FREE')) {
      // Actualizar a los 50 créditos de cortesía si tenía menos por el seed legacy
      wallet = await db.wallet.update({
        where: { id: wallet.id },
        data: { balance: 50 }
      });
    }

    // Ensure User has a Subscription (fallback to FREE if not exists)
    let subscription = user.subscription;
    if (!subscription) {
      let freePlan = await db.plan.findUnique({
        where: { name: 'FREE' }
      });

      if (!freePlan) {
        freePlan = await db.plan.create({
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

      subscription = await db.userSubscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: 'active'
        },
        include: {
          plan: {
            include: { limits: true }
          }
        }
      });
    }

    // Calcular límites
    const maxChannels = subscription?.plan?.limits?.maxChannels ?? 1;
    const planName = subscription?.plan?.name ?? 'FREE';

    return NextResponse.json({
      success: true,
      role: user.role,
      plan: { name: planName },
      planName: planName,
      planStatus: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      wallet: { balance: wallet.balance },
      creditsBalance: wallet.balance,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: planName,
        planStatus: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        maxChannels: maxChannels,
        creditsBalance: wallet.balance
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

