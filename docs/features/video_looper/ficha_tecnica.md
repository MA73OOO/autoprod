# ⚙️ Ficha Técnica: Video Looper Studio

> **Ruta:** `docs/features/video_looper/ficha_tecnica.md`  
> **Estado:** `✅ HECHO` (En producción / Operativo)  
> **Capa Técnica:** FastAPI (Python 8000) + FFmpeg + Moviepy + React (Next.js)

---

## 🛠️ 1. Arquitectura y Pipeline de Ejecución

```mermaid
flowchart TD
    A[FileTree: Click o Drag & Drop] -->|Click .mp4/.mp3| B1[FilePreviewer: /workspace/raw Stream]
    A -->|Drag & Drop a Looper| B2[VideoLooperStudio.tsx]
    B2 -->|POST /video/scan_audio_folder| C[FastAPI: Escaneo de Pistas]
    B2 -->|POST /video/inspect_media| D[FastAPI: ffprobe de Clips + has_audio]
    B2 -->|POST /video/create_loop| E[Motor FFmpeg Local (CREATE_NO_WINDOW)]
    E -->|Concat Demuxer + AQ-mode 2 + BT.709| F[Generación .mp4]
    E -->|Thread progress_ticker| G1[GET /video/job_status: Progreso dinámico]
    F -->|GET /video/preview/{job_id}| G2[Reproductor HTML5 con Regeneración]
    F -->|Exportación Completa| H[Workspace Local /Videos]
```

---

## 🔌 2. Endpoints y Métodos de la API Local (FastAPI `localhost:8000`)

| Endpoint | Método | Parámetros Clave | Descripción |
|---|:---:|---|---|
| `/video/inspect_media` | `POST` | `{ file_path: string }` | Ejecuta `ffprobe` para extraer resolución, FPS, duración exacta, códec y detección booleana de pista de audio (`has_audio`). |
| `/video/scan_audio_folder` | `POST` | `{ folder_path: string }` | Escanea recursivamente archivos de audio, suma duraciones y devuelve tiempo formateado `HH:MM:SS`. |
| `/video/create_loop` | `POST` | `{ video_files, audio_folder, duration, resolution, quality, mute_original_audio, is_preview }` | Construye archivos concat, aplica filtros FFmpeg silenciosos (`CREATE_NO_WINDOW`), gestión de audio y exporta el `.mp4`. |
| `/video/preview/{job_id}` | `GET` | `job_id` en path | Emite el stream de video resultante mediante `FileResponse` para el `<video>` HTML5 del estudio. |
| `/video/job_status/{job_id}` | `GET` | `job_id` en path | Consulta el estado del render (`processing`, `completed`, `error`) con porcentaje dinámico calculado por `progress_ticker`. |
| `/workspace/raw` | `GET` | `path: string` | Sirve cualquier archivo multimedia local (video/audio/imagen) por streaming HTTP con MIME type detectado para el inspector lateral. |

---

## 🎛️ 3. Parámetros de Calidad, Audio y Filtros FFmpeg

1. **Anti-Pixelado & Perfiles CRF Puros:**
   - Eliminación de VBV capping rígido (`-b:v`, `-maxrate`, `-bufsize` retirados) para evitar macrobloques y artefactos de compresión en fondos dinámicos u oscuros.
   - Perfiles de compresión:
     - **💎 Master / Ultra:** `-crf 14`, preset `slow` (o `faster` en preview).
     - **✨ Alta Nitidez Pro:** `-crf 17`, preset `medium` (o `fast` en preview).
     - **⚖️ Equilibrado:** `-crf 21`, preset `medium` (o `fast` en preview).
   - Optimización psicovisual: `-x264-params aq-mode=2:no-fast-pskip=1` (mejora degradados sutiles y bordes finos).
   - Espacio de color preservado: `-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv`.
2. **Normalización de Relación de Aspecto & Resolución Original:**
   - Soporta `"original"` (conserva la resolución nativa de los clips fuente calculada por `ffprobe`, sin aplicar escaladores ni letterboxing).
   - Resoluciones estándar: 1080p (`1920x1080`), 4K (`3840x2160`), 720p (`1280x720`) y Vertical Shorts (`1080x1920`) con escalador `lanczos`.
