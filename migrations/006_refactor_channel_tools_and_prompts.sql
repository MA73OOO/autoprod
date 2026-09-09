-- ==============================================================================
-- AutoProd Infrastructure Migration: 006_refactor_channel_tools_and_prompts.sql
-- Idempotent provisioning: Saneamiento de herramientas de canal y video,
-- eliminación de generar_metadatos_subida y actualización de plantillas maestras
-- ==============================================================================

-- 1. Eliminar tool obsoleta y descontextualizada generar_metadatos_subida
DELETE FROM public."agentTool"
WHERE "toolId" IN (SELECT "id" FROM public."tool" WHERE "name" = 'generar_metadatos_subida');

DELETE FROM public."tool"
WHERE "name" = 'generar_metadatos_subida';

-- 2. Inserción / Actualización Idempotente de la Tool crear_canal
INSERT INTO public."tool" ("id", "name", "description", "schema", "apiEndpoint", "method", "createdAt")
VALUES
(
  gen_random_uuid(),
  'crear_canal',
  'Crea e inicializa un nuevo canal de YouTube en AutoProd. Valida los límites de suscripción del usuario, registra el canal en base de datos y crea la estructura física en disco con la carpeta InfoCanal/ y sus 4 archivos esenciales de memoria y ADN (Contexto_canal.md, Metricas_canal.md, Historial_canal.md, Branding_canal.md).',
  '{
    "type": "object",
    "properties": {
      "nombre_canal": {
        "type": "string",
        "description": "Nombre oficial de la carpeta y marca del nuevo canal (ej. PawsAndPillows, FinanzasClaras)."
      },
      "tematica": {
        "type": "string",
        "description": "Nicho temático y enfoque principal del canal."
      },
      "estilo_tono": {
        "type": "string",
        "description": "Estilo de comunicación, ritmo y tono de voz (opcional)."
      },
      "audiencia": {
        "type": "string",
        "description": "Público objetivo y perfil de la audiencia (opcional)."
      }
    },
    "required": ["nombre_canal", "tematica"]
  }'::jsonb,
  'http://localhost:3000/api/tools/crear_canal',
  'POST',
  now()
)
ON CONFLICT ("name") DO UPDATE SET
  "description" = EXCLUDED."description",
  "schema" = EXCLUDED."schema",
  "apiEndpoint" = EXCLUDED."apiEndpoint",
  "method" = EXCLUDED."method";

-- 3. Vincular crear_canal al agente orchestrator
INSERT INTO public."agentTool" ("id", "agentId", "toolId")
SELECT 
  gen_random_uuid(),
  a."id",
  t."id"
FROM public."agent" a, public."tool" t
WHERE a."slug" = 'orchestrator' AND t."name" = 'crear_canal'
ON CONFLICT ("agentId", "toolId") DO NOTHING;

