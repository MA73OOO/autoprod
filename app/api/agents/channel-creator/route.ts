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
    // En la nueva arquitectura, este endpoint recibe el Súper Prompt previsualizado
    // O los parámetros base si se salta el preview.
    const { workspacePath, channelName, superPrompt } = body;

    if (!workspacePath || !channelName) {
      return NextResponse.json({ success: false, error: 'Faltan parámetros requeridos (workspacePath, channelName)' }, { status: 400 });
    }

    let finalContent = "Contenido autogenerado del canal.";

    // 1. Si hay un Súper Prompt de Llama, llamamos a la nube para hacer el trabajo pesado
    if (superPrompt) {
      finalContent = await askCloudExpert(superPrompt);
    }

    // 2. Ejecutar la infraestructura local (Python Motor)
    // Crear carpeta
    await callPythonMotor('POST', '/workspace/create', {
      target_path: workspacePath,
      folder_name: channelName,
      subfolders: ['Videos', 'Imagenes', 'Musica', 'loop', 'guion', 'Prompts']
    });

    // Guardar ConfigCanal.md
    const configPath = `${workspacePath.replace(/\\/g, '/')}/${channelName}/ConfigCanal.md`;
    await callPythonMotor('POST', '/workspace/file', {
      path: configPath,
      content: finalContent
    });

    return NextResponse.json({ 
      success: true, 
      message: "Canal creado y archivos guardados exitosamente.",
      path: `${workspacePath}/${channelName}`
    });

  } catch (error: any) {
    console.error('Error en Channel Creator Execution Switch:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
