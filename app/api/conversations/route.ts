import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/src/prisma/db';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Lazy sync user to PostgreSQL in case they were dropped from database
    let dbUser = await db.orm.public.User.where({ id: user.id }).first();
    if (!dbUser) {
      const role = user.email === 'mateo@autoprod.io' ? 'ADMIN' : 'USER';
      await db.orm.public.User.create({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split('@')[0],
        role: role,
      });
    }

    // Fetch conversations and include messages
    const conversations = await db.orm.public.Conversation
      .where({ userId: user.id })
      .orderBy((c) => c.updatedAt.desc())
      .include('messages', (m) => m.orderBy((msg) => msg.createdAt.asc()))
      .all();

    return NextResponse.json(conversations);
  } catch (err: any) {
    console.error('Error fetching conversations:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Lazy sync user to PostgreSQL in case they were dropped from database
    let dbUser = await db.orm.public.User.where({ id: user.id }).first();
    if (!dbUser) {
      const role = user.email === 'mateo@autoprod.io' ? 'ADMIN' : 'USER';
      await db.orm.public.User.create({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split('@')[0],
        role: role,
      });
    }

    const body = await request.json();
    const { title, channelId, videoId, systemPrompt, welcomeText } = body;

    // Create the conversation
    const conversation = await db.orm.public.Conversation.create({
      title: title || 'Nueva conversación',
      userId: user.id,
      systemPrompt: systemPrompt || null,
      channelId: channelId || null,
      videoId: videoId || null,
    });

    // Create default welcome message from Gemini
    const welcomeMessage = await db.orm.public.Message.create({
      conversationId: conversation.id,
      sender: 'GEMINI',
      text: welcomeText || '¡Hola! Soy tu Co-Pilot de AutoProd. Selecciona un proyecto y configuramos el prompt SEO o preparemos el renderizado.',
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
