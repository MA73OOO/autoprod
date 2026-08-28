# 🚀 AutoProd — Gemini Video Organizer App (Web App PWA)

**AutoProd** es una plataforma web progresiva (PWA) de nivel profesional diseñada para automatizar la producción de video, optimizar contenido SEO mediante IA (Google Gemini) y renderizar videos automáticamente para canales de YouTube. 

El núcleo del proyecto está diseñado bajo una **Arquitectura Agéntica Híbrida Multi-Modelo** que garantiza máxima privacidad, eficiencia operativa y un **costo de orquestación de $0 USD**:
1. **Frontend y APIs en la Nube**: Servidos de forma gratuita en Vercel, gestionando la base de datos (Supabase) y el consumo de créditos API.
2. **Orquestador Local (Motor Python)**: Opera en la PC del creador. Se encarga de manipular el sistema de archivos (crear carpetas, guardar guiones) y proveer acceso seguro al almacenamiento.
3. **Gestor de Contexto (Context Manager)**: Utilidad en Next.js que lee reglas maestras (ej. `PROMPT_OPTIMIZADOR_SEO.md`) y reglas específicas (`.autoprod_channel.md`) del sistema de archivos local para ensamblar los prompts.
4. **Agentes Especialistas (Consolas)**: Interfaces modulares en la UI (ej. Arquitecto de Canales, Guionista SEO) conectadas a Endpoints aislados. Evitan la divagación delegando el "pensamiento" a APIs Cloud (Gemini/OpenAI) con un Súper-Prompt altamente empaquetado (One-Shot Generation).

---

## 📂 Estructura del Proyecto

```text
AutoProd/
├── app/                  <-- Código de la aplicación Next.js 15 (App Router)
├── docs/                 <-- Módulos de documentación
│   ├── frontend/         <-- UI PWA (React / Next.js, Tailwind, Shadcn UI)
│   ├── backend/          <-- API Cloud (TypeScript) y Local Helper (Python)
│   ├── database/         <-- Esquema Prisma, Supabase y Terraform
│   └── functions/        <-- Catálogo de funciones (Interceptor, BYOK, Render)
├── harness/              <-- Arnés de validación de entornos y despliegues
│   ├── deploy/           <-- Scripts de automatización de despliegues
│   └── validations/      <-- Validaciones de Git y variables de entorno
├── README.md             <-- Este archivo
└── .gitignore
```

---

## 🛠️ Tecnologías Principales

*   **Front-End**: Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI, PWA (`@ducanh2912/next-pwa`).
*   **Backend Cloud**: Next.js API Routes (TypeScript), Prisma ORM, Supabase (PostgreSQL).
*   **Agente Helper Local**: Python (FastAPI / PyInstaller) + FFmpeg.
*   **Infraestructura**: Terraform IaC + Vercel.

---

## 🚀 Inicio Rápido (Desarrollo Frontend)

Para levantar la interfaz y el servidor de desarrollo de la web app:

### 1. Instalar Dependencias
Asegúrate de utilizar `pnpm`:
```bash
pnpm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env.local` y rellena las variables de Supabase y Prisma:
```bash
cp .env.example .env.local
```

### 3. Iniciar Servidor de Desarrollo
```bash
pnpm dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.
