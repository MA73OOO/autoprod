# ⚙️ Motor Local (Python FastAPI)

## 📌 Qué hace
Es el puente entre el cerebro alojado en la nube (Next.js) y el disco duro del usuario. Ejecuta operaciones físicas en el Sistema Operativo, como listar archivos, crear estructuras de carpetas, o abrir el explorador de archivos nativo de Windows/macOS.

## 🛠️ Cómo lo hace
Está construido en Python utilizando el framework web `FastAPI`. 
1. El usuario inicializa el servidor local (usualmente corriendo en `http://localhost:8000`).
2. Expone Endpoints RESTful protegidos por configuración de CORS (solo acepta peticiones desde `localhost:3000` y el dominio de producción `autoprod.vercel.app`).
3. El frontend y el backend (Vía las herramientas del Orquestador) hacen llamados HTTP a estos endpoints.
4. El motor ejecuta comandos nativos (como `os.walk`, manipulación de archivos `open()`, o comandos PowerShell/AppleScript para diálogos de carpeta) y devuelve los resultados formateados al Orquestador.

## 📂 Archivos involucrados
- `controlador/routers/workspace.py` -> Contiene los endpoints para leer archivos, listarlos, eliminarlos y el prompt nativo para seleccionar la carpeta base.
- `controlador/routers/ollama.py` -> Endpoints para la instalación automática y control del modelo local Ollama.
- `main.py` -> Archivo de inicio del servidor FastAPI (usando uvicorn).

## 🎯 Propósito
Evitar las limitaciones del navegador. Como AutoProd es un software SaaS web (Next.js), el navegador por seguridad bloquea el acceso directo a los archivos locales del usuario. El Motor Local elimina esta restricción, permitiendo que la IA web "hackee" la brecha e instancie cambios directamente en la PC del usuario a Costo de Servidor $0.
