import { NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const { id: conversationId } = await params;
    const body = await request.json();
    const { title, channelId, videoId } = body;

    // Verify ownership
    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, userId: user.id }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    // Build update payload
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;

    if (channelId !== undefined) {
      if (!channelId || channelId === 'null' || channelId === 'undefined') {
        updateData.channelId = null;
      } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelId);
        let resolvedChannel: { id: string } | null = null;

        if (isUuid) {
          resolvedChannel = await db.channel.findFirst({
            where: { id: channelId, userId: user.id },
            select: { id: true }
          });
        }

        // If not found by UUID, try lookup by name
        if (!resolvedChannel) {
          resolvedChannel = await db.channel.findFirst({
            where: {
              userId: user.id,
              name: { equals: channelId, mode: 'insensitive' }
            },
            select: { id: true }
          });
        }

        // If still not found, auto-create channel entry so FK never fails
        if (!resolvedChannel) {
          try {
            resolvedChannel = await db.channel.create({
              data: {
                userId: user.id,
                name: channelId,
                niche: channelId,
              },
              select: { id: true }
            });
          } catch (createErr) {
            console.warn('Could not auto-create channel in conversation patch:', createErr);
            resolvedChannel = null;
          }
        }

        updateData.channelId = resolvedChannel ? resolvedChannel.id : null;
      }
    }

    if (videoId !== undefined) {
      if (!videoId) {
        updateData.videoId = null;
      } else {
        const video = await db.video.findFirst({
          where: { id: videoId, channel: { userId: user.id } },
          select: { id: true }
        });
        updateData.videoId = video ? video.id : null;
      }
    }

    // Update conversation (updatedAt is managed automatically by Prisma)
    const updated = await db.conversation.update({
      where: { id: conversationId },
      data: updateData
    });

    return NextResponse.json({ success: true, conversation: updated });
  } catch (err: any) {
    console.error('Error updating conversation:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    // Verify ownership
    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, userId: user.id }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    // Delete conversation (cascade will handle messages)
    await db.conversation.delete({
      where: { id: conversationId }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting conversation:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
