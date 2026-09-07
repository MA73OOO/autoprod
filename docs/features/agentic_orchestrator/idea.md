# 💡 Idea & Escalabilidad: Agentic Orchestrator

> **Ruta:** `docs/features/agentic_orchestrator/idea.md`  
> **Propósito:** Transformar la IA de un simple generador de texto pasivo en un copilot proactivo capaz de actuar sobre el sistema operativo y producir contenido autónomamente.

---

## 🎯 1. El Problema & El Propósito de Negocio

- **El Problema:** Chatear con ChatGPT o Claude en su web estándar obliga al creador a copiar y pegar manualmente respuestas, crear carpetas en el explorador de Windows, guardar archivos y formatear guiones a mano. La IA no tiene "manos" para tocar los archivos del usuario.
- **La Solución AutoProd:** Un orquestador inteligente que combina la economía de `gpt-4o-mini` (para tareas de bajo costo) con herramientas nativas que leen, crean y organizan carpetas y archivos locales de forma desatendida, permitiendo además activar el **Pensamiento Profundo** cuando se requiere análisis estratégico de alto calibre.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Function Calling Nativo Multi-Paso (5 pasos)** | `✅ HECHO` | Encadena lectura, escritura y creación de archivos en una sola llamada. |
| **Snapshot de Verdad Absoluta del Workspace** | `✅ HECHO` | Evita alucinaciones inyectando el estado real del disco en el prompt. |
| **Modo Pensamiento Profundo (Deep Reasoning)** | `✅ HECHO` | Enrutamiento a Gemini Flash Thinking / Pro / o3-mini para análisis experto. |
| **Plantillas Guiadas de Prompting** | `✅ HECHO` | Inserción de preguntas clave para Canal, Video, Guion y Arte. |
| **Sincronización Reactiva de UI (`workspaceModified`)** | `✅ HECHO` | Refresca el árbol de archivos en vivo sin recargar la página. |
| **Ejecución Asíncrona en Background (Sub-Agentes)** | `⏳ FALTANTE` | Agente que trabaja en segundo plano mientras el usuario sigue chateando. |
| **Memoria a Largo Plazo de Preferencias del Creador** | `⏳ FALTANTE` | Recordar reglas específicas (ej: "nunca uses la palabra X en mis títulos"). |
| **Confirmación Visual de Diff de Archivos** | `⏳ FALTANTE` | Previsualizar qué líneas cambiarán en un archivo antes de permitir la escritura. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Agente Detective de Errores de Render:**
   - Si un render en FFmpeg falla, el orquestador lee automáticamente el log de error, diagnostica el problema (ej: falta de espacio en disco o códec incompatible) y propone la solución con un botón.
2. **Modo Autónomo de Planificación Semanal:**
   - Pedirle al orquestador: *"Planifica los 3 videos de la próxima semana para mi canal de terror"* y que genere de golpe las 3 carpetas con sus sinopsis, guiones base y sugerencias de títulos optimizados.
