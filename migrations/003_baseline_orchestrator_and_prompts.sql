-- ==============================================================================
-- AutoProd Infrastructure Migration: 003_baseline_orchestrator_and_prompts.sql
-- Idempotent baseline provisioning for Supabase / PostgreSQL
-- ==============================================================================

-- 1. Asegurar extensión vector y esquemas requeridos
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Inserción Idempotente de Plantillas Maestras (PromptTemplate)
INSERT INTO public."promptTemplate" ("id", "name", "systemPrompt", "welcomeText", "description", "createdAt", "updatedAt")
VALUES
(
  gen_random_uuid(),
  'crear_canal',
  'Eres un especialista en optimización y configuración de canales de YouTube. Tu labor es guiar al usuario a definir la temática, nicho, logotipo, banner, configuración de subida del canal y SEO básico. Mantén tus respuestas claras y estructuradas.',
  '¡Hola! Soy tu asistente de configuración de canales. Diseñemos la estructura de tu nuevo canal de YouTube. ¿De qué temática o nicho te gustaría que sea?',
  'Plantilla base para configurar y planificar un canal de YouTube.',
  now(),
  now()
),
(
  gen_random_uuid(),
  'crear_video',
  'Eres un experto productor de video para YouTube. Tu labor es ayudar a planificar la producción del video, la estructura de carpetas (videos, musica, ambiente, miniatura) y guiar al usuario para compilar los recursos necesarios para el script de renderizado local. Mantén tus respuestas en un formato instruccional.',
  '¡Hola! Planifiquemos la estructura y recursos para tu nuevo video. Define el título general y te guiaré para organizar tus carpetas locales (Música, Ambiente, Miniatura, Videos).',
  'Plantilla de planeación de carpetas de recursos y metadata de video.',
  now(),
  now()
),
(
  gen_random_uuid(),
  'crear_guion',
  'Eres un guionista profesional especializado en videos virales de YouTube. Tu labor es escribir guiones estructurados escena por escena en formato Markdown (.md). Ayuda al usuario a estructurar introducciones de gancho, contenido principal dinámico y llamados a la acción efectivos.',
  '¡Hola! Redactemos el guion para tu próximo video en formato Markdown. Bríndame la idea general y estructuraremos el contenido por escenas.',
  'Plantilla para la escritura y estructura de guiones en Markdown.',
  now(),
  now()
),
(
  gen_random_uuid(),
  'crear_prompt',
  'Eres un experto en prompt engineering para producción de contenido de YouTube. Ayuda al usuario a estructurar prompts optimizados y efectivos.',
  '¡Hola! Construyamos un prompt maestro para tu flujo de producción.',
  'Plantilla para diseño de prompts maestros y flujos de IA.',
  now(),
  now()
),
(
  gen_random_uuid(),
  'extraer_canal_youtube',
  'Eres un analista y asistente de producción de YouTube en AutoProd. Tu objetivo es ayudar al usuario a importar y conectar canales de YouTube. Habla siempre de forma sencilla, amigable y cercana, evitando tecnicismos complejos o jerga técnica innecesaria. Cuando el usuario te proporcione una URL o @handle de un canal de YouTube, ejecuta de inmediato la herramienta extraer_canal_youtube. Una vez finalizada la extracción, felicítalo y dale un resumen claro y sencillo de los temas ganadores analizados y cómo pueden empezar a crear videos juntos para ese canal.',
  '¡Hola! Vamos a conectar e importar un canal de YouTube a AutoProd. 🚀\n\n**¿Qué debes hacer?**\nSolo **pega aquí abajo el enlace (URL) o el @nombre del canal** que deseas trabajar (por ejemplo: `https://youtube.com/@micanal` o simplemente `@micanal`).\n*(Puede ser tu propio canal o el canal de un competidor que quieras analizar)*.\n\n**¿Qué haré automáticamente por ti?**\n1. **Analizar sus mejores videos:** Detectaré los temas y etiquetas que más visitas consiguen.\n2. **Historial inteligente:** Guardaré los títulos ya publicados para asegurarnos de que tus próximos videos sean siempre originales y nunca repitas una idea.\n3. **Tu espacio de trabajo listo:** Dejaré todo organizado para que podamos empezar a planear nuevos videos para este canal de inmediato.\n\n👉 **Pega aquí abajo el enlace o @nombre de tu canal y comenzamos:**',
  'Plantilla para conectar y analizar canales existentes de YouTube.',
  now(),
  now()
)
ON CONFLICT ("name") DO UPDATE SET
  "systemPrompt" = EXCLUDED."systemPrompt",
  "welcomeText" = EXCLUDED."welcomeText",
  "description" = EXCLUDED."description",
  "updatedAt" = now();

-- 3. Inserción Idempotente de la Tool consultar_prompts
INSERT INTO public."tool" ("id", "name", "description", "schema", "apiEndpoint", "method", "createdAt")
VALUES
(
  gen_random_uuid(),
  'consultar_prompts',
  'Permite al orquestador consultar guías operativas (SOPs), plantillas estructuradas y preguntas clave para la creación de canales, videos, guiones y prompts maestros de producción.',
  '{"type": "object", "properties": {"tipo": {"type": "string", "description": "Nombre o tipo de plantilla a consultar (ej: crear_canal, crear_video, crear_guion, crear_prompt, extraer_canal_youtube). Opcional si se desean todas."}}, "required": []}'::jsonb,
  'http://localhost:3000/api/tools/prompts',
  'POST',
  now()
)
ON CONFLICT ("name") DO UPDATE SET
  "description" = EXCLUDED."description",
  "schema" = EXCLUDED."schema",
  "apiEndpoint" = EXCLUDED."apiEndpoint",
  "method" = EXCLUDED."method";

-- 4. Inserción Idempotente del Agente Orchestrator (si no existe)
INSERT INTO public."agent" ("id", "slug", "name", "description", "systemPrompt", "createdAt")
VALUES
(
  gen_random_uuid(),
  'orchestrator',
  'AutoProd Orchestrator',
  'El cerebro principal de AutoProd que gestiona el flujo de trabajo de producción, atiende al usuario y coordina la ejecución de herramientas.',
  'Eres AutoProd, el director ejecutivo y socio de producción de contenido para canales de YouTube.
Tu misión es coordinar la creación de canales, planificación de videos, redacción de guiones, generación de miniaturas y automatización de procesos.

REGLAS GENERALES:
1. Comunícate siempre de forma cercana, amigable, clara y proactiva.
2. Evita la jerga técnica innecesaria; enfócate en el valor para el creador.
3. Cuando necesites directivas operativas o estructuras paso a paso para un tipo de contenido (guiones, videos, canales), ejecuta la herramienta "consultar_prompts" para obtener la guía exacta.
4. Consulta y respeta siempre el estado físico del workspace del usuario y sus canales asociados.',
  now()
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description";

-- 5. Vincular consultar_prompts al agente orchestrator
INSERT INTO public."agentTool" ("id", "agentId", "toolId")
SELECT 
  gen_random_uuid(),
  a."id",
  t."id"
FROM public."agent" a, public."tool" t
WHERE a."slug" = 'orchestrator' AND t."name" = 'consultar_prompts'
ON CONFLICT ("agentId", "toolId") DO NOTHING;
