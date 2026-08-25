# ⚙️ Documentación Backend: TypeScript & Local Helper Python

## 📌 Resumen General
El backend está dividido en dos capas optimizadas para mantener el costo operativo en **$0 USD**:

1. **Cloud Backend (TypeScript - Next.js API Routes / Vercel)**:
   * Gestiona autenticación de usuarios (Supabase Auth).
   * Maneja el CRUD de Canales y Proyectos mediante **Prisma ORM**.
   * Entrega actualizaciones de scripts de Python en caliente (`Hot-Reloading`).

2. **Agente Helper Local (Python - `localhost:4812`)**:
   * Ejecutable liviano que corre silenciosamente en la computadora del cliente.
   * Ejecuta `generador_videos.py` y FFmpeg utilizando la CPU/GPU del cliente.
   * Descarga automáticamente actualizaciones de scripts desde Vercel sin molestar al usuario.

---

## 🔌 API Endpoints (Cloud & Local)

### Endpoints Cloud (Vercel)
* `POST /api/auth`: Inicio de sesión y token JWT con Supabase.
* `GET /api/projects`: Listado de canales y proyectos del usuario.
* `GET /api/scripts/latest`: Devuelve la versión más reciente de `generador_videos.py`.

### Endpoints Local Helper (`http://localhost:4812`)
* `GET /status`: Verifica que el Helper está activo en la máquina del cliente.
* `POST /render`: Inicia el renderizado de video en el disco local usando FFmpeg.
* `POST /update-scripts`: Descarga silenciosa del script de Python en caliente.
