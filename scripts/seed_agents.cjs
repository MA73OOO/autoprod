require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seed de Agentes y Prompts...");

  // --- PROMPT TEMPLATES (Guías de Razonamiento para el Orquestador) ---
  const orchestratorPrompt = await prisma.promptTemplate.upsert({
    where: { name: 'orchestrator_base' },
    update: {},
    create: {
      name: 'orchestrator_base',
      description: 'SOP (Standard Operating Procedure) y System Prompt del orquestador principal.',
      systemPrompt: `ERES UN SISTEMA DE INTELIGENCIA DE AUTOPROD. TUS REGLAS SON ABSOLUTAS:

1. NUNCA INVENTES NI ASUMAS ARCHIVOS. Eres ciego hasta que uses la API.
2. Si el usuario te pide explorar el proyecto, tu ÚNICA respuesta debe ser el comando de la API. NO DEBES saludar. NO DEBES explicar lo que vas a hacer.
3. Debes imprimir ESTRICTAMENTE esto y nada más:
[LLAMAR_API: workspace_list]

4. Cuando el sistema te devuelva el resultado de 'workspace_list', DEBES leer los archivos más importantes (Markdown, TXT) usando:
[LLAMAR_API: workspace_read | archivo: ruta]

5. SOLO cuando ya tengas la información de los archivos leída, puedes hablar en lenguaje natural con el usuario para explicarle el proyecto.`
    }
  });
  console.log(`PromptTemplate upserted: ${orchestratorPrompt.name}`);

  const injectionPrompt = await prisma.promptTemplate.upsert({
    where: { name: 'tool_injection' },
    update: {},
    create: {
      name: 'tool_injection',
      description: 'Instrucción interna inyectada luego del resultado de una API.',
      systemPrompt: `Instrucción interna: Evalúa el resultado anterior. Si necesitas más contexto (por ejemplo, si viste un archivo .md interesante en una lista), llama a la siguiente API (ej. workspace_read). Si ya tienes todo el contexto necesario, responde la duda del usuario de manera natural, directa y sin mencionar que usas APIs ni lees JSON.`
    }
  });
  console.log(`PromptTemplate upserted: ${injectionPrompt.name}`);

  // 1. Crear el Agente "Arquitecto de Canales"
  const agent = await prisma.agent.upsert({
    where: { slug: 'channel_architect' },
    update: {},
    create: {
      slug: 'channel_architect',
      name: 'Arquitecto de Canales',
      description: 'Crea la estructura de carpetas y archivos iniciales para un nuevo canal o proyecto.',
      systemPrompt: `Eres el Arquitecto de Canales, un orquestador local en AutoProd.
Tu objetivo es planificar la estructura de carpetas y archivos para un nuevo canal de YouTube.`,
    }
  });

  console.log(`Agente upserted: ${agent.name} (ID: ${agent.id})`);
  await prisma.agentStep.deleteMany({ where: { agentId: agent.id }});

  const step = await prisma.agentStep.create({
    data: {
      agentId: agent.id,
      stepOrder: 1,
      stepName: 'Generar Estructura Base',
      apiEndpoint: '/api/agents/channel-creator',
      method: 'POST',
      dynamicPromptTemplate: `El usuario quiere crear un canal. Extrae el nombre del canal y el tema. Genera un Súper Prompt estructurado.`
    }
  });

  console.log(`Paso creado: ${step.stepName}`);

  // 3. Crear el Agente "Movement"
  const movementGestor = await prisma.agent.upsert({
    where: { slug: "gestor_movement" },
    update: {},
    create: {
      slug: "gestor_movement",
      name: "Gestor Movement",
      description: "Ejecutor de contenido creativo. Utilizado cuando Llama requiere generar un texto de alta calidad, ideas o un guion avanzado.",
      systemPrompt: "Eres un agente ejecutor en la nube. Operas el puerto 8000. Recibes un Súper Prompt y usas Gemini 1.5 para ejecutar la labor requerida. Deberás leer archivos, crear carpetas o escribir el resultado según indique el Llama.",
    }
  });

  console.log(`Agente upserted: ${movementGestor.name} (ID: ${movementGestor.id})`);
  await prisma.agentStep.deleteMany({ where: { agentId: movementGestor.id }});

  const movementStep = await prisma.agentStep.create({
    data: {
      agentId: movementGestor.id,
      stepOrder: 1,
      stepName: 'Crear Contenido con Gemini',
      apiEndpoint: '/api/agents/movement',
      method: 'POST',
      dynamicPromptTemplate: `El usuario ha solicitado generar contenido. Crea un Súper Prompt estructurado.`
    }
  });
  console.log(`Paso creado: ${movementStep.stepName}`);

  // --- PRIMITIVAS (LOCALES) ---
  const primList = await prisma.agent.upsert({
    where: { slug: "workspace_list" },
    update: {},
    create: {
      slug: "workspace_list",
      name: "Listar Workspace",
      description: "Lista las carpetas y archivos del proyecto seleccionado. Fundamental para conocer la estructura del entorno.",
      systemPrompt: "",
    }
  });
  await prisma.agentStep.deleteMany({ where: { agentId: primList.id }});
  await prisma.agentStep.create({ data: { agentId: primList.id, stepOrder: 1, stepName: "Listar", apiEndpoint: "LOCAL:workspace_list", method: "INTERNAL" }});
  console.log(`Agente upserted: ${primList.name}`);

  const primRead = await prisma.agent.upsert({
    where: { slug: "workspace_read" },
    update: {},
    create: {
      slug: "workspace_read",
      name: "Leer Archivo",
      description: "Lee el contenido de un archivo específico (.md o .txt). Requiere argumento 'archivo' (ruta relativa).",
      systemPrompt: "",
    }
  });
  await prisma.agentStep.deleteMany({ where: { agentId: primRead.id }});
  await prisma.agentStep.create({ data: { agentId: primRead.id, stepOrder: 1, stepName: "Leer", apiEndpoint: "LOCAL:workspace_read", method: "INTERNAL" }});
  console.log(`Agente upserted: ${primRead.name}`);

  const primWrite = await prisma.agent.upsert({
    where: { slug: "workspace_write" },
    update: {},
    create: {
      slug: "workspace_write",
      name: "Escribir Archivo",
      description: "Guarda o sobrescribe un archivo .md o .txt. Requiere argumentos 'archivo' y 'contenido'.",
      systemPrompt: "",
    }
  });
  await prisma.agentStep.deleteMany({ where: { agentId: primWrite.id }});
  await prisma.agentStep.create({ data: { agentId: primWrite.id, stepOrder: 1, stepName: "Escribir", apiEndpoint: "LOCAL:workspace_write", method: "INTERNAL" }});
  console.log(`Agente upserted: ${primWrite.name}`);

  const primDel = await prisma.agent.upsert({
    where: { slug: "workspace_delete" },
    update: {},
    create: {
      slug: "workspace_delete",
      name: "Eliminar Archivo",
      description: "Elimina un archivo del proyecto. Requiere argumento 'archivo'.",
      systemPrompt: "",
    }
  });
  await prisma.agentStep.deleteMany({ where: { agentId: primDel.id }});
  await prisma.agentStep.create({ data: { agentId: primDel.id, stepOrder: 1, stepName: "Eliminar", apiEndpoint: "LOCAL:workspace_delete", method: "INTERNAL" }});
  console.log(`Agente upserted: ${primDel.name}`);

  console.log("¡Seed completado! Tu Arquitecto, Gestor y Herramientas Primitivas están listas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
