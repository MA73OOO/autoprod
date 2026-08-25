# Estado del Proyecto - AutoProd Console (Hoy)

Este documento resume el estado actual del repositorio, las APIs implementadas, el esquema de la base de datos en Supabase y los próximos pasos de desarrollo.

---

## 1. Base de Datos (PostgreSQL & Prisma Next)

El esquema relacional ha sido migrado exitosamente a **Prisma 8 (Prisma Next)** y está totalmente sincronizado en **Supabase** (todos los tipos y restricciones se encuentran aplicados).

- **Estructura UUID:** Todas las claves primarias y relaciones de usuario (`User.id`, `Conversation.userId`, `Channel.userId`, etc.) utilizan ahora identificadores nativos `Uuid` compatibles con Supabase Auth.
- **Enums Nativos:** Los enums de sistema (`Role`, `MessageSender`) se han definido a nivel global con el códec `@@type("pg/text@1")` y asignaciones de texto plano (`USER = "USER"`), asegurando la compatibilidad de base de datos en Postgres.
- **Campo de Prompt Maestro:** Se añadió la columna `systemPrompt String?` a la tabla `Conversation` para almacenar las instrucciones iniciales que guían la IA.

---

## 2. Capa de Servidor (APIs & Endpoints)

Todas las APIs están escritas usando el App Router de Next.js y cuentan con verificación de sesión de Supabase:

- **`/api/auth/sync` (POST):** Sincroniza al usuario logueado en Supabase Auth con la tabla `User` de PostgreSQL.
- **`/api/prompts` (GET):** Recupera las plantillas de prompts de la base de datos. **Auto-seeding incorporado:** si la tabla está vacía (como tras una limpieza), inserta de inmediato los prompts maestros por defecto (`crear_canal`, `crear_video`, `crear_guion`).
- **`/api/conversations` (GET, POST):**
  - **GET:** Lista los chats ordenados por fecha de actualización.
  - **POST:** Crea un chat asociando el título, el `systemPrompt` y el `welcomeText`.
  - **Lazy Sync de Usuario:** Si por alguna razón el usuario se elimina de la base de datos (por ejemplo, al limpiar esquemas), este endpoint lo re-crea en caliente antes de procesar la petición para evitar errores de clave foránea.
- **`/api/channels` (GET):** Lista los canales del usuario incluyendo sus videos asociados. Incorpora también *lazy sync* para garantizar consistencia.

---

## 3. Frontend (Dashboard & Interfaz)

Ubicado en [`app/dashboard/page.tsx`](file:///E:/autoprod/app/dashboard/page.tsx), el dashboard incluye:

- **Home Launchpad:** Vista de inicio limpia que muestra las tarjetas de acción rápida.
- **Conexión Real de Canales y Chats:** El panel izquierdo muestra dinámicamente las conversaciones reales y la lista de canales/videos de la base de datos.
- **Paneles Ajustables (Resizable):** El panel de chat izquierdo y el panel de configuración derecho admiten redimensionado arrastrable fluido en vanilla React.
- **Botones de Launchpad Dinámicos:** Los botones de "Crear Canal", "Crear Video" y "Crear Guion" están vinculados a la creación de chats con sus respectivos roles de IA.

---

## Próxima Fase: Lanzamiento de Asistentes de Configuración (Wizard Modal)

Según lo acordado (Opción A), el siguiente paso será implementar los modales de configuración rápida que se activarán al hacer clic en las tarjetas de Launchpad:
1. **Crear Canal Wizard:** Pregunta temática, público y nombre objetivo.
2. **Crear Video Wizard:** Permite elegir a qué canal pertenece el video, su título y enfoque.
3. **Crear Guion Wizard:** Pregunta sobre la temática, duración estimada y tono del guion.

Las respuestas de estos formularios se compilarán y se concatenarán directamente al `systemPrompt` maestro de la conversación antes de abrir el chat.
