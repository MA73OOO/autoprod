import { NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    // Execute conversation ownership check and messages fetch in parallel to reduce database roundtrip latency
    const [conversation, messages] = await Promise.all([
      db.conversation.findFirst({
        where: { id: conversationId, userId: user.id }
      }),
      db.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(messages || []);
  } catch (err: any) {
    console.error('Error fetching conversation messages:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const { id: conversationId } = await params;
    const body = await request.json();
    const { text, checklist } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    // 1. Fetch conversation to verify ownership and check its current messages
    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, userId: user.id }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    // Check count of messages to see if we should auto-update the title
    const messageCount = await db.message.count({
      where: { conversationId }
    });
    // messageCount is already total

    // 2. Save User Message
    const userMessage = await db.message.create({
      data: {
        conversationId,
        sender: 'USER',
        text: text.trim(),
      }
    });

    // 3. Update conversation title if it was a default placeholder
    let updatedTitle = conversation.title;
    const isDefaultTitle = 
      conversation.title === 'Nueva conversación' || 
      conversation.title === 'New conversation' || 
      conversation.title === 'Optimización de Video SEO';

    if (isDefaultTitle && messageCount <= 1) {
      updatedTitle = text.length > 25 ? `${text.substring(0, 25)}...` : text;
    }

    // Update conversation updatedAt timestamp and title if needed
    await db.conversation.update({
      where: { id: conversationId },
      data: { 
        title: updatedTitle,
        updatedAt: new Date().toISOString()
      }
    });

    // 4. Simulate or use provided AI Response
    const responseText = body.aiResponseText || `[Respuesta Vacía del Modelo]`;

    // Save AI Response Message
    const geminiMessage = await db.message.create({
      data: {
        conversationId,
        sender: 'GEMINI',
        text: responseText,
      }
    });

    return NextResponse.json({
      success: true,
      userMessage,
      geminiMessage,
      conversationTitle: updatedTitle
    });
  } catch (err: any) {
    console.error('Error in messages API:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
