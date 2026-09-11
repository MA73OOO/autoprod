# ⚙️ Ficha Técnica: AI Video Studio & B-Roll Auto-Finder

> **Ruta:** `docs/features/ai_video_and_broll/ficha_tecnica.md`  
> **Estado:** `💡 EN DISEÑO TÉCNICO`  
> **Capa Técnica:** Next.js UI + FastAPI Motor Local (`localhost:8000`) + Pexels/Pixabay APIs + Video AI Providers (Luma/Runway/Kling) + FFmpeg

---

## 🛠️ 1. Pipeline de B-Roll y Generación de Video

```mermaid
flowchart TD
    A[Guion / Prompt de Escena] --> B{¿Tipo de Recurso?}
    
    B -->|B-Roll de Stock Libre| C[FastAPI: POST /video/fetch_stock_broll]
    C -->|Búsqueda en Pexels / Pixabay API| D[Stream de descarga asíncrona]
    
    B -->|Video Sintético IA| E[app/api/video/generate_ai_clip]
    E -->|Provider API: Luma / Runway / Kling| F[Generación remota MP4]
    F -->|Descarga vía Motor Local| D
    
    D --> G[Guardado Físico: {Canal}/{Video}/Videos/clip_{id}.mp4]
    G --> H[FFmpeg probe: Detección de resolución y FPS]
    H --> I[Carga automática en Video Looper Studio Timeline]
```

---

## 🔌 2. Especificación de Endpoints Propuestos

### A. Motor Local (FastAPI `localhost:8000`)

| Endpoint | Método | Parámetros Clave | Descripción |
|---|:---:|---|---|
| `/video/stock_search` | `GET` | `query, orientation (landscape/portrait), limit` | Busca clips de stock en alta definición y retorna lista con thumbnails de previsualización. |
| `/video/stock_download` | `POST` | `{ download_url, output_folder, filename }` | Descarga el archivo de video en segundo plano directamente a la carpeta `Videos/` del proyecto. |

### B. Capa Next.js / Cerebro Agéntico

| Endpoint | Método | Parámetros Clave | Descripción |
|---|:---:|---|---|
| `/api/tools/buscar_broll` | `POST` | `{ keywords, channelName, videoTitle, orientation }` | Tool del Orquestador para extraer B-roll automático basado en los bloques del guion. |
| `/api/video/generate` | `POST` | `{ prompt, image_ref?, provider, duration, aspectRatio }` | Invoca el motor de video generativo configurado y delega la descarga al motor local. |

---

## 🎛️ 3. Parámetros de Video & Normalización
- **Formatos soportados:** `.mp4` (H.264 / HEVC), `.mov`, `.webm`.
- **Relaciones de Aspecto:** Horizontal 16:9 (`1920x1080`, `3840x2160`) y Vertical 9:16 (`1080x1920`).
- **Post-Procesamiento:** Inyección directa a `VideoLooperStudio.tsx` para concatenación multiclip o bucle continuo.
