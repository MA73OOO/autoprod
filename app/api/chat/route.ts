import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { generateText, tool as aiTool, jsonSchema } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { db as prisma } from '@/src/prisma/db';
import { getWorkspacePath } from '@/harness/setup/detector';
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
          select: { name: true, email: true, openaiVaultId: true, geminiVaultId: true, anthropicVaultId: true }
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
    
    let requiredCredits = 1; // Default fallback
    let usedSystemKey = false;
    let userWalletId: string | null = null;

    if (!apiKey) {
      // 2. EL USUARIO NO TIENE BYOK: Pasamos directo a las Llaves Maestras del Sistema (Admin)
      usedSystemKey = true;

      // Calcular costo dinámico
      try {
        const pricing = await prisma.servicePricing.findUnique({
          where: {
            serviceType_modelName: {
              serviceType: 'CHAT',
              modelName: model || 'default'
            }
          }
        });
        if (pricing && pricing.isActive) {
          requiredCredits = pricing.costPerUnit;
        }
      } catch (e) {
        console.warn('Error reading service pricing, defaulting to 1', e);
      }

      // Verificar saldo
      if (userId) {
        try {
          let wallet = await prisma.wallet.findUnique({ where: { userId } });
          // Auto-crear wallet si no existe (para cuentas antiguas)
          if (!wallet) {
            wallet = await prisma.wallet.create({ data: { userId, balance: 10 } }); // 10 créditos gratis de cortesía
          }
          if (wallet.balance < requiredCredits) {
             return NextResponse.json({ 
               error: `Créditos insuficientes. Necesitas ${requiredCredits} crédito(s) para usar este modelo. Por favor recarga tu saldo o configura tu API Key personal (BYOK).`
             }, { status: 402 }); 
          }
          userWalletId = wallet.id;
        } catch(e) {
          console.warn('Error checking wallet', e);
        }
      }

      if (!confirmCreditUsage) {
        // Detenemos la ejecución y le avisamos al frontend que pregunte al usuario
        return NextResponse.json({ 
          requiresConfirmation: true, 
          message: `Esta acción consumirá ${requiredCredits} crédito(s) de la plataforma. ¿Deseas continuar?`
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
    let baseSystemPrompt = 'Eres AutoProd, un asistente inteligente.';
    if (userRecord?.name) {
      baseSystemPrompt = `Estás hablando con ${userRecord.name}. Dirígete a él/ella por su nombre.\n\n` + baseSystemPrompt;
    }
    let systemPrompt = baseSystemPrompt;
    const aiTools: Record<string, any> = {};

    try {
      // Obtener el agente orquestador desde la BD
      const orchestrator = await prisma.agent.findFirst({
        where: { slug: 'orchestrator' },
        include: {
          agentTools: {
            include: { tool: true }
          }
        }
      });

      if (orchestrator) {
        // Inyectar workspace_path dinámicamente en el system prompt
        const workspacePath = getWorkspacePath() || 'No configurado';
        const resolvedPrompt = orchestrator.systemPrompt.replace('{workspace_path}', workspacePath);
        systemPrompt = (userRecord?.name ? `Estás hablando con ${userRecord.name}. Dirígete a él/ella por su nombre.\n\n` : '') + resolvedPrompt;
        
        // Mapear herramientas de la BD a Vercel AI SDK Tools
        const toolNames: string[] = [];
        for (const at of orchestrator.agentTools) {
          const dbTool = at.tool;
          if (!dbTool) continue;
          
          toolNames.push(dbTool.name);

          aiTools[dbTool.name] = aiTool({
            description: dbTool.description || '',
            parameters: jsonSchema(dbTool.schema as any),
            execute: async (args: any) => {
               try {
                 console.log(`[Proxy Tool] Invocando ${dbTool.name} en ${dbTool.apiEndpoint}`);
                 
                 // Inyectar el contexto del usuario en los argumentos
                 const payload = { ...args, _userContext: { id: userId, name: userRecord?.name, email: userRecord?.email } };
                 
                  // Normalización inteligente de sinónimos de parámetros (anti-422)
                  if (!payload.path && (payload.file_path || payload.filepath || payload.filename || payload.archivo || payload.file)) {
                    payload.path = payload.file_path || payload.filepath || payload.filename || payload.archivo || payload.file;
                  }
                  if (!payload.content && (payload.text || payload.body || payload.data || payload.contenido)) {
                    payload.content = payload.text || payload.body || payload.data || payload.contenido;
                  }
                  if (!payload.folder_name && (payload.folder || payload.name || payload.nombre_carpeta || payload.directory)) {
                    payload.folder_name = payload.folder || payload.name || payload.nombre_carpeta || payload.directory;
                  }
                  if (!payload.target_path && (payload.target || payload.destination || payload.ruta_destino)) {
                    payload.target_path = payload.target || payload.destination || payload.ruta_destino;
                  }
                  if (!payload.base_path && (payload.path && dbTool.name === 'listar_directorio')) {
                    payload.base_path = payload.path;
                  }

                  // Blindaje: Si es una herramienta de archivos y la ruta es relativa, anteponer el workspace
                  const workspaceRoot = getWorkspacePath();
                  if (workspaceRoot && payload.path && typeof payload.path === 'string' && !path.isAbsolute(payload.path)) {
                    payload.path = path.join(workspaceRoot, payload.path);
                  }
                  if (workspaceRoot && payload.target_path && typeof payload.target_path === 'string' && !path.isAbsolute(payload.target_path)) {
                    payload.target_path = path.join(workspaceRoot, payload.target_path);
                  }
                  if (workspaceRoot && payload.base_path && typeof payload.base_path === 'string' && !path.isAbsolute(payload.base_path)) {
                    payload.base_path = path.join(workspaceRoot, payload.base_path);
                  }

                 // Para métodos GET, convertir argumentos a query params
                 let url = dbTool.apiEndpoint;
                 if (dbTool.method === 'GET' && payload && Object.keys(payload).length > 0) {
                   const params = new URLSearchParams();
                   for (const [key, val] of Object.entries(payload)) {
                     if (key !== '_userContext' && val !== undefined && val !== null) {
                       params.append(key, String(val));
                     }
                   }
                   const qs = params.toString();
                   if (qs) {
                     url += (url.includes('?') ? '&' : '?') + qs;
                   }
                 }
                 
                 const response = await fetch(url, {
                   method: dbTool.method,
                   headers: {
                     'Content-Type': 'application/json'
                   },
                   body: dbTool.method !== 'GET' ? JSON.stringify(payload) : undefined
                 });
                 
                 if (!response.ok) {
                   const errorJson = await response.json().catch(() => ({}));
                   let detail = errorJson.detail;
                   if (Array.isArray(detail)) {
                     detail = detail.map((d: any) => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg || JSON.stringify(d)}`).join(' | ');
                   } else if (typeof detail === 'object') {
                     detail = JSON.stringify(detail);
                   }
                   return `[Error en ${dbTool.name} (HTTP ${response.status})]: ${detail || response.statusText}. Por favor revisa los parámetros e inténtalo de nuevo con la ruta absoluta correcta.`;
                 }

                 const data = await response.json();
                 return JSON.stringify(data);
               } catch(e: any) {
                 return `[Fallo de conexión en ${dbTool.name}]: ${e.message}. Verifica si el motor local está activo en el puerto 8000.`;
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
    let cleanModel = '';
    if (provider === 'openai' || provider === 'chatgpt') {
      aiModel = openai('gpt-4o', { apiKey });
    } else if (provider === 'anthropic') {
      aiModel = anthropic(model || 'claude-3-5-sonnet-20240620', { apiKey });
    } else if (provider === 'gemini') {
      const rawModel = model || 'gemini-3.5-flash';
      cleanModel = rawModel.replace(/^models\//, '').trim();
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

    // Guardar token usage y descontar créditos si usó llave maestra
    if (userId) {
      if (result.usage && result.usage.totalTokens > 0) {
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

      // Descuento de créditos
      if (usedSystemKey && userWalletId && requiredCredits > 0) {
        try {
          await prisma.$transaction([
            prisma.wallet.update({
              where: { id: userWalletId },
              data: { balance: { decrement: requiredCredits } }
            }),
            prisma.creditConsumption.create({
              data: {
                walletId: userWalletId,
                creditsUsed: -requiredCredits,
                serviceType: 'CHAT',
                modelName: model || 'unknown',
                description: `Chat interactivo con ${model || 'unknown'}`
              }
            })
          ]);
        } catch (e: any) {
          console.warn('Error deducting credits:', e.message);
        }
      }
    }
    
    let finalOutput = result.text;
    
    // Si el LLM decidió no escribir texto final pero sí ejecutó herramientas (Falla común en Gemini con Vercel AI SDK)
    // Forzamos una segunda pasada para que sintetice los resultados de las herramientas.
    if (!finalOutput && result.toolResults && result.toolResults.length > 0) {
      try {
        const toolSummaryPrompt = `Acabas de ejecutar una o más herramientas del sistema. Estos fueron los resultados obtenidos:\n\n${JSON.stringify(result.toolResults, null, 2)}\n\nPor favor, responde al usuario explicándole con amabilidad y claridad qué acciones realizaste en su workspace y cuál es el estado actual de su proyecto.`;
        
        const synthesisResult = await generateText({
          model: aiModel,
          messages: [
             ...history.filter((h: any) => h.role !== 'system'),
             { role: 'user', content: toolSummaryPrompt }
          ],
          system: systemPrompt,
        });
        
        finalOutput = synthesisResult.text;
      } catch (synthesisErr: any) {
        console.warn("[Synthesis Error]:", synthesisErr.message);
      }
    }

    // ── GUARDIÁN DE RESPUESTA: Nunca retornar una respuesta vacía ──
    if (!finalOutput || finalOutput.trim() === '') {
      if (result.toolResults && result.toolResults.length > 0) {
        const resumenHerramientas = result.toolResults.map((tr: any) => {
          let outputStr = '';
          if (typeof tr.result === 'string') {
            outputStr = tr.result;
          } else if (tr.result !== undefined && tr.result !== null) {
            outputStr = JSON.stringify(tr.result);
          } else {
            outputStr = 'Ejecutado con éxito';
          }
          if (outputStr && outputStr.length > 180) {
            outputStr = outputStr.substring(0, 180) + '...';
          }
          return `• **${tr.toolName}**: ${outputStr}`;
        }).join('\n');

        finalOutput = `He ejecutado las siguientes acciones en tu workspace:\n\n${resumenHerramientas}\n\n¿Deseas continuar con el siguiente paso?`;
      } else {
        finalOutput = "He procesado tu mensaje. ¿En qué más te puedo colaborar en tu proyecto de AutoProd?";
      }
    }

    return NextResponse.json({ text: finalOutput, modelName: cleanModel || model });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
