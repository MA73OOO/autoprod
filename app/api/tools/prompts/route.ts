import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/src/prisma/db';

// ──────────────────────────────────────────────
// GET /api/tools/prompts
// Modo Lectura Pura (Frontend Launchpad / Consultas)
// ──────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = new URL(req.url);
    const tipo = url.searchParams.get('tipo') || url.searchParams.get('name');

    if (tipo) {
      const template = await db.promptTemplate.findFirst({
        where: { name: { equals: tipo, mode: 'insensitive' } }
      });
      if (!template) {
        return NextResponse.json({ error: `Plantilla "${tipo}" no encontrada` }, { status: 404 });
      }
      return NextResponse.json(template);
    }

    const templates = await db.promptTemplate.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(templates);
  } catch (err: any) {
    console.error('[Tools/Prompts GET Error]:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

// ──────────────────────────────────────────────
// POST /api/tools/prompts
// Invocación como Tool del Orquestador (Function Calling)
// O Creación Dinámica de Nueva Plantilla
// ──────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const tipo = body.tipo || body.nombre || body.template_name || body.template;

    // 1. Modo Tool del Orquestador: Consulta de SOP y guía paso a paso
    if (tipo && !body.systemPrompt) {
      const template = await db.promptTemplate.findFirst({
        where: { name: { equals: String(tipo).trim(), mode: 'insensitive' } }
      });

      if (!template) {
        const all = await db.promptTemplate.findMany({ select: { name: true, description: true } });
        return NextResponse.json({
          status: 'not_found',
          message: `No se encontró plantilla exacta para "${tipo}". Plantillas registradas: ${all.map(p => p.name).join(', ')}`,
          availableTemplates: all
        });
      }

      return NextResponse.json({
        status: 'success',
        templateName: template.name,
        description: template.description,
        systemPrompt: template.systemPrompt,
        welcomeText: template.welcomeText,
        sopInstructions: `Guía para el agente: ${template.systemPrompt}`
      });
    }

    // 2. Creación dinámica de nueva plantilla (Admin o Creador)
    const { name, systemPrompt, welcomeText, description } = body;
    if (name && systemPrompt) {
      const cleanName = String(name).trim().toLowerCase().replace(/\s+/g, '_');
      const newTemplate = await db.promptTemplate.upsert({
        where: { name: cleanName },
        update: {
          systemPrompt,
          welcomeText: welcomeText || null,
          description: description || null,
        },
        create: {
          name: cleanName,
          systemPrompt,
          welcomeText: welcomeText || null,
          description: description || null,
        }
      });

      return NextResponse.json({ status: 'success', template: newTemplate }, { status: 201 });
    }

    // 3. Fallback si el LLM invocó la tool sin argumentos: devolver catálogo disponible
    const allTemplates = await db.promptTemplate.findMany({
      select: { name: true, description: true, welcomeText: true, systemPrompt: true }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Catálogo de procedimientos y plantillas maestras disponibles en AutoProd',
      templates: allTemplates
    });
  } catch (err: any) {
    console.error('[Tools/Prompts POST Error]:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
