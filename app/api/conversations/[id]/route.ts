import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/src/prisma/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: conversationId } = params;
    const body = await request.json();
    const { title, channelId, videoId } = body;

    // Verify ownership
    const conversation = await db.orm.public.Conversation
      .where({ id: conversationId, userId: user.id })
      .first();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    // Build update payload
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    if (title !== undefined) updateData.title = title;
    if (channelId !== undefined) updateData.channelId = channelId || null;
    if (videoId !== undefined) updateData.videoId = videoId || null;

    // Update
    const updated = await db.orm.public.Conversation
      .where({ id: conversationId })
      .update(updateData);

    return NextResponse.json({ success: true, conversation: updated });
  } catch (err: any) {
    console.error('Error updating conversation:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: conversationId } = params;

    // Verify ownership
    const conversation = await db.orm.public.Conversation
      .where({ id: conversationId, userId: user.id })
      .first();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    // Delete conversation (cascade will handle messages)
    await db.orm.public.Conversation
      .where({ id: conversationId })
      .delete();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting conversation:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
