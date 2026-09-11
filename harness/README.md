# 🛠️ Arnés de Pruebas y Despliegue (Harness)

Este directorio contiene scripts y herramientas de automatización para validaciones locales y flujos de despliegue.

## 📂 Estructura del Módulo

- **`db/`**: Harness de migraciones y sincronización de PostgreSQL.
  - `migrate.ts`: Ejecución secuencial transaccional de `migrations/*.sql` con checksums, tracking en `_autoprod_migrations` y auto-regeneración de Prisma Client (`pnpm db:migrate` / `pnpm db:status`).
- **`build/`**: Harness de compilación y empaquetado del Motor Local.
  - `compile-exe.ts`: Compilador automatizado con liberación de bloqueos de procesos, PyInstaller y verificación de dependencias portables (`pnpm build:exe`).
- **`validations/`**: Scripts de pre-validación de entornos y estado de Git.
  - `check-env.ts` / `check-env.ps1`: Valida variables de entorno críticas (`pnpm check:env`).
  - `git-prep.ts` / `git-prep.ps1`: Verifica que el repositorio local esté limpio para desplegar (`pnpm check:git`).
- **`setup/`**: Detección y aprovisionamiento de binarios del sistema operativo (FFmpeg, Whisper, Python).
- **`deploy/`**: Pipeline de despliegue a producción seguro y automatizado.
  - `deploy-vercel.ts`: Valida variables (.env), aplica migraciones en Supabase, ejecuta build de prueba y prepara/lanza el despliegue a Vercel (`pnpm deploy:prod` / `pnpm deploy:vercel`).
