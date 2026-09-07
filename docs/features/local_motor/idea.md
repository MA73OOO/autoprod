# 💡 Idea & Escalabilidad: Motor Local (FastAPI Python)

> **Ruta:** `docs/features/local_motor/idea.md`  
> **Propósito:** El pilar de costo cero de AutoProd: desbloquear el poder del hardware local del cliente sin las restricciones de seguridad del navegador.

---

## 🎯 1. El Problema & El Propósito de Negocio

- **El Problema:** Por motivos de seguridad (sandbox), las aplicaciones web en el navegador no pueden acceder libremente a los archivos del disco duro ni ejecutar programas instalados en la PC (como FFmpeg o Whisper). La mayoría de empresas resuelven esto subiendo los archivos a un servidor en la nube, lo que genera costos astronómicos de ancho de banda y renderizado.
- **La Solución AutoProd:** Un microservicio local en Python que corre silenciosamente en la computadora del usuario. Permite que la IA web dé instrucciones seguras para manipular archivos, renderizar videos y transcribir audios directamente en su GPU/CPU, manteniendo los costos de infraestructura de AutoProd en **$0 USD**.

---

## 📊 2. Matriz de Alcance: Lo Hecho vs. Lo Faltante

| Capacidad | Estado | Descripción / Comentario |
|---|:---:|---|
| **Servidor FastAPI en Puerto 8000** | `✅ HECHO` | Uvicorn con CORS seguro para desarrollo y producción. |
| **Integración con Diálogos Nativos de Windows/macOS** | `✅ HECHO` | Selector nativo de carpetas sin inputs file limitados de HTML. |
| **Control de Acceso por Licenciamiento (Tiers)** | `✅ HECHO` | Exclusivo para suscriptores Starter, Pro y Enterprise. |
| **Inicio en Segundo Plano / Servicio Silencioso** | `⏳ FALTANTE` | Iniciar como demonio/servicio de Windows sin ventana de terminal abierta. |
| **Empaquetado en Ejecutable Único (`.exe`)** | `⏳ FALTANTE` | Empaquetar con PyInstaller o Tauri para evitar que el usuario instale Python. |
| **Detección Automática de Actualizaciones de Versión** | `⏳ FALTANTE` | Alerta en el dashboard cuando hay un nuevo motor local disponible. |

---

## 🚀 3. Banco de Ideas de Escalabilidad para este Módulo

1. **Auto-Detección y Configuración de Drivers NVIDIA CUDA:**
   - Detectar si la máquina tiene tarjeta gráfica GeForce/RTX y activar aceleración por GPU automáticamente sin configuración manual.
2. **Soporte de Autenticación por Token Local (Bearer Secret):**
   - Generar un token criptográfico efímero al arrancar el motor para que ninguna otra pestaña del navegador pueda enviar peticiones no autorizadas.
