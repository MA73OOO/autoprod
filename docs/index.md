# 📚 Índice Maestro de Documentación (AutoProd)

**⚠️ ATENCIÓN AGENTES DE IA (Gemini, Claude, Cursor, Windsurf):**
Si estás leyendo esto, es porque has sido instruido a consultar el contexto del repositorio antes de proponer cambios, escribir código o crear nuevas funcionalidades. **ESTE ES TU PUNTO DE PARTIDA OBLIGATORIO.**

## 🧠 ¿Cómo entender este repositorio?

AutoProd no es solo un gestor de contenido; es un **IDE Avanzado para el Desarrollo y Automatización de Tareas** impulsado por Inteligencia Artificial y agentes autónomos. Su visión principal es potenciar la producción diaria con tecnología disruptiva, buscando siempre reducir los costos operativos al mínimo posible (aunque existen costos de APIs de IA, la arquitectura busca descentralizar el procesamiento).

Para lograr un sistema totalmente funcional y trabajable de manera agéntica, AutoProd está compuesto por dos capas principales que reflejan sus decisiones técnicas y arquitectónicas:

1. **Frontend / Backend Cloud (Next.js):** Maneja la interfaz de usuario estilo IDE (TailwindCSS v4), autenticación (Supabase SSR), base de datos (Prisma 7.10) y orquestación de Agentes de IA usando el SDK de Vercel AI (Function Calling). Esta capa delega el trabajo pesado para no incurrir en altos costos de servidor.
2. **Motor Local (FastAPI Python):** La verdadera disrupción de AutoProd. Corre directamente en la máquina del cliente (`localhost:8000`), permitiendo interactuar con el sistema operativo y el sistema de archivos del usuario. Esta decisión arquitectónica **reduce drásticamente los costos de servidor y procesamiento**, al mismo tiempo que **disminuye los tiempos de ejecución** en el desarrollo de las tareas.

---

## 📂 Mapa de Contextos y Funcionalidades

Antes de modificar cualquier parte del sistema, **DEBES** leer el `.md` correspondiente a la funcionalidad o área que vas a afectar. 

### 🌟 Funcionalidades Específicas (`docs/features/`)
Esta carpeta contiene el detalle de las mecánicas centrales. **Si vas a crear una nueva funcionalidad**, DEBES documentarla aquí creando una subcarpeta y añadiéndola a esta lista.

- 🤖 **[Agentic Orchestrator](file:///e:/autoprod/docs/features/agentic_orchestrator/README.md):** Cómo Gemini delega tareas usando Function Calling hacia el Motor de Python.
- 🔁 **[Video Looper Studio](file:///e:/autoprod/docs/features/video_looper/README.md):** Creación de loops de video con sincronización de música, calidad anti-pixelado y previsualizador de 5 minutos.
- 🎧 **[Subtitulador Whisper & Hardware Governor](file:///e:/autoprod/docs/features/subtitles_whisper/README.md):** Subtitulado con Whisper API/Local, modo carpeta de canciones, control de CPU/GPU y compatibilidad con CapCut.
- ⚙️ **[Local Motor (FastAPI)](file:///e:/autoprod/docs/features/local_motor/README.md):** Cómo el backend de Python interactúa físicamente con el disco duro del usuario.
- 📁 **[Folder CRUD](file:///e:/autoprod/docs/features/folder_crud/README.md):** Gestión agéntica y multiplataforma de carpetas y canales en el workspace local.
- 🔐 **[Auth Guard & JWT](file:///e:/autoprod/docs/features/auth_guard/README.md):** Sistema SSR de doble verificación para sesiones de Supabase.
- 📊 **[Token Tracker](file:///e:/autoprod/docs/features/token_tracker/README.md):** Sistema asíncrono para el rastreo de consumo de tokens por usuario.
- 📺 **[YouTube Channel Extractor](file:///e:/autoprod/docs/features/youtube_channel_extractor/README.md):** Extracción con YouTube Data API v3, contexto local anti-duplicados y persistencia vectorial con pgvector.

### 🏛️ Arquitectura General (`docs/`)
- 🖥️ **[Frontend (UI)](file:///e:/autoprod/docs/frontend/README.md):** Componentes React, Tailwind v4, drag handlers.
- 🌐 **[Backend (Next.js)](file:///e:/autoprod/docs/backend/README.md):** API Routes, Supabase, Vercel AI SDK.
- 🗄️ **[Base de Datos (Prisma)](file:///e:/autoprod/docs/database/README.md):** Esquemas, migraciones, sincronización con auth de Supabase.
- 🛣️ **[Roadmap y Planeación](file:///e:/autoprod/docs/plan/roadmap.md):** Visión a futuro e historial de implementaciones.

---

## 🛑 Reglas para Agentes (Tus Instrucciones)

1. **Expón tu contexto primero:** Antes de ejecutar acciones, escribir código o crear un plan de implementación, DEBES explicar claramente al usuario cuál es tu contexto actual, por qué estás tomando esas decisiones y cómo se alinean con la arquitectura de AutoProd. Muestra tu razonamiento ("una ventana de contexto") para que el usuario valide que estás en sintonía.
2. **Lee antes de escribir:** Nunca asumas cómo funciona una funcionalidad. Ve al link correspondiente arriba y léela.
3. **Documenta siempre:** Si creas una funcionalidad (ej. Integración de Pagos, Render de Video), al finalizar DEBES crear su carpeta en `docs/features/{tu_feature}/README.md` y agregar el link a este archivo `docs/index.md`.
4. **Estructura Estándar para features:** Tu `README.md` dentro de `docs/features/` DEBE contener:
   - **Qué hace:** (Resumen)
   - **Cómo lo hace:** (Lógica paso a paso)
   - **Archivos involucrados:** (Rutas exactas)
   - **Propósito:** (Por qué existe en el negocio)
