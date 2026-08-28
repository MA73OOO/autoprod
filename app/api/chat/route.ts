import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText, tool, jsonSchema } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { db as prisma } from '@/src/prisma/db';
import fsLib from 'fs/promises';
import path from 'path';

// ──────────────────────────────────────────────
// Tool definitions with RAW JSON Schema (bypasses
// the broken Zod v4 → JSON Schema conversion in
// Vercel AI SDK 7 that strips all `properties`).
// ──────────────────────────────────────────────
const OLLAMA_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'list_directory',
      description: 'List the contents of a directory',
      parameters: {
        type: 'object',
        properties: {
          dirPath: { type: 'string', description: 'The relative path to the directory (e.g., ".", "app/api")' },
        },
        required: ['dirPath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'read_file',
      description: 'Read the contents of a file',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'The relative path to the file (e.g., "package.json")' },
        },
        required: ['filePath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'write_file',
      description: 'Write content to a file (creates or overwrites)',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'The relative path to the file' },
          content: { type: 'string', description: 'The content to write to the file' },
        },
        required: ['filePath', 'content'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_file',
      description: 'Delete a file or directory. WARNING: This is destructive. You MUST ask the user for confirmation BEFORE calling this tool. Pass confirmed: true ONLY if the user explicitly said YES in their last message.',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'The relative path to the file or directory to delete' },
          confirmed: { type: 'boolean', description: 'Set to true ONLY if the user explicitly confirmed the deletion in their most recent message. Otherwise false.' },
        },
        required: ['filePath', 'confirmed'],
      },
    },
  },
];

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

async function executeTool(name: string, args: Record<string, unknown>, workspacePath: string): Promise<string> {
  if (!workspacePath) return JSON.stringify({ error: "No workspace selected in the UI." });
  
  try {
    switch (name) {
      case 'list_directory': {
        const base = path.join(workspacePath, (args.dirPath as string) || '.');
        const res = await callPythonMotor('GET', `/?base_path=${encodeURIComponent(base)}`);
        return JSON.stringify(res.tree || []);
      }
      case 'read_file': {
        const fullPath = path.join(workspacePath, args.filePath as string);
        const res = await callPythonMotor('GET', `/file?path=${encodeURIComponent(fullPath)}`);
        const content = res.content || '';
        // Truncate very large files to avoid blowing up context
        return content.length > 8000 ? content.slice(0, 8000) + '\n... [truncated]' : content;
      }
      case 'write_file': {
        const fullPath = path.join(workspacePath, args.filePath as string);
        await callPythonMotor('POST', `/file`, { path: fullPath, content: args.content });
        return JSON.stringify({ success: true, message: `File ${args.filePath} written successfully.` });
      }
      case 'delete_file': {
        const confirmed = args.confirmed as boolean;
        if (!confirmed) {
          return JSON.stringify({ error: 'Deletion aborted. You must ask the user for explicit confirmation before deleting.' });
        }
        const fullPath = path.join(workspacePath, args.filePath as string);
        await callPythonMotor('DELETE', `/file?path=${encodeURIComponent(fullPath)}`);
        return JSON.stringify({ success: true, message: `File deleted successfully.` });
      }
      default:
        return JSON.stringify({ error: 'Unknown tool' });
    }
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}

// ──────────────────────────────────────────────
// Ollama-specific chat + tool loop.
// ──────────────────────────────────────────────
const OLLAMA_BASE = 'http://127.0.0.1:11434';
const MAX_TOOL_STEPS = 5;

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: Record<string, unknown> } }>;
}

