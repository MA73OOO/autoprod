# 📺 Extracción de Canales de YouTube & Contexto Vectorial (YouTube Channel Extractor)

## 📌 Qué hace
Permite a cualquier creador de contenido que ya posee uno o múltiples canales de YouTube con material publicado, incorporarse a **AutoProd** simplemente indicando la URL o el `@handle` de su canal. 

La funcionalidad:
1. **Extrae automáticamente** la información completa del canal y el histórico de videos publicados (títulos, descripciones, etiquetas/tags y métricas de rendimiento como vistas, likes y comentarios) mediante la **YouTube Data API v3**.
2. **Genera archivos físicos de contexto** en el workspace local del usuario dentro de la carpeta `InfoCanal/` (`Contexto_canal.md`, `Metricas_canal.md` y `Historial_canal.md`).
3. **Crea un Catálogo Anti-Duplicados** para que ninguna producción futura de videos repita temáticas o ideas ya cubiertas.
4. **Indexa un Vector Semántico (pgvector)** en la base de datos Supabase PostgreSQL (`text-embedding-3-small` de OpenAI con 1536 dimensiones), permitiendo que el modo **Pensamiento Profundo (Deep Reasoning)** identifique instantáneamente a qué canal se refiere el usuario al solicitar ideas o planificaciones, inyectando las etiquetas ganadoras y las restricciones anti-duplicación en tiempo real.

---

## 🛠️ Cómo lo hace

El flujo opera mediante una arquitectura coordinada en 5 capas:

1. **Resolución Inteligente de Identificadores (`lib/youtube/extractor.ts`):**
   - Normaliza cualquier formato de entrada del usuario: URLs completas (`https://youtube.com/@micanal`, `https://youtube.com/channel/UC...`, `https://youtube.com/c/...`), handles (`@micanal`), o IDs canónicos de 24 caracteres (`UC...`).
   - Llama a los endpoints oficiales de YouTube Data API v3 (`channels`, `playlistItems` de la lista de subidas `uploads`, y `videos` para obtener tags y estadísticas).
   - Extrae hasta 50-100 videos consumiendo únicamente **3 unidades de cuota** de YouTube API por canal.

2. **Minería de Datos y Catálogo Anti-Duplicados (`lib/youtube/analytics.ts`):**
   - **Análisis de Etiquetas Ganadoras:** Pondera la frecuencia de cada etiqueta con el promedio de reproducciones y engagement de los videos que la contienen, generando un ranking de tags de alto impacto.
   - **Inventario Anti-Duplicación:** Compila la lista de todos los títulos y temáticas ya realizadas para ser inyectadas como regla prohibitiva en el prompt de la IA.
   - **Síntesis Semántica:** Genera el bloque textual optimizado que describe la propuesta de valor, estilo y nicho del canal.

3. **Generación de Vector Semántico (OpenAI):**
   - Utiliza el modelo `text-embedding-3-small` a través del SDK de Vercel AI (`embed`) para transformar la síntesis del canal en un vector de 1536 dimensiones.
   - Utiliza la misma `OPENAI_API_KEY` ya configurada en AutoProd con un costo inferior a $0.00002 USD por canal.

4. **Persistencia en Base de Datos (`prisma/schema.prisma` + Supabase pgvector):**
   - Actualiza o crea el registro en la tabla `Channel`.
   - Inserta/actualiza el registro en la tabla `ChannelContext` con la columna `embedding vector(1536)` y un índice de búsqueda HNSW para similitud de coseno.
   - Registra los videos en la tabla `Video` con estado `PUBLISHED`.
   - Expone la función RPC `match_channel_contexts` para consultas semánticas en milisegundos.

5. **Generación Física en el Workspace Local del Cliente:**
   - Crea en el disco duro del usuario la estructura:
     ```text
     {workspace}/{NombreCanal}/InfoCanal/
       ├── Contexto_canal.md       # Branding, nicho, tono y estilo
       ├── Metricas_canal.md       # Ranking de tags ganadoras y fórmulas de títulos
       └── Historial_canal.md      # Catálogo de videos y filtro anti-duplicados
     ```
   - Las futuras subcarpetas de videos conviven al mismo nivel sin duplicar conceptos.

6. **Integración con Pensamiento Profundo (`app/api/chat/route.ts`):**
   - Cuando el usuario formula una consulta en el chat (especialmente con Pensamiento Profundo activado), el orquestador evalúa la similitud semántica con sus canales importados vía `match_channel_contexts`.
   - Si detecta correlación, inyecta dinámicamente en el system prompt el contexto del canal, las etiquetas comprobadas y la directiva estricta de no repetir temas pasados.

---

## 📂 Archivos involucrados

- `lib/youtube/extractor.ts` -> Cliente de YouTube Data API v3 para resolución de URLs, extracción de canales, uploads y metadatos de videos.
- `lib/youtube/analytics.ts` -> Algoritmos de minería de etiquetas, ranking de rendimiento, síntesis semántica y generador de Markdown.
- `app/api/tools/extraer_canal_youtube/route.ts` -> Endpoint agéntico ejecutable por el Orquestador o directamente desde la interfaz.
- `prisma/schema.prisma` -> Modelos `ChannelContext` y relaciones con `Channel` y `User`.
- `migrations/add_channel_context_vector.sql` -> Migración con extensión `vector`, tabla `channelContext`, índice HNSW y función RPC `match_channel_contexts`.
- `app/api/chat/route.ts` -> Normalización de argumentos para la herramienta y recuperación semántica de contexto de canales en Pensamiento Profundo.
- `scripts/seed-orchestrator.ts` & `app/api/setup/seed/route.ts` -> Registro de la herramienta `extraer_canal_youtube` en el catálogo del agente.
- `components/dashboard/Launchpad.tsx` -> Tarjeta de acceso rápido `📥 Extraer Canal`.
- `components/dashboard/ChatPanel.tsx` -> Botón en barra de herramientas y plantilla guiada `[Extracción y Análisis de Canal de YouTube]`.
- `components/dashboard/UserSettingsModal.tsx` -> Configuración y almacenamiento en Vault de la `YOUTUBE_API_KEY`.
- `tests/youtube-extractor.test.ts` -> Suite de pruebas unitarias para normalización, minería de tags y generación de Markdown.
- `docs/index.md` -> Registro central de la funcionalidad en la documentación maestra.

---

## 🎯 Propósito
Permitir el onboarding inmediato y sin fricciones de creadores profesionales que ya tienen canales consolidados, evitando el problema común de que la IA sugiera ideas que el creador ya publicó en el pasado, y aprovechando la data real de las etiquetas que ya demostraron funcionar para maximizar el alcance y retención en YouTube.
