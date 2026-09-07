# 🎧 Subtitulador Inteligente con Whisper, Hardware Governor y Exportación CapCut

## 📋 ¿Qué hace?
Permite subtitular videos individuales (.mp4, .mov) o procesar carpetas completas de canciones (.mp3, .wav, etc.) generando subtítulos con sincronización temporal exacta en formatos estándar (`.srt`, `.vtt`, `.json`), además de soportar el quemado directo permanente en el video mediante FFmpeg.

Integra:
1. **Doble Motor Whisper:** Soporte para la **API Cloud de OpenAI** (0% consumo de CPU local, 15x-20x más rápida) y **Motor Local** (con límite de núcleos de CPU seguros o aceleración por GPU).
2. **Hardware Governor:** Gestor centralizado de concurrencia para evitar saturación de memoria RAM y congelamiento de PCs con especificaciones modestas.
3. **Modal de Estimación Previa y Advertencias de Energía (`PreExecutionEstimateModal`):** Informa tiempos estimados según el hardware y previene apagados accidentales del equipo.
4. **Compatibilidad Nativa con CapCut:** Los archivos `.srt` generados contienen marcas de tiempo precisas que se importan directamente en la línea de tiempo de CapCut para aplicar estilos, animaciones y tipografías virales.

---

## ⚙️ ¿Cómo lo hace?

### 1. Extracción y Transcripción
- Si el archivo es un video, se extrae el audio a 16kHz mono a 64kbps usando FFmpeg para optimizar el tamaño por debajo del límite de 25MB de OpenAI.
- Si es una carpeta de canciones, escanea recursivamente cada pista de audio (`.mp3`, `.wav`, `.aac`, `.m4a`, etc.) y las transcribe de forma secuencial.

### 2. Conversión a Formatos de Subtítulos
- Whisper devuelve segmentos con marcas temporales exactas (`start`, `end`, `text`).
- El conversor interno genera:
  - **`.srt`:** Formato SubRip estándar (`00:00:01,250 --> 00:00:04,800`).
  - **`.vtt`:** Formato WebVTT para reproductores web y YouTube (`00:00:01.250 --> 00:00:04.800`).
  - **`.json`:** Estructura completa con metadatos por palabra y puntuación.
- Los archivos se almacenan en una subcarpeta dedicada `Subtitulos/` en el workspace del usuario.

### 3. Control de Hardware (Hardware Governor)
- Detecta número de núcleos de CPU (`os.cpu_count()`), memoria RAM mediante `GlobalMemoryStatusEx` (`ctypes`) y adaptadores gráficos GPU.
- Limita los hilos de trabajo a `max(1, cpu_cores - 2)` para que el sistema operativo y el navegador sigan totalmente fluidos.
- Semáforo de tareas pesadas: si hay un render de loop de video en curso y se solicita subtitulado, el trabajo se encola de forma ordenada sin colapsar el procesador.

---

## 🎬 Flujo de Trabajo con CapCut

1. **Generación en AutoProd:**
   - Arrastra la carpeta de canciones o video a **🎧 Subtitulador IA**.
   - Haz clic en **"Estimar Tiempo y Generar Subtítulos..."**.
   - Revisa el modal de estimación y confirma.
2. **Importación en CapCut:**
   - Abre CapCut en PC o Móvil con tu video o audio en la línea de tiempo.
   - Ve a **Texto (Text) > Subtítulos locales (Local Subtitles) > Importar (.srt)**.
   - Selecciona el archivo `.srt` generado en `Subtitulos/`.
   - CapCut sincroniza cada frase al milisegundo exacto y permite aplicar efectos de texto viral en un solo clic.

---

## 📁 Archivos Involucrados

| Componente / Archivo | Rol |
| :--- | :--- |
| [`controlador/hardware.py`](file:///e:/autoprod/controlador/hardware.py) | `HardwareGovernor` que detecta CPU/RAM/GPU, calcula tiempos y bloquea colisiones de tareas pesadas. |
| [`controlador/routers/subtitles.py`](file:///e:/autoprod/controlador/routers/subtitles.py) | Endpoints `POST /subtitles/estimate`, `POST /subtitles/generate`, `GET /subtitles/status/{id}` y lector/guardador de subtítulos. |
| [`controlador/routers/video_looper.py`](file:///e:/autoprod/controlador/routers/video_looper.py) | Integración del render de video con el `HardwareGovernor` para respetar los slots de recursos. |
| [`lib/controlador-client.ts`](file:///e:/autoprod/lib/controlador-client.ts) | Métodos tipados en TypeScript para comunicar el frontend con el backend local. |
| [`components/dashboard/PreExecutionEstimateModal.tsx`](file:///e:/autoprod/components/dashboard/PreExecutionEstimateModal.tsx) | Modal interactivo de estimación de tiempo, ficha de hardware y advertencias previas a la exportación. |
| [`components/dashboard/VideoSubtitlesStudio.tsx`](file:///e:/autoprod/components/dashboard/VideoSubtitlesStudio.tsx) | Estudio completo con pestañas para video individual, carpeta de canciones, barra de progreso y editor de subtítulos. |
| [`components/dashboard/Launchpad.tsx`](file:///e:/autoprod/components/dashboard/Launchpad.tsx) | Tarjeta interactiva `🎧 Subtitular Video / Canciones (WHISPER IA)`. |
| [`components/dashboard/ConversationSidebar.tsx`](file:///e:/autoprod/components/dashboard/ConversationSidebar.tsx) | Botón de acceso directo `🎧 Subtitulador IA` en la barra lateral. |
| [`app/dashboard/page.tsx`](file:///e:/autoprod/app/dashboard/page.tsx) | Enrutamiento de la vista central (`activeView === 'subtitles'`). |

---

## 💼 Propósito en el Negocio

Elimina una de las tareas más tediosas y lentas en la creación de contenido para YouTube, TikTok y Shorts: la transcripción manual de letras y diálogos. Al automatizar la sincronización temporal y el cálculo de recursos, permite que creadores con cualquier tipo de computadora (desde portátiles modestos hasta estaciones de trabajo) produzcan videos con subtítulos profesionales sin congelar sus equipos y listos para estilizar en CapCut.
