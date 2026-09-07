# 💡 Idea & Escalabilidad: YouTube Channel Extractor & Contexto Semántico

> **Ruta:** `docs/features/youtube_channel_extractor/idea.md`  
> **Propósito:** Onboarding instantáneo de canales existentes y memoria permanente anti-duplicados con IA.

---

## 🎯 1. El Problema & El Propósito de Negocio

- **El Problema:** Cuando un creador experimentado prueba una herramienta de IA (ChatGPT, Claude, etc.), la IA suele proponerle títulos y temas que *ya publicó hace dos meses*. La IA no conoce su historial ni sabe cuáles de sus etiquetas le han traído más visitas. Explicarle todo el contexto manualmente es agotador.
- **La Solución AutoProd:** Pegas la URL de tu canal (`@micanal`), AutoProd extrae tus últimos 50 videos con solo 3 unidades de cuota de YouTube API, analiza qué etiquetas funcionan mejor, genera archivos locales en tu carpeta `InfoCanal/` y almacena un vector semántico en la nube. Ahora la IA piensa con el ADN de tu canal y **nunca repite un video que ya hiciste**.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Resolución de Enlaces & Handles (@canal)** | `✅ HECHO` | Normaliza URLs completas, handles y Channel IDs canónicos. |
| **Extracción Eficiente (3 unidades de API)** | `✅ HECHO` | Extrae hasta 50 videos sin agotar las 10,000 unidades diarias de Google. |
| **Ranking de Etiquetas Ganadoras** | `✅ HECHO` | Pondera frecuencia de tags con promedio de visualizaciones. |
| **Generación Física en Workspace (`InfoCanal/`)** | `✅ HECHO` | Archivos `Contexto_canal.md`, `Metricas_canal.md` e `Historial_canal.md`. |
| **Persistencia Vectorial pgvector (1536d)** | `✅ HECHO` | Búsqueda por similitud semántica en Supabase con función RPC. |
| **Anti-Duplicados en Pensamiento Profundo** | `✅ HECHO` | Inyección automática de directivas restrictivas en el system prompt. |
| **Scraping de Transcripciones y Guiones Antiguos** | `⏳ FALTANTE` | Descargar subtítulos de los videos para clonar el tono de voz exacto del creador. |
| **Extracción de Canales de la Competencia (Benchmarking)** | `⏳ FALTANTE` | Analizar un canal rival para detectar qué temas les funcionan a ellos y no a ti. |
| **Sincronización Automática Diaria (Auto-Refresh)** | `⏳ FALTANTE` | Tarea periódica para actualizar estadísticas y nuevos videos subidos sin re-extraer manual. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Mapa de Océano Azul (Nicho no Explotado):**
   - Cruzar los videos más vistos del canal con las búsquedas populares de YouTube para encontrar "temas vacíos" donde el creador tiene alta probabilidad de posicionar #1.
2. **Generador de Fórmulas de Títulos Ganadoras:**
   - Detectar patrones gramaticales en los títulos con más visitas (ej: "Cómo logré X en Y días", "La verdad sobre Z") y ofrecer un generador de títulos basado en sus propios éxitos pasados.
