# 📁 CRUD de Carpetas y Canales (Folder CRUD)

## 📌 Qué hace
Proporciona la gestión integral y multiplataforma (Windows y macOS) para la creación y eliminación de carpetas y canales dentro del workspace local de AutoProd, soportando operaciones individuales o masivas (en bloque).

Abstrae por completo la complejidad de rutas técnicas del sistema operativo (`C:\...`, `E:/...`, barras diagonales), permitiendo que el usuario y la Inteligencia Artificial interactúen usando términos de negocio: **"Workspace"**, **"Canales"** y **"Carpetas de recursos"** (Guiones, Videos, Miniaturas, etc.).

---

## 🛠️ Cómo lo hace

El flujo opera mediante una arquitectura agéntica de 4 capas:

1. **Definición de Schemas y Prompting (`scripts/seed-orchestrator.ts` & `app/api/setup/seed/route.ts`):**
   - Las herramientas `crear_carpetas` y `eliminar_carpetas` exponen esquemas JSON que permiten parámetros individuales (`folder_name`, `ruta`) y arrays (`folders`, `paths`).
   - El System Prompt del agente orquestador instruye al modelo (`gpt-4o-mini`) a nunca mostrar rutas del sistema al cliente y a priorizar la ejecución de herramientas en bloque.

2. **Normalización Inteligente en Proxy (`app/api/chat/route.ts`):**
   - Intercepta los llamados de función generados por el LLM.
   - Detecta y consolida alias comunes generados por la IA (`carpetas`, `nombres`, `rutas`, `folder_names`, `canal`).
   - Resuelve rutas relativas contra el `effectiveWorkspaceRoot` detectado del usuario.
   - Limpia y unifica las barras a formato POSIX universal (`/`).

3. **Ejecución Local en Python (`controlador/routers/workspace.py`):**
   - **Creación (`/workspace/create`):**
     - Recibe `target_path`, `folders`, `folder_name`, `paths` o `channel_name`.
     - Ancla automáticamente la operación al workspace raíz (`default_workspace_path()`) si la ruta es relativa.
     - Crea las carpetas recursivamente con `mkdir(parents=True, exist_ok=True)` y genera subcarpetas opcionales (`subfolders`).
   - **Eliminación (`/workspace/delete_folder`):**
     - Acepta múltiples rutas o nombres de carpetas y resuelve contra el canal o workspace.
     - Ejecuta `shutil.rmtree` directamente sobre la ruta.
     - Si la carpeta no se encuentra directamente (por variaciones de mayúsculas o tildes), ejecuta un fallback de búsqueda insensible a acentos (`normalize_str`) en el directorio del canal antes de reportar error.

4. **Respuesta Orientada al Negocio:**
   - La API de Python devuelve un resumen estructurado (`created: []` o `deleted: []`).
   - El LLM confirma la acción de manera amigable y profesional sin exponer tecnicismos de rutas locales.

---

## 📂 Archivos involucrados

- `controlador/routers/workspace.py` -> Endpoints `/workspace/create` y `/workspace/delete_folder` con soporte de arrays, anclaje de workspace y búsqueda insensible.
- `app/api/chat/route.ts` -> Adaptador y normalizador de argumentos para las herramientas `crear_carpetas` y `eliminar_carpetas`.
- `scripts/seed-orchestrator.ts` -> Schemas JSON actualizados y system prompt del agente orquestador en Prisma.
- `app/api/setup/seed/route.ts` -> Endpoint de sincronización de seed para despliegue y reinicio de base de datos.
- `docs/index.md` -> Registro y referencia central de la funcionalidad.

---

## 🎯 Propósito
Garantizar que la IA y el usuario tengan una base de sistema de archivos robusta y predecible. Es el cimiento sobre el cual se estructuran los canales de YouTube, los proyectos de videos y la posterior generación de archivos de guiones, investigaciones y metadatos (`.md`).
