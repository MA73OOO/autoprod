# 🚀 AutoProd — Gemini Video Organizer App (Web App PWA)

**AutoProd** es una plataforma web progresiva (PWA) de nivel profesional diseñada para automatizar la producción de video, optimizar contenido SEO mediante IA (Google Gemini) y renderizar videos automáticamente para canales de YouTube. 

El núcleo del proyecto está diseñado bajo una arquitectura híbrida que garantiza un **costo operativo de $0 USD** para el creador:
1. **Frontend y APIs en la Nube**: Servidos de forma gratuita en Vercel, gestionando la base de datos y autenticación mediante Supabase.
2. **Procesamiento de Video Local**: Un agente helper local (Python + FFmpeg) que aprovecha los recursos locales (CPU/GPU) del propio usuario para el renderizado pesado, eliminando la necesidad de costosos servidores de renderizado en la nube.

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
