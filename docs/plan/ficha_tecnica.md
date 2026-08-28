# Ficha Técnica de Producto - AutoProd Console

Este documento detalla las especificaciones técnicas, arquitectura del sistema y definición de la pila tecnológica de **AutoProd Console**.

---

## 1. Información General del Producto
* **Nombre del Producto:** AutoProd Console (YouTube Co-Pilot & Production Automation Suite)
* **Descripción:** Plataforma agéntica para creadores de YouTube que automatiza la producción y gestión. Integra una arquitectura híbrida donde Llama actúa como Orquestador Local, un Motor en Python ejecuta el trabajo pesado en el sistema de archivos (puerto 8000), y APIs Premium (Gemini) se usan on-demand vía Switches.
* **Versión de Software:** 0.1.0-alpha
* **Arquitectura:** Arquitectura Agéntica Híbrida Multi-Modelo (Orquestador Llama + Motor Python Local + Especialistas Cloud).

---

## 2. Arquitectura de Software y Pila Tecnológica

### Frontend
* **Framework:** Next.js 16.3.3 (compilado dinámicamente con Turbopack).
* **Librería de Componentes:** React 19.2.8.
* **Estilos:** TailwindCSS v4 (diseño responsivo con estética premium oscura y paneles interactivos resizables).
* **Feedback de Interfaz:** Sonner (mensajes toast flotantes para notificaciones instantáneas).

### Base de Datos y Capa de Datos (Catálogo de Agentes)
* **Motor de Base de Datos:** PostgreSQL (alojado en Supabase).
* **Capa de Abstracción:** Prisma 8 / Prisma Next.
* **Catálogo Dinámico:** La tabla `Agent` define los "Switches" disponibles, eliminando hardcoding y permitiendo a Llama descubrir nuevas capacidades en tiempo real.

### Motor Operativo (Heavy Lifter Local)
* **Lenguaje:** Python (FastAPI / Uvicorn).
* **Rol:** Se ejecuta en el puerto 8000 del PC del creador. Maneja *todo* el trabajo pesado operativo: manipulación segura de archivos `.md`/`.txt`, creación de árboles de directorios (estructuras de videos), y automatización de renderizado (FFmpeg).

### Inteligencia Artificial Híbrida (El Cerebro)
* **Orquestador Local (Ollama/Llama 3 8B):** Gestiona el flujo paso a paso de forma gratuita, interceptando solicitudes mediante el protocolo `[LLAMAR_API: slug]`.
* **Agentes Especialistas Cloud (Gemini 1.5):** Llamados exclusivamente a través de los Switches (ej. `/api/agents/movement/route.ts`) cuando se requiere redacción creativa, optimización SEO de alto nivel o razonamiento complejo, minimizando costos.
* **Integración Adicional:** YouTube Data API v3 para automatización de publicación.
---

## 3. Especificación de Base de Datos (Esquema Relacional)

Las tablas principales creadas en el esquema `public` de PostgreSQL son:

| Tabla | Propósito | Llave Primaria | Llaves Foráneas / Relaciones |
| :--- | :--- | :--- | :--- |
| **`User`** | Registro de creadores y roles en el sistema (USER/ADMIN). | `id` (UUID) | Relación 1-1 con `UserSettings` y `UserSubscription`. |
| **`UserSettings`** | Preferencias de tema, resoluciones de renders e idioma relacional. | `id` (UUID) | `userId` $\rightarrow$ `User.id` (Cascade), `languageCode` $\rightarrow$ `Language.code`. |
| **`Language`** | Tabla maestra que provee los códigos de idioma disponibles (ej: "es"). | `code` (String) | Relacionada con `UserSettings`. |
| **`ApiKey`** | Almacenamiento cifrado de API Keys de IA de los usuarios (Google, Anthropic). | `id` (UUID) | `userId` $\rightarrow$ `User.id` (Cascade). |
| **`Channel`** | Registro de canales de YouTube del usuario con tokens OAuth (Refresh/Access). | `id` (UUID) | `userId` $\rightarrow$ `User.id` (Cascade). |
| **`Video`** | Videos creados por canal, su estado de renderizado (DRAFT, COMPLETED) y metadata. | `id` (UUID) | `channelId` $\rightarrow$ `Channel.id` (Cascade). |
| **`Conversation`** | Hilos de chat individuales. Almacena el `systemPrompt` (Prompt Maestro). | `id` (UUID) | `userId` $\rightarrow$ `User.id`, `channelId` $\rightarrow$ `Channel.id`, `videoId` $\rightarrow$ `Video.id`. |
| **`Message`** | Historial de mensajes dentro de una conversación (mensajes de USER o GEMINI). | `id` (UUID) | `conversationId` $\rightarrow$ `Conversation.id` (Cascade). |
| **`PromptTemplate`**| Plantillas maestras de prompts de sistema para inicializar herramientas de IA. | `id` (UUID) | Unicidad por columna `name` (ej: `crear_canal`). |

---

## 4. Integraciones y Automatizaciones Locales (Workspace)

* **Directorio de Workspace Local:** Carpeta raíz física en el computador del usuario (`E:\Youtube`).
* **Estructura Dinámica de Proyectos:**
  * Carpeta de Canales (Ej: `E:\Youtube\PawsAndPillows`).
  * Carpetas de Proyectos de Videos (Ej: `E:\Youtube\PawsAndPillows\PerritoDormilon`).
  * Estructura interna de activos: `Videos/`, `Musica/`, `Ambiente/`, `miniature/`, `Resultado/`, y los archivos descriptivos editables de metadata `config_subida.md` y `comentario_fijado.md`.
* **Motor de Edición Automática (Python):** Script en segundo plano que procesa los archivos locales de música y videos usando bibliotecas de procesamiento de medios (ej: FFMPEG, MoviePy), automatizando las operaciones de compilación directamente desde la consola web de AutoProd.

---

## 5. Módulo de Configuración de IA y Detección de Suscripción

### Proveedores de IA Soportados (`provider` en `ApiKey`)
- **`GEMINI_API_KEY` (BYOK):** API Key de Google AI Studio configurada manualmente por el usuario. Permite usar el tier gratuito de $0 USD o pay-as-you-go.
- **`GOOGLE_OAUTH_PRO` (OAuth):** Token de sesión enlazado de Google One AI Premium para consumir la cuota de suscripción activa de usuario.

### Persistencia y Consumo de Claves
1. **Lado Cliente (`localStorage`):** Almacena el `providerType` activo (`byok` o `oauth`), la API Key local temporal (cifrada en memoria) y la selección del modelo por defecto.
2. **Lado Servidor (`ApiKey`):** Sincroniza la clave cifrada en PostgreSQL para que las llamadas de backend puedan ejecutarse de forma segura sin requerir que el cliente envíe la API Key en cada petición HTTP.

### Modelos de IA Disponibles
- **`gemini-2.5-flash`:** Modelo rápido y ligero por defecto para optimizaciones y categorizaciones rápidas.
- **`gemini-2.5-pro`:** Modelo de alto razonamiento sugerido para la generación de guiones extensos.
- **`imagen-3.0-generate-002`:** Generador de imágenes de alta fidelidad para bocetos de miniaturas y recursos gráficos.
