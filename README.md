# 🚀 AutoProd — Plataforma Agéntica de Producción de Video

**AutoProd** es una plataforma web progresiva (PWA) de nivel profesional diseñada para automatizar la producción de video, optimizar contenido SEO y crear proyectos completos para canales de YouTube mediante una orquestación inteligente de IA.

El núcleo del proyecto está diseñado bajo una **Arquitectura Agéntica Híbrida Multi-Modelo** altamente refinada, pensada para garantizar la máxima eficiencia operativa y minimizar los costos de IA, delegando responsabilidades según la especialidad de cada componente:

### 1. El Orquestador Central 🧠
- Actúa como el "Director de Orquesta" y coordina la ejecución de herramientas según el contexto del usuario.
- Lee un catálogo dinámico de herramientas y SOPs directamente desde la base de datos.
- Su trabajo es decidir qué herramienta usar basándose en el contexto del chat.

### 2. El Motor Local (Python en Puerto 8000) ⚙️
- Este es el **trabajador pesado (Heavy Lifter)** de la arquitectura.
- Opera directamente en la máquina del usuario (PC) por razones de seguridad, velocidad y privacidad.
- Se encarga de explorar el workspace (`workspace`), procesar videos (`video_looper`) y transcribir con Faster-Whisper local (`subtitles`).
- La seguridad es estricta: protege el entorno de ejecución de inyecciones de código.
- **Routers**: `workspace.py` (CRUD de archivos), `video_looper.py` (render de video), `subtitles.py` (Faster-Whisper), `chat.py` (chat local).

### 3. Los Agentes Especialistas (Switches Cloud) ⚡
- Modelos avanzados que se invocan cuando la tarea requiere redacción creativa extensa.
- **Multi-Provider**: Soporta **Gemini** (`@ai-sdk/google`), **OpenAI/GPT-4o** (`@ai-sdk/openai`), y **Anthropic/Claude** (`@ai-sdk/anthropic`) via AI SDK v7.

### 4. Catálogo Dinámico en Base de Datos (Prisma/Supabase) 🗄️
- Cero *hardcoding*. Las funciones y directivas operativas viven en la base de datos.
- Las API Keys de los providers se almacenan cifradas en **Supabase Vault** y se desencriptan en runtime via RPC.

### 5. Tracking de Consumo de Tokens 📊
- La tabla `TokenUsage` registra cada llamada a un modelo: provider, modelo, promptTokens, completionTokens, totalTokens.
- Asociado al usuario y a la conversación para monitorear costos.

---

## 📂 Estructura del Proyecto

```text
AutoProd/
├── app/                          <-- Aplicación Next.js (App Router)
│   ├── api/                      <-- API Routes (Cloud Backend)
│   │   ├── auth/                 <-- Autenticación (sync, callback, me-role)
│   │   ├── channels/             <-- CRUD de Canales de YouTube
│   │   ├── chat/                 <-- Chat Orquestador Central + Tool Loop
│   │   ├── conversations/        <-- CRUD de Conversaciones y Mensajes
│   │   ├── prompts/              <-- Plantillas de Prompts
│   │   ├── settings/keys/        <-- Gestión de API Keys (Supabase Vault)
│   │   └── setup/                <-- Instalación y estado del motor local
│   ├── dashboard/                <-- Dashboard principal (paneles IDE)
│   ├── login/                    <-- Autenticación Google OAuth
│   └── page.tsx                  <-- Landing Page bilingüe (ES/EN)
├── components/                   <-- Componentes React reutilizables
│   ├── auth/                     <-- GoogleLoginButton
│   └── dashboard/                <-- Componentes del dashboard
│       ├── ChatPanel.tsx         <-- Panel de chat multi-provider
│       ├── ConversationSidebar.tsx
│       ├── FilePreviewer.tsx     <-- Vista previa de archivos
│       ├── FileTree.tsx          <-- Árbol de archivos del workspace
│       ├── Launchpad.tsx         <-- Tarjetas de inicio rápido
│       ├── MarkdownEditor.tsx    <-- Editor de Markdown
│       ├── RightInspector.tsx    <-- Panel inspector derecho
│       ├── UserSettingsModal.tsx <-- Modal de configuración
│       └── WorkspaceModal.tsx    <-- Selector de workspace
├── controlador/                  <-- Motor Python Local (FastAPI, Puerto 8000)
│   ├── main.py                   <-- Servidor FastAPI con CORS
│   └── routers/
│       ├── workspace.py          <-- CRUD de archivos y carpetas
│       ├── video_looper.py       <-- Renderizado de videos
│       ├── subtitles.py          <-- Subtitulado local Faster-Whisper
│       └── chat.py               <-- Chat local
├── lib/                          <-- Utilidades compartidas del backend
│   ├── auth.ts                   <-- Auth guard (JWT + Supabase fallback)
│   ├── controlador-client.ts    <-- Cliente HTTP para el Motor Python
│   └── supabase/                 <-- Clientes Supabase (server/client)
├── prisma/
│   └── schema.prisma             <-- Esquema de BD (multi-schema)
└── docs/                         <-- Documentación técnica
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
| **Motor Local** | Python (FastAPI / Uvicorn) | 3.10+ |
| **Transcripción Local** | Faster-Whisper (CTranslate2) | 1.0+ |
| **Validación** | Zod | 4.4.3 |
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
