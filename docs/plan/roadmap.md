# Plan de Desarrollo: Integración de Workspace Local de YouTube y Editor Markdown

Este documento define la hoja de ruta en fases para habilitar la administración local del directorio `E:\Youtube`, permitiendo inicializar la estructura de carpetas de producción y editar de forma interactiva las configuraciones de subida en formato Markdown (`config_subida.md` y `comentario_fijado.md`).

---

## 📅 Fases de Implementación

### Fase 0: Asistentes de Configuración Rápida (Wizard Modals)
- **Objetivo:** Introducir un flujo de configuración guiado paso a paso para evitar el chat libre desde cero, estructurando las respuestas del usuario antes de guardarlas en el prompt maestro.
- **Detalle de la Experiencia (Opción A):**
  - Al pulsar sobre las tarjetas de Launchpad (**Crear Canal**, **Crear Video**, **Crear Guion**), se abrirá un modal de asistente en lugar de redirigir de inmediato al chat libre.
  - **Crear Canal Wizard:** Cuestionario de 2-3 preguntas (Ej: Temática o nicho, público objetivo, propuestas de nombre).
  - **Crear Video Wizard:**
    - Carga dinámicamente los canales guardados en base de datos para permitir al usuario **seleccionar a qué Canal pertenece el video**.
    - Cuestionario rápido (Ej: Título tentativo, enfoque del video, referencias musicales/ambiente).
  - **Crear Guion Wizard:** Cuestionario rápido (Ej: Título/temática, tono del narrador, duración del video).
- **Concatenación al Prompt Maestro:**
  - El backend recibe el formulario completado, concatena los detalles recopilados al final del `systemPrompt` (Ej: `\n\nDetalles del Proyecto:\nCanal: PawsAndPillows\nTítulo: Lofi Beats para Dormir...`), y lo guarda en la base de datos.
  - El mensaje de bienvenida de la IA se personaliza para confirmar que ha absorbido estas especificaciones en su memoria y guiar los siguientes pasos.

### Fase 0.5: Configuración de IA y Detección de Suscripción (Hybrid BYOK / OAuth & API Key)
- **Objetivo:** Permitir que cada usuario configure cómo se consume la API de IA (Gemini / Imagen 3) para mantener costos de operación en $0 USD en el servidor.
- **Flujos de Conexión:**
  - **Opción A (Google One AI Premium / Suscripción Pro):** Botón `Conectar con Google`. Identifica el token de sesión o credenciales de la cuenta Pro para consumir su cuota. Muestra el estado *"Conectado: Google Gemini Pro Activo"*.
  - **Opción B (API Key de Google AI Studio / Pay-as-you-go / Tier Gratuito):** Input para guardar manualmente la API Key (`AIza...`). Persiste en `localStorage` y en la tabla `ApiKey` de Supabase (proveedores `GEMINI_API_KEY`, `GOOGLE_OAUTH_PRO`).
- **Selector de Modelos Dinámico:**
  - Selector en la interfaz para alternar entre `gemini-2.5-flash`, `gemini-2.5-pro` e `imagen-3.0-generate-002`.

### Fase 1: API de Acceso al Workspace Local (File System)
- **Objetivo:** Permitir que la consola de AutoProd interactúe directamente con el directorio local de almacenamiento `E:\Youtube`.
- **Estructura Personalizable:**
  - El generador de carpetas permitiría a los creadores definir y renombrar las carpetas libremente.
  - Se mantendrán las carpetas base configurables para la integración de scripts de compilación (ej: `Musica/`, `Ambiente/`, `miniature/`, `Videos/`, `Resultado/`).
- **Endpoints a implementar:**
  - `GET /api/workspace`: Lista los canales y videos existentes leyendo las subcarpetas del sistema de archivos local.
  - `POST /api/workspace/init`: Inicializa la estructura del proyecto para un nuevo video/canal.

### Fase 2: Parseador y Editor de Metadatos de Subida (`config_subida.md`)
- **Objetivo:** Leer el archivo `config_subida.md`, interpretarlo estructuradamente en la UI del dashboard, y guardarlo/reescribirlo automáticamente al hacer modificaciones.
- **Flujo de Trabajo:**
  1. **Lectura:** El backend lee `config_subida.md` de un proyecto y extrae títulos recomendados, descripciones y etiquetas.
  2. **Renderizado en UI:** Los campos se muestran en el panel derecho del dashboard (Inspector) y en pestañas editables en el centro.
  3. **Edición y Escritura:** Al guardar los campos (o cuando el co-pilot Gemini optimiza los textos), se regenera la plantilla del archivo `.md` y se escribe en el almacenamiento local.

### Fase 3: Copilot Integrado, Estadísticas de Canal y Edición Automática
- **Objetivo:** Aprovechar Gemini y la API de YouTube para automatizar la creación y toma de decisiones.
- **Estadísticas de YouTube (YouTube Stats):**
  - Integrar las métricas de visualizaciones e interacciones para que la IA proponga nuevas miniaturas, cambie de enfoque en los guiones o ajuste las temáticas lofi de acuerdo al rendimiento de tus videos de forma directa.
- **Edición Automática (Python):**
  - Ejecutar localmente los scripts de Python (ej. automatizaciones de copiado de música, compilación de audio/video y miniaturas) leyendo las rutas del workspace para editar y crear el video automáticamente.
