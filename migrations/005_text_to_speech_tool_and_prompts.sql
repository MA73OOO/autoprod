-- ==============================================================================
-- AutoProd Infrastructure Migration: 005_text_to_speech_tool_and_prompts.sql
-- Idempotent provisioning for Text-to-Speech Multi-Engine Tool and Prompts
-- ==============================================================================

-- 1. Inserción Idempotente de la Tool generar_locucion
INSERT INTO public."tool" ("id", "name", "description", "schema", "apiEndpoint", "method", "createdAt")
VALUES
(
  gen_random_uuid(),
  'generar_locucion',
  'Genera narraciones y voces en off para videos de YouTube a partir de texto o guiones. Soporta motor gratuito sin costo (Edge-TTS) y motor de alta fidelidad (OpenAI TTS). El archivo .mp3 se guarda automáticamente en la carpeta de producción del video.',
  '{
    "type": "object",
    "properties": {
      "texto": {
        "type": "string",
        "description": "Texto exacto del guion o escena que se va a narrar."
      },
      "canal": {
        "type": "string",
        "description": "Nombre de la carpeta del canal al que pertenece el video."
      },
      "video": {
        "type": "string",
        "description": "Nombre de la carpeta del video donde se guardará la locución (dentro de Ambiente/). Opcional si se pasa ruta_destino."
      },
      "ruta_destino": {
        "type": "string",
        "description": "Ruta física absoluta o relativa de la carpeta donde se guardará el archivo MP3."
      },
      "proveedor": {
        "type": "string",
        "enum": ["edge_tts", "openai"],
        "description": "Motor de voz a utilizar: edge_tts (100% Gratis, sin API key) o openai (Económico, alta fidelidad). Por defecto edge_tts."
      },
      "voz": {
        "type": "string",
        "description": "ID de la voz elegida (ej: es-ES-AlvaroNeural, es-MX-DaliaNeural, es-CO-GonzaloNeural, onyx, echo, nova, alloy). Por defecto es-ES-AlvaroNeural para edge_tts u onyx para openai."
      }
    },
    "required": ["texto"]
  }'::jsonb,
  'http://localhost:3000/api/tools/generar_locucion',
  'POST',
  now()
)
ON CONFLICT ("name") DO UPDATE SET
  "description" = EXCLUDED."description",
  "schema" = EXCLUDED."schema",
  "apiEndpoint" = EXCLUDED."apiEndpoint",
  "method" = EXCLUDED."method";

-- 2. Vincular generar_locucion al agente orchestrator
INSERT INTO public."agentTool" ("id", "agentId", "toolId")
SELECT 
  gen_random_uuid(),
  a."id",
  t."id"
FROM public."agent" a, public."tool" t
WHERE a."slug" = 'orchestrator' AND t."name" = 'generar_locucion'
ON CONFLICT ("agentId", "toolId") DO NOTHING;

-- 3. Inserción Idempotente de la Plantilla Maestra crear_locucion
INSERT INTO public."promptTemplate" ("id", "name", "systemPrompt", "welcomeText", "description", "createdAt", "updatedAt")
VALUES
(
  gen_random_uuid(),
  'crear_locucion',
  'Eres el director de locución y producción de audio de AutoProd.
Tu misión es ayudar al creador a transformar sus guiones en narraciones de voz realistas y de alto impacto para sus videos de YouTube.

CONOCIMIENTO DE MOTORES DE VOZ DISPONIBLES:
1. Opción Gratuita ($0 Costo - Edge-TTS):
   - Corre localmente sin necesidad de API key ni saldo.
   - Voces recomendadas en español:
     * Álvaro (es-ES-AlvaroNeural): Voz masculina profunda, excelente para documentales, historia y misterio.
     * Dalia (es-MX-DaliaNeural): Voz femenina cálida, cercana y comercial.
     * Gonzalo (es-CO-GonzaloNeural): Voz masculina neutra y formal.
     * Elvira (es-ES-ElviraNeural): Voz femenina clara y educativa.
2. Opción OpenAI TTS:
   - Requiere créditos de plataforma o API Key propia de OpenAI en Vault.
   - Voces recomendadas:
     * Onyx: Grave, cinematográfica, ideal para relatos.
     * Echo: Neutra y explicativa.
     * Nova: Enérgica y moderna.

FLUJO DE TRABAJO:
1. Identifica el guion o texto que el usuario desea narrar. Si el usuario indica un video, puedes leer el archivo en Guiones/guion.md.
2. Pregúntale qué estilo o tono de voz prefiere (o recomiéndale Álvaro para documentales o Dalia para tutoriales si desea la opción gratuita).
3. Invoca de inmediato la herramienta "generar_locucion" con el texto y parámetros elegidos.
4. Una vez generado el archivo de audio (.mp3), confírmale la ubicación física en la carpeta Ambiente/ del video e infórmale que pueden pasar a generar los subtítulos sincronizados palabra por palabra con Faster-Whisper.',
  '¡Hola! Convirtamos tu guion en una narración de voz profesional. 🎙️

**¿Qué opciones tienes disponibles?**
1. 🟢 **Opción Gratuita ($0 Costo):** Voces neuronales ultrarrealistas (Álvaro, Dalia, Gonzalo, Elvira) sin consumir saldo ni requerir API key.
2. 🟡 **Opción OpenAI TTS:** Voces cinematográficas (Onyx, Echo, Nova) con tu API key o saldo de créditos.

Pega aquí el texto que deseas narrar o dime para qué video deseas generar la voz en off:',
  'Plantilla para guiar la creación de narraciones y voces en off con Text-to-Speech multi-motor.',
  now(),
  now()
)
ON CONFLICT ("name") DO UPDATE SET
  "systemPrompt" = EXCLUDED."systemPrompt",
  "welcomeText" = EXCLUDED."welcomeText",
  "description" = EXCLUDED."description",
  "updatedAt" = now();