3. **Modo Stream Copy Inteligente (1:1 Cero Pérdida):**
   - Cuando se conserva la resolución original y los clips tienen dimensiones idénticas, activa `-c:v copy`.
   - **Ventaja crítica:** No descomprime ni re-codifica los fotogramas del video. Calidad 100% idéntica a la fuente original de YouTube, eliminando cualquier tipo de pixelación, banding o pérdida generacional, y reduciendo el tiempo de renderizado de minutos a segundos.
4. **Pipeline Anti-Pixelado para Re-Codificación (Fondos Oscuros y Partículas):**
   - En caso de re-escalar o cambiar formato, utiliza `aq-mode=3` (Adaptive Quantization con sesgo a escenas oscuras), `-tune film` y CRF de alta fidelidad (CRF 12 Master, CRF 15 High) para evitar macrobloques en videos espaciales, de estrellas o túneles de luz.
5. **Pipeline de Concatenación Multiclip Secuencial en 2 Fases:**
   - **Fase 1 (Master Cycle Synthesis):** Cuando el usuario añade múltiples clips a la línea de tiempo (`Clip 1 -> Clip 2 -> ...`), se ensambla primero un archivo maestro intermedio de un ciclo (`cycle_master_{job_id}.mp4`) usando `filter_complex concat=n=N:v=1:a=1` (o `a=0` si está muteado). Esto normaliza framerate, timebase y canales de audio, eliminando el fallo silencioso del demuxer cuando los clips provienen de fuentes o cámaras distintas.
   - **Fase 2 (Looping a Escala):** El ciclo maestro sintetizado se repite hasta alcanzar la duración objetivo (`target_duration`) usando `-c:v copy` para una exportación ultra-rápida y sin degradación generacional.
6. **Línea de Tiempo Interactiva & Carga Directa (PC y Workspace):**
   - Interfaz visual de pista horizontal con arrastre drag-and-drop para reordenar clips sobre la marcha (`handleClipDragStart`, `handleClipDrop`).
   - Botones de control por clip: desplazamiento lateral (`◀`, `▶`), duplicado directo (`📋`) y eliminación (`✕`).
   - Carga nativa desde el explorador de archivos de Windows (`<input type="file">` e integración con `saveBinaryFile`) además de soporte de arrastre desde el Workspace Explorer de AutoProd.
7. **Control de Audio Flexible:**
   - `mute_original_audio = True`: Inyecta `-an` a la pista de video para silenciar el sonido ambiente de la cámara o clips fuente.
   - Ensamble con carpeta de música: `-c:a aac -b:a 320k` manteniendo sincronización exacta.
8. **Ejecución Silenciosa y Aislada en Windows:**
   - Flag `CREATE_NO_WINDOW = 0x08000000` en todos los subprocesos de Python para prevenir la apertura de pestañas no deseadas en Windows Terminal.
   - Flags `-nostdin` y `stdin=subprocess.DEVNULL` para evitar bloqueos del buffer en segundo plano.
   - Script `start-motor.bat` configurado con `start "" /B` para desacoplar el servidor Uvicorn del cierre de la terminal.

---

## 📂 4. Archivos Involucrados en el Repositorio

- [`controlador/routers/video_looper.py`](file:///e:/autoprod/controlador/routers/video_looper.py): Router FastAPI con subprocesos seguros, ticker de progreso, profiles CRF y muteado de audio.
- [`controlador/routers/workspace.py`](file:///e:/autoprod/controlador/routers/workspace.py): Endpoint `/workspace/raw` para streaming de archivos multimedia locales.
- [`lib/controlador-client.ts`](file:///e:/autoprod/lib/controlador-client.ts): Cliente TypeScript con `muteOriginalAudio` y `createVideoLoop`.
- [`components/dashboard/VideoLooperStudio.tsx`](file:///e:/autoprod/components/dashboard/VideoLooperStudio.tsx): Interfaz con Drop Zone, toggle de audio, previewer con loader animado y botón de regeneración.
- [`components/dashboard/FilePreviewer.tsx`](file:///e:/autoprod/components/dashboard/FilePreviewer.tsx): Reproductor HTML5 integrado para previsualizar `.mp4`, `.mov`, `.mkv`, `.webm` y archivos de audio al seleccionarlos en el árbol.
- [`components/dashboard/FileTree.tsx`](file:///e:/autoprod/components/dashboard/FileTree.tsx): Eventos de clic que disparan la reproducción de archivos de video y audio en el inspector lateral.
- [`start-motor.bat`](file:///e:/autoprod/start-motor.bat): Lanzador desacoplado en segundo plano del motor local para Windows.
