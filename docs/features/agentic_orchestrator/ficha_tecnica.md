# ⚙️ Ficha Técnica: Agentic Orchestrator & Tool Execution Loop

> **Ruta:** `docs/features/agentic_orchestrator/ficha_tecnica.md`  
> **Estado:** `✅ HECHO` (En producción / Operativo)  
> **Capa Técnica:** Next.js API Routes (`/api/chat`) + Vercel AI SDK (`generateText`) + Prisma + Motor Python Local

---

## 🛠️ 1. Pipeline de Ejecución Agéntica (Tool Loop)

```mermaid
flowchart TD
    A[Usuario envía mensaje] --> B[app/api/chat/route.ts]
    B --> C[Snapshot de Verdad Absoluta del Workspace Local]
    B --> D[Carga de Herramientas desde BD Prisma]
    B --> E{¿Pensamiento Profundo?}
    E -->|Sí| F[Gemini 2.0 Flash Thinking / Pro / o3-mini]
    E -->|No| G[gpt-4o-mini Orquestador Gratuito]
    F & G --> H[generateText con maxSteps: 5]
    H -->|Tool Call: LOCAL:*| I[FastAPI Motor Python en localhost:8000]
    I -->|Resultado en Disco| H
    H -->|Respuesta Final| J[UI Stream / Sincronización de Tree]
```

---

## 🔌 2. Capacidades Técnicas del Endpoint `/api/chat`

1. **Snapshot en Tiempo Real del Workspace:**
   - Antes de enviar el prompt al LLM, escanea el directorio local para inyectar carpetas y archivos reales, evitando alucinaciones de rutas inexistentes.
2. **Traducción Dinámica de Schemas JSON a Zod:**
   - Lee definiciones de herramientas desde la tabla `Tool` de Prisma y las adapta al vuelo usando `jsonSchema` de `ai-core`.
3. **Loop Multi-Paso (`maxSteps: 5`):**
   - Permite que el modelo encadene hasta 5 operaciones consecutivas (ej: listar carpetas $\to$ leer archivo $\to$ crear carpeta nueva $\to$ escribir guion $\to$ responder).
4. **Sincronización Bidireccional (`workspaceModified`):**
   - Si una herramienta altera el sistema de archivos, el endpoint emite la señal para que el componente `FileTree.tsx` recargue automáticamente el árbol de archivos.
5. **Modo Pensamiento Profundo (Deep Reasoning):**
   - Enrutamiento a modelos de razonamiento riguroso con inyección de reglas de retención y psicología de audiencia.

---

## 📂 3. Archivos Involucrados

- [`app/api/chat/route.ts`](file:///e:/autoprod/app/api/chat/route.ts): Endpoint central del orquestador.
- [`components/dashboard/ChatPanel.tsx`](file:///e:/autoprod/components/dashboard/ChatPanel.tsx): Panel de chat con selector de modo de razonamiento y plantillas guiadas.
- [`prisma/schema.prisma`](file:///e:/autoprod/prisma/schema.prisma): Modelos `Agent`, `Tool` y `AgentTool`.
- [`scripts/seed-orchestrator.ts`](file:///e:/autoprod/scripts/seed-orchestrator.ts): Catálogo de herramientas base registradas.
