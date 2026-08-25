# Estado del Proyecto - AutoProd Console

Último commit: `92c5aac` — rama `master` sincronizada con `origin/master`, working tree limpio.

---

## 1. Base de Datos (PostgreSQL + Prisma 8 / Prisma Next)

El contrato [`contract.prisma`](file:///e:/autoprod/src/prisma/contract.prisma) está completamente definido y sincronizado en **Supabase**. Todos los modelos, enums y restricciones se encuentran aplicados en PostgreSQL.

### Enums globales

| Enum | Valores | Tipo PG |
|---|---|---|
| `Role` | `USER`, `ADMIN` | `pg/text@1` |
| `MessageSender` | `USER`, `GEMINI` | `pg/text@1` |

### Modelos en el namespace `public` (11 modelos)

| Modelo             | Descripción                                                                                      |
| --------------------| --------------------------------------------------------------------------------------------------|
| `User`             | Usuario base con UUID compatible con Supabase Auth. Lleva rol, suscripción, settings y API Keys. |
| `Language`         | Catálogo dinámico de idiomas (`es`, `en`, `pt`, `fr`).                                           |
| `UserSettings`     | Idioma (relacional), tema (`dark`/`light`), notificaciones, resolución de render por defecto.    |
| `ApiKey`           | Llaves de IA por proveedor (`GOOGLE`, `OPENAI`, `ANTHROPIC`). Unique por `[userId, provider]`.   |
| `UserSubscription` | Plan activo del usuario con fecha de vencimiento.                                                |
| `Plan`             | Planes (`FREE`, `PRO`, `ENTERPRISE`) con Stripe Price ID.                                        |
| `PlanLimit`        | Límites por plan: canales, videos, render en la nube, minutos mensuales, templates avanzados.    |
| `Channel`          | Canal de YouTube. Soporta integración OAuth (`youtubeChannelId`, `accessToken`, `refreshToken`). |
| `Video`            | Video dentro de un canal. Status: `DRAFT`, `RENDERING`, `COMPLETED`, `UPLOADED`.                 |
| `Conversation`     | Chat vinculable opcionalmente a un `Channel` o `Video`. Incluye `systemPrompt` maestro.          |
| `Message`          | Mensaje dentro de una conversación. Sender: `USER` o `GEMINI`.                                   |
| `PromptTemplate`   | Plantillas maestras para los asistentes (`crear_canal`, `crear_video`, `crear_guion`).           |

---

## 2. Capa de Servidor (API Routes — Next.js App Router)

Todas las rutas en [`app/api/`](file:///e:/autoprod/app/api) están protegidas con verificación de sesión via Supabase SSR (`@/lib/supabase/server`).

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/auth/sync` | `POST` | Sincroniza el usuario de Supabase Auth con la tabla `User` de PostgreSQL. |
| `/api/prompts` | `GET` | Lista plantillas de prompt. **Auto-seeding:** si la tabla está vacía, inserta los 3 prompts por defecto en caliente. |
| `/api/conversations` | `GET` | Lista conversaciones del usuario ordenadas por `updatedAt` desc, incluyendo sus mensajes. |
| `/api/conversations` | `POST` | Crea conversación con `title`, `systemPrompt`, `welcomeText`, `channelId?`, `videoId?`. Crea automáticamente el mensaje de bienvenida de `GEMINI`. |
| `/api/channels` | `GET` | Lista canales del usuario incluyendo sus videos (`include('videos')`). |

> **Patrón Lazy Sync de Usuario:** Las rutas `/api/conversations` y `/api/channels` verifican si el `User` existe en PostgreSQL antes de operar. Si fue eliminado (p.ej., al limpiar el esquema), lo re-crea automáticamente desde la sesión de Supabase Auth.

---

## 3. Frontend

### Landing Page — [`app/page.tsx`](file:///e:/autoprod/app/page.tsx)
- Página pública de marketing con diseño oscuro (gradientes púrpura/índigo).
- Secciones: Hero, Features Grid (3 tarjetas), How It Works (3 pasos), Footer.
- **Bilingüe ES/EN** con selector persistido en `localStorage` via [`app/translations.ts`](file:///e:/autoprod/app/translations.ts).
- CTA principal redirige a `/login`.

### Dashboard — [`app/dashboard/page.tsx`](file:///e:/autoprod/app/dashboard/page.tsx)
Componente `'use client'` de ~1000 líneas. Capacidades implementadas:

- **Autenticación:** Carga sesión en mount, ejecuta `POST /api/auth/sync`, muestra perfil. Logout con toast de `sonner`.
- **Paneles redimensionables:** Panel izquierdo (256px default, rango 180–450px) y panel derecho (320px default, rango 240–500px) con drag handlers nativos.
- **Vistas:** Alterna entre `'home'` (Launchpad) y `'chat'` (interfaz de chat).
- **Carga de datos en mount:** Fetcha prompts, canales+videos y conversaciones. Si no hay conversaciones, auto-crea una inicial.
- **Launchpad dinámico:** Botones "Crear Canal 📺", "Crear Video 🎬" y "Crear Guion 📄" buscan la `PromptTemplate` en BD y crean la conversación con `systemPrompt` y `welcomeText` personalizados.
- **Modal de Settings:** Componente `UserSettingsModal` (`@/components/dashboard/UserSettingsModal`).
- **Render Simulator:** Estado local de progreso de render (`isRendering`, `renderProgress`).
- **Checklist de prompt interceptor:** Estado para `cta`, `timestamps`, `tags`, `saveThumbnail`.
- **Bilingüe:** Mismo sistema de `translations.ts` que la landing.

### Login — [`app/login/`](file:///e:/autoprod/app/login)
Autenticación Google OAuth via Supabase Auth.

---

## 4. Infraestructura

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| Auth | Supabase Auth + Google OAuth |
| Base de datos | PostgreSQL via Supabase |
| ORM | Prisma 8 (Prisma Next) — `db.orm.public.*` |
| Despliegue | Vercel |
| Notificaciones UI | `sonner` |

---

## 5. Roadmap — Próximas Fases

### 🔲 Fase 0 — Wizard Modals de Configuración Rápida ← **SIGUIENTE**
Al pulsar las tarjetas del Launchpad, abrir un modal de asistente paso a paso en lugar de ir directo al chat libre:
- **Crear Canal Wizard:** Temática, público objetivo, nombres propuestos.
- **Crear Video Wizard:** Selección de canal existente (desde BD), título, enfoque, referencias.
- **Crear Guion Wizard:** Temática, tono del narrador, duración estimada.
- Las respuestas se concatenan al `systemPrompt` maestro antes de crear la conversación.

### 🔲 Fase 0.5 — Configuración de IA y BYOK
- Flujo híbrido: Google One AI Premium (OAuth) o API Key manual (Google AI Studio).
- Persistencia en `localStorage` y tabla `ApiKey` en Supabase.
- Selector de modelo: `gemini-2.5-flash`, `gemini-2.5-pro`, `imagen-3.0-generate-002`.

### 🔲 Fase 1 — API de Workspace Local (`E:\Youtube`)
- `GET /api/workspace`: lista canales/videos leyendo el sistema de archivos local.
- `POST /api/workspace/init`: inicializa estructura de carpetas para un nuevo video/canal.

### 🔲 Fase 2 — Parseador de `config_subida.md`
- Leer, renderizar en el panel derecho del dashboard y reescribir el archivo de metadatos de subida a YouTube.

### 🔲 Fase 3 — Copilot Integrado + Estadísticas + Edición Automática (Python)
- YouTube Data API para métricas de canal.
- Scripts Python locales para compilación de audio/video y miniaturas.
