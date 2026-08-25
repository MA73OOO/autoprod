import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/src/prisma/db';

export async function POST(
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
    const { text, checklist } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    // 1. Fetch conversation to verify ownership and check its current messages
    const conversation = await db.orm.public.Conversation
      .where({ id: conversationId, userId: user.id })
      .first();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    // Check count of messages to see if we should auto-update the title
    const messageCount = await db.orm.public.Message
      .where({ conversationId })
      .count();

    // 2. Save User Message
    const userMessage = await db.orm.public.Message.create({
      conversationId,
      sender: 'USER',
      text: text.trim(),
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
    await db.orm.public.Conversation
      .where({ id: conversationId })
      .update({ 
        title: updatedTitle,
        updatedAt: new Date().toISOString()
      });

    // 4. Simulate Gemini Response (Mock optimization return)
    const responseText = `Entendido. He optimizado el contenido para tu video utilizando la configuración enriquecida. He actualizado los resultados SEO del panel derecho con el título optimizado, etiquetas clave y descripción mejorada.`;

    // Save Gemini Response Message
    const geminiMessage = await db.orm.public.Message.create({
      conversationId,
      sender: 'GEMINI',
      text: responseText,
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
