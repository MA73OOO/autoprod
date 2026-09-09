# ⚙️ Ficha Técnica: Text-to-Speech Multi-Motor (Edge-TTS & OpenAI TTS)

> **Ruta:** `docs/features/text_to_speech/ficha_tecnica.md`  
> **Estado:** `✅ HECHO` (En producción / Operativo)  
> **Capa Técnica:** Next.js API Routes + Motor Local FastAPI (8000) + Microsoft Edge-TTS + OpenAI TTS (`tts-1`) + Supabase Vault + Prisma Wallet

---

## 🛠️ 1. Arquitectura de Generación y Gobernanza de Costos

```mermaid
flowchart TD
    A[Usuario / Orquestador Agéntico] --> B[app/api/tools/generar_locucion]
    B -->|Elección de Proveedor| C{¿Qué motor usar?}
    
    C -->|edge_tts: $0 Gratis Local| D[Sin deducción de créditos]
    D --> E[FastAPI: POST /tts/generate]
    
    C -->|openai: TTS-1| F{¿Tiene OpenAI Key en Vault?}
    F -->|Sí: BYOK Propia| G[Deducción: 0 créditos de plataforma]
    F -->|No: Llave de la plataforma| H[Deducción: 1 crédito / 1,000 chars vía db.$transaction]
    G & H --> E
    
    E -->|Edge-TTS async stream / OpenAI API| I[Archivo MP3 generado]
    I --> J[Guardado en Disco Local: {Canal}/{Video}/Ambiente/locucion_{voz}.mp3]
    J --> K[Retorno de metadata + Duración + Conexión directa a Subtítulos Faster-Whisper]
```

---

## 🔌 2. Endpoints de la API & Motor Local

### A. Motor Local (`controlador/routers/tts.py` en `localhost:8000`)

| Endpoint | Método | Parámetros Clave | Descripción |
|---|:---:|---|---|
| `/tts/voices` | `GET` | N/A | Lista las voces disponibles agrupadas por motor (`edge_tts` con soporte multilingüe y neural, `openai` con alloy, echo, fable, onyx, nova, shimmer). |
| `/tts/preview` | `POST` | `{ provider, voice, text, openai_api_key? }` | Genera una muestra de audio corta en memoria y la retorna en Base64 para preescucha en vivo en la UI. |
| `/tts/generate` | `POST` | `{ text, voice, provider, output_path, speed?, pitch?, openai_api_key? }` | Renderiza la locución completa y la guarda directamente en la ruta especificada en disco. |

### B. Herramienta del Orquestador Agéntico (`app/api/tools/generar_locucion/route.ts`)

| Endpoint | Método | Parámetros Clave | Descripción |
|---|:---:|---|---|
| `/api/tools/generar_locucion` | `POST` | `{ text, voice, provider?, channelName, videoTitle?, filename?, speed? }` | Tool invocable por el cerebro agéntico (`orchestrator`) o la UI. Resuelve BYOK desde Supabase Vault, audita y descuenta créditos si aplica, y delega al motor local. |

---

## 💰 3. Modelo Económico y Reglas de Créditos

- **🟢 Motor Edge-TTS (`provider: 'edge_tts'`):**
  - **Costo:** **0 Créditos (100% Gratuito e Ilimitado)**.
  - **Ejecución:** Local vía streaming seguro de Microsoft Edge Neural Voices. No requiere API key ni tarjeta de crédito.
- **🟡 Motor OpenAI TTS (`provider: 'openai'`):**
  - **BYOK (Bring Your Own Key):** Si el usuario tiene su propia API Key de OpenAI configurada en Supabase Vault, consume **0 créditos de plataforma** (AutoProd no cobra margen sobre su clave).
  - **Créditos de Plataforma:** Si utiliza el cupo del sistema, descuenta **1 crédito por cada 1,000 caracteres** (mínimo 1 crédito) con registro contable inmutable en `CreditConsumption` y transacción atómica en `Wallet`.

---

## 📂 4. Archivos Involucrados

- [`controlador/routers/tts.py`](file:///e:/autoprod/controlador/routers/tts.py): Router de FastAPI con implementaciones nativas de Edge-TTS y OpenAI TTS.
- [`controlador/main.py`](file:///e:/autoprod/controlador/main.py): Registro del router `/tts` en el motor local.
- [`controlador/requirements.txt`](file:///e:/autoprod/controlador/requirements.txt): Inclusión de `edge-tts>=6.1.12`.
- [`app/api/tools/generar_locucion/route.ts`](file:///e:/autoprod/app/api/tools/generar_locucion/route.ts): Tool oficial del Orquestador Agéntico en cumplimiento con `AGENTS.md`.
- [`migrations/005_text_to_speech_tool_and_prompts.sql`](file:///e:/autoprod/migrations/005_text_to_speech_tool_and_prompts.sql): Registro idempotente de la Tool y PromptTemplate `crear_locucion`.
- [`lib/controlador-client.ts`](file:///e:/autoprod/lib/controlador-client.ts): Métodos de cliente TypeScript `getTTSVoices`, `previewTTS`, `generateTTS`.
- [`components/dashboard/TextToSpeechStudio.tsx`](file:///e:/autoprod/components/dashboard/TextToSpeechStudio.tsx): Estudio interactivo de locución con editor, preescucha en vivo y botón de puente hacia el subtitulador.
- [`components/dashboard/ConversationSidebar.tsx`](file:///e:/autoprod/components/dashboard/ConversationSidebar.tsx) & [`components/dashboard/Launchpad.tsx`](file:///e:/autoprod/components/dashboard/Launchpad.tsx): Puntos de entrada en la interfaz de usuario.
- [`app/dashboard/page.tsx`](file:///e:/autoprod/app/dashboard/page.tsx): Integración de navegación en el centro de control del dashboard.
