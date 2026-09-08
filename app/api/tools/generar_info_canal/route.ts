import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs/promises';
import path from 'path';
import { getWorkspacePath } from '@/harness/setup/detector';

async function getToolAiModel(supabase: any, userId: string) {
  if (process.env.OPENAI_API_KEY) {
    return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })('gpt-4o-mini');
  }
  const { data: openaiKey } = await supabase.rpc('get_api_key', { p_user_id: userId, p_provider: 'openai' });
  if (openaiKey && typeof openaiKey === 'string' && openaiKey.trim() !== '') {
    return createOpenAI({ apiKey: openaiKey })('gpt-4o-mini');
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
    const { nombre_canal, contexto_del_usuario, _userContext } = await req.json();
    const userId = _userContext?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized, no user context' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const aiModel = await getToolAiModel(supabase, userId);

    const prompt = `Eres un experto en Branding y Creación de Canales de YouTube de AutoProd.
Debes crear la guía de recursos gráficos para el canal "${nombre_canal}".
El usuario ha dado el siguiente contexto/temática: "${contexto_del_usuario}".

Genera un documento Markdown con EXACTAMENTE este formato (reemplaza los valores con ideas creativas adaptadas al canal):

# 🎨 Guía de Marca y Recursos del Canal - ${nombre_canal}

¡Bienvenido a la carpeta de identidad de canal para **${nombre_canal}**!

---

## 🖼️ Archivos Visuales Generados

1. **\`logo.jpg\`**
   - **Uso:** Foto de perfil de YouTube (Avatar).
   - **Formato:** 1:1 Cuadrado.
   - **Diseño:** [Describe detalladamente la imagen para el logo]

2. **\`banner.jpg\`**
   - **Uso:** Encabezado/Banner del canal de YouTube.
   - **Formato:** 16:9 Panorámico (2560 x 1440).
   - **Diseño:** [Describe detalladamente la imagen para el banner]

3. **\`marca_de_agua.jpg\`**
   - **Uso:** Marca de agua del video (botón de suscripción en la esquina inferior derecha).
---`;

    const result = await generateText({
      model: aiModel,
      prompt: prompt,
    });

    const workspace = _userContext?.workspacePath || getWorkspacePath();
    if (!workspace) throw new Error("No workspace path configured");

    const folderPath = path.join(workspace, nombre_canal, 'canal');
    await fs.mkdir(folderPath, { recursive: true });
    
    const filePath = path.join(folderPath, 'config_canal.md');
    await fs.writeFile(filePath, result.text, 'utf-8');

    return NextResponse.json({
      status: "success",
      message: `config_canal.md generado exitosamente en ${filePath}`,
      content_preview: result.text.substring(0, 200) + '...'
    });

  } catch (error: any) {
    console.error('Error generar_info_canal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
