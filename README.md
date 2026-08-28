# 🚀 AutoProd — Plataforma Agéntica de Producción de Video

**AutoProd** es una plataforma web progresiva (PWA) de nivel profesional diseñada para automatizar la producción de video, optimizar contenido SEO y crear proyectos completos para canales de YouTube mediante una orquestación inteligente de IA.

El núcleo del proyecto está diseñado bajo una **Arquitectura Agéntica Híbrida Multi-Modelo** altamente refinada, pensada para garantizar la máxima eficiencia operativa y minimizar los costos de IA, delegando responsabilidades según la especialidad de cada componente:

### 1. El Orquestador Local (Llama / Ollama) 🧠
- Actúa como el "Director de Orquesta" y opera localmente de forma **gratuita**.
- Lee un catálogo dinámico de APIs (Switches) directamente desde la base de datos, conociendo en tiempo real qué herramientas tiene a su disposición.
- **Protocolo de Intercepción**: En lugar de requerir que el modelo genere JSON estructurado (lo cual suele fallar en modelos pequeños como Llama 8B), utiliza un protocolo estricto de strings `[LLAMAR_API: slug | arg1: valor]`. Nuestro backend intercepta esto en el stream y ejecuta las acciones silenciosamente.
- Su único trabajo es *decidir qué herramienta usar* basándose en el contexto del chat. No hace trabajo pesado.

### 2. El Motor Local (Python en Puerto 8000) ⚙️
- Este es el **trabajador pesado (Heavy Lifter)** de la arquitectura.
- Opera directamente en la máquina del usuario (PC) por razones de seguridad y acceso.
- Se encarga de explorar el disco duro (`workspace_list`), leer archivos (`workspace_read`), crear árboles enteros de directorios para nuevos canales (`/workspace/create`), y guardar los guiones o resultados (`write_file`).
- La seguridad es estricta: solo permite operar sobre archivos `.md` y `.txt`, protegiendo el entorno de ejecución de inyecciones de código.

### 3. Los Agentes Especialistas (Switches Cloud - ej. Gemini) ⚡
- Modelos avanzados y de pago (como **Gemini 1.5 Flash**) que se invocan *únicamente* cuando la tarea requiere alta inteligencia o redacción creativa extensa.
- **Flujo**: Llama orquesta -> Inicia el Switch -> Se arma un "Súper Prompt" -> Gemini ejecuta la redacción o el diseño conceptual -> Se envía el resultado al Motor Python para que lo guarde.
- Esto asegura que **solo gastas dinero/créditos cuando realmente necesitas un modelo premium**, mientras que toda la planeación previa la hizo Llama gratis.

### 4. Catálogo Dinámico en Base de Datos (Prisma/Supabase) 🗄️
- Cero *hardcoding*. Las funciones a las que Llama puede acceder se almacenan en la tabla `Agent` de la base de datos.
- Si se añade un nuevo agente (ej. "Gestor Movement", "Arquitecto de Canales"), este queda automáticamente disponible en el Súper Prompt del sistema para que Llama empiece a usarlo.

---

## 📂 Estructura del Proyecto

```text
AutoProd/
├── app/                  <-- Código de la aplicación Next.js 15 (App Router)
├── docs/                 <-- Módulos de documentación (Ficha Técnica, Reglas)
├── controlador/          <-- Motor Python Local (FastAPI, Puerto 8000)
├── prisma/               <-- Esquema Prisma (Base de Datos)
├── README.md             <-- Este archivo
└── seed_agents.cjs       <-- Script para poblar la Base de Datos con los Agentes
```

---

## 🛠️ Tecnologías Principales

*   **Front-End**: Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI, AI SDK (Vercel).
*   **Backend Cloud**: Next.js API Routes (TypeScript), Prisma 8 ORM, Supabase (PostgreSQL).
*   **Motor Local**: Python (FastAPI / Uvicorn).
*   **Modelos de IA**: Ollama (Llama 3 8B), Google Gemini 1.5 Flash (via `@ai-sdk/google`).

---

## 🚀 Inicio Rápido (Desarrollo)

### 1. Instalar Dependencias
Asegúrate de utilizar `pnpm`:
```bash
pnpm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env` y rellena las variables de Supabase, Prisma y Google AI:
```bash
cp .env.example .env
```

### 3. Población de Base de Datos (Agentes)
Asegúrate de haber empujado tu esquema y correr el seed para cargar los Agentes:
```bash
pnpm exec prisma db push
node seed_agents.cjs
```

### 4. Iniciar Motores
Debes correr tanto el Motor Local de Python (Puerto 8000) como la Web App (Puerto 3000):

Terminal 1 (Backend Next.js):
```bash
pnpm dev
```

Terminal 2 (Motor Python):
```bash
cd controlador
python -m uvicorn main:app --reload --port 8000
```
