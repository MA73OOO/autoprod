# 🚀 AutoProd — Plataforma Agéntica de Producción de Video

**AutoProd** es una plataforma web progresiva (PWA) de nivel profesional diseñada para automatizar la producción de video, optimizar contenido SEO y crear proyectos completos para canales de YouTube mediante una orquestación inteligente de IA.

El núcleo del proyecto está diseñado bajo una **Arquitectura Agéntica Híbrida Multi-Modelo** altamente refinada, pensada para garantizar la máxima eficiencia operativa y minimizar los costos de IA, delegando responsabilidades según la especialidad de cada componente:

### 1. El Orquestador Local (Llama / Ollama) 🧠
- Actúa como el "Director de Orquesta" y opera localmente de forma **gratuita**.
- Lee un catálogo dinámico de APIs (Switches) directamente desde la base de datos, conociendo en tiempo real qué herramientas tiene a su disposición.
- **Protocolo de Interceptación**: Utiliza un protocolo estricto de strings `[LLAMAR_API: slug | arg1: valor]`. El backend intercepta esto en la respuesta y ejecuta las acciones silenciosamente.
- Su único trabajo es *decidir qué herramienta usar* basándose en el contexto del chat. No hace trabajo pesado.

### 2. El Motor Local (Python en Puerto 8000) ⚙️
- Este es el **trabajador pesado (Heavy Lifter)** de la arquitectura.
- Opera directamente en la máquina del usuario (PC) por razones de seguridad y acceso.
- Se encarga de explorar el disco duro (`workspace_list`), leer archivos (`workspace_read`), crear árboles enteros de directorios (`workspace_create`), escribir resultados (`workspace_write`) y eliminar archivos (`workspace_delete`).
- La seguridad es estricta: solo permite operar sobre archivos `.md` y `.txt`, protegiendo el entorno de ejecución de inyecciones de código.
- **Routers**: `workspace.py` (CRUD de archivos), `chat.py` (chat local), `ollama_manager.py` (instalación de Ollama).

### 3. Los Agentes Especialistas (Switches Cloud) ⚡
- Modelos avanzados y de pago que se invocan *únicamente* cuando la tarea requiere alta inteligencia o redacción creativa extensa.
- **Multi-Provider**: Soporta **Gemini** (`@ai-sdk/google`), **OpenAI/GPT-4o** (`@ai-sdk/openai`), y **Anthropic/Claude** (`@ai-sdk/anthropic`) via AI SDK v7.
- **Flujo**: Llama orquesta → Inicia el Switch → Se arma un "Súper Prompt" → El modelo cloud ejecuta la tarea → Se envía el resultado al Motor Python para que lo guarde.
- Esto asegura que **solo gastas dinero/créditos cuando realmente necesitas un modelo premium**, mientras que toda la planeación previa la hizo Llama gratis.

### 4. Catálogo Dinámico en Base de Datos (Prisma/Supabase) 🗄️
- Cero *hardcoding*. Las funciones a las que Llama puede acceder se almacenan en las tablas `Agent`, `AgentStep` y `AgentTool` de la base de datos.
- Si se añade un nuevo agente (ej. "Gestor Movement", "Arquitecto de Canales"), este queda automáticamente disponible en el Súper Prompt del sistema para que Llama empiece a usarlo.
- Las API Keys de los providers se almacenan cifradas en **Supabase Vault** y se desencriptan en runtime via RPC.

### 5. Tracking de Consumo de Tokens 📊
- La tabla `TokenUsage` registra cada llamada a un modelo cloud: provider, modelo, promptTokens, completionTokens, totalTokens.
- Asociado al usuario y opcionalmente a la conversación.
- Permite monitorear costos y establecer límites por plan.

---

## 📂 Estructura del Proyecto

