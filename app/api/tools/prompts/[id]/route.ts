import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/src/prisma/db';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { systemPrompt, welcomeText, description, name } = body;

    const updated = await db.promptTemplate.update({
      where: { id },
      data: {
        ...(name ? { name: String(name).trim().toLowerCase().replace(/\s+/g, '_') } : {}),
        ...(systemPrompt ? { systemPrompt } : {}),
        ...(welcomeText !== undefined ? { welcomeText } : {}),
        ...(description !== undefined ? { description } : {}),
      }
    });

    return NextResponse.json({ status: 'success', template: updated });
  } catch (err: any) {
    console.error('[Tools/Prompts PATCH Error]:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar plantilla' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    await db.promptTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ status: 'success', message: 'Plantilla eliminada' });
  } catch (err: any) {
    console.error('[Tools/Prompts DELETE Error]:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar plantilla' }, { status: 500 });
  }
}
