import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { db as prisma } from '@/src/prisma/db';
import fsLib from 'fs/promises';
import path from 'path';

// ──────────────────────────────────────────────
// Tool executor — calls the Python Motor API
// ──────────────────────────────────────────────
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

async function executeTool(slug: string, args: Record<string, string>, workspacePath: string): Promise<string> {
  if (!workspacePath) return JSON.stringify({ error: "No workspace selected in the UI." });
  
  try {
    switch (slug) {
      case 'workspace_list': {
        const base = path.join(workspacePath, '.');
        const res = await callPythonMotor('GET', `/?base_path=${encodeURIComponent(base)}`);
        
        function formatTree(nodes: any[], indent = ''): string {
          let out = '';
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const isLast = i === nodes.length - 1;
            const prefix = isLast ? '└── ' : '├── ';
            out += `${indent}${prefix}${node.name}${node.type === 'directory' ? '/' : ''}\n`;
            if (node.children && node.children.length > 0) {
              const childIndent = indent + (isLast ? '    ' : '│   ');
              out += formatTree(node.children, childIndent);
            }
          }
          return out;
        }
        
        const treeText = formatTree(res.tree || []);
        return `Estructura del proyecto:\n${treeText}`;
      }
      case 'workspace_read': {
        const filePath = args['archivo'] || args['file'];
        if (!filePath) return "Error: Falta el argumento 'archivo'.";
        const fullPath = path.join(workspacePath, filePath.trim());
        const res = await callPythonMotor('GET', `/file?path=${encodeURIComponent(fullPath)}`);
        const content = res.content || '';
        return content.length > 8000 ? content.slice(0, 8000) + '\n... [truncated]' : content;
      }
      case 'workspace_write': {
        const filePath = args['archivo'] || args['file'];
        const content = args['contenido'] || args['content'];
        if (!filePath || !content) return "Error: Faltan argumentos 'archivo' o 'contenido'.";
        const fullPath = path.join(workspacePath, filePath.trim());
        const res = await callPythonMotor('POST', `/file`, { path: fullPath, content });
        return JSON.stringify(res);
      }
      case 'workspace_delete': {
        const filePath = args['archivo'] || args['file'];
        if (!filePath) return "Error: Falta el argumento 'archivo'.";
        const fullPath = path.join(workspacePath, filePath.trim());
        const res = await callPythonMotor('DELETE', `/file?path=${encodeURIComponent(fullPath)}`);
        return JSON.stringify(res);
      }
      default:
        return JSON.stringify({ error: `La herramienta primitiva ${slug} no está implementada localmente.` });
    }
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}