export async function ollamaChatWithTools(
  modelName: string,
  systemPrompt: string,
  userMessages: any[],
  workspacePath: string
): Promise<string> {
  const history: OllamaMessage[] = [
    { role: 'system', content: systemPrompt },
    ...userMessages.map(m => {
      let textContent = '';
      if (typeof m.content === 'string') {
        textContent = m.content;
      } else if (Array.isArray(m.content)) {
        textContent = m.content.map((part: any) => part.text || '').join('\\n');
      }
      return { role: m.role as 'user' | 'assistant', content: textContent };
    }),
  ];

  for (let step = 0; step < MAX_TOOL_STEPS; step++) {
    const body = {
      model: modelName,
      messages: history,
      tools: OLLAMA_TOOLS,
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
    const assistantMsg = data.message;

    if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
      history.push({
        role: 'assistant',
        content: assistantMsg.content || '',
        tool_calls: assistantMsg.tool_calls,
      });

      for (const tc of assistantMsg.tool_calls) {
        const fnName = tc.function.name;
        const fnArgs = typeof tc.function.arguments === 'string'
          ? JSON.parse(tc.function.arguments)
          : tc.function.arguments;

        const result = await executeTool(fnName, fnArgs, workspacePath);
        history.push({
          role: 'tool',
          content: `[TOOL RESULT FOR ${fnName}]:\n${result}`,
        });
      }
      continue;
    }

    return assistantMsg.content || '';
  }
  return '[El modelo agotó el máximo de pasos de herramientas. Intenta de nuevo con una pregunta más simple.]';
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

    const systemPrompt = 'You are a helpful AI assistant integrated into AutoProd, a video content production tool. Answer questions conversationally and concisely. You also have optional filesystem tools available — only use them when the user explicitly asks you to read files, list directories, or write to files. For general questions, just respond with text directly.';

    const lastMessage = messages[messages.length - 1]?.content || '';
    let activeAgentSlug = req.body && (await req.clone().json()).agentSlug; // Extraer si viene del UI

    // --- FASE 1: ENRUTAMIENTO INTELIGENTE (Si no hay trigger manual) ---
    if (!activeAgentSlug && provider === 'ollama') {
      try {
        const availableAgents = await prisma.agent.findMany({ select: { slug: true, description: true } });
        if (availableAgents.length > 0) {
          const routerPrompt = `
Eres un clasificador de intenciones ultrarrápido. El usuario dice: "${lastMessage}".
Selecciona el 'slug' del agente que mejor puede ayudar de esta lista:
${availableAgents.map(a => `- ${a.slug}: ${a.description}`).join('\n')}
Si no aplica ninguno, responde SOLO con: chat_general
Tu respuesta debe ser EXACTAMENTE el slug, sin comillas, sin explicaciones.`;

          const routerRes = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model || 'llama3.1:latest', prompt: routerPrompt, stream: false })
          });
          if (routerRes.ok) {
            const rData = await routerRes.json();
            const guess = rData.response?.trim();
            if (availableAgents.some(a => a.slug === guess)) {
              activeAgentSlug = guess;
            }
          }
        }
      } catch (e) {
        console.warn("Fallo al clasificar agente, cayendo a chat_general", e);
      }
    }

    // --- FASE 2 y 3: CARGA DEL ARNÉS Y EJECUCIÓN (Llama) ---
    if (activeAgentSlug && activeAgentSlug !== 'chat_general' && provider === 'ollama') {
      const currentStepOrder = (await req.clone().json().catch(() => {}))?.currentStepOrder || 1;
      
      const agent = await prisma.agent.findUnique({
        where: { slug: activeAgentSlug },
        include: { steps: { where: { stepOrder: currentStepOrder } } }
      });

      if (agent && agent.steps.length > 0) {
        const activeStep = agent.steps[0];
        const dynamicContext = `ROL: ${agent.systemPrompt}\nTAREA ACTUAL: ${activeStep.stepName}\nINSTRUCCIONES: ${activeStep.dynamicPromptTemplate || ''}\n\nAnaliza la conversación y genera la estructura o respuesta requerida para este paso. No divagues.`;

        // Generamos la respuesta con Ollama
        const ollamaModel = model || 'llama3.1:latest';
        const reasoningResult = await ollamaChatWithTools(
          ollamaModel,
          dynamicContext,
          messages,
          workspacePath || ''
        );

        // Si el paso tiene un Endpoint, pedimos Preview en la UI
        if (activeStep.apiEndpoint) {
          return NextResponse.json({ text: reasoningResult }, {
            headers: {
              'X-AutoProd-Agent': encodeURIComponent(agent.name),
              'X-AutoProd-Step-Name': encodeURIComponent(activeStep.stepName),
              'X-AutoProd-Action-Endpoint': encodeURIComponent(activeStep.apiEndpoint),
              'X-AutoProd-Requires-Preview': 'true'
            }
          });
        } else {
          return NextResponse.json({ text: reasoningResult });
        }
      }
    }

    // --- FALLBACK A CHAT GENERAL ---
    if (provider === 'ollama') {
      const ollamaModel = model || 'llama3.1:latest';
      return NextResponse.json({ text: await ollamaChatWithTools(ollamaModel, systemPrompt, messages, workspacePath || '') });
    }

    let aiModel;
    switch (provider) {
      case 'openai':
      case 'chatgpt':
        aiModel = openai('gpt-4o', { apiKey });
        break;
      case 'anthropic':
        aiModel = anthropic(model || 'claude-3-5-sonnet-20240620', { apiKey });
        break;
      case 'gemini':
        const cleanModel = (model || 'gemini-3.6-flash').replace(/^models\//, '');
        aiModel = createGoogleGenerativeAI({ apiKey })(cleanModel);
        break;
      default:
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const toolsDef = {
      list_directory: tool({
        description: 'List the contents of a directory. Only use when the user explicitly asks.',
        parameters: jsonSchema({
          type: 'object',
          properties: {
            dirPath: { type: 'string', description: 'The relative path to the directory' }
          }
        }),
        execute: async (args) => JSON.parse(await executeTool('list_directory', args, workspacePath || ''))
      }),
      read_file: tool({
        description: 'Read the contents of a file',
        parameters: jsonSchema({
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'The relative path to the file' }
          },
          required: ['filePath']
        }),
        execute: async (args) => {
          const res = await executeTool('read_file', args, workspacePath || '');
          return { content: res };
        }
      }),
      write_file: tool({
        description: 'Write content to a file',
        parameters: jsonSchema({
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'The relative path to the file' },
            content: { type: 'string', description: 'The content to write' }
          },
          required: ['filePath', 'content']
        }),
        execute: async (args) => JSON.parse(await executeTool('write_file', args, workspacePath || ''))
      }),
      delete_file: tool({
        description: 'Delete a file. Pass confirmed: true ONLY if the user explicitly confirmed.',
        parameters: jsonSchema({
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'The relative path to the file' },
            confirmed: { type: 'boolean', description: 'Set to true ONLY if confirmed' }
          },
          required: ['filePath', 'confirmed']
        }),
        execute: async (args) => JSON.parse(await executeTool('delete_file', args, workspacePath || ''))
      })
    };

    const result = await generateText({
      model: aiModel,
      messages,
      system: systemPrompt,
      tools: provider !== 'ollama' ? toolsDef : undefined,
      maxSteps: 3,
    });

    const responseText = result.text || result.steps?.map((s: any) => s.text).filter(Boolean).join('\n') || '[Sin respuesta del modelo]';
    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    if (error.cause) console.error('Cause:', error.cause);
    if (error.stack) console.error('Stack:', error.stack);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
