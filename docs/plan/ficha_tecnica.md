# Ficha Técnica de Producto - AutoProd Console

Este documento detalla las especificaciones técnicas, arquitectura del sistema y definición de la pila tecnológica de **AutoProd Console**.

---

## 1. Información General del Producto
* **Nombre del Producto:** AutoProd Console (YouTube Co-Pilot & Production Automation Suite)
* **Descripción:** Plataforma agéntica para creadores de YouTube que automatiza la producción y gestión. Integra una arquitectura híbrida donde Llama actúa como Orquestador Local, un Motor en Python ejecuta el trabajo pesado en el sistema de archivos (puerto 8000), y APIs Premium multi-provider se usan on-demand vía Switches.
* **Versión de Software:** 0.1.0-alpha
* **Arquitectura:** Arquitectura Agéntica Híbrida Multi-Modelo (Orquestador Llama + Motor Python Local + Especialistas Cloud Multi-Provider).

---

## 2. Arquitectura de Software y Pila Tecnológica

### Frontend
* **Framework:** Next.js 16.3.3 (compilado dinámicamente con Turbopack).
* **Librería de Componentes:** React 19.2.8.
* **Estilos:** TailwindCSS v4 + plugin Typography (diseño responsivo con estética premium oscura y paneles interactivos redimensionables).
* **Feedback de Interfaz:** Sonner 2.0.8 (mensajes toast flotantes para notificaciones instantáneas).
* **Markdown:** react-markdown 10.1.0 + remark-gfm 4.0.1 (renderizado de respuestas del chat y archivos).
* **Validación:** Zod 4.4.3 (validación de esquemas en runtime).

### Base de Datos y Capa de Datos (Catálogo de Agentes)
* **Motor de Base de Datos:** PostgreSQL (alojado en Supabase). Multi-schema: `public`, `auth`, `vault`.
* **Capa de Abstracción:** Prisma 7.10.0 con `@prisma/adapter-pg` (pool de conexiones via `pg`). Preview feature: `multiSchema`.
* **Catálogo Dinámico:** Las tablas `Agent`, `AgentStep` y `AgentTool` definen los "Switches" disponibles, eliminando hardcoding y permitiendo a Llama descubrir nuevas capacidades en tiempo real.
* **Vault:** Supabase Vault para almacenamiento encriptado de API Keys. Desencriptación en runtime via `supabase.rpc('get_decrypted_secret')`.

### Motor Operativo (Heavy Lifter Local)
* **Lenguaje:** Python (FastAPI / Uvicorn).
* **Rol:** Se ejecuta en el puerto 8000 del PC del creador. Maneja *todo* el trabajo pesado operativo: manipulación segura de archivos `.md`/`.txt`, creación de árboles de directorios, selector de workspace nativo (PowerShell/osascript), gestión de Ollama.
* **Routers:** `workspace.py` (CRUD FS), `chat.py` (chat local), `ollama_manager.py` (instalación multiplataforma).

### Inteligencia Artificial Híbrida Multi-Provider (El Cerebro)

#### Orquestador Local (Ollama/Llama)
* Gestiona el flujo paso a paso de forma gratuita.
* Protocolo de interceptación: `[LLAMAR_API: slug | arg1: valor1]` — el backend detecta este patrón en la respuesta y ejecuta la herramienta.
* API directa a Ollama: `http://127.0.0.1:11434/api/chat` (modo no-streaming).
* Modelo por defecto: `llama3.1:latest`.

#### Agentes Especialistas Cloud (Switches)
Llamados exclusivamente a través de los Switches cuando se requiere trabajo avanzado:

| Provider | Paquete | Modelo por Defecto | Uso |
|---|---|---|---|
| **Gemini** | `@ai-sdk/google` v4.0.56 | `gemini-3.6-flash` | Switches de agentes (Movement, Channel Creator), chat premium |
| **OpenAI** | `@ai-sdk/openai` v4.0.50 | `gpt-4o` | Chat premium alternativo |
| **Anthropic** | `@ai-sdk/anthropic` v4.0.44 | `claude-3-5-sonnet-20240620` | Chat premium alternativo |
| **Ollama** | `ollama-ai-provider` v1.2.0 / `ollama-ai-provider-v2` v4.0.1 | `llama3.1:latest` | Orquestación local gratuita |

* **Motor de IA:** Vercel AI SDK v7.0.83 (`ai` package). Función central: `generateText()` con soporte multi-provider.
* **Integración Adicional planeada:** YouTube Data API v3 para automatización de publicación.

---

## 3. Especificación de Base de Datos (Esquema Relacional)

Las tablas creadas en el esquema `public` de PostgreSQL son:

