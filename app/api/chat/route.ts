import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { generateText, tool as aiTool, jsonSchema, embed } from 'ai';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { db as prisma } from '@/src/prisma/db';
import { isOrchestratorFreeForUser, PLANS_CONFIG } from '@/lib/pricing-config';
import { getWorkspacePath } from '@/harness/setup/detector';
import path from 'path';
import fs from 'fs';

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
    const body = await req.json();
    const messages = body.messages;
    const provider = body.provider || 'openai';
    const model = body.model === 'default' || !body.model ? 'gpt-4o-mini' : body.model;
    const { workspacePath, channelId, confirmCreditUsage, deepThinking } = body;
    const isDeepThinking = Boolean(deepThinking);

    if (!messages) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
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

    let userRecord: any = null;

    if (userId) {
      try {
        userRecord = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            email: true,
            role: true,
            openaiVaultId: true,
            geminiVaultId: true,
            anthropicVaultId: true,
            subscription: {
              include: { plan: { include: { limits: true } } }
            }
          }
        });
      } catch (e: any) {
        console.warn('Failed to retrieve user settings', e);
      }
    }

    const userPlan = (userRecord?.subscription?.plan?.name as 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE') || 'FREE';
    const planConfig = PLANS_CONFIG[userPlan] || PLANS_CONFIG.FREE;
    const maxChannels = userRecord?.subscription?.plan?.limits?.maxChannels ?? planConfig.maxChannels;
    const isAdmin = userRecord?.role === 'ADMIN';
    const existingChannels: string[] = [];


    let apiKey = '';

    // 1a. PRIORIDAD 1: Variable de Entorno (.env / .env.local)
    if ((provider === 'openai' || provider === 'chatgpt') && process.env.OPENAI_API_KEY) {
      apiKey = process.env.OPENAI_API_KEY;
    } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY;
    } else if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      apiKey = process.env.ANTHROPIC_API_KEY;
    }

    // 1b. PRIORIDAD 2: BYOK en Vault (openaiVaultId, geminiVaultId, etc.)
    if (!apiKey) {
      let secretId = null;
      if (provider === 'openai' || provider === 'chatgpt') secretId = userRecord?.openaiVaultId;
      if (provider === 'gemini') secretId = userRecord?.geminiVaultId;
      if (provider === 'anthropic') secretId = userRecord?.anthropicVaultId;

      if (secretId) {
        const { data: secretData } = await supabase.rpc('get_decrypted_secret', { p_secret_id: secretId });
        if (secretData) {
          apiKey = typeof secretData === 'string' ? secretData : secretData.get_decrypted_secret || secretData;
        }
      } 
    }

    // 1c. PRIORIDAD 3: RPC get_api_key (User API keys)
    if (!apiKey && userId) {
      const providerKey = (provider === 'openai' || provider === 'chatgpt') ? 'openai' : provider;
      try {
        const { data: rpcKey } = await supabase.rpc('get_api_key', { p_user_id: userId, p_provider: providerKey });
        if (rpcKey && typeof rpcKey === 'string' && rpcKey.trim() !== '') {
          apiKey = rpcKey;
        }
        if (!apiKey && (provider === 'openai' || provider === 'chatgpt')) {
          const { data: chatgptRpcKey } = await supabase.rpc('get_api_key', { p_user_id: userId, p_provider: 'chatgpt' });
          if (chatgptRpcKey && typeof chatgptRpcKey === 'string' && chatgptRpcKey.trim() !== '') {
            apiKey = chatgptRpcKey;
          }
        }
      } catch (e) {
        console.warn('RPC get_api_key fallback error:', e);
      }
    }
    
    let requiredCredits = 0;
    let usedSystemKey = false;
    let userWalletId: string | null = null;
    const userPlanName = userRecord?.subscription?.plan?.name || 'FREE';

    if (!apiKey) {
      // 2. EL USUARIO NO TIENE BYOK: Pasamos directo a las Llaves Maestras del Sistema (Admin)
      usedSystemKey = true;

      // Evaluar si es orquestador gratuito para este plan
      const isFree = isOrchestratorFreeForUser(userPlanName, model);

      if (isFree) {
        requiredCredits = 0; // Gratuito para usuarios de pago en gpt-4o-mini
      } else if (userPlanName === 'FREE' && (!model || model === 'default' || model === 'gpt-4o-mini')) {
        requiredCredits = 1; // Para usuarios FREE, gpt-4o-mini cuesta 1 crédito de sus 50 tokens de prueba
      } else {
        // Modelos avanzados o de pago
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
          } else {
            requiredCredits = 1;
          }
        } catch (e) {
          console.warn('Error reading service pricing, defaulting to 1', e);
          requiredCredits = 1;
        }
      }

      // Verificar saldo si la acción cuesta créditos
      if (userId) {
        try {
          let wallet = await prisma.wallet.findUnique({ where: { userId } });
          // Auto-crear wallet si no existe (con 50 créditos iniciales de cortesía)
          if (!wallet) {
            wallet = await prisma.wallet.create({ data: { userId, balance: 50 } });
          }
          userWalletId = wallet.id;

          if (requiredCredits > 0 && wallet.balance < requiredCredits) {
            if (userPlanName === 'FREE') {
              return NextResponse.json({
                error: `Has agotado tus 50 créditos de prueba gratuita. Para continuar usando el orquestador ilimitado y acceder a todas las herramientas de AutoProd, suscríbete a Starter ($70), Pro ($100) o Enterprise ($150).`,
                requiresUpgrade: true
              }, { status: 402 });
            } else {
              return NextResponse.json({
                error: `Créditos insuficientes (${wallet.balance} disponibles, necesitas ${requiredCredits}). Por favor recarga tu saldo o mejora tu plan para continuar.`,
                requiresUpgrade: true
              }, { status: 402 });
            }
          }
        } catch(e) {
          console.warn('Error checking wallet', e);
        }
      }

      // Solo pedir confirmación si tiene costo en créditos y el usuario no ha confirmado
      if (requiredCredits > 0 && !confirmCreditUsage) {
        return NextResponse.json({ 
          requiresConfirmation: true, 
          message: `Esta acción consumirá ${requiredCredits} crédito(s) de la plataforma. ¿Deseas continuar?`
        }, { status: 402 });
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
    const executedTools: string[] = [];

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
        // Inyectar workspace_path dinámicamente en el system prompt (prioridad: request body del cliente -> detector)
        const currentWorkspacePath = (workspacePath && typeof workspacePath === 'string' && workspacePath.trim() !== '')
          ? workspacePath
          : (getWorkspacePath() || 'No configurado');
        let resolvedPrompt = orchestrator.systemPrompt.replace('{workspace_path}', currentWorkspacePath);
        // Limpiar cualquier residuo de prohibición estricta antigua que forzaba respuestas simplonas de 2 líneas
        resolvedPrompt = resolvedPrompt.replace(/⛔ REGLA ABSOLUTA — PROHIBICIÓN DE RESPUESTAS TIPO MENÚ[\s\S]*?(?=\n\n|$)/g, '');
        systemPrompt = (userRecord?.name ? `Estás hablando con ${userRecord.name}. Dirígete a él/ella por su nombre.\n\n` : '') + resolvedPrompt;

        // Escanear el estado físico actual del workspace en disco en tiempo real
        let workspaceStructureSnapshot = '';
        try {
          if (currentWorkspacePath && currentWorkspacePath !== 'No configurado' && fs.existsSync(currentWorkspacePath)) {
            const entries = fs.readdirSync(currentWorkspacePath, { withFileTypes: true });
            const structureLines: string[] = [];
            for (const entry of entries) {
              if (entry.name.startsWith('.')) continue;
              if (entry.isDirectory()) {
                if (!existingChannels.includes(entry.name)) {
                  existingChannels.push(entry.name);
                }
                const subPath = path.join(currentWorkspacePath, entry.name);
                let subDirs: string[] = [];
                try {
                  subDirs = fs.readdirSync(subPath, { withFileTypes: true })
                    .filter(e => !e.name.startsWith('.'))
                    .map(e => `${e.isDirectory() ? '📁' : '📄'} ${e.name}`);
                } catch { /* ignorar errores de permisos */ }
                structureLines.push(`• Canal/Carpeta "${entry.name}": [${subDirs.join(', ') || 'vacío'}]`);
              } else {
                structureLines.push(`• Archivo en raíz: "${entry.name}"`);
              }
            }
            if (structureLines.length > 0) {
              workspaceStructureSnapshot = `\n\n--- ESTADO ACTUAL DEL WORKSPACE EN DISCO (TIEMPO REAL) ---\nUbicación: ${currentWorkspacePath}\nCanales detectados físicamente (${existingChannels.length}): ${existingChannels.join(', ')}\nElementos detectados actualmente:\n${structureLines.join('\n')}\n(Usa esta lista como verdad absoluta de lo que existe físicamente en el disco duro del usuario al momento de responder. Si el usuario pregunta qué tiene o se refiere a un canal o carpeta, básate en este estado).`;
            } else {
              workspaceStructureSnapshot = `\n\n--- ESTADO ACTUAL DEL WORKSPACE EN DISCO (TIEMPO REAL) ---\nUbicación: ${currentWorkspacePath}\nEl workspace está actualmente vacío (sin canales ni archivos).`;
            }
          }
        } catch (scanErr: any) {
          console.warn("[Workspace Scan Error]:", scanErr.message);
        }

        // Sincronizar canales de la base de datos
        if (userId) {
          try {
            const dbChannels = await prisma.channel.findMany({ where: { userId }, select: { name: true } });
            for (const dbc of dbChannels) {
              if (!existingChannels.includes(dbc.name)) {
                existingChannels.push(dbc.name);
              }
            }
          } catch (dbErr: any) {
            console.warn("[DB Channels Sync Error]:", dbErr.message);
          }
        }

        systemPrompt += workspaceStructureSnapshot;

        // Resolver canal activo de forma segura (sin relación Prisma context inexistente)
        let activeChannel: any = null;
        let activeChannelContext: any = null;
        if (channelId) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelId);
          try {
            if (isUuid) {
              activeChannel = await prisma.channel.findFirst({
                where: { id: channelId }
              });
            }
            if (!activeChannel) {
              activeChannel = await prisma.channel.findFirst({
                where: { name: { equals: channelId, mode: 'insensitive' } }
              });
            }
          } catch (findErr) {
            console.warn('[Channel lookup error]:', findErr);
          }

          // Si no está en BD aún pero es una carpeta seleccionada en workspace:
          if (!activeChannel && typeof channelId === 'string' && channelId.trim()) {
            activeChannel = {
              id: channelId,
              name: channelId,
              niche: channelId,
              localPath: currentWorkspacePath ? path.join(currentWorkspacePath, channelId) : null
            };
          }
        } else if (userId) {
          const userChannels = await prisma.channel.findMany({
            where: { userId },
            take: 2
          });
          if (userChannels.length === 1) {
            activeChannel = userChannels[0];
          }
        }

        if (activeChannel) {
          try {
            const { data: ctxData } = await supabase
              .from('channelContext')
              .select('*')
              .eq('channelId', activeChannel.id)
              .maybeSingle();
            activeChannelContext = ctxData;
          } catch (sbErr: any) {
            console.warn('[Supabase channelContext error]:', sbErr?.message);
          }
        }

        const isAtChannelLimit = !isAdmin && existingChannels.length >= maxChannels;
        const planLimitsDirective = `\n\n=== REGLAS COMERCIALES Y LÍMITES DE SUSCRIPCIÓN DEL USUARIO ===
- Plan de Suscripción Actual: ${userPlan} (${planConfig.displayName})
- Límite de canales permitidos por su plan: ${maxChannels >= 9999 ? 'Ilimitados' : `${maxChannels} canal(es)`}
- Canales existentes actualmente en su workspace (${existingChannels.length}): ${existingChannels.length > 0 ? existingChannels.join(', ') : 'Ninguno'}

⚠️ REGLA CRÍTICA DE GESTIÓN DE CANALES:
${isAtChannelLimit ? `
¡ATENCIÓN! El usuario ya ha alcanzado el límite máximo de canales permitidos por su plan (${existingChannels.length} de ${maxChannels} canal(es)).
Si el usuario te solicita crear un nuevo canal, abrir un canal adicional, o generar una nueva carpeta raíz para otro canal (ejemplo: "crear otro canal", "ayúdame a crear el canal X"):
1. TIENES ESTRICTAMENTE PROHIBIDO ejecutar herramientas de creación de carpetas o canales en la raíz del workspace (NO llames a "crear_carpetas" para un nuevo canal, ni a "extraer_canal_youtube").
2. NUNCA digas que creaste el canal ni inventes que ya existe la carpeta o que vas a proceder a crearla.
3. Debes responderle de forma muy amable, empática y profesional informándole:
   "Actualmente te encuentras en el plan ${planConfig.displayName}, el cual permite un máximo de ${maxChannels} canal(es) de YouTube. Tu espacio de trabajo ya tiene activo el canal '${existingChannels[0] || 'existente'}'.
   Para gestionar más canales simultáneos sin borrar el actual:
   • Plan Pro ($100 USD/mes): Hasta 3 canales profesionales simultáneos (Multi-nicho).
   • Plan Enterprise ($150 USD/mes): Canales ILIMITADOS.
   Puedes actualizar tu plan en cualquier momento desde la ventana de Planes & Suscripciones o en la barra superior."
