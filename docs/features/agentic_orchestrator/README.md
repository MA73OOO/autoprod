# 🤖 Agentic Orchestrator

## 📌 Qué hace
Es el "cerebro" central de la aplicación AutoProd. Recibe los mensajes del usuario desde la interfaz, los evalúa utilizando `gpt-4o-mini` (ChatGPT 4o Mini) de OpenAI como orquestador predeterminado, e invoca de manera autónoma herramientas y sub-agentes para cumplir tareas complejas como crear carpetas, redactar guiones o planificar canales.

## 🛠️ Cómo lo hace
Utiliza el patrón **Function Calling Nativo** a través del Vercel AI SDK:
1. Lee las credenciales y el `workspacePath` del payload HTTP.
2. Extrae de la base de datos de Prisma el agente principal (`isOrchestrator: true`) y su catálogo dinámico de herramientas (`Tools`).
3. Traduce los JSON Schemas de la BD a tipos Zod mediante la utilidad `jsonSchema` de `ai-core`.
4. **Snapshot en Tiempo Real del Workspace:** Antes de llamar al LLM, escanea físicamente la estructura actual de `workspacePath` (canales, subcarpetas y archivos) e inyecta un bloque de verdad absoluta en el `systemPrompt` para que el modelo nunca alucine carpetas inexistentes o borradas.
5. Ejecuta `generateText` con `maxSteps: 5`. Si el modelo decide que necesita explorar una carpeta o leer un archivo, el SDK interrumpe, ejecuta la función conectada a tu Motor Python, devuelve el resultado al modelo, y el modelo formula una respuesta o hace otra llamada.
6. Inyecta dinámicamente las reglas de negocio (`contextRules`) si el usuario está chateando dentro del alcance de un Canal específico.
7. **Sincronización Bidireccional UI/LLM:** Detecta si se ejecutaron herramientas mutadoras (`crear_carpetas`, `eliminar_carpetas`, etc.), retorna `workspaceModified: true` y el frontend (`app/dashboard/page.tsx`) recarga automáticamente el árbol de archivos (`workspaceTree`) en tiempo real.

## 📂 Archivos involucrados
- `app/api/chat/route.ts` -> El endpoint donde vive toda la lógica del Orquestador.
- `prisma/schema.prisma` -> Modelos `Agent`, `Tool`, y `AgentTool` (relación Many-to-Many).
- `scripts/seed-orchestrator.ts` -> Script de inserción de las herramientas base.

## 🎯 Propósito
Permitir que la Inteligencia Artificial sea "agéntica", es decir, que no solo genere texto de manera estática, sino que actúe sobre el sistema operativo (escribiendo, leyendo, explorando carpetas) sin necesidad de intervención manual o scripts inflexibles.
