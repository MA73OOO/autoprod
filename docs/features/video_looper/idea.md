# 💡 Idea & Escalabilidad: Video Looper Studio

> **Ruta:** `docs/features/video_looper/idea.md`  
> **Propósito:** Automatización de fondos en bucle infinito y videos de música sin esfuerzo manual.

---

## 🎯 1. El Problema & La Oportunidad de Negocio

- **El Problema:** Crear videos de 1 a 3 horas de música lo-fi, sonidos para dormir o fondos relajantes requiere abrir un editor pesado (Premiere/DaVinci), duplicar un clip de 10 segundos cientos de veces, ajustar manualmente el audio y esperar un render lento. Además, YouTube comprime agresivamente escenas oscuras si el bitrate y el CRF no están optimizados.
- **La Solución AutoProd:** Arrastras un video y una carpeta de canciones; AutoProd calcula automáticamente las repeticiones para que el bucle coincida exactamente con la música, aplica configuraciones anti-pixelado de nivel profesional y genera una vista previa de 5 minutos en segundos a **$0 costo de servidor**.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Arrastrar & Soltar (Drag & Drop)** | `✅ HECHO` | Desde el árbol de archivos local directamente a la Drop Zone. |
| **Sincronización Automática con Música** | `✅ HECHO` | Lee todas las canciones de una carpeta y calcula la duración exacta del loop. |
| **Línea de Tiempo Multiclip (Secuencia)** | `✅ HECHO` | Pista horizontal interactiva con arrastre Drag-and-Drop, reordenamiento con flechas `◀ ▶`, duplicado rápido `📋` y concatenación secuencial garantizada sin desincronización de audio ni FPS. |
| **Carga Directa desde PC (Explorador Windows)** | `✅ HECHO` | Soporte para arrastrar archivos directamente desde el escritorio o hacer clic para buscar en el sistema de archivos del usuario. |
| **Modo Cero Pérdida (1:1 Stream Copy)** | `✅ HECHO` | Si la resolución es original y los clips coinciden, genera el bucle en segundos sin re-codificación (`-c:v copy`), conservando el 100% de la nitidez nativa. |
| **Calidad Anti-Pixelado H.264 (CRF Puro + AQ-mode 3)** | `✅ HECHO` | Perfiles CRF 12 (Master), 15 (Alta Nitidez) y 18 (Equilibrado) con `aq-mode=3` para fondos oscuros espaciales y partículas. |
| **Previsualizador Dinámico con Regeneración** | `✅ HECHO` | Render ultrarrápido con loader animado, indicador de progreso en vivo y botón `🔄 Regenerar`. |
| **Control de Audio (Mute / Silenciar)** | `✅ HECHO` | Detección de audio con ffprobe y opción de silenciar la pista original del video (`-an`). |
| **Inspección Multimedia en Panel Lateral** | `✅ HECHO` | Clic en archivos `.mp4`, `.mov`, `.mp3` del FileTree abre el reproductor HTML5 streaming local (`/workspace/raw`). |
| **Ejecución Silenciosa & Desacoplada** | `✅ HECHO` | Subprocesos con `CREATE_NO_WINDOW` (sin popups de terminal) y `start-motor.bat` desacoplado. |
| **Exportación a Workspace Local** | `✅ HECHO` | Guarda el archivo final en la carpeta `/Videos` del canal correspondiente. |
| **Render Batch / Cola Nocturna** | `⏳ FALTANTE` | Encolar múltiples combinaciones de videos y canciones para procesar consecutivamente. |
| **Transición Suave (Crossfade / Dissolve)** | `⏳ FALTANTE` | Filtro de encadenado suave entre repeticiones del clip para evitar saltos bruscos. |
| **Soporte de Aceleración por Hardware GPU** | `⏳ FALTANTE` | Activar flags para `h264_nvenc` (NVIDIA) o `h264_qsv` (Intel) para acelerar renders 5x. |
| **Preajustes de Shorts / TikTok (9:16)** | `⏳ FALTANTE` | Centrado inteligente del clip horizontal en encuadre vertical con desenfoque de fondo. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Auto-Generador de Metadatos de Tracklist:**
   - Extraer los nombres de los archivos de audio en la carpeta y generar un texto de "Capítulos / Tracklist con Timestamps" para pegarlo directamente en la descripción de YouTube.
