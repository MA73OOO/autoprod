# ⚙️ Ficha Técnica: FEAT-16 — Orquestación de Canales, Capa de Video (`config_video.md`) & Interactive Question Cards

> **Ruta:** `docs/features/channel_and_video_orchestration/ficha_tecnica.md`  
> **Estado:** `✅ HECHO` (En producción / Operativo)  
> **Capa Técnica:** Next.js API Routes (`/api/tools/crear_canal`, `/api/chat`) + React 19 (`InteractiveQuestionCard.tsx`) + Prisma + Markdown Parser (`remark-gfm`)

---

## 🛠️ 1. Pipeline de Inicialización y Flujo de Interacción

```mermaid
flowchart TD
    A[Usuario en Chat / Consola] --> B{¿Crear Canal o Video?}
    
    B -->|Crear Canal| C[Tool: /api/tools/crear_canal]
    C --> D[Validación de Límites por Plan maxChannels]
    D --> E[Registro en BD: Channel + ChannelContext]
    E --> F[Creación de Workspace: {canal}/InfoCanal/]
    F --> G[Generación de 4 Archivos .md: Contexto, Metricas, Historial, Branding]

    B -->|Crear Video| H[Orquestador Central: SOP crear_video]
    H --> I[Consulta Memoria InfoCanal/ y anti-duplicados]
    I --> J[Pregunta interactiva: ¿Carpetas extra?]
    J --> K[InteractiveQuestionCard: Elección de Modelo & Créditos]
    K --> L[Generación con Modelo Elegido: config_video.md]
    L --> M[Tool: crear_carpetas: Guiones, Videos, Miniatura, Musica, Ambiente]
```

---

## 🔌 2. Capacidades Técnicas Implementadas

1. **Tool `crear_canal` (`/api/tools/crear_canal`):**
   - Valida el cupo de canales según el plan de suscripción (`maxChannels`).
   - Registra el canal en la tabla `Channel` de Prisma con su `localPath` y `niche`.
   - Inicializa el registro semántico `channelContext` en Supabase/PostgreSQL.
   - Crea en el workspace local la carpeta física `{canal}/InfoCanal/` con los 4 archivos esenciales:
     - `Contexto_canal.md`: Nicho, temática, audiencia, tono de voz y directivas.
     - `Metricas_canal.md`: Pilares temáticos y palabras clave de nicho.
     - `Historial_canal.md`: Catálogo anti-duplicados estructurado.
     - `Branding_canal.md`: Especificaciones para `logo.jpg`, `banner.jpg` y `marca_de_agua.jpg`.
2. **Depuración y Saneamiento de Herramientas:**
   - Eliminación definitiva de la tool obsoleta `generar_metadatos_subida`.
   - `generar_info_canal` se mantiene como alias retrocompatible que delega a `crear_canal`.
3. **Capa de Video con Datos de Subida (`config_video.md`):**
   - Todo proyecto de video nuevo cuenta con el archivo central `config_video.md` en su raíz para copiar y pegar directamente en YouTube Studio:
     - Título SEO de alto impacto.
     - Descripción estructurada (gancho, resumen, timestamps, enlaces, llamadas a la acción).
     - Etiquetas (Tags) de nicho.
     - Comentario fijado para interacción de la comunidad.
   - 5 carpetas canónicas de producción: `Guiones/`, `Videos/`, `Miniatura/`, `Musica/`, `Ambiente/`.
4. **Sistema de Bloques Interactivos (`InteractiveQuestionCard.tsx`):**
   - Parser en `ChatPanel.tsx` sobre bloques markdown ````interactive-question````.
   - Renderizado de tarjetas visuales cliqueables con badges de costo en créditos (`⚡ 0 créditos (Gratis)`, `🧠 ~2 créditos`, `🚀 ~5 créditos`).
   - Selección de 1-clic con envío directo al chat para evitar tipeo manual y reducir la ambigüedad en el modelo.
   - Soporte para multi-selección y opción de texto libre personalizada.

---

## 📂 3. Archivos Involucrados

- [`app/api/tools/crear_canal/route.ts`](file:///e:/autoprod/app/api/tools/crear_canal/route.ts): Endpoint unificado de creación e inicialización de canales.
- [`app/api/tools/generar_info_canal/route.ts`](file:///e:/autoprod/app/api/tools/generar_info_canal/route.ts): Delegador retrocompatible a `crear_canal`.
- [`components/dashboard/InteractiveQuestionCard.tsx`](file:///e:/autoprod/components/dashboard/InteractiveQuestionCard.tsx): Componente UI interactivo de selección de modelos y preguntas.
- [`components/dashboard/ChatPanel.tsx`](file:///e:/autoprod/components/dashboard/ChatPanel.tsx): Integración de `ReactMarkdown` con `InteractiveQuestionCard`.
- [`components/agents/ChannelCreatorConsole.tsx`](file:///e:/autoprod/components/agents/ChannelCreatorConsole.tsx): Consola de creación conectada a `crear_canal`.
- [`migrations/006_refactor_channel_tools_and_prompts.sql`](file:///e:/autoprod/migrations/006_refactor_channel_tools_and_prompts.sql): Migración SQL de tools y plantillas maestras.
