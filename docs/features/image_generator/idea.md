# 💡 Idea & Escalabilidad: Image & Thumbnail Studio

> **Ruta:** `docs/features/image_generator/idea.md`  
> **Propósito:** Creación de miniaturas de alto CTR y fondos visuales sin depender de diseñadores gráficos ni herramientas externas.

---

## 🎯 1. El Problema & El Propósito de Negocio

- **El Problema:** La miniatura representa más del 80% del éxito de un video en YouTube. Muchos creadores ven una miniatura exitosa de su competencia y quieren replicar su estética, pero no saben cómo redactar un prompt adecuado para DALL-E o Midjourney, terminando con imágenes genéricas sin gancho visual.
- **La Solución AutoProd:** Pegas un pantallazo de cualquier miniatura (`Ctrl+V`); la IA analiza la iluminación, paleta y composición, y te hace 3 preguntas inteligentes para clonar esa misma vibra estética con tu propio personaje o temática, guardando el archivo listo en tu disco local.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Análisis de Referencia con Visión (`Ctrl+V`)** | `✅ HECHO` | Desglose automático de composición, colores e iluminación. |
| **Cuestionario Guiado de Prompting** | `✅ HECHO` | Selección de aspectos, estilos preconfigurados y emoción. |
| **Generación con DALL-E 3 (16:9, 9:16, 1:1)** | `✅ HECHO` | Imágenes de alta resolución nativas. |
| **Persistencia Dual (Disco Local + Supabase Storage)** | `✅ HECHO` | Archivo físico en carpeta del canal y respaldo en la nube. |
| **Generación de Textos y Títulos Superpuestos** | `⏳ FALTANTE` | Renderizado de textos tipográficos llamativos (estilo MrBeast) sobre la imagen. |
| **Integración con Modelos Locales (Stable Diffusion / FLUX)** | `⏳ FALTANTE` | Opción de generar imágenes 100% gratis en GPUs NVIDIA locales. |
| **Eliminación de Fondo en 1 Clic (Remove Background)** | `⏳ FALTANTE` | Recortar al presentador o personaje para colocarlo en diferentes escenas. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Simulador de Miniatura en Feed Real de YouTube:**
   - Previsualizar cómo se ve la miniatura generada entre miniaturas reales de la competencia en modo móvil y escritorio.
2. **Generador de Paquetes A/B (3 Variantes Simultáneas):**
   - Generar automáticamente una versión enfocada en emoción de sorpresa, otra en misterio y otra en contraste extremo para pruebas A/B.
