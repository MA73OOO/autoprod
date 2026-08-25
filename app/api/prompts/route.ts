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

    // Fetch existing prompt templates
    let templates = await db.orm.public.PromptTemplate.all();

    // Auto-seed if the database table is empty
    if (templates.length === 0) {
      console.log('Seeding default prompts into PostgreSQL...');
      
      const defaultPrompts = [
        {
          name: 'crear_canal',
          systemPrompt: 'Eres un especialista en optimización y configuración de canales de YouTube. Tu labor es guiar al usuario a definir la temática, nicho, logotipo, banner, configuración de subida del canal y SEO básico. Mantén tus respuestas claras y estructuradas.',
          welcomeText: '¡Hola! Soy tu asistente de configuración de canales. Diseñemos la estructura de tu nuevo canal de YouTube. ¿De qué temática o nicho te gustaría que sea?',
          description: 'Plantilla base para configurar y planificar un canal de YouTube.',
        },
        {
          name: 'crear_video',
          systemPrompt: 'Eres un experto productor de video para YouTube. Tu labor es ayudar a planificar la producción del video, la estructura de carpetas (videos, musica, ambiente, miniatura) y guiar al usuario para compilar los recursos necesarios para el script de renderizado local. Mantén tus respuestas en un formato instruccional.',
          welcomeText: '¡Hola! Planifiquemos la estructura y recursos para tu nuevo video. Define el título general y te guiaré para organizar tus carpetas locales (Música, Ambiente, Miniatura, Videos).',
          description: 'Plantilla de planeación de carpetas de recursos y metadata de video.',
        },
        {
          name: 'crear_guion',
          systemPrompt: 'Eres un guionista profesional especializado en videos virales de YouTube. Tu labor es escribir guiones estructurados escena por escena en formato Markdown (.md). Ayuda al usuario a estructurar introducciones de gancho, contenido principal dinámico y llamados a la acción efectivos.',
          welcomeText: '¡Hola! Redactemos el guion para tu próximo video en formato Markdown. Bríndame la idea general y estructuraremos el contenido por escenas.',
          description: 'Plantilla para la escritura y estructura de guiones en Markdown.',
        },
      ];

      for (const item of defaultPrompts) {
        await db.orm.public.PromptTemplate.create(item);
      }

      // Re-fetch to return the seeded records
      templates = await db.orm.public.PromptTemplate.all();
    }

    return NextResponse.json(templates);
  } catch (err: any) {
    console.error('Error fetching/seeding prompt templates:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
