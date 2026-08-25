# 🛠️ Arnés de Pruebas y Despliegue (Harness)

Este directorio contiene scripts y herramientas de automatización para validaciones locales y flujos de despliegue.

## 📂 Estructura del Módulo

- **`validations/`**: Scripts de PowerShell para pre-validación de entornos y estado de Git.
  - `check-env.ps1`: Valida la existencia de las variables de entorno necesarias.
  - `git-prep.ps1`: Verifica que el repositorio local esté listo y limpio para desplegar.
- **`deploy/`**: Scripts de automatización para el despliegue en la nube.
  - `deploy-vercel.js`: Coordina el despliegue del proyecto Next.js en Vercel.
