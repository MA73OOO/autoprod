# 🔧 Catálogo de Funciones y Herramientas del Sistema (AutoProd)

> **Propósito de este documento:** Referencia técnica del catálogo de herramientas, sub-agentes y funciones que el Orquestador puede invocar. Si durante una conversación **el usuario menciona una capacidad o idea que no existe aún en este catálogo**, el agente de IA debe:
> 1. Identificar que la función aún no está implementada.
> 2. Preguntarle al usuario si desea gestionar esa idea (crear una tarjeta en el Master Tracker o crear la carpeta en `docs/features/`).
> 3. No improvisar ni asumir que existe.

---

## 🧠 1. Protocolo de Ejecución Agéntica (Function Calling)

El Orquestador opera mediante **Function Calling nativo** del Vercel AI SDK:

1. El usuario envía un mensaje al chat.
2. `app/api/chat/route.ts` consulta en Prisma el Agente `Orchestrator` (`isOrchestrator: true`) y carga sus `Tools`.
3. Se construye un System Prompt dinámico inyectando `contextRules` del canal si se provee `channelId`.
4. Los JSON Schemas de herramientas se convierten al formato Zod vía `jsonSchema()` de `ai-core`.
5. El LLM decide si usar herramientas. Si las usa, el SDK ejecuta el bloque `execute` (fetch al Motor Python) y devuelve el resultado al LLM.
6. El LLM genera la respuesta final con `generateText` con `maxSteps: 5`.

---

## 🔌 2. Herramientas Primitivas (Motor Local Python `localhost:8000`)

Herramientas de bajo nivel registradas en el catálogo de Prisma:

| Slug | Descripción | Endpoint Python | Estado |
|---|---|---|:---:|
| `workspace_list` | Lista recursiva del árbol de archivos hasta 4 niveles | `GET /workspace/?base_path={path}` | `✅ ACTIVA` |
| `workspace_read` | Lee contenido de un archivo (máx 8000 chars) | `GET /workspace/file?path={fullPath}` | `✅ ACTIVA` |
| `workspace_write` | Guarda o sobrescribe un archivo | `POST /workspace/file` | `✅ ACTIVA` |
| `workspace_delete` | Elimina un archivo del proyecto | `DELETE /workspace/file?path={fullPath}` | `✅ ACTIVA` |
| `crear_carpetas` | Crea canal y subcarpetas en bloque | `POST /workspace/create` | `✅ ACTIVA` |
| `eliminar_carpetas` | Elimina una o varias carpetas | `POST /workspace/delete_folder` | `✅ ACTIVA` |
| `extraer_canal_youtube` | Extrae metadatos y contexto vectorial de un canal de YouTube | `/api/tools/extraer_canal_youtube` | `✅ ACTIVA` |

---

## ⚡ 3. Sub-Agentes Especialistas (Cloud Premium)

Agentes que usan modelos pesados y se activan por delegación del Orquestador:

| Slug | Nombre | Endpoint | Modelo | Estado |
|---|---|---|---|:---:|
| `channel_architect` | Arquitecto de Canales | `/api/agents/channel-creator` | Gemini Flash | `✅ ACTIVO` |
| `gestor_movement` | Gestor Movement | `/api/agents/movement` | Gemini Flash + AI SDK Tools | `✅ ACTIVO` |

---

## 🎛️ 4. Herramientas Planificadas (No Implementadas)

> **⚠️ IMPORTANTE PARA AGENTES:** Si el usuario solicita alguna de las siguientes capacidades, esta **NO existe aún**. Debes notificarlo y preguntar si quiere que la gestionemos creando una entrada en el [Master Feature Tracker](file:///e:/autoprod/docs/features/README.md).

| Capacidad | Área | Estado | Referencia |
|---|---|:---:|---|
| Subida directa de video a YouTube (OAuth + Upload API v3) | Integración YouTube | `📋 PLANIFICADO` | [Idea](file:///e:/autoprod/docs/features/youtube_channel_extractor/idea.md) |
| Editor/Parseador visual de `config_subida.md` | Frontend | `📋 PLANIFICADO` | — |
| Instalador automático de dependencias (`autoprod-setup`) | Motor Local | `🔄 EN PROGRESO` | [Idea](file:///e:/autoprod/docs/features/local_motor/idea.md) |
| Calendario de publicación y cron automatizado | Scheduler | `📋 PLANIFICADO` | [Idea](file:///e:/autoprod/docs/features/README.md) |
| Motor TTS Multi-Voz (Edge-TTS + ElevenLabs) | Multimedia | `💡 IDEA` | — |
| Render batch nocturno en cola | Multimedia | `💡 IDEA` | — |
| Auto-corte a YouTube Shorts / TikTok (9:16) | Multimedia | `💡 IDEA` | — |
| Agente A/B Testing de Miniaturas | IA Agéntica | `💡 IDEA` | — |
| Dashboard de Analíticas de YouTube | Integración YouTube | `💡 IDEA` | — |
| Webhooks de alerta a Discord / Telegram | Notificaciones | `💡 IDEA` | — |
| Modo Agencia y Multi-Canal con roles | SaaS | `💡 IDEA` | — |
| Empaquetador de escritorio (Tauri / Electron `.exe`) | Distribución | `💡 IDEA` | — |

---

## 📋 5. Protocolo de Gestión de Ideas para Agentes

Cuando el usuario mencione algo que **no está en las herramientas activas** de la sección 2 y 3:

```
1. Identificar que la capacidad no existe en el catálogo actual.
2. Informar al usuario: "Esa funcionalidad no está implementada aún."
3. Preguntar: "¿Quieres que la registremos como una idea en el Master Tracker?"
4. Si acepta → crear la entrada en docs/features/README.md (sección Backlog)
   y opcionalmente crear la carpeta docs/features/{slug}/ con idea.md.
5. NO improvisar código ni asumir que existe un endpoint para ello.
```

---

## 📁 6. ContextManager — Inyección de Reglas de Canal

Implementado en [`lib/agents/context-manager.ts`](file:///e:/autoprod/lib/agents/context-manager.ts):

**Reglas Globales** (desde raíz del workspace):
- `PROMPT_OPTIMIZADOR_SEO.md` — Reglas de SEO y formato de títulos/descripciones.
- `PLANTILLA_DESCRIPCIONES.md` — Plantilla estándar de descripciones de YouTube.

**Reglas de Canal** (desde carpeta del canal):
- `.autoprod_channel.md` — Nicho, tono, público objetivo y restricciones específicas del canal.
- Se inyectan en el System Prompt cuando hay un `channelId` activo.

---

## 📝 7. Plantillas de Prompt del Sistema

| Nombre | Propósito |
|---|---|
| `orchestrator_base` | SOP del orquestador: explorar antes de actuar, no inventar rutas. |
| `tool_injection` | Instrucción post-resultado de herramienta: evaluar, pedir contexto o responder. |
| `crear_canal` | Template para configurar y planificar un canal de YouTube. |
| `crear_video` | Template de planeación de carpetas y metadata de video. |
| `crear_guion` | Template para escritura de guiones escena por escena en Markdown. |
