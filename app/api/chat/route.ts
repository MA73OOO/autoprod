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
// Tool executor — runs the actual filesystem operation.
// ──────────────────────────────────────────────
async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case 'list_directory': {
        const dirPath = (args.dirPath as string) || '.';
        const fullPath = path.join(process.cwd(), dirPath);
        const items = await fsLib.readdir(fullPath, { withFileTypes: true });
        return JSON.stringify(items.map(i => ({ name: i.name, isDirectory: i.isDirectory() })));
      }
      case 'read_file': {
        const filePath = args.filePath as string;
        const fullPath = path.join(process.cwd(), filePath);
        const content = await fsLib.readFile(fullPath, 'utf8');
        // Truncate very large files to avoid blowing up context
        return content.length > 8000 ? content.slice(0, 8000) + '\n... [truncated]' : content;
      }
      case 'write_file': {
        const filePath = args.filePath as string;
        const content = args.content as string;
        const fullPath = path.join(process.cwd(), filePath);
        await fsLib.mkdir(path.dirname(fullPath), { recursive: true });
        await fsLib.writeFile(fullPath, content, 'utf8');
        return JSON.stringify({ success: true, message: `File ${filePath} written successfully.` });
      }
      case 'delete_file': {
        const filePath = args.filePath as string;
        const confirmed = args.confirmed as boolean;
        if (!confirmed) {
          return JSON.stringify({ error: 'Deletion aborted. You must ask the user for explicit confirmation before deleting.' });
        }
        const fullPath = path.join(process.cwd(), filePath);
        await fsLib.rm(fullPath, { recursive: true, force: true });
        return JSON.stringify({ success: true, message: `Path ${filePath} deleted successfully.` });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
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

async function ollamaChatWithTools(
  modelName: string,
  systemPrompt: string,
  userMessages: Array<{ role: string; content: string }>,
): Promise<string> {
  const history: OllamaMessage[] = [
    { role: 'system', content: systemPrompt },
    ...userMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
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

        const result = await executeTool(fnName, fnArgs);
        history.push({
          role: 'tool',
          content: result,
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
    const { messages, provider, model } = await req.json();

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

    if (provider === 'ollama') {
      const ollamaModel = model || 'llama3.1:latest';
      const responseText = await ollamaChatWithTools(ollamaModel, systemPrompt, messages);
      return NextResponse.json({ text: responseText || '[Sin respuesta del modelo]' });
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
        parameters: z.object({
          dirPath: z.string().describe('The relative path to the directory'),
        }),
        execute: async ({ dirPath }) => {
          try {
            const fullPath = path.join(process.cwd(), dirPath);
            const items = await fs.readdir(fullPath, { withFileTypes: true });
            return items.map(item => ({ name: item.name, isDirectory: item.isDirectory() }));
          } catch (e: any) { return { error: e.message }; }
        },
      }),
      read_file: tool({
        description: 'Read the contents of a file. Only use when the user explicitly asks.',
        parameters: z.object({ filePath: z.string() }),
        execute: async ({ filePath }) => {
          try {
            const content = await fs.readFile(path.join(process.cwd(), filePath), 'utf8');
            return { content };
          } catch (e: any) { return { error: e.message }; }
        },
      }),
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
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