` : `
El usuario tiene disponibilidad para crear canales (${existingChannels.length} de ${maxChannels >= 9999 ? 'ilimitados' : maxChannels}). Puedes proceder con la creación cuando lo solicite.
`}
`;
        systemPrompt += planLimitsDirective;

        const channelExtractionDirective = `\n\n--- INSTRUCCIÓN PARA EXPLICAR EXTRACCIÓN DE CANALES ---
Si el usuario te pregunta qué harás al pasarle una URL, cómo funciona la extracción de un canal o qué pasará en su espacio de trabajo:
1. Explícale de forma muy clara, profesional y amigable usando un diagrama de árbol de carpetas Markdown.
2. Menciona sus canales existentes como referencia (por ejemplo, si ves "FinanzasReales" en su workspace actual, úsalo como ejemplo directo).
3. Muestra el diagrama de cómo quedará su workspace:
\`\`\`text
/Workspace
├── /FinanzasReales (Tu canal actual)
└── /NombreCanal (Nuevo canal traído desde YouTube)
    ├── /InfoCanal
    │   ├── Contexto_canal.md    # Identidad, nicho, tono y audiencia
    │   ├── Metricas_canal.md    # Ranking de etiquetas (tags) ganadoras
    │   └── Historial_canal.md   # Catálogo anti-duplicación de videos
    └── /Futuras_Carpetas_de_Videos (Creadas sin repetir ideas)
\`\`\`
4. Resalta los dos beneficios clave para el creador:
   • 🚫 CERO IDEAS DUPLICADAS: Analizaremos todos los videos publicados para que las nuevas carpetas que creemos en AutoProd exploren ángulos frescos y nunca repitan un tema ya realizado.
   • 📈 APROVECHAR LO QUE YA FUNCIONÓ: Minaremos las etiquetas (tags) y fórmulas de títulos con mayor volumen de reproducciones para incorporarlas en los nuevos videos.
5. Invítalo amablemente a compartirte la URL o @handle de su canal para comenzar la extracción de inmediato.`;

        systemPrompt += channelExtractionDirective;

        if (activeChannel) {
          const channelNiche = activeChannel.niche || activeChannelContext?.title || activeChannel.name;
          const channelSummary = activeChannelContext?.contextSummary || activeChannelContext?.description || `Canal enfocado en el nicho: ${channelNiche}.`;
          const channelLocal = activeChannel.localPath || (currentWorkspacePath ? path.join(currentWorkspacePath, activeChannel.name) : `Workspace/${activeChannel.name}`);

          const channelSpecificDirective = `\n\n=== CANAL ACTIVO SELECCIONADO EN EL CHAT: "${activeChannel.name}" ===
- CANAL ACTIVO: "${activeChannel.name}"
- NICHO Y TEMÁTICA PERMITIDA: "${channelNiche}"
- RUTA FÍSICA ASOCIADA: "${channelLocal}"
- RESUMEN DEL CANAL:
${channelSummary}

⚠️ REGLA CRÍTICA DE CONTEXTO:
El usuario ha seleccionado expresamente el canal "${activeChannel.name}".
1. NUNCA hables de forma genérica ni le preguntes al usuario "¿de cuál de tus canales quieres hablar?" ni menciones los otros canales como si no supieras cuál está seleccionado.
2. Reconoce directamente que estás operando dentro de "${activeChannel.name}".
3. Todo el contenido generado (ideas, guiones, hooks, títulos, miniaturas, videos en bucle y carpetas) DEBE pertenecer ESTRICTAMENTE al nicho de "${channelNiche}" para este canal.

=== PRESENTACIÓN DE CAPACIDADES PARA EL CANAL "${activeChannel.name}" ===
Cuando el usuario salude, pregunte "¿en qué me puedes ayudar?", "¿qué puedes hacer?", o pida ideas:
Responde como el **Director y Productor Ejecutivo exclusivo del canal "${activeChannel.name}"**, con una **estructura limpia, ejecutiva y visualmente atractiva** con Markdown profesional:

ESTRUCTURA DE RESPUESTA EXIGIDA PARA "${activeChannel.name}":
• **Saludo y Enfoque del Canal:**
  "¡Hola! Estamos trabajando en tu canal **${activeChannel.name}** (Nicho: ${channelNiche}). Como tu Co-Pilot y Director de Producción, mi labor es potenciar el crecimiento y automatizar la creación de contenido para este canal."

• **Pilares de Producción Aplicados a ${activeChannel.name}:**
  - 🎯 **Estrategia & Ideación para ${activeChannel.name}:** Desarrollo de conceptos ganadores y premisas para el nicho de ${channelNiche}, ganchos psicológicos en los primeros 5 segundos y fórmulas de títulos de alto CTR.
  - 🎬 **Video Looper Studio (PRO HD):** Producción y repetición de videos en bucle continuo con Copia Directa 1:1 (cero pérdida de nitidez de YouTube), línea de tiempo multiclip interactiva y sincronización con música para fondos de 30 min a 3 horas ideales para ${activeChannel.name}.
  - 🎨 **Estudio Creativo & Miniaturas IA:** Diseño de miniaturas adaptadas a la identidad visual de ${activeChannel.name}, análisis de imágenes de referencia y generación de portadas con alto CTR.
  - 📈 **Inteligencia Competitiva de YouTube:** Análisis y minería de canales referentes del nicho (${channelNiche}) para extraer etiquetas ganadoras, patrones de títulos con millones de views y catálogo anti-duplicados para no repetir ideas.
  - 📁 **Organización del Workspace:** Estructura modular de carpetas en ${channelLocal} (/Guiones, /Miniaturas, /Videos, /InfoCanal).

• **3 Siguientes Pasos Inteligentes para ${activeChannel.name}:**
  Ofrece 3 opciones creativas y accionables para avanzar de inmediato con este canal (ejemplo: 1. Redactar el guion del próximo video con gancho de alta retención; 2. Analizar un canal referente de ${channelNiche} para minar sus mejores tags; 3. Diseñar la miniatura o fondo en bucle en el Looper Studio).

Cierra preguntando: "¿Por cuál de estas acciones prefieres que arranquemos con ${activeChannel.name} hoy?"`;

          systemPrompt += channelSpecificDirective;
        } else {
          const generalCapabilitiesDirective = `\n\n=== DIRECTIVA DE PRESENTACIÓN DE CAPACIDADES (MODO GENERAL / SIN CANAL ESPECÍFICO) ===
Cuando el usuario salude, pregunte "¿en qué me puedes ayudar?", "¿qué puedes hacer?", "¿cuáles son tus funciones?", pida orientación o cómo arrancar:
1. Responde como un **Director y Productor Ejecutivo de Contenido de Élite**, con una **estructura limpia, ejecutiva y visualmente atractiva** con Markdown profesional.
2. Menciona los canales que tiene disponibles en su workspace (${existingChannels.length > 0 ? existingChannels.join(', ') : 'tus canales'}).
3. Explica los pilares de producción de AutoProd (Estrategia & Ideación, Video Looper PRO 1:1, Estudio de Miniaturas IA, Inteligencia Competitiva de YouTube, y Organización de Workspace).
4. Ofrece 3 opciones claras: trabajar en uno de sus canales existentes, analizar un nuevo canal competidor de YouTube, o configurar su espacio de producción.`;

          systemPrompt += generalCapabilitiesDirective;
        }
        
        // Mapear herramientas de la BD a Vercel AI SDK Tools
        const toolNames: string[] = [];
        for (const at of orchestrator.agentTools) {
          const dbTool = at.tool;
          if (!dbTool) continue;
          
          toolNames.push(dbTool.name);

          const toolSchemaObj = jsonSchema((dbTool.schema && typeof dbTool.schema === 'object') ? dbTool.schema as any : { type: 'object', properties: {} });

          aiTools[dbTool.name] = aiTool({
            description: dbTool.description || '',
            inputSchema: toolSchemaObj,
            parameters: toolSchemaObj,
            execute: async (args: any) => {
               try {
                 executedTools.push(dbTool.name);
                 console.log(`[Proxy Tool] Invocando ${dbTool.name} en ${dbTool.apiEndpoint}`);
                 
                 // Inyectar el contexto dinámico del usuario en los argumentos (incluyendo workspacePath)
                 const payload = { ...args, _userContext: { id: userId, name: userRecord?.name, email: userRecord?.email, workspacePath: currentWorkspacePath } };
                  // 1. Normalización inteligente de sinónimos de parámetros (anti-422)
                  if (!payload.path && (payload.file_path || payload.filepath || payload.filename || payload.archivo || payload.file || payload.target_path || payload.target || payload.nombre_archivo)) {
                    payload.path = payload.file_path || payload.filepath || payload.filename || payload.archivo || payload.file || payload.target_path || payload.target || payload.nombre_archivo;
                  }
                  if (!payload.content && (payload.text || payload.body || payload.data || payload.contenido || payload.idea || payload.ideas || payload.resumen || payload.guion)) {
                    payload.content = payload.text || payload.body || payload.data || payload.contenido || payload.idea || payload.ideas || payload.resumen || payload.guion;
                  }
                  if (!payload.folder_name && (payload.folder || payload.name || payload.nombre_carpeta || payload.directory)) {
                    payload.folder_name = payload.folder || payload.name || payload.nombre_carpeta || payload.directory;
                  }
                  if (!payload.target_path && (payload.target || payload.destination || payload.ruta_destino)) {
                    payload.target_path = payload.target || payload.destination || payload.ruta_destino;
                  }
                  if (!payload.channel_name && (payload.channel || payload.canal || payload.nombre_canal)) {
                    payload.channel_name = payload.channel || payload.canal || payload.nombre_canal;
                  }
                  if (!payload.base_path) {
                    if (payload.path) payload.base_path = payload.path;
                    else if (payload.channel_name) payload.base_path = payload.channel_name;
                    else if (payload.folder_name && (dbTool.name === 'listar_directorio' || dbTool.name === 'listar_directorio_plano')) {
                      payload.base_path = payload.folder_name;
                    }
                  }

                  // Normalización para extraer_canal_youtube
                  if (dbTool.name === 'extraer_canal_youtube') {
                    if (!payload.url_canal && (payload.url || payload.canal_url || payload.channel_url || payload.canal || payload.channel || payload.handle || payload.link)) {
                      payload.url_canal = payload.url || payload.canal_url || payload.channel_url || payload.canal || payload.channel || payload.handle || payload.link;
                    }
                  }

                  // 2. Extensión .md o .txt automática para archivos
                  if (dbTool.name === 'guardar_archivo' && payload.path && typeof payload.path === 'string') {
                    if (!payload.path.endsWith('.md') && !payload.path.endsWith('.txt')) {
                      payload.path += '.md';
                    }
                  }

                  // 3. Obtener raíz de workspace efectiva (prioridad: request body -> detector)
                  const effectiveWorkspaceRoot = (workspacePath && typeof workspacePath === 'string' && workspacePath.trim() !== '')
                    ? workspacePath
                    : (getWorkspacePath() || '');

                  // 4. GUARD ESPECÍFICO para listar_directorio y listar_directorio_plano
                  if (dbTool.name === 'listar_directorio' || dbTool.name === 'listar_directorio_plano') {
                    if (!payload.base_path || payload.base_path === '.' || payload.base_path === '/') {
                      if (payload.channel_name) {
                        payload.base_path = effectiveWorkspaceRoot ? path.join(effectiveWorkspaceRoot, payload.channel_name) : payload.channel_name;
                      } else {
                        payload.base_path = effectiveWorkspaceRoot;
                      }
                    } else if (effectiveWorkspaceRoot && !path.isAbsolute(payload.base_path)) {
                      payload.base_path = path.join(effectiveWorkspaceRoot, payload.base_path);
                    }
                  }

                  // 5. GUARD ESPECÍFICO para crear_carpetas: normalización individual y múltiple
                  if (dbTool.name === 'crear_carpetas') {
                    // Normalizar arrays si el modelo los pasó con otros nombres
                    if (Array.isArray(payload.folder_name)) {
                      payload.folders = payload.folder_name;
                      delete payload.folder_name;
                    }
                    if (!payload.folders && (payload.carpetas || payload.folder_names || payload.nombres)) {
                      payload.folders = payload.carpetas || payload.folder_names || payload.nombres;
                    }
                    if (!payload.paths && payload.rutas) {
                      payload.paths = payload.rutas;
                    }
                    if (!payload.subfolders && payload.subcarpetas) {
                      payload.subfolders = payload.subcarpetas;
                    }
                    if (payload.channel && !payload.channel_name) {
                      payload.channel_name = payload.channel;
                    }
                    if (payload.canal && !payload.channel_name) {
                      payload.channel_name = payload.canal;
                    }
                    // Si no hay target_path ni paths, definir target_path por defecto
                    if (!payload.target_path && !payload.paths) {
                      if (payload.channel_name) {
                        payload.target_path = payload.channel_name;
                      } else {
                        payload.target_path = effectiveWorkspaceRoot;
                      }
                    }
                  }

                  // GUARD DE LÍMITES DE SUSCRIPCIÓN PARA CREACIÓN DE CANALES
                  if (dbTool.name === 'crear_carpetas' && !isAdmin && existingChannels.length >= maxChannels) {
                    let isNewChannelAttempt = false;
                    let requestedChannelName = '';

                    // 1. Si se indicó channel_name y es diferente a los canales ya existentes
                    if (payload.channel_name && !existingChannels.includes(payload.channel_name)) {
                      isNewChannelAttempt = true;
                      requestedChannelName = payload.channel_name;
                    }

                    // 2. Si el destino es la raíz del workspace (sin target_path o igual a effectiveWorkspaceRoot)
                    const normTarget = (payload.target_path || '').replace(/\\/g, '/').toLowerCase();
                    const normWsRoot = (effectiveWorkspaceRoot || '').replace(/\\/g, '/').toLowerCase();
                    const isRootTarget = !payload.target_path || normTarget === normWsRoot || normTarget === '.' || normTarget === '/';

                    if (isRootTarget && !payload.channel_name) {
                      const candidateFolders = [
                        payload.folder_name,
                        ...(Array.isArray(payload.folders) ? payload.folders : []),
                        ...(Array.isArray(payload.paths) ? payload.paths : [payload.path]),
                      ].filter(Boolean);

                      for (const f of candidateFolders) {
                        if (typeof f === 'string') {
                          const cleanName = path.basename(f.trim().replace(/\\/g, '/'));
                          // Si no es un canal existente ni pertenece a uno existente
                          if (!existingChannels.includes(cleanName) && !existingChannels.some(ch => f.includes(ch))) {
                            isNewChannelAttempt = true;
                            requestedChannelName = cleanName;
                            break;
                          }
                        }
                      }
                    }

                    if (isNewChannelAttempt) {
                      console.warn(`[Plan Limit Guard]: Bloqueada creación del canal "${requestedChannelName}" para usuario en plan ${userPlan}`);
                      return `[LÍMITE DE PLAN ALCANZADO]: No es posible crear el nuevo canal "${requestedChannelName}". El usuario tiene el plan ${planConfig.displayName} (${userPlan}), que solo permite un máximo de ${maxChannels} canal(es). Su workspace ya contiene el canal "${existingChannels[0] || 'existente'}". NO intentes crear la carpeta e informa claramente al usuario que ha alcanzado el límite de su plan, e invítalo a actualizar a Plan Pro ($100 USD para 3 canales) o Enterprise ($150 USD para canales ilimitados).`;
                    }
                  }

                  if (dbTool.name === 'extraer_canal_youtube' && !isAdmin && existingChannels.length >= maxChannels) {
                    console.warn(`[Plan Limit Guard]: Bloqueada extracción de canal para usuario en plan ${userPlan}`);
                    return `[LÍMITE DE PLAN ALCANZADO]: No se puede extraer un nuevo canal de YouTube. El usuario se encuentra en el plan ${planConfig.displayName} (${userPlan}), el cual solo permite un máximo de ${maxChannels} canal(es). Su workspace ya cuenta con el canal '${existingChannels[0] || 'existente'}'. Informa al usuario que ha alcanzado el límite de su plan y debe subir a Plan Pro (hasta 3 canales) o Enterprise (canales ilimitados) para importar nuevos canales.`;
                  }

                  // 6. GUARD ESPECÍFICO para eliminar_carpetas: asegurar soporte individual y múltiple (multiplataforma)
                  if (dbTool.name === 'eliminar_carpetas') {
                    const channelName = payload.channel_name ?? payload.canal ?? payload.channel ?? null;
                    if (channelName) payload.channel_name = String(channelName);

                    const collectedPaths: string[] = [];

                    // Recolectar de arrays
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

                    // Recolectar de valores individuales
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

                    // Limpieza y estandarización a barras /
                    if (collectedPaths.length > 0) {
                      const cleanList = collectedPaths.map(p => {
                        let c = p.replace(/\\/g, '/');
                        const isAbs = c.startsWith('/') || /^[a-zA-Z]:\//.test(c);
                        if (!isAbs && effectiveWorkspaceRoot && !payload.channel_name) {
                          c = path.join(effectiveWorkspaceRoot, c).replace(/\\/g, '/');
                        }
                        return c;
                      });

                      payload.paths = cleanList;
                      if (cleanList.length === 1) {
                        payload.ruta = cleanList[0];
                      }
                    }
                  }

                  // Log args reales para debugging
                  console.log(`[Proxy Tool] Args recibidos para ${dbTool.name}:`, JSON.stringify(args));
                  console.log(`[Proxy Tool] Payload normalizado:`, JSON.stringify(payload));

                  // 7. Garantizar que TODAS las rutas absolutas antepongan effectiveWorkspaceRoot si son relativas
                  if (effectiveWorkspaceRoot) {
                    if (payload.path && typeof payload.path === 'string' && !path.isAbsolute(payload.path)) {
                      payload.path = path.join(effectiveWorkspaceRoot, payload.path);
                    }
                    if (payload.target_path && typeof payload.target_path === 'string' && !path.isAbsolute(payload.target_path)) {
                      payload.target_path = path.join(effectiveWorkspaceRoot, payload.target_path);
                    }
                    if (payload.base_path && typeof payload.base_path === 'string' && !path.isAbsolute(payload.base_path)) {
                      payload.base_path = path.join(effectiveWorkspaceRoot, payload.base_path);
                    }
                    if (Array.isArray(payload.paths) && dbTool.name !== 'eliminar_carpetas' && dbTool.name !== 'crear_carpetas') {
                      payload.paths = payload.paths.map((p: any) => {
                        if (typeof p !== 'string') return p;
                        if (path.isAbsolute(p)) return p;
                        return path.join(effectiveWorkspaceRoot, p);
                      });
                    }
                  }

                 // Para métodos GET, convertir argumentos a query params
                 let url = dbTool.apiEndpoint;
                 if (dbTool.method === 'GET' && payload && Object.keys(payload).length > 0) {
                   const params = new URLSearchParams();
                   for (const [key, val] of Object.entries(payload)) {
                     if (key !== '_userContext' && val !== undefined && val !== null && typeof val !== 'object') {
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


      // Inyectar directiva de Pensamiento Profundo si está activado
      if (isDeepThinking) {
        systemPrompt += `\n\n=== MODO PENSAMIENTO PROFUNDO ACTIVADO (DEEP REASONING) ===
- Tienes activado el modo de Pensamiento Profundo y Razonamiento Estratégico.
- ANTES de ejecutar herramientas o dar tu respuesta definitiva, analiza exhaustivamente el problema paso a paso.
- Evalúa:
  1. Psicología y retención de la audiencia de YouTube (gancho en los primeros 5 segundos, retención a mitad del video, llamados a la acción sin fricción).
  2. Arquitectura de contenido y coherencia con la temática del canal y el workspace.
  3. Viabilidad técnica de las carpetas y archivos necesarios.
  4. Optimización de CTR, SEO y posicionamiento algorítmico.
- Si vas a ejecutar herramientas para crear canales, videos o archivos, asegúrate de planificar la estructura de carpetas y archivos con máxima precisión antes de invocar la herramienta.
- Brinda una respuesta estructurada, profunda y de alto impacto para el creador.`;
      }

      // Inyectar contexto semántico vectorial de canales importados (pgvector)
      if (userId) {
        try {
          const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
          const userQueryText = typeof lastUserMessage?.content === 'string' 
            ? lastUserMessage.content 
            : (Array.isArray(lastUserMessage?.content) ? JSON.stringify(lastUserMessage.content) : '');

          if (userQueryText && userQueryText.trim().length > 3) {
            let oaiKey = process.env.OPENAI_API_KEY;
            if (!oaiKey && userRecord?.openaiVaultId) {
              const { data: sData } = await supabase.rpc('get_decrypted_secret', { p_secret_id: userRecord.openaiVaultId });
              if (sData) oaiKey = typeof sData === 'string' ? sData : sData.get_decrypted_secret || sData;
            }
            if (!oaiKey) {
              const { data: rpcK } = await supabase.rpc('get_api_key', { p_user_id: userId, p_provider: 'openai' });
              if (rpcK && typeof rpcK === 'string') oaiKey = rpcK;
            }

            if (oaiKey) {
              const { embedding } = await embed({
                model: createOpenAI({ apiKey: oaiKey }).embedding('text-embedding-3-small'),
                value: userQueryText.slice(0, 1000),
              });

              const { data: matchedChannels, error: matchErr } = await supabase.rpc('match_channel_contexts', {
                query_embedding: `[${embedding.join(',')}]`,
                match_threshold: 0.45,
                match_count: 2,
                p_user_id: userId,
              });

              if (!matchErr && Array.isArray(matchedChannels) && matchedChannels.length > 0) {
                for (const mc of matchedChannels) {
                  let antiDupSection = '';
                  if (Array.isArray(mc.topics_covered) && mc.topics_covered.length > 0) {
                    const topTitles = mc.topics_covered.slice(0, 15).map((t: any) => `• "${t.title}"`).join('\n');
                    antiDupSection = `\n🚫 TEMAS Y TÍTULOS YA TRATADOS EN ESTE CANAL (REGLA ESTRICTA: NO DUPLICAR NI REPETIR ESTAS IDEAS):\n${topTitles}`;
                  }

                  let bestTagsSection = '';
                  if (Array.isArray(mc.best_tags) && mc.best_tags.length > 0) {
                    const tagNames = mc.best_tags.slice(0, 10).map((t: any) => `"${t.tag}" (${t.avgViews?.toLocaleString()} vistas prom.)`).join(', ');
                    bestTagsSection = `\n🏷️ ETIQUETAS GANADORAS RECOMENDADAS PARA ESTE CANAL:\n${tagNames}`;
                  }

                  systemPrompt += `\n\n=== CANAL HISTÓRICO RELEVANTE DETECTADO (SIMILITUD SEMÁNTICA: ${Math.round((mc.similarity || 0) * 100)}%) ===
Canal: "${mc.title}" (${mc.handle || 'Sin handle'})
Identidad y Resumen: ${mc.context_summary}
${bestTagsSection}
${antiDupSection}
DIRECTIVA ESTRATÉGICA PARA PENSAMIENTO PROFUNDO:
- El usuario se está refiriendo o su consulta se alinea con este canal.
- Prohibido repetir los títulos o conceptos ya realizados listados arriba.
- Utiliza las etiquetas ganadoras comprobadas para optimizar la propuesta.
- Propón enfoques frescos, ángulos complementarios y estructuras de alto CTR.`;
                }
              }
            }
          }
        } catch (vectorErr: any) {
          console.warn('[Vector Context Retrieval]:', vectorErr?.message);
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
      let selectedModel = model || 'gpt-4o-mini';
      if (isDeepThinking) {
        selectedModel = (model && (model.includes('o1') || model.includes('o3') || (model.includes('4o') && !model.includes('mini')))) ? model : 'o3-mini';
      }
      cleanModel = selectedModel;
      aiModel = openai(selectedModel, { apiKey });
    } else if (provider === 'anthropic') {
      const selectedModel = isDeepThinking ? 'claude-3-7-sonnet-20250219' : (model || 'claude-3-5-sonnet-20240620');
      cleanModel = selectedModel;
      aiModel = anthropic(selectedModel, { apiKey });
    } else if (provider === 'gemini') {
      let rawModel = model || 'gemini-2.5-flash';
      if (isDeepThinking) {
        rawModel = (model && model.includes('pro')) ? model : 'gemini-2.0-flash-thinking-exp-01-21';
      }
      cleanModel = rawModel.replace(/^models\//, '').trim();
      aiModel = createGoogleGenerativeAI({ apiKey })(cleanModel);
    } else {
      throw new Error('Invalid provider');
    }

    // Preparar historial (soporta contenido de texto y partes multimodales de imagen)
    const history = messages.map((m: any) => {
      let content: any = '';
      if (typeof m.content === 'string') {
        content = m.content;
      } else if (Array.isArray(m.content)) {
        content = m.content;
      } else {
        content = String(m.content || '');
      }
      return { role: m.role as 'user' | 'assistant' | 'system', content };
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
                creditsUsed: requiredCredits,
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

    const MUTATING_TOOLS = new Set([
      'crear_carpetas',
      'eliminar_carpetas',
      'guardar_archivo',
      'generar_info_canal',
      'generar_metadatos_subida'
    ]);
    const workspaceModified = executedTools.some(t => MUTATING_TOOLS.has(t));

    return NextResponse.json({ 
      text: finalOutput, 
      modelName: cleanModel || model,
      workspaceModified,
      executedTools,
      isDeepThinking
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