```text
AutoProd/
├── app/                          <-- Aplicación Next.js 16 (App Router)
│   ├── api/                      <-- API Routes (Cloud Backend)
│   │   ├── agents/               <-- Endpoints de Agentes Especialistas
│   │   │   ├── channel-creator/  <-- Switch: Arquitecto de Canales
│   │   │   └── movement/         <-- Switch: Gestor Movement (Gemini + Tools)
│   │   ├── auth/                 <-- Autenticación (sync, callback, me-role)
│   │   ├── channels/             <-- CRUD de Canales de YouTube
│   │   ├── chat/                 <-- Chat Universal Multi-Provider + Tool Loop
│   │   ├── conversations/        <-- CRUD de Conversaciones y Mensajes
│   │   ├── prompts/              <-- Plantillas de Prompts (auto-seed)
│   │   ├── settings/keys/        <-- Gestión de API Keys (Supabase Vault)
│   │   └── setup/                <-- Instalación y shutdown del motor local
│   ├── dashboard/                <-- Dashboard principal (paneles IDE)
│   ├── login/                    <-- Autenticación Google OAuth
│   └── page.tsx                  <-- Landing Page bilingüe (ES/EN)
├── components/                   <-- Componentes React reutilizables
│   ├── agents/                   <-- ChannelCreatorConsole
│   ├── auth/                     <-- GoogleLoginButton
│   └── dashboard/                <-- 11 componentes del dashboard
│       ├── ChatPanel.tsx         <-- Panel de chat multi-provider
│       ├── ConversationSidebar.tsx
│       ├── FilePreviewer.tsx     <-- Vista previa de archivos
│       ├── FileTree.tsx          <-- Árbol de archivos del workspace
│       ├── Launchpad.tsx         <-- Tarjetas de inicio rápido
│       ├── MarkdownEditor.tsx    <-- Editor de Markdown
│       ├── RightInspector.tsx    <-- Panel inspector derecho
│       ├── UserSettingsModal.tsx <-- Modal de configuración de IA
│       └── WorkspaceModal.tsx    <-- Selector de workspace
├── controlador/                  <-- Motor Python Local (FastAPI, Puerto 8000)
│   ├── main.py                   <-- Servidor FastAPI con CORS
│   └── routers/
│       ├── workspace.py          <-- CRUD de archivos y carpetas
│       ├── chat.py               <-- Chat local
│       └── ollama_manager.py     <-- Instalación automática de Ollama
├── lib/                          <-- Utilidades compartidas del backend
│   ├── agents/
│   │   └── context-manager.ts   <-- Inyección de reglas globales y de canal
│   ├── auth.ts                   <-- Auth guard (JWT + Supabase fallback)
│   ├── controlador-client.ts    <-- Cliente HTTP para el Motor Python
│   └── supabase/                 <-- Clientes Supabase (server/client)
├── src/prisma/
│   └── db.ts                     <-- Cliente Prisma singleton (adapter-pg)
├── prisma/
│   └── schema.prisma             <-- Esquema de BD (14 modelos, multi-schema)
├── docs/                         <-- Documentación técnica
├── seed_agents.cjs               <-- Script para poblar Agentes y Prompts
├── migration_token_usage.sql     <-- Migración SQL para tabla TokenUsage
└── COMPATIBILITY_AND_SECURITY_GUIDELINES.md
```

---

## 🛠️ Tecnologías Principales

| Capa | Tecnología | Versión |
|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | 16.3.3 |
| **UI** | React | 19.2.8 |
| **Estilos** | TailwindCSS + Typography plugin | v4 |
| **Notificaciones** | Sonner (toast flotantes) | 2.0.8 |
| **Markdown** | react-markdown + remark-gfm | 10.1.0 |
| **ORM** | Prisma Client + adapter-pg | 7.10.0 |
| **Base de Datos** | PostgreSQL (Supabase, multi-schema) | — |
| **Auth** | Supabase Auth + Google OAuth | — |
| **Vault** | Supabase Vault (encriptación de API keys) | — |
| **AI SDK** | Vercel AI SDK | 7.0.83 |
| **Gemini** | `@ai-sdk/google` | 4.0.56 |
| **OpenAI** | `@ai-sdk/openai` | 4.0.50 |
| **Anthropic** | `@ai-sdk/anthropic` | 4.0.44 |
| **Ollama** | `ollama-ai-provider` + `ollama-ai-provider-v2` | 1.2.0 / 4.0.1 |
| **Motor Local** | Python (FastAPI / Uvicorn) | 3.10+ |
| **Validación** | Zod | 4.4.3 |

---

## 🚀 Inicio Rápido (Desarrollo)

### 1. Instalar Dependencias
Asegúrate de utilizar `pnpm`:
```bash
pnpm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env` y rellena las variables de Supabase, Prisma y Google AI:
```bash
cp .env.example .env
```

Variables requeridas:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### 3. Población de Base de Datos (Agentes)
Asegúrate de haber empujado tu esquema y correr el seed para cargar los Agentes:
```bash
pnpm exec prisma db push
node seed_agents.cjs
```

### 4. Iniciar Motores
Debes correr tanto el Motor Local de Python (Puerto 8000) como la Web App (Puerto 3000):

Terminal 1 (Backend Next.js):
```bash
pnpm dev
```

Terminal 2 (Motor Python):
```bash
cd controlador
python -m uvicorn main:app --reload --port 8000
```
