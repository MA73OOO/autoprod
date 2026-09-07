import { NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';
import { PLANS_CONFIG } from '@/lib/pricing-config';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const channels = await db.channel.findMany({
      where: { userId: user.id },
      include: {
        context: true,
        videos: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(channels);
  } catch (err: any) {
    console.error('Error fetching channels:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const body = await req.json().catch(() => ({}));
    const { name, localPath, niche, description } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'El nombre del canal es obligatorio.' }, { status: 400 });
    }

    const cleanName = name.trim();

    // 1. Obtener usuario y sus límites de suscripción
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: {
          include: {
            plan: {
              include: { limits: true }
            }
          }
        }
      }
    });

    const userPlan = (dbUser?.subscription?.plan?.name as 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE') || 'FREE';
    const planConfig = PLANS_CONFIG[userPlan] || PLANS_CONFIG.FREE;
    const maxChannels = dbUser?.role === 'ADMIN' ? 9999 : (dbUser?.subscription?.plan?.limits?.maxChannels ?? planConfig.maxChannels);

    // 2. Comprobar si el canal ya existe para este usuario (por nombre insensible a mayúsculas)
    const existingChannel = await db.channel.findFirst({
      where: {
        userId: user.id,
        name: { equals: cleanName, mode: 'insensitive' }
      },
      include: {
        context: true
      }
    });

    // 3. Contar canales actuales si es un canal nuevo
    const currentChannelsCount = await db.channel.count({
      where: { userId: user.id }
    });

    if (!existingChannel && currentChannelsCount >= maxChannels) {
      return NextResponse.json({
        error: 'LIMIT_REACHED',
        code: 'MAX_CHANNELS_REACHED',
        currentCount: currentChannelsCount,
        maxAllowed: maxChannels,
        userPlan,
        message: `Has alcanzado el límite máximo de ${maxChannels} canal(es) permitido por tu plan ${planConfig.displayName}. Actualiza a Pro o Enterprise para gestionar más canales simultáneos.`
      }, { status: 403 });
    }

    // 4. Si ya existe, actualizar datos (localPath, niche)
    if (existingChannel) {
      const updated = await db.channel.update({
        where: { id: existingChannel.id },
        data: {
          ...(localPath ? { localPath: localPath.trim() } : {}),
          ...(niche ? { niche: niche.trim() } : {}),
        },
        include: {
          context: true
        }
      });
      return NextResponse.json(updated);
    }

    // 5. Crear nuevo canal
    const newChannel = await db.channel.create({
      data: {
        userId: user.id,
        name: cleanName,
        localPath: localPath ? localPath.trim() : null,
        niche: niche ? niche.trim() : null,
      },
      include: {
        context: true
      }
    });

    // Si se envió un nicho o descripción inicial y no hay contexto, inicializar ChannelContext básico
    if (niche || description) {
      try {
        await db.channelContext.create({
          data: {
            channelId: newChannel.id,
            userId: user.id,
            channelUrl: `local://${encodeURIComponent(cleanName)}`,
            title: niche?.trim() || cleanName,
            description: description?.trim() || `Canal enfocado en ${niche || cleanName}`,
            contextSummary: `Canal temático enfocado en el nicho: ${niche || cleanName}.`
          }
        });
      } catch (ctxErr) {
        console.warn('No se pudo inicializar channelContext:', ctxErr);
      }
    }

    const fullChannel = await db.channel.findUnique({
      where: { id: newChannel.id },
      include: { context: true }
    });

    return NextResponse.json(fullChannel, { status: 201 });
  } catch (err: any) {
    console.error('Error creating/updating channel:', err);
    return NextResponse.json({ error: err.message || 'Error interno al registrar canal' }, { status: 500 });
  }
}