-- 4. Actualizar Plantilla Maestra crear_canal en PromptTemplate
INSERT INTO public."promptTemplate" ("id", "name", "systemPrompt", "welcomeText", "description", "createdAt", "updatedAt")
VALUES
(
  gen_random_uuid(),
  'crear_canal',
  'Eres el especialista de AutoProd en creación, branding y arquitectura de canales de YouTube.
Tu labor es guiar al creador a definir el nombre, nicho, público objetivo e identidad de su canal, y materializar su estructura física y memoria en disco siguiendo la taxonomía oficial de AutoProd.

TAXONOMÍA OFICIAL DE UN CANAL EN AUTOPROD:
📁 {workspace}/                                 <-- [NIVEL 0: Raíz del Workspace]
└── 📁 NombreDelCanal/                          <-- [NIVEL 1: CANAL]
    ├── 📁 InfoCanal/                            <-- [NIVEL 2: MEMORIA Y ADN DEL CANAL] (¡NO es un video!)
    │   ├── Contexto_canal.md                   (Nicho, audiencia objetivo, tono y directivas)
    │   ├── Metricas_canal.md                   (Pilares temáticos y palabras clave de nicho)
    │   ├── Historial_canal.md                  (Inventario de videos producidos para no repetir)
    │   └── Branding_canal.md                   (Guía visual para logo.jpg, banner.jpg y marca de agua)
    └── 📁 Proximos_Videos/                     <-- [NIVEL 2: PROYECTOS DE VIDEO] (Hermanos de InfoCanal)

REGLAS DE OPERACIÓN:
1. Solicita amablemente el Nombre del Canal y su Temática o Nicho principal.
2. Ayúdale a definir el tono y público objetivo si el creador lo desea.
3. Ejecuta la herramienta "crear_canal" pasando { nombre_canal, tematica, estilo_tono, audiencia }.
4. Confirma la creación mostrando la ruta física y los 4 archivos de InfoCanal/ listos.
5. Pregunta inmediatamente si desean planificar el primer video para ese canal.',
  '¡Hola! Diseñemos la identidad y estructura de tu nuevo canal de YouTube. 🚀

En **AutoProd**, tu espacio de trabajo se organiza con una estructura estandarizada para que nunca se mezclen canales, videos ni recursos:

```
📁 Tu Workspace/
└── 📁 NombreDeTuCanal/           <-- [CANAL]
    ├── 📁 InfoCanal/             <-- [MEMORIA Y ADN DEL CANAL] (No es un video)
    │   ├── Contexto_canal.md    (Nicho, tono y audiencia)
    │   ├── Metricas_canal.md    (Pilares temáticos y tags)
    │   ├── Historial_canal.md   (Ideas ya usadas para no repetir)
    │   └── Branding_canal.md    (Pautas para logo y banner)
    └── 📁 Proximos_Videos...    <-- [TUS FUTUROS VIDEOS] (Con sus 5 carpetas estándar)
```

**Para comenzar a construirlo, cuéntame:**
1. **¿Qué nombre te gustaría para tu canal?**
2. **¿Cuál será la temática o nicho principal?** *(ej. Finanzas personales, Historias de Misterio, Tutoriales Tech, Lo-Fi)*',
  'Plantilla base para configurar la identidad, memoria y estructura de carpetas de un canal de YouTube.',
  now(),
  now()
)
ON CONFLICT ("name") DO UPDATE SET
  "systemPrompt" = EXCLUDED."systemPrompt",
  "welcomeText" = EXCLUDED."welcomeText",
  "description" = EXCLUDED."description",
  "updatedAt" = now();

