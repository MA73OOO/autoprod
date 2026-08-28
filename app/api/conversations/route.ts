import { NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    // Fetch conversations lightweight (no messages included)
    const conversations = await db.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (err: any) {
    console.error('Error fetching conversations:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const body = await request.json();
    const { title, channelId, videoId, systemPrompt, welcomeText } = body;

    // Create the conversation
    const conversation = await db.conversation.create({
      data: {
        title: title || 'Nueva conversación',
        userId: user.id,
        systemPrompt: systemPrompt || null,
        channelId: channelId || null,
        videoId: videoId || null,
      }
    });

    // Create default welcome message from Gemini
    const welcomeMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'GEMINI',
        text: welcomeText || '¡Hola! Soy tu Co-Pilot de AutoProd. Selecciona un proyecto y configuramos el prompt SEO o preparemos el renderizado.',
      }
    });

    // Structure conversation response with messages array
    const result = {
      ...conversation,
      messages: [welcomeMessage],
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error creating conversation:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
