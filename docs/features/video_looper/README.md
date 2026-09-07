# 🔁 Video Looper Studio

## 📌 Qué hace
Es el módulo especializado en producción y compilación de loops de video continuos e infinitos para YouTube (fondos animados, música lo-fi, streams 24/7 y reels/shorts). Permite a los creadores:
1. Concatena uno o varios clips de video de su workspace en una secuencia de bucle infinito.
2. **Sincronización Automática con Música:** Si se selecciona una carpeta de canciones (`Ambiente`, `canciones`), el sistema analiza todos los archivos de audio, suma sus duraciones y fija automáticamente la duración del bucle para que termine exactamente cuando termine la música.
3. **Calidad Anti-Pixelado:** Aplica codificación H.264 (`libx264`) con CRF 18 (o 16 Máster), VBV buffers y bitrates óptimos (18 a 35+ Mbps) para evitar banding o pixelado en escenas continuas y oscuras.
4. **Previsualizador Rápido de 5 Minutos:** Renderiza una muestra rápida con un límite máximo de 5 minutos en segundos usando preset `ultrafast`, permitiendo reproducir el resultado directamente en el reproductor HTML5 integrado antes de realizar un render completo de varias horas.

---

## 🛠️ Cómo lo hace

1. **Exploración y Detección de Archivos:**
   - El componente `FileTree.tsx` expone eventos `dragStart` para que los videos (`.mp4`, `.mov`, etc.) y carpetas de canciones puedan arrastrarse directamente a la zona de colocación (Drop Zone).
2. **Análisis de Medios en Backend Python (`controlador/routers/video_looper.py`):**
   - **`POST /video/inspect_media`:** Usa `ffprobe` para obtener resolución, FPS, duración y códec de cada clip.
   - **`POST /video/scan_audio_folder`:** Escanea recursivamente la carpeta de audio seleccionada, extrae la duración de cada track y retorna el tiempo total formateado (`HH:MM:SS`).
3. **Generación de Bucle con FFmpeg:**
   - **`POST /video/create_loop`:**
     - Calcula el número de repeticiones del ciclo de video: $\lceil \text{target\_duration} / \text{cycle\_duration} \rceil$.
     - Construye archivos temporales de concatenación (`concat demuxer`).
     - Si se configuró música, genera el archivo concat de audio y los ensambla con `-c:a aac -b:a 320k`.
     - Aplica el filtro `scale=W:H:force_original_aspect_ratio=decrease,pad=W:H:(ow-iw)/2:(oh-ih)/2,setsar=1` para mantener proporciones en 1080p, 4K, 720p o Shorts 9:16.
     - Aplica `-crf 18 -preset medium -pix_fmt yuv420p -b:v 18M -maxrate 25M -bufsize 35M` garantizando calidad visual cristalina y gradientes limpios.
4. **Streaming de Previsualización:**
   - **`GET /video/preview/{job_id}`:** Emite el video resultante mediante `FileResponse` para que el reproductor web `<video controls autoplay loop>` lo reproduzca al instante.
5. **Exportación Final:**
   - Guarda el archivo final renderizado directamente en la carpeta `/Videos` del canal en el workspace del usuario y notifica mediante toast.

---

## 📂 Archivos involucrados
- `controlador/routers/video_looper.py` -> Endpoints en FastAPI para escaneo de canciones, cálculo de duración y ejecución de FFmpeg.
- `controlador/main.py` -> Registro del router `video_looper.router`.
- `lib/controlador-client.ts` -> Cliente TypeScript con métodos `scanAudioFolder`, `inspectMedia`, `createVideoLoop`, `getVideoJobStatus` y `getPreviewVideoUrl`.
- `components/dashboard/VideoLooperStudio.tsx` -> Interfaz de usuario completa con drop zone, reordenamiento, configuración anti-pixelado, tabs de sincronización y reproductor HTML5.
- `components/dashboard/FileTree.tsx` -> Soporte drag & drop con metadatos JSON para videos y audio.
- `components/dashboard/Launchpad.tsx` -> Tarjeta de acceso interactiva `Crear Loop (Video Looper)`.
- `components/dashboard/ConversationSidebar.tsx` -> Botón de acceso rápido `🔁 Video Looper Studio`.
- `app/dashboard/page.tsx` -> Enrutamiento de vista `activeView === 'looper'`.

---

## 🎯 Propósito
Automatizar la creación de videos de larga duración (lo-fi, paisajes sonoros, loops de ambiente) directamente en la máquina local del creador con rendimiento de hardware acelerado por FFmpeg, sin costos de APIs en la nube y con máxima calidad visual.
