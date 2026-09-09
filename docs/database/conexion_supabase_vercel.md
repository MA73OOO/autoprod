# 🔌 Integración y Conexión: Supabase 🤝 Vercel y Gestión de Entornos (DevOps)

Este documento detalla la configuración y el flujo de conexión entre la base de datos PostgreSQL en **Supabase** y la plataforma de despliegue **Vercel** usando **Prisma ORM**, detallando el paso a paso para crear un flujo DevOps completo de múltiples entornos de prueba y producción a coste $0 USD.

---

## 🏗️ Estrategia de Entornos (DevOps $0 USD)

Para trabajar de manera segura sin alterar datos reales en producción ni generar costos, crearemos dos proyectos espejo independientes en Supabase:

```mermaid
graph TD
    A[Repositorio Git GitHub] -->|Push a master/main| B(Vercel: Entorno Production)
    A -->|Push a ramas feature/* u Opciones PR| C(Vercel: Entorno Preview / Pruebas)
    A -->|Desarrollo Local en Máquina| D(Localhost: Entorno Development)

    B -->|Se conecta a| E[Supabase Proyecto: autoprod-prod]
    C -->|Se conecta a| F[Supabase Proyecto: autoprod-dev]
    D -->|Se conecta a| F[Supabase Proyecto: autoprod-dev]
```

1.  **Entorno de Producción (`Production`)**:
    *   **GitHub**: Rama `master` o `main`.
    *   **Vercel**: Dominio de producción (ej. `autoprod.vercel.app`).
    *   **Supabase**: Proyecto dedicado `autoprod-prod`.
2.  **Entorno de Pruebas / Vista Previa (`Preview`)**:
    *   **GitHub**: Cualquier rama secundaria (ej. `feature/auth-supabase`) o Pull Requests abiertos.
    *   **Vercel**: URLs autogeneradas temporales de pruebas por cada commit.
    *   **Supabase**: Proyecto dedicado `autoprod-dev`.
3.  **Entorno Local (`Development`)**:
    *   **Ejecución**: Tu máquina en `localhost:3000`.
    *   **Supabase**: Conectado al mismo proyecto `autoprod-dev`.

---

## 🔑 Variables de Entorno Requeridas

Necesitamos configurar las variables en Vercel asignándolas a sus entornos correspondientes:

| Variable | Descripción | Entorno en Vercel | Origen (Supabase) |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Pool de conexiones (puerto 6543) | **Production** | Proyecto `autoprod-prod` |
| | | **Preview / Development** | Proyecto `autoprod-dev` |
| `DIRECT_URL` | Conexión directa (puerto 5432) | **Production** | Proyecto `autoprod-prod` |
| | | **Preview / Development** | Proyecto `autoprod-dev` |
| `NEXT_PUBLIC_SUPABASE_URL` | API Endpoint Cliente | **Production** | Proyecto `autoprod-prod` |
| | | **Preview / Development** | Proyecto `autoprod-dev` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave anónima pública | **Production** | Proyecto `autoprod-prod` |
| | | **Preview / Development** | Proyecto `autoprod-dev` |

---

## 🛠️ Paso a Paso para Configurar el Entorno

### Paso 1: Crear los proyectos en Supabase
1. Entra a tu consola de [Supabase](https://supabase.com/).
2. Haz clic en **New Project**.
3. Crea el primero con el nombre `autoprod-prod` (Producción).
4. Crea el segundo con el nombre `autoprod-dev` (Desarrollo y pruebas).

### Paso 2: Vincular tu repositorio en Vercel
1. Ingresa a la consola de [Vercel](https://vercel.com/) y haz clic en **Add New > Project**.
2. Importa el repositorio de GitHub de `AutoProd`.
3. En la sección **Configure Project**, no toques la sección de comandos (Vercel detecta Next.js automáticamente).

### Paso 3: Configurar variables por entorno en Vercel
1. Antes de desplegar, expande la sección **Environment Variables** en Vercel.
2. Agrega una variable, por ejemplo, `DATABASE_URL`:
   * Copia la URI de transacciones de tu Supabase `autoprod-prod`.
   * En las casillas de verificación de entornos, marca **únicamente** 🟩 `Production`.
3. Haz clic en añadir y vuelve a agregar `DATABASE_URL`:
   * Copia la URI de transacciones de tu Supabase `autoprod-dev`.
   * En las casillas de verificación de entornos, marca **únicamente** 🟩 `Preview` y 🟩 `Development`.
4. Repite el mismo proceso con las variables restantes (`DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5. Haz clic en **Deploy**.

### Paso 4: Configurar tu entorno local `.env`
Crea un archivo llamado `.env` en la raíz de tu proyecto local con las llaves de tu Supabase de desarrollo (`autoprod-dev`):
```env
DATABASE_URL="postgresql://postgres.[ID_DEV]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ID_DEV]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ID_DEV].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
```

---

## 🔄 Proceso DevOps Diario (Flujo de Trabajo)

Cuando quieras realizar un cambio o añadir código:

1. **Crear una rama local**:
   ```bash
   git checkout -b feature/nueva-api-auth
   ```
2. **Hacer cambios y probarlos**: Corres `pnpm dev` en local. Los datos se guardarán en tu base de datos de pruebas (`autoprod-dev`).
3. **Subir la rama a GitHub**:
   ```bash
   git push origin feature/nueva-api-auth
   ```
4. **Validación en Vercel Preview**: Vercel detectará el push y creará un despliegue de prueba. Puedes entrar a ese enlace y probar las APIs; estas seguirán usando la base de datos de pruebas (`autoprod-dev`).
5. **Merge a Master**: Al confirmar el correcto funcionamiento de las APIs en la URL de preview, realizas el merge a `master` en GitHub.
6. **Puesta en Producción**: Vercel compilará la rama `master` automáticamente y inyectará de forma segura las credenciales de `autoprod-prod`. Tus usuarios verán los cambios integrados con la base de datos real.

---

## ⚡ Automatización con Infraestructura como Código (Terraform)

En lugar de crear los proyectos y copiar/pegar variables a mano, dispones de los archivos en [`terraform/`](file:///e:/autoprod/terraform/):

1. **Crear archivo de variables privadas**:
   ```bash
   cp terraform/terraform.tfvars.example terraform/terraform.tfvars
   ```
2. **Llenar tokens y contraseñas** en `terraform.tfvars` (Supabase access token, Vercel token, org_id, etc.).
3. **Inicializar y desplegar**:
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```
Esto creará automáticamente los proyectos `autoprod-dev` y `autoprod-prod`, inyectará las variables de entorno divididas por entorno (`production` vs `development/preview`), y configurará el dominio `autoprodai.com` en Vercel.
