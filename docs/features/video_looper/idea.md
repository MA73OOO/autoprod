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
| **Calidad Anti-Pixelado H.264** | `✅ HECHO` | CRF 18/16 con buffer VBV para evitar banding en escenas oscuras. |
| **Previsualizador de 5 Minutos** | `✅ HECHO` | Render ultrarrápido con preset `ultrafast` para validar audio y video antes del render final. |
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
