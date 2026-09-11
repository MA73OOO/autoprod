# 💡 Idea de Negocio & Escalabilidad: AI Video Studio & B-Roll Auto-Finder

> **Ruta:** `docs/features/ai_video_and_broll/idea.md`  
> **Estado:** `💡 IDEA / PLANIFICADO`  
> **Propósito:** Automatizar la obtención de metraje de apoyo (B-roll de stock libre de derechos) y la generación de clips sintéticos mediante IA (Text-to-Video / Image-to-Video) directo al espacio de trabajo del proyecto.

---

## 🎯 1. Problema del Creador
- Crear un video largo o un Short requiere decenas de tomas y clips de apoyo (B-roll) para mantener el dinamismo visual.
- Buscar clips en bancos de stock manualmente (Pexels, Pixabay) o descargar de YouTube toma hasta el 60% del tiempo total de edición.
- Las herramientas de Text-to-Video actuales (Runway, Luma, Kling, Pika) funcionan en sitios web aislados, obligando al creador a descargar manualmente cada archivo, renombrarlo y moverlo a la carpeta correcta de su disco.

---

## 🚀 2. Propuesta de Solución en AutoProd
1. **B-Roll Auto-Finder Inteligente (Stock Scraper Local):**
   - El creador o el Orquestador analiza el guion (`Guiones/guion_*.md`).
   - Extrae palabras clave por escena (ej: *"oficina moderna de noche"*, *"primer plano escribiendo en laptop"*, *"galaxia espiral"*).
   - Consulta APIs de stock libre de derechos (Pexels / Pixabay) y descarga los clips en alta resolución (1080p/4K) directamente a `{Workspace}/{Canal}/{Titulo_Video}/Videos/broll_{escena}.mp4`.
2. **AI Video Generation (Text-to-Video & Image-to-Video BYOK):**
   - Integración con motores de video generativo (Luma Dream Machine, Runway Gen-3, Kling AI, Haiper o Stable Video Diffusion local).
   - Convierte prompts de texto o imágenes de la carpeta `Miniatura/` en clips animados de 4 a 10 segundos.
3. **Flujo de Alimentación Directa al Video Looper:**
   - Todo clip obtenido o generado aterriza en la carpeta de producción `Videos/` y queda disponible en la línea de tiempo del **Video Looper Studio (FEAT-04)** para ensamble inmediato.

---

## 📊 3. Matriz de Alcance

| Capacidad | Estado | Notas |
|---|:---:|---|
| Ensamble, bucles y transcodificación de clips | `✅ HECHO` | Video Looper Studio (FEAT-04). |
| B-Roll Auto-Finder (Stock Scraper Pexels/Pixabay) | `📋 PLANIFICADO` | Descarga local silenciosa vía FastAPI. |
| Generación de Video por IA (Text-to-Video Cloud BYOK) | `💡 IDEA` | Conexión vía API Keys con Runway / Kling / Luma. |
| Inferencia Local de Video (Stable Video Diffusion) | `💡 IDEA` | Requiere GPUs de alta capacidad (12GB+ VRAM). |

---

## 🔮 4. Banco de Ideas de Escalabilidad
- **IDEA-VID-1 (Smart Scene Matcher):** Comparación semántica entre el texto del guion y las etiquetas del clip de stock para asegurar relevancia visual.
- **IDEA-VID-2 (Image-to-Video Motion):** Animar miniaturas o ilustraciones generadas en el Image Studio para convertirlas en intros de video en bucle.
