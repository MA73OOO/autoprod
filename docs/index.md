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

### 🌟 Funcionalidades Específicas & Master Tracker (`docs/features/`)
Esta carpeta contiene el detalle de las mecánicas centrales y el seguimiento de producto.
👉 **[🎯 Master Feature Tracker & Product Backlog](file:///e:/autoprod/docs/features/README.md):** Tablero de control de alcance, estado de tareas (`✅ HECHO`, `🔄 EN PROGRESO`, `📋 PLANIFICADO`, `💡 IDEA`) y banco de ideas.

#### 🏛️ Contexto Macro de AutoProd
- 🚀 **[AutoProd: Ficha Técnica Macro](file:///e:/autoprod/docs/features/AutoProd/ficha_tecnica.md)** \| **[AutoProd: Idea (Lo que Tenemos vs. Hacia Dónde Vamos)](file:///e:/autoprod/docs/features/AutoProd/idea.md)**: Arquitectura completa de 2 capas y la visión estratégica para creadores y agencias.

#### 📦 Módulos Específicos
- 🤖 **Agentic Orchestrator:** [Ficha Técnica](file:///e:/autoprod/docs/features/agentic_orchestrator/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/agentic_orchestrator/idea.md)
- 🔁 **Video Looper Studio:** [Ficha Técnica](file:///e:/autoprod/docs/features/video_looper/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/video_looper/idea.md)
- 🎧 **Subtitulador Whisper & Hardware Governor:** [Ficha Técnica](file:///e:/autoprod/docs/features/subtitles_whisper/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/subtitles_whisper/idea.md)
- ⚙️ **Local Motor (FastAPI):** [Ficha Técnica](file:///e:/autoprod/docs/features/local_motor/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/local_motor/idea.md)
- 📁 **Folder CRUD:** [Ficha Técnica](file:///e:/autoprod/docs/features/folder_crud/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/folder_crud/idea.md)
- 🔐 **Auth Guard & JWT:** [Ficha Técnica](file:///e:/autoprod/docs/features/auth_guard/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/auth_guard/idea.md)
- 📊 **Token Tracker:** [Ficha Técnica](file:///e:/autoprod/docs/features/token_tracker/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/token_tracker/idea.md)
- 📺 **YouTube Channel Extractor:** [Ficha Técnica](file:///e:/autoprod/docs/features/youtube_channel_extractor/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/youtube_channel_extractor/idea.md)
- 💳 **Subscriptions, Billing & Token Economics:** [Ficha Técnica](file:///e:/autoprod/docs/features/subscriptions_and_billing/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/subscriptions_and_billing/idea.md)
- 🗃️ **Biblioteca de Recursos (Asset Library & CRUD):** [Ficha Técnica](file:///e:/autoprod/docs/features/asset_library/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/asset_library/idea.md)
- 🎨 **Creador de Imágenes & Miniaturas IA (Image Studio):** [Ficha Técnica](file:///e:/autoprod/docs/features/image_generator/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/image_generator/idea.md)
- 🏛️ **Gobernanza de Canales (FEAT-12):** [Ficha Técnica](file:///e:/autoprod/docs/features/channel_governance/ficha_tecnica.md) \| [Idea & Escalabilidad](file:///e:/autoprod/docs/features/channel_governance/idea.md)

### 🏛️ Arquitectura General (`docs/`)
- 🖥️ **[Frontend (UI)](file:///e:/autoprod/docs/frontend/README.md):** Componentes React, Tailwind v4, drag handlers.
- 🌐 **[Backend (Next.js)](file:///e:/autoprod/docs/backend/README.md):** API Routes, Supabase, Vercel AI SDK.
- 🗄️ **[Base de Datos (Prisma)](file:///e:/autoprod/docs/database/README.md):** Esquemas, migraciones, sincronización con auth de Supabase.
- 🎯 **[Master Feature Tracker](file:///e:/autoprod/docs/features/README.md):** Control central de alcance, estado y banco de ideas.
- 🔧 **[Catálogo de Funciones & Protocolo de Ideas](file:///e:/autoprod/docs/functions/README.md):** Herramientas activas del Orquestador, sub-agentes y lista de capacidades **no implementadas**. Si el usuario pide algo que no existe aquí, el agente DEBE preguntar si quiere gestionarlo.

---

## 🛑 Reglas para Agentes (Tus Instrucciones)

1. **Expón tu contexto primero:** Antes de ejecutar acciones, escribir código o crear un plan de implementación, DEBES explicar claramente al usuario cuál es tu contexto actual, por qué estás tomando esas decisiones y cómo se alinean con la arquitectura de AutoProd. Muestra tu razonamiento ("una ventana de contexto") para que el usuario valide que estás en sintonía.
2. **Lee antes de escribir:** Nunca asumas cómo funciona una funcionalidad. Ve al link correspondiente arriba y léela.
3. **Documenta siempre:** Si creas o modificas una funcionalidad, al finalizar DEBES crear su carpeta en `docs/features/{tu_feature}/`, registrar su `ficha_tecnica.md` e `idea.md`, y agregarlo al tracker en `docs/features/README.md` y a este índice `docs/index.md`.
4. **Estructura Estándar Dual para features:** Cada carpeta dentro de `docs/features/{tu_feature}/` DEBE contener:
   - **`ficha_tecnica.md`:** Código real detrás de la función (endpoints, modelos, archivos exactos, rendimiento y capacidades `✅ HECHAS`).
   - **`idea.md`:** Visión de negocio, propósito del creador, capacidades `⏳ FALTANTES` y banco de ideas de escalabilidad.
5. **Protocolo de ideas no implementadas:** Si el usuario menciona una capacidad que **no existe** en el [Catálogo de Funciones](file:///e:/autoprod/docs/functions/README.md), DEBES:
   - Notificarle que esa funcionalidad no está implementada aún.
   - Preguntarle si quiere que la gestionemos: registrarla en el Master Tracker (`docs/features/README.md`) y/o crear su carpeta `docs/features/{slug}/` con `idea.md`.
   - **Nunca improvisar código ni asumir que existe un endpoint para algo que no está catalogado.**
