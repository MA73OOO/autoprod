import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText, tool as aiTool, jsonSchema } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { db as prisma } from '@/src/prisma/db';
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

// ──────────────────────────────────────────────
// Main POST handler (Agentic Orchestrator)
// ──────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { messages, provider, model, workspacePath, channelId, confirmCreditUsage } = await req.json();

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

    if (userId) {
      try {
        userRecord = await prisma.user.findUnique({
          where: { id: userId },
          select: { openaiVaultId: true, geminiVaultId: true, anthropicVaultId: true }
        });
      } catch (e: any) {
        console.warn('Failed to retrieve user settings', e);
      }
    }

    let apiKey = '';
    let secretId = null;

    if (provider === 'openai' || provider === 'chatgpt') secretId = userRecord?.openaiVaultId;
    if (provider === 'gemini') secretId = userRecord?.geminiVaultId;
    if (provider === 'anthropic') secretId = userRecord?.anthropicVaultId;

    if (secretId) {
      // 1. EL USUARIO TIENE BYOK ACTIVO: Usamos su llave incondicionalmente
      const { data: secretData } = await supabase.rpc('get_decrypted_secret', { p_secret_id: secretId });
      if (secretData) {
        apiKey = typeof secretData === 'string' ? secretData : secretData.get_decrypted_secret || secretData;
      }
    } 
    
    if (!apiKey) {
      // 2. EL USUARIO NO TIENE BYOK: Pasamos directo a las Llaves Maestras del Sistema (Admin)
      if (!confirmCreditUsage) {
        // Detenemos la ejecución y le avisamos al frontend que pregunte al usuario
        return NextResponse.json({ 
          requiresConfirmation: true, 
          message: "Esta acción consumirá créditos de AutoProd. ¿Deseas continuar?"
        }, { status: 402 }); // 402 Payment Required
      }

      // Si ya confirmó, buscamos la llave en SystemSettings -> Vault
      try {
        const systemSettings = await prisma.systemSettings.findUnique({ where: { id: "global" }});
        let systemSecretId = null;
        if (provider === 'openai' || provider === 'chatgpt') systemSecretId = systemSettings?.openaiVaultId;
        if (provider === 'gemini') systemSecretId = systemSettings?.geminiVaultId;
        if (provider === 'anthropic') systemSecretId = systemSettings?.anthropicVaultId;

        if (systemSecretId) {
          const { data: sysSecretData } = await supabase.rpc('get_decrypted_secret', { p_secret_id: systemSecretId });
          if (sysSecretData) {
             apiKey = typeof sysSecretData === 'string' ? sysSecretData : sysSecretData.get_decrypted_secret || sysSecretData;
          }
        }
      } catch(e) {
        console.warn('Error reading system settings from vault', e);
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: `No API key configured in Vault for ${provider}. Verifica tus API Keys en Ajustes.` }, { status: 400 });
    }
    // ──────────────────────────────────────────────
    // 1. Cargar Orquestador y Herramientas (Agentic Pattern)
    // ──────────────────────────────────────────────
    let systemPrompt = 'Eres AutoProd, un asistente inteligente.';
    const aiTools: Record<string, any> = {};

    try {
      // Obtener el agente orquestador desde la BD
      const orchestrator = await prisma.agent.findFirst({
        where: { isOrchestrator: true },
        include: {
          tools: {
            include: { tool: true }
          }
        }
      });

      if (orchestrator) {
        systemPrompt = orchestrator.systemPrompt;
        
        // Mapear herramientas de la BD a Vercel AI SDK Tools
        for (const at of orchestrator.tools) {
          const dbTool = at.tool;
          
          aiTools[dbTool.name] = aiTool({
            description: dbTool.description || '',
            parameters: jsonSchema(dbTool.schema as any),
            execute: async (args: any) => {
               if (!workspacePath) return "Error: No workspace selected in the UI.";
               
               try {
                 if (dbTool.name === 'workspace_list') {
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
                    return `Estructura del proyecto:\n${formatTree(res.tree || [])}`;
                 }
                 if (dbTool.name === 'workspace_read') {
                    const fullPath = path.join(workspacePath, args.file.trim());
                    const res = await callPythonMotor('GET', `/file?path=${encodeURIComponent(fullPath)}`);
                    const content = res.content || '';
                    return content.length > 8000 ? content.slice(0, 8000) + '\n... [truncated]' : content;
                 }
                 if (dbTool.name === 'workspace_write') {
                    const fullPath = path.join(workspacePath, args.file.trim());
                    await callPythonMotor('POST', `/file`, { path: fullPath, content: args.content });
                    return "Archivo guardado exitosamente.";
                 }
                 
                 // Futuro: Aquí podemos despertar Sub-Agentes si la tool delega trabajo
                 return `Herramienta ${dbTool.name} ejecutada, pero no hay lógica proxy definida.`;
                 
               } catch(e: any) {
                 return `Error ejecutando ${dbTool.name}: ${e.message}`;
               }
            }
          });
        }
      }

      // Inyectar contexto de las reglas del canal si existe
      if (channelId) {
         const channel = await prisma.channel.findUnique({ where: { id: channelId } });
         if (channel && channel.contextRules) {
            systemPrompt += `\n\n--- REGLAS DEL CANAL ACTUAL ---\n${channel.contextRules}`;
         }
      }
      
    } catch (e) {
      console.warn("Fallo al cargar Orquestador de BD", e);
    }

    // ──────────────────────────────────────────────
    // 2. Configurar Modelo
    // ──────────────────────────────────────────────
    let aiModel;
    if (provider === 'openai' || provider === 'chatgpt') {
      aiModel = openai('gpt-4o', { apiKey });
    } else if (provider === 'anthropic') {
      aiModel = anthropic(model || 'claude-3-5-sonnet-20240620', { apiKey });
    } else if (provider === 'gemini') {
      const cleanModel = (model || 'gemini-3.6-flash').replace(/^models\//, '');
      aiModel = createGoogleGenerativeAI({ apiKey })(cleanModel);
    } else {
      throw new Error('Invalid provider');
    }

    // Preparar historial
    const history = messages.map((m: any) => {
      let textContent = '';
      if (typeof m.content === 'string') {
        textContent = m.content;
      } else if (Array.isArray(m.content)) {
        textContent = m.content.map((part: any) => part.text || '').join('\n');
      }
      return { role: m.role as 'user' | 'assistant' | 'system', content: textContent };
    });

    // ──────────────────────────────────────────────
    // 3. Generar Texto (Function Calling Nativo)
    // ──────────────────────────────────────────────
    const result = await generateText({
      model: aiModel,
      messages: history.filter((h: any) => h.role !== 'system'),
      system: systemPrompt,
      tools: Object.keys(aiTools).length > 0 ? aiTools : undefined,
      maxSteps: 5 // Permite al LLM iterar, llamar herramientas y luego responder
    });

    // Guardar token usage
    if (result.usage && result.usage.totalTokens > 0 && userId) {
      try {
        if (prisma.tokenUsage) {
          prisma.tokenUsage.create({
            data: {
              userId,
              provider,
              modelName: model || 'unknown',
              promptTokens: result.usage.promptTokens,
              completionTokens: result.usage.completionTokens,
              totalTokens: result.usage.totalTokens
            }
          }).catch(err => console.warn("[TokenUsage] Error guardando:", err.message));
        }
      } catch { /* ignorar silenciosamente si la tabla no existe */ }
    }
    
    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
