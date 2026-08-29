# 🚀 Documentación de Funciones del Sistema

## 📌 Arquitectura Funcional

AutoProd opera con una **Arquitectura Agéntica Híbrida Multi-Modelo** donde las funciones se ejecutan mediante un catálogo dinámico de agentes almacenados en la base de datos.

---

## 1. 🧠 Protocolo de Interceptación de APIs

El Orquestador Local (Llama via Ollama) comunica sus decisiones al backend mediante un protocolo de strings estructurados en lugar de JSON:

```
[LLAMAR_API: slug_api | arg1: valor1 | arg2: valor2]
```

**Flujo completo:**
1. El usuario envía un mensaje al chat.
2. El backend construye un System Prompt dinámico con el template `orchestrator_base` + catálogo de APIs de la BD.
3. Llama genera una respuesta que puede contener `[LLAMAR_API: ...]`.
4. El backend intercepta el patrón con regex: `/\[LLAMAR_API:\s*([^\]]+)\]/g`.
5. Extrae el `slug` y los argumentos.
6. Busca el slug en la tabla `Agent` de la BD.
7. Si es una **primitiva local** (`apiEndpoint` empieza con `LOCAL:`): ejecuta internamente y re-inyecta el resultado.
8. Si es un **switch cloud**: retorna al frontend para confirmación humana (preview).

---

## 2. 🔧 Herramientas Primitivas (Ejecución Local Silenciosa)

Estas herramientas se ejecutan internamente en el backend sin costo de IA, comunicándose con el Motor Python en puerto 8000:

### `workspace_list` — Listar Workspace
- **Formato:** `[LLAMAR_API: workspace_list]`
- **Función:** Lista recursiva del árbol de archivos y carpetas del proyecto seleccionado (hasta 4 niveles).
- **Endpoint interno:** `GET http://localhost:8000/workspace/?base_path={path}`
- **Respuesta formateada:** Árbol con formato `├──` / `└──` para presentar al modelo.

### `workspace_read` — Leer Archivo
- **Formato:** `[LLAMAR_API: workspace_read | archivo: ruta/relativa.md]`
- **Función:** Lee el contenido de un archivo `.md` o `.txt`. Trunca a 8000 caracteres.
- **Endpoint interno:** `GET http://localhost:8000/workspace/file?path={fullPath}`
- **Seguridad:** Solo permite extensiones `.md` y `.txt`.

### `workspace_write` — Escribir Archivo
- **Formato:** `[LLAMAR_API: workspace_write | archivo: ruta/relativa.md | contenido: texto]`
- **Función:** Guarda o sobrescribe un archivo. Crea el directorio si no existe.
- **Endpoint interno:** `POST http://localhost:8000/workspace/file` con body `{ path, content }`
- **Seguridad:** Solo permite extensiones `.md` y `.txt`.

### `workspace_delete` — Eliminar Archivo
- **Formato:** `[LLAMAR_API: workspace_delete | archivo: ruta/relativa.md]`
- **Función:** Elimina un archivo del proyecto.
- **Endpoint interno:** `DELETE http://localhost:8000/workspace/file?path={fullPath}`
- **Seguridad:** Solo permite extensiones `.md` y `.txt`.

---

## 3. ⚡ Switches Cloud (Agentes Especialistas)

Estos agentes usan modelos cloud premium (Gemini, OpenAI, Anthropic) y se activan por delegación del Orquestador:

### `channel_architect` — Arquitecto de Canales
- **Slug:** `channel_architect`
- **Endpoint:** `/api/agents/channel-creator`
- **Modelo:** Gemini 1.5 Flash (via `@ai-sdk/google`)
- **Flujo:**
  1. Recibe `workspacePath`, `channelName` y opcionalmente `superPrompt` de Llama.
  2. Si hay Súper Prompt, llama a Gemini para generar contenido creativo.
  3. Crea la estructura de carpetas via Motor Python: `Videos/`, `Imagenes/`, `Musica/`, `loop/`, `guion/`, `Prompts/`.
  4. Guarda `ConfigCanal.md` con el contenido generado.

