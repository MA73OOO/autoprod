import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

const OLLAMA_BASE = 'http://127.0.0.1:11434';
const MAX_TOOL_STEPS = 8;

async function callPythonMotor(method: string, endpoint: string, body?: any) {
  const url = `http://localhost:8000${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error calling motor on ${endpoint}`);
  }
  return res.json();
}

async function askCloudExpert(prompt: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: google('models/gemini-1.5-flash-latest'),
      prompt,
    });
    return text;
  } catch (error: any) {
    console.error('Error calling Gemini:', error);
    return `[Error from Cloud Expert: ${error.message}]`;
  }
}

// Ollama Tool Schema Definition
const tools = [
  {
    type: 'function',
    function: {
      name: 'ask_cloud_expert',
      description: 'Llama a un experto creativo en la nube (Gemini) para redactar descripciones, ideas, o prompts. Usa esta herramienta cuando necesites inspiración o texto complejo.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'El prompt detallado para el experto en la nube.' }
        },
        required: ['prompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_folder_structure',
      description: 'Crea la estructura de directorios para un canal o video.',
      parameters: {
        type: 'object',
        properties: {
          target_path: { type: 'string', description: 'La ruta base del workspace.' },
          folder_name: { type: 'string', description: 'El nombre de la carpeta a crear (ej. el nombre del canal).' },
          subfolders: { type: 'array', items: { type: 'string' }, description: 'Lista de subcarpetas opcionales a crear dentro.' }
        },
        required: ['target_path', 'folder_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Crea o sobrescribe un archivo .md o .txt en el disco duro.',
      parameters: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: 'Ruta absoluta donde guardar el archivo.' },
          content: { type: 'string', description: 'Contenido del archivo.' }
        },
        required: ['file_path', 'content']
      }
    }
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workspacePath, channelName, theme, style, audience, includeConfigPrompt, includeVisualPrompts } = body;

    if (!workspacePath || !channelName || !theme) {
      return NextResponse.json({ success: false, error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const systemPrompt = `Eres el Arquitecto de Canales, un orquestador local en AutoProd.
Tu objetivo es crear la estructura de carpetas y archivos para un nuevo canal de YouTube llamado "${channelName}".
Ruta del workspace: "${workspacePath.replace(/\\/g, '/')}"
Temática: "${theme}"
Estilo/Tono: "${style || 'No especificado'}"
Audiencia: "${audience || 'General'}"

ESTRUCTURA RÍGIDA OBLIGATORIA A CREAR:
1. Carpeta base del canal: \`<workspacePath>/${channelName}\`
2. Archivo de configuración: \`<workspacePath>/${channelName}/ConfigCanal.md\` (Debe contener el Tema, Estilo, Audiencia, y una descripción generada).
3. Archivo de Prompts (solo si se piden prompts visuales): \`<workspacePath>/${channelName}/Prompts.md\` (Debe contener los prompts maestros para miniatura y banner).

REGLA DE VIDA O MUERTE: NO PUEDES TERMINAR TU TAREA NI RESPONDER AL USUARIO HASTA HABER COMPLETADO TODOS ESTOS PASOS:
PASO 1: DEBES usar la herramienta 'create_folder_structure' para crear la carpeta base.
${includeConfigPrompt || includeVisualPrompts ? "PASO 2: DEBES usar 'ask_cloud_expert' para que Gemini te redacte el contenido de los archivos." : ""}
PASO 3: DEBES usar 'write_file' para guardar TODA la información generada en 'ConfigCanal.md'.
${includeVisualPrompts ? "PASO 4: DEBES usar 'write_file' para guardar los prompts visuales en 'Prompts.md'." : ""}

ESTRICTAMENTE PROHIBIDO responder con texto hasta que hayas completado el último paso usando 'write_file'. Si te falta un paso, EJECUTA LA SIGUIENTE HERRAMIENTA.`;

    const messages: any[] = [{ role: 'system', content: systemPrompt }];
    let finalResponse = '';
    
    // Agent Tool Loop
    for (let step = 0; step < MAX_TOOL_STEPS; step++) {
      const ollamaRes = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1', // Ajusta al modelo que estés usando localmente
          messages,
          tools,
          stream: false
        })
      });

      if (!ollamaRes.ok) {
        throw new Error(`Error comunicando con Ollama: ${await ollamaRes.text()}`);
      }

      const json = await ollamaRes.json();
      const message = json.message;
      messages.push(message);

      if (message.tool_calls && message.tool_calls.length > 0) {
        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          const args = toolCall.function.arguments;
          let toolResultStr = '';

          try {
            if (fnName === 'ask_cloud_expert') {
              toolResultStr = await askCloudExpert(args.prompt);
            } else if (fnName === 'create_folder_structure') {
              const res = await callPythonMotor('POST', '/workspace/create', {
                target_path: args.target_path,
                folder_name: args.folder_name,
                subfolders: args.subfolders || []
              });
              toolResultStr = JSON.stringify(res);
            } else if (fnName === 'write_file') {
              const res = await callPythonMotor('POST', '/workspace/file', {
                path: args.file_path,
                content: args.content
              });
              toolResultStr = JSON.stringify(res);
            } else {
              toolResultStr = `Unknown tool: ${fnName}`;
            }
          } catch (err: any) {
            toolResultStr = `Error execution tool ${fnName}: ${err.message}`;
          }

          messages.push({
            role: 'tool',
            content: toolResultStr,
          });
        }
        
        // Forzamos a Ollama a seguir trabajando si no ha terminado
        messages.push({
          role: 'user',
          content: 'Si aún no has completado todos los pasos (incluyendo write_file), ejecuta la siguiente herramienta. Si ya terminaste todos los pasos obligatorios, responde con un mensaje final de éxito.'
        });
      } else {
        // No tool calls, Ollama gave a final response
        finalResponse = message.content;
        break;
      }
    }

    if (!finalResponse) {
      finalResponse = "El proceso agéntico se detuvo antes de finalizar.";
    }

    // Retornamos éxito al frontend
    const channelDir = `${workspacePath.replace(/\\/g, '/')}/${channelName}`;
    return NextResponse.json({ 
      success: true, 
      message: finalResponse,
      path: channelDir
    });

  } catch (error: any) {
    console.error('Error en Channel Creator Agent Loop:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