2. **Inserción de Efectos de Partículas & Lluvia:**
   - Superponer capas de lluvia, nieve o polvo flotante transparente sobre cualquier video estático antes de compilar el bucle.
3. **Control de Normalización de Volumen (Loudness EBU R128):**
   - Normalizar automáticamente el volumen de todas las pistas de música de la carpeta para que no haya canciones más fuertes que otras.
---

## 🎬 4. Arquitectura Definitiva: Video Studio Unificado (Looper Express + Timeline Pro)

Para maximizar la productividad y evitar que el creador tenga que saltar entre herramientas o recurrir a CapCut, **VideoLooper queda INTEGRADO (JUNTO)** dentro del **Video Studio** de AutoProd bajo un modelo dual no destructivo:

### 4.1. Los 2 Modos de Trabajo en la Misma Interfaz:
1. **Modo Looper Express (1-Clic):**
   - Para creadores de canales de música Lo-Fi, fondos relajantes o podcasts estáticos.
   - Flujo directo: Arrastras tu video de 10s + carpeta de canciones y FFmpeg genera el bucle de 1 a 3 horas en **15 segundos** usando *Stream Copy* (`-c:v copy`), sin pasar por renderizados pesados.
2. **Modo Timeline Pro (Línea de Tiempo Multipista):**
   - Para creadores que sobre ese bucle (o sobre clips de streamers/vlogs) necesitan agregar:
     - **Pista de Overlays:** Botón animado de *"Suscríbete"*, logo del canal (`InfoCanal/logo.png`), marcas de agua y CTAs con posicionamiento arrastrable (Drag & Drop) sobre el canvas.
     - **Pista de Subtítulos:** Subtítulos sincronizados palabra por palabra con Faster-Whisper.
     - **Pista de Audio con Ducking:** La música de fondo baja de volumen suavemente cuando la voz en off habla.
   - **Bucle Virtual (0 Lag en Web):** En la línea de tiempo el bucle se representa como **un solo bloque continuo** (no 360 cortes). El navegador solo reproduce el clip de 15 MB en bucle con el atributo nativo `loop`, consumiendo prácticamente 0% de RAM.

### 4.2. Gobernanza de Hardware, Red y PC:
- **Cero Duplicación de Archivos:** No se genera un "video de prueba" intermedio. El creador edita en memoria virtual sobre la vista previa.
- **Single-Pass Final Render:** Al presionar "Exportar Video Final", FFmpeg en el PC local procesa el bucle, la música y los overlays en **una sola pasada con aceleración por GPU (NVENC/VideoToolbox)** a costo $0 de servidor.
- **Streaming por Rango (HTTP 206):** El navegador web solo solicita los bytes del segundo exacto que se está reproduciendo, permitiendo previsualizar videos de 3 horas sin congelar la máquina.

### 4.3. Soporte para Videoblogs y Metraje Largo (Cortes Virtuales):
- **Cortes Virtuales en Memoria:** Cortar un video de 1 hora no crea archivos físicos ni consume RAM adicional. Cada corte es una simple tupla de texto (`{ clip, start, end }`). 200 cortes ocupan menos de 30 KB en la memoria del navegador.
- **Salto Instantáneo entre Cortes:** El reproductor web salta entre los puntos de corte en <10ms directamente desde el SSD NVMe local sin interrupciones perceptibles.
- **Generación Automática de Proxies para 4K:** En metrajes pesados, el motor local genera en segundo plano copias de trabajo en 720p para corte y edición fluida a 60 FPS, aplicando los cortes al archivo 4K original únicamente al momento de la exportación final.
