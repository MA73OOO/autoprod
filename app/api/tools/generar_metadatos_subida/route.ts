import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs/promises';
import path from 'path';
import { getWorkspacePath } from '@/harness/setup/detector';

async function getToolAiModel(supabase: any, userId: string) {
  if (process.env.OPENAI_API_KEY) {
    return openai('gpt-4o-mini', { apiKey: process.env.OPENAI_API_KEY });
  }
  const { data: openaiKey } = await supabase.rpc('get_api_key', { p_user_id: userId, p_provider: 'openai' });
  if (openaiKey && typeof openaiKey === 'string' && openaiKey.trim() !== '') {
    return openai('gpt-4o-mini', { apiKey: openaiKey });
  }
  if (process.env.GEMINI_API_KEY) {
    return createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })('gemini-1.5-flash');
  }
  const { data: geminiKey } = await supabase.rpc('get_api_key', { p_user_id: userId, p_provider: 'gemini' });
  if (geminiKey && typeof geminiKey === 'string' && geminiKey.trim() !== '') {
    return createGoogleGenerativeAI({ apiKey: geminiKey })('gemini-1.5-flash');
  }
  return openai('gpt-4o-mini');
}

export async function POST(req: Request) {
  try {
    const { nombre_canal, nombre_video, tematica, contexto_del_usuario, _userContext } = await req.json();
    const userId = _userContext?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized, no user context' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const aiModel = await getToolAiModel(supabase, userId);

    const prompt = `Eres un experto en YouTube, SEO y Growth Hacking de AutoProd.
Debes crear los metadatos de subida (título, descripción, tags) y el comentario fijado para un video titulado "${nombre_video}" en el canal "${nombre_canal}".
La temática es: "${tematica}".
El usuario indicó: "${contexto_del_usuario}".

Tu respuesta debe estar dividida con un delimitador especial "|||DIVISOR|||" para poder separar el contenido de dos archivos diferentes.

Genera la respuesta EXACTAMENTE con la siguiente estructura:

# 📝 Metadatos del Video - ${nombre_video}

**Título SEO (Atractivo y con palabras clave):**
[Escribe el título aquí, máx 60 caracteres]

**Descripción del Video:**
[Párrafo 1: Gancho atractivo]
[Párrafo 2: Explicación de lo que verán]
[Llamado a la acción (Suscríbete, da like, etc)]

**Etiquetas (Tags):**
[Etiqueta1, Etiqueta2, Etiqueta3, ...]

|||DIVISOR|||

# 📌 Comentario Fijado - ${nombre_video}

[Escribe aquí un comentario fijado atractivo que invite a la interacción, haga una pregunta al público o recomiende otro video/enlace]
`;

    const result = await generateText({
      model: aiModel,
      prompt: prompt,
    });

    const parts = result.text.split('|||DIVISOR|||');
    const config_subida_text = parts[0]?.trim() || result.text;
    const comentario_fijado_text = parts[1]?.trim() || "No se generó el comentario fijado.";

    const workspace = _userContext?.workspacePath || getWorkspacePath();
    if (!workspace) throw new Error("No workspace path configured");

    const folderPath = path.join(workspace, nombre_canal, nombre_video);
    await fs.mkdir(folderPath, { recursive: true });
    
    const subfolders = ["Ambiente", "Guiones", "Imagenes", "Imagenes/Prompt", "Miniaturas", "Musica", "Videos", "Resultado", "prompts"];
    for (const sub of subfolders) {
      await fs.mkdir(path.join(folderPath, sub), { recursive: true });
    }
    
    const configPath = path.join(folderPath, 'config_video.md');
    const comentarioPath = path.join(folderPath, 'comentario_fijado.md');
    
    await fs.writeFile(configPath, config_subida_text, 'utf-8');
    await fs.writeFile(comentarioPath, comentario_fijado_text, 'utf-8');

    return NextResponse.json({
      status: "success",
      message: `Se generaron exitosamente config_video.md y comentario_fijado.md en ${folderPath}`,
      content_preview: result.text.substring(0, 200) + '...'
    });

  } catch (error: any) {
    console.error('Error generar_metadatos_subida:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
