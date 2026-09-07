# 💡 Idea & Escalabilidad: Biblioteca de Recursos (Asset Library)

> **Ruta:** `docs/features/asset_library/idea.md`  
> **Propósito:** Control unificado de todos los recursos generados (imágenes, subtítulos, videos, audios) combinando la velocidad del disco local con la seguridad de la nube.

---

## 🎯 1. El Problema & El Propósito de Negocio

- **El Problema:** Los creadores de contenido generan docenas de miniaturas, pistas de audio, videos y archivos `.srt` por semana. Estos archivos terminan dispersos en la carpeta de descargas, en carpetas temporales o perdidos. Abrirlos en Premiere o CapCut requiere buscar manualmente en el disco duro.
- **La Solución AutoProd:** Un explorador de medios integrado estilo DAM (Digital Asset Management) que detecta automáticamente los archivos generados, permite previsualizarlos en 1 clic, copiar su ruta local de Windows para pegarla en editores de video externos, o respaldarlos en la nube con cuotas controladas.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Catálogo Unificado (Imágenes, Videos, Subs, Audio)** | `✅ HECHO` | Filtros por tipo, canal y búsqueda textual en tiempo real. |
| **Doble Modo de Vista (Cuadrícula & Tabla)** | `✅ HECHO` | Visualización en tarjetas con lightbox o lista detallada ordenable. |
| **Almacenamiento Híbrido (Local, Nube, Dual)** | `✅ HECHO` | Soporte para archivos en disco local y/o Supabase Storage. |
| **Acción "Copiar Path Local"** | `✅ HECHO` | Copia la ruta absoluta de Windows/macOS lista para arrastrar a Premiere/CapCut. |
| **Auto-Escaneo y Sincronización de Disco Físico** | `✅ HECHO` | Detecta medios preexistentes en las carpetas y los cataloga sin duplicar. |
| **Etiquetado con IA y Búsqueda por Contenido Visual** | `⏳ FALTANTE` | Búsqueda semántica (ej: "buscar miniatura con auto rojo") usando embeddings de imagen. |
| **Compresión y Optimización WebP / AVIF Automática** | `⏳ FALTANTE` | Reducción de peso de miniaturas para mejorar tiempos de carga sin perder nitidez. |
| **Papelera de Reciclaje con Recuperación en 30 Días** | `⏳ FALTANTE` | Prevenir pérdidas accidentales antes del borrado definitivo de disco. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Integración con Bibliotecas Externas (Pexels / Freesound):**
   - Buscar y descargar recursos libres de derechos directamente desde la biblioteca sin abrir el navegador.
2. **Favoritos & Colecciones Reutilizables:**
   - Crear carpetas de "Elementos Frecuentes" (logos, intros de audio, música de fondo corporativa) compartidas entre todos los canales.