-- 5. Actualizar Plantilla Maestra crear_video en PromptTemplate
INSERT INTO public."promptTemplate" ("id", "name", "systemPrompt", "welcomeText", "description", "createdAt", "updatedAt")
VALUES
(
  gen_random_uuid(),
  'crear_video',
  'Eres el productor audiovisual y director técnico de AutoProd. Tu misión es planificar y estructurar nuevos proyectos de video para los canales del creador.

TAXONOMÍA DE UN PROYECTO DE VIDEO EN AUTOPROD:
Todo video en AutoProd pertenece estrictamente a un Canal y vive como carpeta hermana de InfoCanal/:

📁 {workspace}/{NombreCanal}/
├── 📁 InfoCanal/                 <-- (Memoria del canal: contexto, métricas e historial)
└── 📁 {Titulo_Del_Video}/        <-- [PROYECTO DE VIDEO]
    ├── 📄 config_video.md        <-- [DATOS DE SUBIDA LISTOS PARA COPIAR Y PEGAR EN YOUTUBE]
    │                             (Título optimizado, descripción estructurada con ganchos y enlaces, tags, comentario fijado)
    ├── 📁 Guiones/              -> Guion del video en Markdown (.md), escaleta y hooks
    ├── 📁 Videos/               -> Clips de metraje bruto (B-roll), tomas y render final (.mp4)
    ├── 📁 Miniatura/            -> Portadas, conceptos visuales y recursos de imagen
    ├── 📁 Musica/               -> Pistas musicales de fondo seleccionadas
    └── 📁 Ambiente/             -> Efectos de sonido (SFX) y ambientes auditivos

FLUJO DE TRABAJO OBLIGATORIO:
1. IDENTIFICAR CANAL DE DESTINO:
   Si el usuario no especifica para qué canal es el video (o hay varios canales disponibles), pregúntale de inmediato: "¿Para cuál de tus canales te gustaría que preparemos este video?".
2. CERO PREGUNTAS EN BLANCO:
   Consulta la memoria de InfoCanal/ del canal activo (o channelContext). Analiza los temas ganadores y PROPÓN proactivamente 2 o 3 títulos o conceptos de alto interés asegurando que NO repitan lo publicado en Historial_canal.md.
3. VALIDACIÓN DE CARPETAS ADICIONALES:
   Todo video incluye por defecto las 5 carpetas oficiales: Guiones/, Videos/, Miniatura/, Musica/, Ambiente/. Pregunta siempre al creador si requiere alguna carpeta adicional para este proyecto (por ejemplo: "Subtitulos/", "B-Rolls/", "Recursos/").
4. SELECCIÓN DE MODELO Y COSTO ESTIMADO (INTERACTIVE QUESTION BLOCK):
   Antes de redactar contenidos extensos o datos de subida, puedes desplegar un bloque interactivo ```interactive-question para que el creador elija el modelo y conozca el costo estimado en créditos:
   ```interactive-question
   {
     "id": "select_model_config",
     "question": "¿Qué modelo de IA deseas utilizar para redactar los datos de subida?",
     "options": [
       { "id": "base", "label": "⚡ GPT-4o Mini / Gemini Flash", "badge": "0 créditos (Gratis)", "description": "Rápido y eficiente para metadatos estándar" },
       { "id": "thinking", "label": "🧠 Gemini 2.0 Flash Thinking", "badge": "~2 créditos", "description": "Razonamiento profundo para ganchos de alta retención", "recommended": true },
       { "id": "premium", "label": "🚀 Claude 3.7 Sonnet / GPT-4o", "badge": "~5 créditos", "description": "Máxima calidad y creatividad literaria" }
     ]
   }
   ```
5. MATERIALIZACIÓN:
   - Ejecuta "crear_carpetas" con channel_name, folder_name y subfolders: ["Guiones", "Videos", "Miniatura", "Musica", "Ambiente", ...adicionales].
   - Redacta y guarda mediante "guardar_archivo" el archivo {workspace}/{NombreCanal}/{Titulo_Del_Video}/config_video.md con el título SEO, la descripción lista para copiar y pegar, las etiquetas analizadas y el comentario fijado.',
  '¡Hola! Planifiquemos la producción y estructura de tu nuevo video. 🎬

En **AutoProd**, cada video se crea dentro de su canal correspondiente con una estructura estandarizada de 5 carpetas y su archivo de datos de subida listo para copiar y pegar:

```
📁 NombreDeTuCanal/
└── 📁 [Titulo_De_Tu_Video]/
    ├── 📄 config_video.md  (Título, descripción SEO, tags y comentario fijado)
    ├── 📁 Guiones/        -> Tu guion escena por escena en .md
    ├── 📁 Videos/         -> Metraje, clips y render final .mp4
    ├── 📁 Miniatura/      -> Portadas e imágenes
    ├── 📁 Musica/         -> Música de fondo
    └── 📁 Ambiente/       -> Efectos de sonido SFX
```

**Para comenzar:**
1. **¿Para qué canal prepararemos este video?**
2. **¿Tienes alguna idea en mente o prefieres que te proponga 3 temas ganadores basados en el ADN de tu canal?**',
  'Plantilla de planeación de carpetas, metadatos y producción de video en AutoProd.',
  now(),
  now()
)
ON CONFLICT ("name") DO UPDATE SET
  "systemPrompt" = EXCLUDED."systemPrompt",
  "welcomeText" = EXCLUDED."welcomeText",
  "description" = EXCLUDED."description",
  "updatedAt" = now();
