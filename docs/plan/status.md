# Estado del Proyecto - AutoProd Console

Último commit: `d1e5891` — `refactor: migrate to agent-based architecture with Prisma schema, modular API routes, and local controller integration`  
Fecha: 2026-08-28  
Rama: `master`

---

## 1. Base de Datos (PostgreSQL + Prisma 7.10 + adapter-pg)

El esquema está definido en [`prisma/schema.prisma`](file:///e:/AutoProd/prisma/schema.prisma) con soporte **multi-schema** (`public`, `auth`, `vault`). El cliente Prisma se inicializa en [`src/prisma/db.ts`](file:///e:/AutoProd/src/prisma/db.ts) usando `@prisma/adapter-pg` con un pool de conexiones `pg`.

### Modelos en el namespace `public` (14 modelos)

| Modelo             | Descripción | Tabla SQL |
| ---                | ---         | ---       |
| `User`             | Usuario base con UUID compatible con Supabase Auth. Campos de Vault ID por provider (geminiVaultId, openaiVaultId, anthropicVaultId). Relación con suscripción, settings, API keys, canales, conversaciones y token usage. | `user` |
| `Language`         | Catálogo de idiomas (`es`, `en`, `pt`, `fr`). Llave primaria: `code`. | `language` |
| `UserSettings`     | Idioma relacional, tema (`dark`/`light`), notificaciones, resolución por defecto. Relación 1-1 con `User`. | `userSettings` |
| `ApiKey`           | API Keys por provider (Google, OpenAI, Anthropic). Unique constraint: `[userId, provider]`. | `apiKey` |
| `UserSubscription` | Suscripción activa del usuario vinculada a un `Plan`. Fecha de expiración con DB-generated default. | `userSubscription` |
| `Plan`             | Planes (FREE, PRO, ENTERPRISE) con Stripe/Lemon Squeezy Price ID. | `plan` |
| `PlanLimit`        | Límites por plan: maxChannels, maxVideosPerChannel, canRenderInCloud, maxMonthlyRenderMinutes, hasAdvancedTemplates. | `planLimit` |
| `Channel`          | Canal de YouTube. Soporta OAuth: `youtubeChannelId`, `accessToken`, `refreshToken`, `tokenExpiry`, `profilePicture`. | `channel` |
| `Video`            | Video dentro de un canal. Status: `DRAFT`. Campos para YouTube: `youtubeVideoId`. | `video` |
| `Conversation`     | Hilo de chat vinculable a Channel y/o Video. Incluye `systemPrompt` maestro. Relación con mensajes y token usage. | `conversation` |
| `Message`          | Mensaje dentro de una conversación. Campo `sender` (string, ej: `USER`, `GEMINI`). | `message` |
| `PromptTemplate`   | Plantillas maestras: `orchestrator_base`, `tool_injection`, `crear_canal`, `crear_video`, `crear_guion`. Unique por `name`. | `promptTemplate` |
| `Agent`            | Agente del catálogo dinámico. `slug` único (ej: `channel_architect`, `workspace_list`). Incluye `systemPrompt` y relación con `AgentStep`. | `agent` |
| `AgentStep`        | Paso de ejecución de un agente. Define `apiEndpoint` (ej: `/api/agents/movement` o `LOCAL:workspace_list`), `method`, y `dynamicPromptTemplate`. | `agentStep` |
| `AgentTool`        | Herramienta asociada a un paso de agente. Campo `toolName`. | `agentTool` |
| `TokenUsage`       | Registro de consumo de tokens por llamada. Campos: `provider`, `modelName`, `promptTokens`, `completionTokens`, `totalTokens`. Vinculado a usuario y opcionalmente a conversación. | `tokenUsage` |

### Catálogo de Agentes (Seed)

Los agentes se poblican mediante [`seed_agents.cjs`](file:///e:/AutoProd/seed_agents.cjs):

**Primitivas Locales** (ejecutadas internamente, endpoint `LOCAL:*`):

| Slug | Nombre | Descripción |
|---|---|---|
| `workspace_list` | Listar Workspace | Lista carpetas y archivos del proyecto seleccionado |
| `workspace_read` | Leer Archivo | Lee contenido de un archivo `.md` o `.txt` |
| `workspace_write` | Escribir Archivo | Guarda o sobrescribe un archivo `.md` o `.txt` |
| `workspace_delete` | Eliminar Archivo | Elimina un archivo del proyecto |

**Switches Cloud** (endpoints API que usan modelos premium):

| Slug | Nombre | Endpoint | Modelo |
|---|---|---|---|
| `channel_architect` | Arquitecto de Canales | `/api/agents/channel-creator` | Gemini 1.5 Flash |
| `gestor_movement` | Gestor Movement | `/api/agents/movement` | Gemini 1.5 Flash (con AI SDK tools) |

**Prompt Templates del Orquestador**:

| Name | Propósito |
|---|---|
| `orchestrator_base` | SOP del orquestador. Reglas absolutas de exploración-primero |
| `tool_injection` | Instrucción inyectada tras el resultado de una API |

---

## 2. Capa de Servidor (API Routes — Next.js App Router)

Todas las rutas en [`app/api/`](file:///e:/AutoProd/app/api) están protegidas con verificación de sesión.

El auth guard se implementa en [`lib/auth.ts`](file:///e:/AutoProd/lib/auth.ts) con un patrón de doble verificación:
1. **Fast path (0ms)**: Decodifica el JWT de la cookie SSR de Supabase síncronamente.
2. **Fallback**: Si falla, llama a `supabase.auth.getUser()` por red.

### Endpoints Cloud (Next.js API Routes)

| Endpoint | Método | Archivo | Descripción |
|---|---|---|---|
| `/api/auth/sync` | POST | `auth/sync/route.ts` | Sincroniza usuario Supabase Auth → tabla `User` |
| `/api/auth/callback` | GET | `auth/callback/route.ts` | Callback de Google OAuth |
| `/api/auth/me-role` | GET | `auth/me-role/route.ts` | Obtiene el rol del usuario actual |
| `/api/chat` | POST | `chat/route.ts` | **Chat Universal Multi-Provider** con tool loop. Soporta Ollama, Gemini, OpenAI, Anthropic. Protocolo de interceptación `[LLAMAR_API: slug]` |
| `/api/agents/channel-creator` | POST | `agents/channel-creator/route.ts` | Switch: Crea estructura de carpetas de canal + contenido con Gemini |
| `/api/agents/movement` | POST | `agents/movement/route.ts` | Switch: Ejecuta Súper Prompt con Gemini + AI SDK tools (`read_file`, `write_file`, `create_folder`) |
| `/api/conversations` | GET | `conversations/route.ts` | Lista conversaciones del usuario (ordenadas por `updatedAt` desc) |
| `/api/conversations` | POST | `conversations/route.ts` | Crea conversación con `systemPrompt`, `welcomeText`, y mensaje de bienvenida automático |
| `/api/conversations/[id]/messages` | GET/POST | `conversations/[id]/messages/route.ts` | CRUD de mensajes dentro de una conversación |
| `/api/channels` | GET | `channels/route.ts` | Lista canales del usuario con sus videos |
| `/api/prompts` | GET | `prompts/route.ts` | Lista plantillas de prompt. **Auto-seeding**: si la tabla está vacía, inserta 3 prompts por defecto |
| `/api/settings/keys` | * | `settings/keys/route.ts` | Gestión de API Keys (encriptación/desencriptación via Supabase Vault RPC) |
| `/api/setup/install` | POST | `setup/install/route.ts` | Instalación del motor local |
| `/api/setup/shutdown` | POST | `setup/shutdown/route.ts` | Apagado del motor local |

### Patrón `universalChatWithTools` — Chat Multi-Provider con Tool Loop

Implementado en [`app/api/chat/route.ts`](file:///e:/AutoProd/app/api/chat/route.ts), este es el corazón del backend:

1. Construye un **System Prompt dinámico** concatenando el template `orchestrator_base` + el catálogo de APIs (primitivas + switches) leído de la BD.
2. Selecciona el provider de IA según el parámetro `provider`:
   - `ollama` → API directa a `http://127.0.0.1:11434/api/chat`
   - `gemini` → `createGoogleGenerativeAI({ apiKey })(modelName)` via AI SDK
   - `openai`/`chatgpt` → `openai('gpt-4o', { apiKey })` via AI SDK
   - `anthropic` → `anthropic(modelName, { apiKey })` via AI SDK
3. Ejecuta un **tool loop** de hasta 5 iteraciones que intercepta `[LLAMAR_API: slug | args]` en la respuesta:
   - Si el slug es una **primitiva local** (`LOCAL:*`): ejecuta `executeTool()` internamente y re-inyecta el resultado en el historial.
   - Si es un **switch cloud**: retorna al frontend con headers `X-AutoProd-*` para confirmación humana (preview).
4. Registra el consumo de tokens en la tabla `TokenUsage` de forma asíncrona (fire-and-forget).

### Endpoints Motor Local (Python FastAPI — Puerto 8000)

Implementado en [`controlador/main.py`](file:///e:/AutoProd/controlador/main.py) con 3 routers:

| Router | Prefix | Endpoints |
|---|---|---|
| `workspace.py` | `/workspace` | `GET /` (listar), `GET /pick` (explorador nativo), `GET /file` (leer), `POST /file` (escribir), `DELETE /file` (eliminar), `POST /create` (crear carpetas) |
| `chat.py` | — | Chat local directo |
| `ollama_manager.py` | `/ollama` | `POST /install` (instala Ollama automáticamente según SO) |
| — | — | `GET /status` (health check), `POST /shutdown` (apagar motor) |

---

## 3. Frontend

### Landing Page — [`app/page.tsx`](file:///e:/AutoProd/app/page.tsx)
- Página pública con diseño oscuro (gradientes púrpura/índigo).
- Secciones: Hero, Features Grid, How It Works, Footer.
- **Bilingüe ES/EN** con selector persistido en `localStorage` via [`app/translations.ts`](file:///e:/AutoProd/app/translations.ts).
- CTA principal redirige a `/login`.

### Dashboard — [`app/dashboard/page.tsx`](file:///e:/AutoProd/app/dashboard/page.tsx)
Layout estilo IDE de 3 paneles redimensionables. Componentes modulares en [`components/dashboard/`](file:///e:/AutoProd/components/dashboard):

| Componente | Archivo | Propósito |
|---|---|---|
| ChatPanel | `ChatPanel.tsx` | Panel de chat multi-provider con selección de modelo, workspace y envío de mensajes |
| ConversationSidebar | `ConversationSidebar.tsx` | Sidebar izquierdo con lista de conversaciones, búsqueda y acciones |
| Launchpad | `Launchpad.tsx` | Tarjetas de inicio rápido (Crear Canal, Video, Guion) con PromptTemplates |
| FilePreviewer | `FilePreviewer.tsx` | Vista previa de archivos del workspace |
| FileTree | `FileTree.tsx` | Árbol de archivos (conectado al Motor Python) |
| MarkdownEditor | `MarkdownEditor.tsx` | Editor de archivos Markdown |
| RightInspector | `RightInspector.tsx` | Panel inspector derecho |
| UserSettingsModal | `UserSettingsModal.tsx` | Configuración de providers de IA, API keys, detección de CLI local |
| WorkspaceModal | `WorkspaceModal.tsx` | Selector de workspace (abre explorador nativo via Motor Python) |
| ConfirmDeleteModal | `ConfirmDeleteModal.tsx` | Modal de confirmación para eliminaciones |

Otros componentes:
- [`components/agents/ChannelCreatorConsole.tsx`](file:///e:/AutoProd/components/agents/ChannelCreatorConsole.tsx) — Consola de creación de canales
- [`components/auth/GoogleLoginButton.tsx`](file:///e:/AutoProd/components/auth/GoogleLoginButton.tsx) — Botón de login Google OAuth

### Login — [`app/login/`](file:///e:/AutoProd/app/login)
Autenticación Google OAuth via Supabase Auth.

---

## 4. Utilidades y Librerías Internas

| Archivo | Propósito |
|---|---|
| [`lib/auth.ts`](file:///e:/AutoProd/lib/auth.ts) | Auth guard con JWT decode + fallback a Supabase |
| [`lib/agents/context-manager.ts`](file:///e:/AutoProd/lib/agents/context-manager.ts) | `ContextManager`: lee reglas globales (`PROMPT_OPTIMIZADOR_SEO.md`, `PLANTILLA_DESCRIPCIONES.md`) y reglas de canal (`.autoprod_channel.md`) via Motor Python |
| [`lib/controlador-client.ts`](file:///e:/AutoProd/lib/controlador-client.ts) | Cliente HTTP para comunicarse con el Motor Python local |
| [`lib/supabase/`](file:///e:/AutoProd/lib/supabase) | Clientes Supabase para server y client |
| [`src/prisma/db.ts`](file:///e:/AutoProd/src/prisma/db.ts) | Singleton de PrismaClient con adapter-pg y pool de conexiones |

---

## 5. Infraestructura

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.3.3 (App Router, Turbopack) |
| Auth | Supabase Auth + Google OAuth |
| Base de datos | PostgreSQL via Supabase (multi-schema: public, auth, vault) |
| ORM | Prisma 7.10.0 (adapter-pg) |
| Vault | Supabase Vault (encriptación/desencriptación de API keys via RPC) |
| AI Providers | Ollama (local), Gemini, OpenAI, Anthropic (AI SDK v7) |
| Motor Local | Python FastAPI + Uvicorn (puerto 8000) |
| Despliegue | Vercel |
| Notificaciones UI | Sonner |
| Package Manager | pnpm 10.29.3 |
