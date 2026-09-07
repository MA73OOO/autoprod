import 'dotenv/config';
import fs from 'fs';
import { db as prisma } from '../src/prisma/db.js';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool as aiTool, jsonSchema } from 'ai';

/**
 * Suite de Pruebas: Validación E2E con OpenAI (gpt-4o-mini), Function Calling y Motor Local
 * Recrea exactamente el escenario donde el usuario pide:
 * 1. "¿Qué canales tengo en mi workspace?"
 * 2. "Podrías eliminar la carpeta de videos de la carpeta 1"
 */
async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ No se encontró OPENAI_API_KEY en .env');
    return;
  }

  const origFetch = globalThis.fetch;
  globalThis.fetch = async (url: any, init: any) => {
    if (typeof url === 'string' && url.includes('api.openai.com')) {
      console.log('\n--- LLAMADA RAW A OPENAI ---');
      const body = JSON.parse(init.body);
      console.log('Tools enviadas al modelo:', JSON.stringify(body.tools, null, 2));
      console.log('Mensajes enviados:', JSON.stringify(body.messages, null, 2));
      const res = await origFetch(url, init);
      const clone = res.clone();
      const resJson = await clone.json();
      console.log('\n--- RESPUESTA RAW DE OPENAI ---');
      console.log(JSON.stringify(resJson, null, 2));
      return res;
    }
    return origFetch(url, init);
  };

  const openai = createOpenAI({ apiKey });

  // 1. Obtener orchestrator y tools desde BD
  const orchestrator = await prisma.agent.findFirst({
    where: { slug: 'orchestrator' },
    include: {
      agentTools: {
        include: { tool: true }
      }
    }
  });

  if (!orchestrator) {
    console.error('❌ No se encontró el agente orchestrator en la base de datos');
    return;
  }

  const currentWorkspacePath = 'E:\\AutoProdAI\\youtube';
  const systemPrompt = orchestrator.systemPrompt.replace('{workspace_path}', currentWorkspacePath);

  const aiTools: Record<string, any> = {};
  for (const at of orchestrator.agentTools) {
    const dbTool = at.tool;
    if (!dbTool) continue;

    const parsedToolSchema = jsonSchema(dbTool.schema as any);

    aiTools[dbTool.name] = aiTool({
      description: dbTool.description || '',
      parameters: parsedToolSchema,
      inputSchema: parsedToolSchema,
      execute: async (args: any) => {
        console.log(`\n>>> [EXECUTE TOOL] ${dbTool.name} invocado con args:`, JSON.stringify(args, null, 2));
        
        // Simular la normalización exacta del proxy (app/api/chat/route.ts)
        const payload: any = { ...args };
        if (dbTool.name === 'eliminar_carpetas') {
          const channelName = payload.channel_name ?? payload.canal ?? payload.channel ?? null;
          if (channelName) payload.channel_name = String(channelName);

          const collectedPaths: string[] = [];
          const candidateArrays = [payload.paths, payload.rutas, payload.folders, payload.carpetas];
          for (const arr of candidateArrays) {
            if (Array.isArray(arr)) {
              for (const item of arr) {
                if (item && typeof item === 'string' && item.trim()) {
                  collectedPaths.push(item.trim());
                }
              }
            }
          }

          const singleCandidates = [
            payload.ruta, payload.path, payload.target_path, payload.folder_path,
            payload.folder_name, payload.folder, payload.name, payload.carpeta
          ];
          for (const cand of singleCandidates) {
            if (cand && typeof cand === 'string' && cand.trim()) {
              if (!collectedPaths.includes(cand.trim())) {
                collectedPaths.push(cand.trim());
              }
            }
          }

          if (collectedPaths.length > 0) {
            const cleanList = collectedPaths.map(p => {
              let c = p.replace(/\\/g, '/');
              const isAbs = c.startsWith('/') || /^[a-zA-Z]:\//.test(c);
              if (!isAbs && currentWorkspacePath && !payload.channel_name) {
                c = `${currentWorkspacePath}/${c}`.replace(/\\/g, '/');
              }
              return c;
            });

            payload.paths = cleanList;
            if (cleanList.length === 1) {
              payload.ruta = cleanList[0];
            }
          }
        }

        console.log(`[Proxy Tool] Payload enviado a motor local:`, JSON.stringify(payload));
        const res = await fetch(dbTool.apiEndpoint, {
          method: dbTool.method,
          headers: { 'Content-Type': 'application/json' },
          body: dbTool.method !== 'GET' ? JSON.stringify(payload) : undefined
        });
        const data = await res.json();
        console.log(`[Proxy Tool] Respuesta del motor local (HTTP ${res.status}):`, JSON.stringify(data));
        return JSON.stringify(data);
      }
    });
  }

  // Asegurar que existe la carpeta Videos antes del test para validar su borrado físico
  const targetFolder = 'E:/AutoProdAI/youtube/FinanzasReales/Videos';
  fs.mkdirSync(targetFolder, { recursive: true });
  console.log(`Carpeta creada previamente en disco para el test: ${targetFolder}`);

  // 2. Historial de conversación real
  const messages = [
    {
      role: 'user' as const,
      content: 'Hola, me podrias ayudar a decirme que canales tengo en mi workspace?'
    },
    {
      role: 'assistant' as const,
      content: `He revisado tu workspace y aquí están los canales y carpetas que tienes:

Canales y Carpetas
FinanzasReales
Ambiente
Guiones
Miniaturas
prompts
Resultado
Videos
Archivos
test.md
Si necesitas hacer algo específico con alguna de estas carpetas o archivos, házmelo saber y estaré encantado de ayudarte.`
    },
    {
      role: 'user' as const,
      content: 'Podrias eliminar la carpeta de videos de la carpeta 1'
    }
  ];

  console.log('\n================ ENVIANDO A GPT-4O-MINI ================');
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: messages as any,
      tools: aiTools,
      maxSteps: 3
    });

    console.log('\n================ RESPUESTA FINAL ================');
    console.log(result.text);

    // Verificar si la carpeta existe en disco
    const stillExists = fs.existsSync(targetFolder);
    console.log(`\n¿Sigue existiendo la carpeta Videos?: ${stillExists ? '❌ SÍ (ERROR)' : '✅ NO (ELIMINADA CORRECTAMENTE)'}`);
  } catch (err: any) {
    console.error('Error invocando OpenAI:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
