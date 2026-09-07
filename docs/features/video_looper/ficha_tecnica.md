# ⚙️ Ficha Técnica: Video Looper Studio

> **Ruta:** `docs/features/video_looper/ficha_tecnica.md`  
> **Estado:** `✅ HECHO` (En producción / Operativo)  
> **Capa Técnica:** FastAPI (Python 8000) + FFmpeg + Moviepy + React (Next.js)

---

## 🛠️ 1. Arquitectura y Pipeline de Ejecución

```mermaid
flowchart TD
    A[FileTree Drag & Drop] --> B[VideoLooperStudio.tsx]
    B -->|POST /video/scan_audio_folder| C[FastAPI: Escaneo de Pistas]
    B -->|POST /video/inspect_media| D[FastAPI: ffprobe de Clips]
    B -->|POST /video/create_loop| E[Motor FFmpeg Local]
    E -->|Concat Demuxer + Filtros Anti-Pixelado| F[Generación .mp4]
    F -->|GET /video/preview/{job_id}| G[Reproductor HTML5 5 min]
    F -->|Exportación Completa| H[Workspace Local /Videos]
```

---

## 🔌 2. Endpoints y Métodos de la API Local (FastAPI `localhost:8000`)

| Endpoint | Método | Parámetros Clave | Descripción |
|---|:---:|---|---|
| `/video/inspect_media` | `POST` | `{ file_path: string }` | Ejecuta `ffprobe` para extraer resolución, FPS, duración exacta y códec. |
| `/video/scan_audio_folder` | `POST` | `{ folder_path: string }` | Escanea recursivamente archivos de audio, suma duraciones y devuelve tiempo formateado `HH:MM:SS`. |
| `/video/create_loop` | `POST` | `{ video_files, audio_folder, duration, resolution, is_preview }` | Construye archivos concat, aplica filtros FFmpeg y genera el archivo resultante. |
| `/video/preview/{job_id}` | `GET` | `job_id` en path | Emite el stream de video resultante mediante `FileResponse` para el `<video>` HTML5. |
| `/video/job_status/{job_id}` | `GET` | `job_id` en path | Consulta el estado del render (`processing`, `completed`, `error`). |

---

## 🎛️ 3. Parámetros de Calidad y Filtros FFmpeg

1. **Anti-Pixelado & Gradientes Limpios:**
   - Códec: `libx264` con `-crf 18` (o 16 en Máster).
   - Rate Control: `-b:v 18M -maxrate 25M -bufsize 35M -pix_fmt yuv420p`.
   - Preset: `medium` para exportación final, `ultrafast` para previsualizaciones rápidas.
2. **Normalización de Relación de Aspecto:**
   - Filtro: `scale=W:H:force_original_aspect_ratio=decrease,pad=W:H:(ow-iw)/2:(oh-ih)/2,setsar=1`.
   - Soporte para 1080p (`1920x1080`), 4K (`3840x2160`), 720p (`1280x720`) y Vertical Shorts (`1080x1920`).
3. **Pistas de Audio Concat:**
   - Códec: `-c:a aac -b:a 320k` con ensamble atómico sin desfasaje de sync.

---

## 📂 4. Archivos Involucrados en el Repositorio

- [`controlador/routers/video_looper.py`](file:///e:/autoprod/controlador/routers/video_looper.py): Router de FastAPI con la lógica FFmpeg y cálculo de repeticiones de bucle.
- [`controlador/main.py`](file:///e:/autoprod/controlador/main.py): Registro de rutas bajo el prefijo `/video`.
- [`lib/controlador-client.ts`](file:///e:/autoprod/lib/controlador-client.ts): Cliente TypeScript (`createVideoLoop`, `scanAudioFolder`, `inspectMedia`, `getPreviewVideoUrl`).
- [`components/dashboard/VideoLooperStudio.tsx`](file:///e:/autoprod/components/dashboard/VideoLooperStudio.tsx): Interfaz completa con Drop Zone, reordenamiento, previsualizador y selector de calidad.
- [`components/dashboard/FileTree.tsx`](file:///e:/autoprod/components/dashboard/FileTree.tsx): Eventos drag con metadatos JSON de archivos multimedia.