// ──────────────────────────────────────────────
// Universal chat + tool loop for ALL providers
// ──────────────────────────────────────────────
const OLLAMA_BASE = 'http://127.0.0.1:11434';
const MAX_TOOL_STEPS = 5;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function universalChatWithTools(
  provider: string,
  modelName: string,
  apiKey: string,
  systemPrompt: string,
  userMessages: any[],
  workspacePath: string,
  availableDbAgents: { slug: string; name: string; description: string | null; apiEndpoint: string }[] = []
): Promise<{ text: string; requiresPreview?: boolean; agentSlug?: string; stepName?: string; endpoint?: string; usage?: { promptTokens: number, completionTokens: number, totalTokens: number } }> {
  
  const history: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...userMessages.map(m => {
      let textContent = '';
      if (typeof m.content === 'string') {
        textContent = m.content;
      } else if (Array.isArray(m.content)) {
        textContent = m.content.map((part: any) => part.text || '').join('\n');
      }
      return { role: m.role as 'user' | 'assistant', content: textContent };
    }),
  ];

  let accumulatedUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  for (let step = 0; step < MAX_TOOL_STEPS; step++) {
    let assistantContent = '';

    if (provider === 'ollama') {
      const body = {
        model: modelName,
        messages: history,
        stream: false,
      };
      const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Ollama API error (${res.status}): ${errText}`);
      }
      const data = await res.json();
      assistantContent = data.message?.content || '';
    } else {
      let aiModel;
      if (provider === 'openai' || provider === 'chatgpt') {
        aiModel = openai('gpt-4o', { apiKey });
      } else if (provider === 'anthropic') {
        aiModel = anthropic(modelName || 'claude-3-5-sonnet-20240620', { apiKey });
      } else if (provider === 'gemini') {
        const cleanModel = (modelName || 'gemini-3.6-flash').replace(/^models\//, '');
        aiModel = createGoogleGenerativeAI({ apiKey })(cleanModel);
      } else {
        throw new Error('Invalid provider');
      }

      const result = await generateText({
        model: aiModel,
        messages: history.filter(h => h.role !== 'system') as any, // AI SDK receives system separately
        system: systemPrompt,
      });
      assistantContent = result.text;
      
      if (result.usage) {
        accumulatedUsage.promptTokens += result.usage.promptTokens || 0;
        accumulatedUsage.completionTokens += result.usage.completionTokens || 0;
        accumulatedUsage.totalTokens += result.usage.totalTokens || 0;
      }
    }

    // Buscar si el asistente intentó llamar a una API
    const apiRegex = /\[LLAMAR_API:\s*([^\]]+)\]/g;
    let match = apiRegex.exec(assistantContent);

    if (match) {
      const rawCall = match[1];
      const parts = rawCall.split('|').map(s => s.trim());
      const slug = parts[0];
      const args: Record<string, string> = {};
      
      for (let i = 1; i < parts.length; i++) {
        const [k, ...v] = parts[i].split(':');
        if (k && v.length > 0) {
          args[k.trim()] = v.join(':').trim();
        }
      }

      // Check si la herramienta existe en el catálogo dinámico de la base de datos
      const dbAgent = availableDbAgents.find(a => a.slug === slug);
      if (dbAgent) {
        if (dbAgent.apiEndpoint.startsWith('LOCAL:')) {
          // Es una primitiva ejecutada internamente
          history.push({ role: 'assistant', content: assistantContent });
          
          const result = await executeTool(slug, args, workspacePath);
          
          // La instrucción interna dinámica está en el systemPrompt del último mensaje?
          // No, lo inyectaremos directamente desde una variable o se pasa por argumento.
          // Para simplificar, lo pasamos a la función universalChatWithTools.
          
          history.push({
            role: 'user',
            content: `[RESULTADO DE LA API ${slug}]:\n${result}\n\n${global.toolInjectionPrompt || 'Instrucción interna: Evalúa el resultado anterior y responde la duda del usuario de manera natural.'}`,
          });
          continue; // Bucle
        } else {
          // Enviar a UI para confirmación humana (Preview Switch)
          return {
            text: assistantContent.replace(match[0], '').trim() || 'Generando Súper Prompt...',
            requiresPreview: true,
            agentSlug: dbAgent.name,
            stepName: 'Ejecutar Agente',
            endpoint: dbAgent.apiEndpoint,
            usage: accumulatedUsage
          };
        }
      }
      
      // Herramienta no encontrada
      history.push({ role: 'assistant', content: assistantContent });
      history.push({ role: 'user', content: `[ERROR] La API '${slug}' no existe en el catálogo de la base de datos.` });
      continue;
    }

    // No hubo llamada a API, retornar respuesta final
    return { text: assistantContent, usage: accumulatedUsage };
  }
  return { text: '[El modelo agotó el máximo de pasos de razonamiento. Intenta de nuevo con una pregunta más simple.]', usage: accumulatedUsage };
}

// ──────────────────────────────────────────────
// Main POST handler
// ──────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { messages, provider, model, workspacePath } = await req.json();

    if (!messages || !provider) {
      return NextResponse.json({ error: 'Messages and provider are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { createClient: createServerClient } = require('@/lib/supabase/server');
    const supabaseServer = await createServerClient();
    const { data: userData } = await supabaseServer.auth.getUser();
    const userId = userData?.user?.id;

    let userRecord = null;
    let userError = null;

    try {
      if (userId && provider !== 'ollama') {
        userRecord = await prisma.user.findUnique({
          where: { id: userId },
          select: { openaiVaultId: true, geminiVaultId: true, anthropicVaultId: true }
        });
      }
    } catch (e: any) {
      userError = e;
    }

    if (userError && provider !== 'ollama') {
      return NextResponse.json({ error: 'Failed to retrieve user settings' }, { status: 500 });
    }

    let apiKey = '';
    if (provider !== 'ollama') {
      let secretId = null;
      if (provider === 'openai' || provider === 'chatgpt') secretId = userRecord?.openaiVaultId;
      if (provider === 'gemini') secretId = userRecord?.geminiVaultId;
      if (provider === 'anthropic') secretId = userRecord?.anthropicVaultId;

      if (!secretId) {
        return NextResponse.json({ error: `No API key configured for ${provider}. Verifica tus API Keys en Ajustes.` }, { status: 400 });
      }

      const { data: secretData, error: secretError } = await supabase
        .rpc('get_decrypted_secret', { p_secret_id: secretId });

      if (secretError || !secretData) {
        return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 });
      }

      apiKey = typeof secretData === 'string' ? secretData : secretData.get_decrypted_secret || secretData;
    }

    let dbAgents: { slug: string; description: string | null; name: string; apiEndpoint: string }[] = [];
    let basePromptTemplate = 'Eres un orquestador inteligente en AutoProd.';
    let toolInjectionTemplate = '';

    try {
      const agents = await prisma.agent.findMany({ include: { steps: { orderBy: { stepOrder: 'asc' } } } });
      dbAgents = agents.map(a => ({
        slug: a.slug,
        name: a.name,
        description: a.description,
        apiEndpoint: a.steps.length > 0 ? a.steps[0].apiEndpoint : ''
      }));

      // Extraer PromptTemplates
      const orchestratorBase = await prisma.promptTemplate.findUnique({ where: { name: 'orchestrator_base' } });
      if (orchestratorBase) basePromptTemplate = orchestratorBase.systemPrompt;

      const toolInjection = await prisma.promptTemplate.findUnique({ where: { name: 'tool_injection' } });
      if (toolInjection) toolInjectionTemplate = toolInjection.systemPrompt;
      
      // Hack temporal para pasar el injection template a la función sin romper la firma
      (global as any).toolInjectionPrompt = toolInjectionTemplate;
      
    } catch (e) {
      console.warn("Fallo al cargar Agentes o Prompts de BD", e);
    }

    let dynamicSystemPrompt = `${basePromptTemplate}\n\n`;
    
    // Inyectar Catálogo de APIs Unificado
    dynamicSystemPrompt += 'Si necesitas usar una API, tu respuesta debe contener ÚNICAMENTE el formato estricto: [LLAMAR_API: slug_api | arg1: valor1]\n\n';
    
    const localAgents = dbAgents.filter(a => a.apiEndpoint.startsWith('LOCAL:'));
    const cloudAgents = dbAgents.filter(a => !a.apiEndpoint.startsWith('LOCAL:'));

    dynamicSystemPrompt += '--- APIs PRIMITIVAS GLOBALES (Se ejecutan silenciosamente) ---\n';
    for (const la of localAgents) {
      dynamicSystemPrompt += `- Slug: ${la.slug}\n  Descripción: ${la.description || ''}\n  Formato: [LLAMAR_API: ${la.slug} | arg1: valor1]\n\n`;
    }
    
    dynamicSystemPrompt += '--- AGENTES COMPLEJOS (Switches para delegar tareas finales) ---\n';
    for (const ca of cloudAgents) {
      dynamicSystemPrompt += `- Slug: ${ca.slug}\n  Descripción: ${ca.description || ''}\n  Formato: [LLAMAR_API: ${ca.slug}]\n\n`;
    }

    const modelToUse = model || (provider === 'ollama' ? 'llama3.1:latest' : 'gemini-3.6-flash');

    const result = await universalChatWithTools(
      provider,
      modelToUse,
      apiKey,
      dynamicSystemPrompt, 
      messages, 
      workspacePath || '',
      dbAgents
    );

    // Guardar token usage asíncronamente (safe guard)
    if (result.usage && result.usage.totalTokens > 0 && userId) {
      try {
        if (prisma.tokenUsage) {
          prisma.tokenUsage.create({
            data: {
              userId,
              provider,
              modelName: modelToUse,
              promptTokens: result.usage.promptTokens,
              completionTokens: result.usage.completionTokens,
              totalTokens: result.usage.totalTokens
            }
          }).catch(err => console.warn("[TokenUsage] Error guardando:", err.message));
        }
      } catch { /* tabla aún no creada, ignorar silenciosamente */ }
    }

    if (result.requiresPreview) {
      return NextResponse.json({ text: result.text }, {
        headers: {
          'X-AutoProd-Agent': encodeURIComponent(result.agentSlug || ''),
          'X-AutoProd-Step-Name': encodeURIComponent(result.stepName || ''),
          'X-AutoProd-Action-Endpoint': encodeURIComponent(result.endpoint || ''),
          'X-AutoProd-Requires-Preview': 'true'
        }
      });
    }
    
    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    if (error.cause) console.error('Cause:', error.cause);
    if (error.stack) console.error('Stack:', error.stack);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
