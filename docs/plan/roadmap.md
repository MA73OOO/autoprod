# Roadmap: AutoProd Console

Hoja de ruta completa del sistema. Cada fase es un bloque deployable de funcionalidad que amplía el control de AutoProd sobre el flujo de producción de YouTube.

> **Última actualización:** 2026-09-07 — Sincronizado con Master Tracker  
> 📌 Para el seguimiento detallado de funcionalidades hechas, en curso y banco de ideas, consulta la [Matriz Maestra de Funcionalidades & Ideas (Master Tracker)](file:///e:/autoprod/docs/features/README.md).

---

## 📊 Estado de Fases

| Fase | Nombre | Estado |
|---|---|---|
| -2 | Monetización (Lemon Squeezy) | 🔲 Pendiente |
| -1 | `autoprod-setup` (Dependencias del Sistema) | 🔲 Pendiente (parcial: instalación de Ollama implementada) |
| 0 | Wizard Modals de Configuración Rápida | 🔲 Pendiente |
| 0.5 | Configuración de IA y BYOK | ✅ **Completada** — Multi-provider (Gemini, OpenAI, Anthropic, Ollama), Supabase Vault, TokenUsage |
| 1 | API de Workspace Local | ✅ **Completada** — Motor Python puerto 8000, CRUD completo, explorador nativo |
| 2 | Parseador de `config_subida.md` | 🔲 Pendiente |
| 3 | Copilot + Edición Automática (Python) | 🔲 Pendiente |
| 3.5 | Integración YouTube (OAuth + Upload + Stats) | 🔲 Pendiente |
| 3.6 | Subtitulado Automático (Whisper) | 🔲 Pendiente |
| 4 | Calendario de Publicación | 🔲 Pendiente |

### Lo que se construyó más allá del roadmap original

Las siguientes funcionalidades fueron implementadas sin estar explícitamente planificadas en las fases originales:

- **Arquitectura Agéntica Completa**: Tablas `Agent`, `AgentStep`, `AgentTool` con catálogo dinámico de herramientas.
- **Chat Universal Multi-Provider**: `universalChatWithTools()` con soporte para Function Calling nativo de Vercel AI SDK, usando las herramientas inyectadas desde Prisma (`jsonSchema`).
- **Switches Cloud**: Endpoints de agentes especializados (`channel-creator`, `movement`) con AI SDK tools nativos.
- **Token Usage Tracking**: Tabla `TokenUsage` para monitorear consumo por provider/modelo/usuario.
- **Auth Guard Optimizado**: Doble verificación JWT local + fallback Supabase.
- **ContextManager**: Inyección de reglas globales y de canal al System Prompt.
- **11 Componentes de Dashboard**: ChatPanel, ConversationSidebar, Launchpad, FilePreviewer, FileTree, MarkdownEditor, etc.

---

## 📅 Fases de Implementación

### Fase -2: Monetización — Lemon Squeezy (Pagos y Planes)
- **Objetivo:** Habilitar el modelo de negocio desde el día uno. AutoProd se vende como SaaS — los pagos y la gestión de planes van antes de cualquier feature avanzada para que el producto genere ingresos mientras se desarrolla.
- **Plataforma:** [Lemon Squeezy](https://www.lemonsqueezy.com/) — procesador de pagos SaaS-native con manejo de impuestos global, licencias, suscripciones y webhooks. Sin necesidad de Stripe + Tax complejo.
- **Flujo de Checkout:**
  1. Usuario selecciona un plan (FREE / PRO / ENTERPRISE) desde la UI.
  2. Redirige al checkout hosted de Lemon Squeezy (URL con prefill de email).
  3. Lemon Squeezy procesa el pago y dispara un webhook a `/api/payments/webhook`.
  4. El webhook actualiza `UserSubscription.plan` y `UserSubscription.expiresAt` en la BD.
  5. El acceso a features avanzadas se desbloquea en tiempo real.
- **Planes y límites** (ya modelados en `Plan` y `PlanLimit` en la BD):

| Plan         | Precio | Canales    | Videos/mes | Render cloud | Subtitulado |
| --------------| --------| ------------| ------------| --------------| -------------|
| `FREE`       | $0     | 1          | 5          | ✗            | ✗           |
| `PRO`        | $X/mes | Ilimitados | Ilimitados | ✓            | ✓           |
| `ENTERPRISE` | Custom | Ilimitados | Ilimitados | ✓            | ✓ + API     |

- **Endpoints:**
  - `GET /api/payments/checkout` — Genera la URL de checkout de Lemon Squeezy para un plan.
  - `POST /api/payments/webhook` — Recibe y valida eventos de Lemon Squeezy (`subscription_created`, `subscription_updated`, `subscription_cancelled`).
  - `GET /api/payments/portal` — Redirige al portal de gestión de suscripción del usuario (cancelar, cambiar plan, historial).
- **Variables de entorno necesarias:** `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET`.
- **UI:**
  - Página `/pricing` pública con tabla de planes.
  - Badge de plan activo en el dashboard (FREE / PRO).
  - Banner de upgrade cuando el usuario intenta acceder a una feature bloqueada por plan.
  - Botón "Gestionar Suscripción" en Settings → redirige al portal de Lemon Squeezy.

---

### Fase -1: `autoprod-setup` — Paquete Standalone de Dependencias del Sistema
- **Objetivo:** Garantizar que todas las herramientas locales necesarias estén instaladas, en la versión correcta y actualizadas, sin depender del entorno del usuario. Es prerequisito de Fases 1, 2, 3 y 3.6.
- **Dependencias que gestiona:**

  | Herramienta | Uso | Versión mínima |
  |---|---|---|
  | Python | Scripts de compilación y automatización | 3.10+ |
  | FFmpeg | Compilación de audio/video | 6.x |
  | yt-dlp | Descarga de referencias de YouTube | Latest |
  | Whisper (OpenAI) | Subtitulado automático gratuito local | Latest |
  | Pillow / moviepy | Miniaturas y edición de video | Última estable |

- **Módulo:** `harness/setup/` con `detector.ts`, `downloader.ts`, `installer.ts`, `manifest.json`.
- **Endpoints:**
  - `GET /api/setup/status` — Estado de cada dependencia (`installed`, `outdated`, `missing`).
  - `POST /api/setup/install` — Lanza instalación/actualización.
  - `GET /api/setup/stream` — Progreso en tiempo real via SSE.
- **UI:** Panel en Settings con tabla de estado, botón "Actualizar todo" y log en vivo. Badge `⚡ Sistema listo` / `⚠️ Actualización disponible` en el dashboard.

---

### Fase 0: Asistentes de Configuración Rápida (Wizard Modals)
- **Objetivo:** Flujo de configuración guiado paso a paso al crear Canal, Video o Guion, antes de entrar al chat libre.
- **Wizards:**
  - **Crear Canal:** Temática/nicho, público objetivo, propuestas de nombre.
  - **Crear Video:** Selección de canal (desde BD), título tentativo, enfoque, referencias musicales.
  - **Crear Guion:** Temática, tono del narrador, duración estimada.
- **Resultado:** Las respuestas se concatenan al `systemPrompt` maestro antes de crear la conversación. El mensaje de bienvenida de la IA confirma el contexto absorbido.

---

### ✅ Fase 0.5: Configuración de IA y BYOK — COMPLETADA
- **Objetivo:** $0 USD en costos de servidor — cada usuario usa su propia cuota de IA.
- **Implementado:**
  - **Multi-Provider BYOK:** Soporte para Gemini (`@ai-sdk/google`), OpenAI (`@ai-sdk/openai`), Anthropic (`@ai-sdk/anthropic`), y Ollama (local, gratuito).
  - **Supabase Vault:** API Keys encriptadas en Vault con desencriptación en runtime via RPC. Campos: `geminiVaultId`, `openaiVaultId`, `anthropicVaultId` en modelo `User`.
  - **UI de Configuración:** `UserSettingsModal` con detección de CLI local, gestión de keys por provider.
  - **Modelos por defecto:** `gemini-3.6-flash`, `gpt-4o`, `claude-3-5-sonnet-20240620`, `llama3.1:latest`.
  - **Token Usage Tracking:** Tabla `TokenUsage` registra consumo por provider/modelo/usuario.

---

### ✅ Fase 1: API de Workspace Local — COMPLETADA
- **Objetivo:** AutoProd lee y escribe directamente en el sistema de archivos local.
- **Implementado:**
  - **Motor Python (FastAPI)** corriendo en `localhost:8000` con 3 routers: `workspace.py`, `chat.py`, `ollama_manager.py`.
  - **Selector de workspace nativo:** Abre explorador de archivos del SO (PowerShell/osascript) via `GET /workspace/pick`.
  - **CRUD completo:** Listar (`GET /workspace/`), crear carpetas (`POST /workspace/create`), leer archivos (`GET /workspace/file`), escribir (`POST /workspace/file`), eliminar (`DELETE /workspace/file`).
  - **Seguridad:** Solo archivos `.md` y `.txt` permitidos.
  - **Límite de profundidad:** Árbol recursivo hasta 4 niveles.

---

### Fase 2: Parseador y Editor de `config_subida.md`
- **Objetivo:** Leer, renderizar en el Inspector del dashboard y reescribir el archivo de metadatos de subida.
- **Flujo:**
  1. Backend lee `config_subida.md` → extrae título, descripción, tags, privacidad.
  2. Se renderiza en el panel derecho (Inspector) con campos editables.
  3. Al guardar (o al optimizar con Gemini), se regenera y reescribe el `.md` en el FS local.

---

### Fase 3: Copilot Integrado + Edición Automática (Python)
- **Objetivo:** Gemini como copilot de decisiones + scripts Python para compilación local.
- **Copilot:** Propone nuevas miniaturas, ajusta temáticas lofi y guiones basándose en métricas del canal.
- **Scripts Python:** Automatización de copia de música, compilación de audio/video y miniaturas, leyendo rutas del workspace.

---

### Fase 3.5: Integración YouTube Completa (OAuth + Upload + Stats)
- **Objetivo:** Cerrar el loop de producción — subir el video a YouTube directamente desde AutoProd.

#### OAuth de YouTube
- Flujo: `Conectar Canal de YouTube` → Google OAuth Consent Screen con scopes `youtube.upload`, `youtube.readonly`, `youtube.force-ssl`.
- Tokens (`access_token` + `refresh_token`) se guardan en `Channel.accessToken` / `Channel.refreshToken` (campos ya existentes en BD).
- Renovación automática del `access_token` cuando expire.
- **Endpoints:** `GET /api/youtube/auth`, `GET /api/youtube/callback`, `POST /api/youtube/refresh`.

> ⚠️ **Atención Técnica — Sincronización de cuotas OAuth:** Centraliza la renovación de tokens en `GET /api/youtube/refresh` usando el `refreshToken` guardado en la tabla `Channel`. Evita renovaciones duplicadas o race conditions ejecutando el refresh de forma atómica (ej. con un lock optimista en BD o un mutex en memoria) para prevenir rechazos `401` en subidas desatendidas del cron.

#### Subida de Videos
- El Inspector del video expone el botón **"Subir a YouTube"**.
- El sistema lee `config_subida.md` (Fase 2) para título, descripción, tags y privacidad.
- Sube el archivo desde `E:\Youtube\...\Resultado\` via YouTube Data API v3 (resumable upload).
- Actualiza `Video.status → UPLOADED`, guarda `youtubeVideoId` y `youtubeUrl` en BD.
- **Endpoints:** `POST /api/youtube/upload`, `GET /api/youtube/upload/[id]/stream` (SSE de progreso).

> ⚠️ **Atención Técnica — Resumable Uploads:** Al iniciar la subida, YouTube devuelve un `upload_uri` único y de duración limitada. Este URI debe persistirse en la BD (campo `Video.uploadUri String?`) inmediatamente tras la respuesta inicial. Si la subida se interrumpe (caída de red, reinicio del servidor), el worker puede reanudarla con un `PUT` al mismo `upload_uri` enviando el `Content-Range` correcto, sin reiniciar la transferencia del archivo completo.

#### Stats para el Copilot
- `GET /api/youtube/channel/stats` — Consulta YouTube Analytics API: views, retención, CTR de miniatura, subs ganados.
- Datos alimentan al Copilot (Fase 3) para propuestas de contenido.

#### Campos BD adicionales en `Video`
```prisma
youtubeVideoId  String?
youtubeUrl      String?
publishedAt     DateTime?
```

---

### Fase 3.6: Subtitulado Automático con Whisper (OpenAI — Gratuito Local)
- **Objetivo:** Generar subtítulos precisos, sincronizados y con marca de tiempo a nivel de palabra, corriendo Whisper localmente sin costo. Disponible solo en plan PRO+.
- **Herramienta:** [Whisper](https://github.com/openai/whisper) — modelo de reconocimiento de voz de OpenAI, gratuito y de ejecución local. Se instala via `autoprod-setup` (Fase -1).

#### Pipeline de Procesamiento

```
Video → FFmpeg (extraer audio) → VAD → Segmentos → Whisper → Timestamps → SRT/VTT → Timeline
```

**Paso 1 — Extracción de audio (FFmpeg):**
- Extrae el canal de audio del video en formato `.wav` (16kHz mono) optimizado para Whisper.

**Paso 2 — VAD: Detección de Actividad de Voz (Voice Activity Detection):**
- Herramienta: **Silero VAD** (PyTorch, gratuito) — detecta con precisión los segmentos donde hay voz y los que son silencio/música/ruido.
- Beneficios: evita pasar silencio largo a Whisper (acelera hasta 3x el proceso), reduce alucinaciones del modelo en partes sin voz.
- Output: lista de segmentos `[{start_ms, end_ms}]` con voz confirmada.
- Umbral configurable de sensibilidad VAD desde la UI.

**Paso 3 — Transcripción con timestamps a nivel de palabra (Whisper):**
- Se usa `whisper` con `--word_timestamps True` para obtener el timestamp exacto de inicio y fin de **cada palabra**.
- Output raw: JSON con `segments[]`, cada segmento tiene `words[]` → `{word, start, end, probability}`.
- Solo se procesan los segmentos detectados por VAD (no el audio completo).

**Paso 4 — Generación de línea de tiempo y archivos:**
- Los segmentos de palabras se agrupan en líneas de subtítulo respetando:
  - Máx. caracteres por línea (configurable, default: 42).
  - Máx. duración por cue (configurable, default: 7s).
  - Pausa natural entre frases detectada por VAD.
- Se generan: `.srt` (estándar), `.vtt` (YouTube/web), `.json` (timeline interno con timestamps por palabra).
- Los archivos se guardan en `E:\Youtube\...\Subtitulos\`.

**Paso 5 — Quemado o adjunto:**
- FFmpeg incrusta los subs como track soft (seleccionable) o los quema hard (permanentes) al video.
- Al subir a YouTube (Fase 3.5), los subs `.vtt` se adjuntan automáticamente como caption track.

#### Modelos disponibles (tradeoff velocidad/precisión)

| Modelo | VRAM | Velocidad | Precisión | Recomendado para |
|---|---|---|---|---|
| `tiny` | ~1 GB | Muy rápido | Básica | Pruebas rápidas |
| `base` | ~1 GB | Rápido | Buena | Videos cortos |
| `small` | ~2 GB | Moderado | Muy buena | Uso general |
| `medium` | ~5 GB | Lento | Excelente | Producción |
| `large-v3` | ~10 GB | Muy lento | Máxima | Máxima calidad |

#### UI: Editor de Timeline de Subtítulos
- **Timeline visual:** barra horizontal que muestra los segmentos VAD (verde = voz, gris = silencio) y los cues de subtítulo con su duración.
- **Editor de cues:** tabla editable donde cada fila es un cue con `inicio`, `fin`, `texto`. Se puede arrastrar para reposicionar.
- **Marcas de tiempo por palabra:** al hacer click en una palabra del texto, se resalta su posición exacta en la timeline.
- **Controles:** selector de modelo, umbral VAD, chars/línea, modo de quemado (soft/hard), idioma destino.
- **Preview:** reproductor de video con los subtítulos superpuestos en tiempo real antes de quemar.

#### Endpoints
- `POST /api/subtitles/generate` — Lanza el pipeline completo (VAD → Whisper → Timeline).
- `GET /api/subtitles/[id]/stream` — Progreso en tiempo real via SSE (% VAD, % Whisper, % export).
- `GET /api/subtitles/[id]` — Devuelve el `.srt`, `.vtt` o `.json` de timeline.
- `PATCH /api/subtitles/[id]` — Guarda ediciones manuales del timeline desde el editor.
- `POST /api/subtitles/[id]/burn` — Lanza el quemado final con FFmpeg.

> ⚠️ **Atención Técnica — Concurrencia Whisper + FFmpeg:** Ejecutar Whisper `medium` o `large-v3` junto con un render activo de FFmpeg puede saturar la VRAM en GPUs de gama media. Implementar un semáforo/cola en el backend local (ej. `asyncio.Semaphore(1)` en el worker Python, o una tabla `ProcessingLock` en BD) que impida procesar transcripciones y renders de video de forma simultánea. La UI debe reflejar el estado de espera con un mensaje claro: *"Render en progreso — subtitulado en cola"*.

---

### Fase 4: Calendario de Publicación y Automatización de Subidas
- **Objetivo:** Que el usuario programe la subida de videos a YouTube con fecha y hora específica, automatizando el ciclo completo de publicación. Requiere Fase 3.5 (YouTube OAuth + Upload) completada.
- **Flujo:**
  1. Desde el Inspector del video, el usuario activa **"Programar Subida"**.
  2. Selecciona fecha, hora y zona horaria desde un date-picker integrado.
  3. AutoProd guarda el job programado en BD (`ScheduledUpload`) y lo encola.
  4. En la fecha y hora indicada, el worker lanza automáticamente el flujo de upload a YouTube (Fase 3.5), incluyendo título, descripción, tags y subs `.vtt` si están disponibles.
  5. Tras la subida, actualiza `Video.status → UPLOADED` y notifica al usuario.
- **Calendario visual:**
  - Vista de calendario mensual en el dashboard (`/dashboard/calendar`) que muestra los videos programados por fecha.
  - Drag & drop para reprogramar una subida arrastrando el video a otro día.
  - Indicador de color por estado: `PENDIENTE` (azul), `SUBIENDO` (amarillo), `PUBLICADO` (verde), `ERROR` (rojo).
  - Vista de lista semanal alternativa con hora exacta por item.
- **Recurrencia (opcional, plan PRO):**
  - Opción de definir un ritmo de publicación automático (ej: "un video cada martes a las 18:00").
  - AutoProd selecciona el siguiente video en estado `COMPLETED` de la cola y lo programa automáticamente.
- **Modelo BD nuevo:**
  ```prisma
  model ScheduledUpload {
    id          String   @id @default(uuid())
    videoId     String   @unique
    video       Video    @relation(fields: [videoId], references: [id])
    scheduledAt DateTime
    timezone    String   @default("UTC")
    status      ScheduleStatus @default(PENDING)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }

  enum ScheduleStatus {
    PENDING
    UPLOADING
    DONE
    FAILED
  }
  ```
- **Endpoints:**
  - `POST /api/schedule` — Crea o actualiza un job programado para un video.
  - `GET /api/schedule` — Lista todos los jobs del usuario con su estado.
  - `DELETE /api/schedule/[id]` — Cancela un job pendiente.
  - `GET /api/schedule/calendar` — Devuelve los jobs agrupados por fecha para la vista de calendario.
- **Worker:** Job runner usando `node-cron` o un cron de Vercel (Cron Jobs) que revisa cada minuto los jobs en estado `PENDING` con `scheduledAt <= now()` y ejecuta la subida.

