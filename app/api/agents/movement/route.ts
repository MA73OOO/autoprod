import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText, tool, jsonSchema } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { db as prisma } from '@/src/prisma/db';
import path from 'path';

// Utilidad para llamar a la API de Python
async function callPythonMotor(method: string, endpoint: string, body?: any) {
  const url = `http://localhost:8000/workspace${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Motor error: ${res.status}`);
  }
  return res.json();
}

export async function POST(req: Request) {
  try {
    const { superPrompt, workspacePath } = await req.json();

    if (!superPrompt) {
      return NextResponse.json({ error: 'Super Prompt es requerido.' }, { status: 400 });
    }
    if (!workspacePath) {
      return NextResponse.json({ error: 'No hay workspace seleccionado.' }, { status: 400 });
    }

    // Obtener API Key del usuario
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { createClient: createServerClient } = require('@/lib/supabase/server');
    const supabaseServer = await createServerClient();
    const { data: userData } = await supabaseServer.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { geminiVaultId: true }
    });

    if (!userRecord?.geminiVaultId) {
      return NextResponse.json({ error: 'No hay API Key de Gemini configurada.' }, { status: 400 });
    }

    const { data: secretData, error: secretError } = await supabase
      .rpc('get_decrypted_secret', { p_secret_id: userRecord.geminiVaultId });

    if (secretError || !secretData) {
      return NextResponse.json({ error: 'No se pudo desencriptar la API Key' }, { status: 500 });
    }

    const apiKey = typeof secretData === 'string' ? secretData : secretData.get_decrypted_secret || secretData;
    
    // Configurar Gemini
    const google = createGoogleGenerativeAI({ apiKey });
    const model = google('gemini-1.5-flash');

    // Herramientas seguras que solo pueden tocar .md y .txt 
    // (Python ya lo restringe en el puerto 8000, así que estamos doblemente seguros).
    const toolsDef = {
      read_file: tool({
        description: 'Lee el contenido de un archivo .md o .txt para obtener contexto.',
        parameters: jsonSchema({
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'Ruta relativa del archivo a leer (ej. guion.md)' }
          },
          required: ['filePath']
        }),
        execute: async ({ filePath }) => {
          try {
            const fullPath = path.join(workspacePath, filePath);
            const res = await callPythonMotor('GET', `/file?path=${encodeURIComponent(fullPath)}`);
            const content = res.content || '';
            return content.length > 15000 ? content.slice(0, 15000) + '\n... [truncado]' : content;
          } catch (e: any) {
            return `Error al leer archivo: ${e.message}`;
          }
        }
      }),
      write_file: tool({
        description: 'Guarda el contenido generado en un archivo .md o .txt.',
        parameters: jsonSchema({
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'Ruta relativa del archivo donde guardar (ej. resultado.md)' },
            content: { type: 'string', description: 'El contenido final generado' }
          },
          required: ['filePath', 'content']
        }),
        execute: async ({ filePath, content }) => {
          try {
            const fullPath = path.join(workspacePath, filePath);
            await callPythonMotor('POST', `/file`, { path: fullPath, content });
            return `Archivo ${filePath} guardado exitosamente con ${content.length} caracteres.`;
          } catch (e: any) {
            return `Error al escribir archivo: ${e.message}`;
          }
        }
      }),
      create_folder: tool({
        description: 'Crea una nueva carpeta y sus subcarpetas asociadas en el proyecto.',
        parameters: jsonSchema({
          type: 'object',
          properties: {
            folderName: { type: 'string', description: 'Nombre de la carpeta principal a crear.' },
            subfolders: { 
              type: 'array', 
              items: { type: 'string' }, 
              description: 'Lista opcional de subcarpetas a crear dentro de la carpeta principal.' 
            }
          },
          required: ['folderName']
        }),
        execute: async ({ folderName, subfolders }) => {
          try {
            const res = await callPythonMotor('POST', `/create`, { 
              target_path: workspacePath, 
              folder_name: folderName, 
              subfolders: subfolders || [] 
            });
            return `Estructura de carpetas '${folderName}' creada exitosamente.`;
          } catch (e: any) {
            return `Error al crear carpetas: ${e.message}`;
          }
        }
      })
    };

    const systemPrompt = `Eres un creador de contenido avanzado que opera dentro de AutoProd.
Se te entregará un 'Súper Prompt' generado por un agente orquestador (Llama).
Tu misión es ejecutar las instrucciones dictadas en ese Súper Prompt.

- Si el Súper Prompt indica que leas información de una fuente, utiliza la herramienta 'read_file'.
- Genera el contenido solicitado con altísima calidad (es para YouTube/Redes).
- Si el Súper Prompt te pide estructurar un nuevo proyecto/video, usa 'create_folder' para generar las carpetas.
- Una vez generado el contenido, utiliza OBLIGATORIAMENTE la herramienta 'write_file' para guardar el resultado final en la ubicación indicada.
- Al final, responde con un breve mensaje para el usuario resumiendo lo que lograste.`;

    // Ejecutar flujo con Gemini (Max 5 pasos para que pueda leer, pensar y escribir)
    const result = await generateText({
      model: model,
      messages: [{ role: 'user', content: `SUPER PROMPT:\n${superPrompt}` }],
      system: systemPrompt,
      tools: toolsDef,
      maxSteps: 5, 
    });

    return NextResponse.json({ 
      success: true, 
      message: result.text || 'Contenido generado y procesos ejecutados correctamente.' 
    });

  } catch (error: any) {
    console.error('Movement Agent Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno en el agente Movement' }, { status: 500 });
  }
}
