# 🎨 Documentación Front-End: Web App PWA

## 📌 Resumen General
La capa de presentación es una **Progressive Web App (PWA)** desarrollada en **React / Next.js 15**, estilizada con **Tailwind CSS** y componentes de **Shadcn UI**. Se puede instalar directamente en el escritorio de Windows y macOS con un solo clic.

---

## 📐 Layout de 3 Columnas (IDE Style)

1. **Panel Izquierdo (Navegador & Recursos)**:
   * Explorador de Canales y Proyectos.
   * Gestor de plantillas de Prompts (`PLANTILLA_DESCRIPCIONES.md`, `PROMPT_OPTIMIZADOR_SEO.md`).
   * Estado de la API Key de Gemini (BYOK).

2. **Panel Central (Chat Co-Pilot & Interceptor de Prompts)**:
   * Interfaz conversacional en tiempo real conectada a la API de Gemini.
   * **Interceptor de Prompts (Pre-flight Quality Checklist)**: Pausa el envío del usuario para ofrecer checkboxes recomendadas (Call to action, tags, marcas de tiempo) y enriquecer la consulta antes de enviar.

3. **Panel Derecho (Inspector de Resultados)**:
   * Vista previa en tiempo real de títulos, etiquetas y descripciones SEO generadas.
   * Previsualización de imágenes/miniaturas generadas.
   * Monitor de progreso de renderizado de video local (conectado al Helper `localhost:4812`).

---

## 🛠️ Tecnologías y Librerías
* **Framework**: Next.js 15 (App Router) + React 19.
* **PWA**: `@ducanh2912/next-pwa` (Soporte offline e instalación de escritorio).
* **Estilos**: Tailwind CSS + Shadcn UI + Lucide Icons.
* **Estado & Peticiones**: React Hooks + `@google/genai` SDK.