| Tabla | Propósito | Llave Primaria | Relaciones Clave |
| :--- | :--- | :--- | :--- |
| **`User`** | Creadores y roles (USER/ADMIN). Campos Vault ID por provider. | `id` (UUID) | 1-1 con `UserSettings`, `UserSubscription`. 1-N con `ApiKey`, `Channel`, `Conversation`, `TokenUsage`. |
| **`UserSettings`** | Tema, resolución, idioma relacional, notificaciones. | `id` (UUID) | `userId` → `User.id`, `languageCode` → `Language.code` |
| **`Language`** | Catálogo de idiomas disponibles. | `code` (String) | Referenciada por `UserSettings` |
| **`ApiKey`** | API Keys por provider. Constraint: `unique([userId, provider])`. | `id` (UUID) | `userId` → `User.id` |
| **`UserSubscription`** | Plan activo con fecha de vencimiento. | `id` (UUID) | `userId` → `User.id`, `planId` → `Plan.id` |
| **`Plan`** | Planes de suscripción (FREE, PRO, ENTERPRISE). | `id` (UUID) | 1-1 con `PlanLimit` |
| **`PlanLimit`** | Límites operativos por plan. | `id` (UUID) | `planId` → `Plan.id` |
| **`Channel`** | Canal de YouTube con tokens OAuth. | `id` (UUID) | `userId` → `User.id`. 1-N con `Video`, `Conversation` |
| **`Video`** | Videos con estado y metadata. | `id` (UUID) | `channelId` → `Channel.id` |
| **`Conversation`** | Hilos de chat con `systemPrompt` maestro. | `id` (UUID) | `userId` → `User.id`, `channelId` → `Channel.id`, `videoId` → `Video.id` |
| **`Message`** | Mensajes dentro de una conversación. | `id` (UUID) | `conversationId` → `Conversation.id` |
| **`PromptTemplate`** | Plantillas de prompts del sistema. Unique por `name`. | `id` (UUID) | — |
| **`Agent`** | Agentes del catálogo dinámico. `slug` único. | `id` (UUID) | 1-N con `AgentStep` |
| **`AgentStep`** | Pasos de ejecución: `apiEndpoint`, `method`, `dynamicPromptTemplate`. | `id` (UUID) | `agentId` → `Agent.id`. 1-N con `AgentTool` |
| **`AgentTool`** | Herramienta vinculada a un paso de agente. | `id` (UUID) | `stepId` → `AgentStep.id` |
| **`TokenUsage`** | Registro de consumo: provider, modelo, tokens (prompt/completion/total). | `id` (UUID) | `userId` → `User.id`, `conversationId` → `Conversation.id` |

---

## 4. Integraciones y Automatizaciones Locales (Workspace)

* **Directorio de Workspace Local:** Carpeta raíz seleccionada dinámicamente por el usuario (explorador nativo via Motor Python).
* **Estructura Dinámica de Proyectos:**
  * Carpeta de Canales (Ej: `Workspace/PawsAndPillows`).
  * Carpetas de Proyectos de Videos (Ej: `Workspace/PawsAndPillows/PerritoDormilon`).
  * Estructura interna de activos: `Videos/`, `Musica/`, `Ambiente/`, `miniature/`, `Resultado/`, y los archivos descriptivos editables de metadata `config_subida.md` y `comentario_fijado.md`.
* **Motor de Edición Automática (Python):** Planeado para fases futuras — procesamiento de archivos locales usando FFmpeg/MoviePy desde la consola web de AutoProd.

---

## 5. Módulo de Configuración de IA y Multi-Provider

### Proveedores de IA Soportados
| Provider | Método de Auth | Almacenamiento |
|---|---|---|
| **Gemini** (BYOK) | API Key de Google AI Studio | Supabase Vault (`geminiVaultId`) |
| **OpenAI** (BYOK) | API Key de OpenAI | Supabase Vault (`openaiVaultId`) |
| **Anthropic** (BYOK) | API Key de Anthropic | Supabase Vault (`anthropicVaultId`) |
| **Ollama** (Local) | Sin auth (localhost:11434) | N/A |

### Flujo de Persistencia de Claves
1. El usuario ingresa su API Key en `UserSettingsModal`.
2. La clave se envía al endpoint `/api/settings/keys`.
3. El backend encripta la clave en Supabase Vault y guarda el `secretId` resultante en el campo correspondiente del modelo `User` (`geminiVaultId`, `openaiVaultId`, `anthropicVaultId`).
4. En cada llamada al chat, el backend desencripta la clave via `supabase.rpc('get_decrypted_secret')`.

### Modelos de IA Disponibles en el Código
| Modelo | Provider | Uso por defecto |
|---|---|---|
| `gemini-3.6-flash` | Gemini | Modelo por defecto cuando `provider=gemini` y no se especifica modelo |
| `gpt-4o` | OpenAI | Modelo fijo para `provider=openai`/`chatgpt` |
| `claude-3-5-sonnet-20240620` | Anthropic | Modelo por defecto para `provider=anthropic` |
| `llama3.1:latest` | Ollama | Modelo por defecto para `provider=ollama` |

### Tracking de Consumo (TokenUsage)
- Cada llamada a un provider cloud (Gemini, OpenAI, Anthropic) registra el consumo en la tabla `TokenUsage`.
- Campos: `provider`, `modelName`, `promptTokens`, `completionTokens`, `totalTokens`.
- El registro es asíncrono (fire-and-forget) para no bloquear la respuesta al usuario.
- Se vincula al `userId` y opcionalmente al `conversationId` activo.