### `gestor_movement` — Gestor Movement
- **Slug:** `gestor_movement`
- **Endpoint:** `/api/agents/movement`
- **Modelo:** Gemini 1.5 Flash con **AI SDK tools nativos**
- **Tools disponibles:**
  - `read_file` — Lee archivo `.md`/`.txt` (máx. 15000 chars).
  - `write_file` — Guarda contenido generado en archivo.
  - `create_folder` — Crea carpeta con subcarpetas.
- **Flujo:**
  1. Recibe un `superPrompt` preparado por Llama.
  2. Gemini ejecuta hasta 5 pasos (`maxSteps: 5`) pudiendo leer, pensar y escribir.
  3. Las tools se comunican con el Motor Python en puerto 8000.
  4. Retorna un resumen de lo ejecutado.

---

## 4. 📋 ContextManager — Inyección de Reglas

Implementado en [`lib/agents/context-manager.ts`](file:///e:/AutoProd/lib/agents/context-manager.ts), este módulo enriquece los prompts con contexto del proyecto:

### Reglas Globales
Lee archivos de la raíz del workspace:
- `PROMPT_OPTIMIZADOR_SEO.md` — Reglas de SEO y formato.
- `PLANTILLA_DESCRIPCIONES.md` — Plantilla de descripciones.

### Reglas de Canal
Lee el archivo `.autoprod_channel.md` dentro de la carpeta del canal:
- Contiene reglas específicas del nicho, tono, público objetivo.
- Se inyectan al System Prompt cuando hay un canal seleccionado.

---

## 5. 📊 Token Usage Tracking

Cada llamada a un provider cloud registra automáticamente el consumo:

| Campo | Descripción |
|---|---|
| `provider` | `gemini`, `openai`, `anthropic` |
| `modelName` | `gemini-3.6-flash`, `gpt-4o`, `claude-3-5-sonnet-20240620` |
| `promptTokens` | Tokens de entrada consumidos |
| `completionTokens` | Tokens de salida generados |
| `totalTokens` | Total (prompt + completion) |
| `userId` | Usuario que hizo la llamada |
| `conversationId` | Conversación asociada (opcional) |

El registro es **fire-and-forget** — no bloquea la respuesta HTTP al usuario.

---

## 6. 🔑 Modelo BYOK Multi-Provider (Bring Your Own Key)

### Providers Soportados

| Provider | Config en `User` | Modelo por Defecto |
|---|---|---|
| Gemini | `geminiVaultId` | `gemini-3.6-flash` |
| OpenAI | `openaiVaultId` | `gpt-4o` |
| Anthropic | `anthropicVaultId` | `claude-3-5-sonnet-20240620` |
| Ollama | N/A (local) | `llama3.1:latest` |

### Flujo de Encriptación
1. Usuario ingresa API Key en `UserSettingsModal`.
2. `/api/settings/keys` encripta la clave en Supabase Vault.
3. Se guarda el `secretId` en el campo Vault del `User`.
4. En cada chat, se desencripta con `supabase.rpc('get_decrypted_secret')`.

### Costo Operativo: $0 USD
- Cada usuario aporta su propia clave/cuota de IA.
- Ollama corre 100% local sin costos.
- El servidor de AutoProd no paga por tokens.

---

## 7. 🗂️ Prompt Templates del Sistema

Templates poblados via [`seed_agents.cjs`](file:///e:/AutoProd/seed_agents.cjs):

| Name | Propósito |
|---|---|
| `orchestrator_base` | SOP del orquestador: reglas absolutas de exploración-primero, prohibición de inventar archivos |
| `tool_injection` | Instrucción inyectada tras resultado de API: evaluar, pedir más contexto o responder |
| `crear_canal` | Template para configurar y planificar un canal de YouTube |
| `crear_video` | Template de planeación de carpetas y metadata de video |
| `crear_guion` | Template para escritura de guiones escena por escena en Markdown |

---

## 8. 🎬 Generador & Renderizador de Videos Local (Planificado)

* **Propósito:** Concatenar pistas de audio, videos de fondo y audio ambiental.
* **Modos de Duración:**
  * Duración Natural (Suma exacta de canciones en `Musica/`).
  * Duración Fija (60 minutos en bucle).
  * Duración Personalizada.
* **Ejecución:** Motor Python Local llamando a FFmpeg nativo.
* **Estado:** Planificado para fases futuras del roadmap.
