# 💡 Idea de Negocio & Escalabilidad: Instalador Oficial 1-Clic (`AutoProd-Setup.exe`)

> **Ruta:** `docs/features/standalone_installer/idea.md`  
> **Estado:** `✅ HECHO (Windows: AutoProd-Setup.exe & macOS: AutoProd-Setup.dmg)`  
> **Propósito:** Empaquetar todo el motor local de procesamiento pesado, dependencias y binarios en un único instalador profesional de escritorio, eliminando terminales, dependencias manuales y fricción para el creador de contenido.

---

## 🎯 1. El Problema del Creador
- El 95% de los creadores de contenido no son desarrolladores de software: no saben ni quieren saber qué es Python, pip, FFmpeg, variables de entorno `PATH`, o comandos de terminal.
- Si una herramienta exige abrir una consola negra para instalar dependencias, la tasa de abandono de usuarios supera el 80%.
- La promesa de AutoProd (*"Tu contenido. Tu equipo. Tu control"* con $0 costo de servidor) depende de que el motor corra localmente en la máquina del usuario. Para que esto funcione a escala masiva, **la instalación debe ser exactamente tan simple como instalar Spotify, Discord o Steam**.

---

## 🚀 2. Solución: El Instalador Autónomo de AutoProd
1. **Experiencia de 1 Clic (Zero-Config en Windows):**
   - El creador descarga `AutoProd-Setup.exe`.
   - Un asistente visual con diseño oficial y selección de idioma instala todo en silencio sin tocar la terminal.
2. **Binarios Portables Embebidos:**
   - No requiere que el usuario instale Python ni FFmpeg por separado.
   - El instalador deposita `autoprod-motor.exe` (compilado con PyInstaller con todas las librerías incluidas: FastAPI, Faster-Whisper, Edge-TTS) y los ejecutables portables `ffmpeg.exe` y `yt-dlp.exe` en la carpeta `bin/`.
3. **Inicialización Automática del Workspace Canónico:**
   - Durante la instalación, crea automáticamente el archivo de configuración `.autoprod-config.json` fijando la carpeta `workspace/`.
   - Crea un acceso directo en el Escritorio y en el Menú Inicio.
4. **Distribución Gratuita y Escalable vía GitHub Releases:**
   - La entrega del instalador no satura los servidores de AutoProd: la API [`/api/setup/download-installer`](file:///e:/autoprod/app/api/setup/download-installer/route.ts) redirige de forma transparente al CDN de GitHub Releases (`/releases/latest/download/AutoProd-Setup.exe`), logrando costo $0 de ancho de banda y máxima velocidad de descarga global.

---

## 📊 3. Matriz de Alcance

| Capacidad | Estado | Notas |
|---|:---:|---|
| Compilador One-File PyInstaller (`autoprod-motor.exe`) | `✅ HECHO` | Con soporte para Faster-Whisper, Edge-TTS y Uvicorn. |
| Instalador Gráfico Inno Setup (`AutoProd-Setup.exe`) | `✅ HECHO` | Asistente en español e inglés con desinstalador limpio. |
| Inyección de Binarios Portables (`ffmpeg`, `yt-dlp`) | `✅ HECHO` | Alojados en `{app}\bin\` y añadidos al PATH del proceso. |
| Entrega CDN vía GitHub Releases (`/api/setup/download-installer`) | `✅ HECHO` | Descarga de la última release publicada en Windows. |
| Arnés de Compilación en 1 Comando (`pnpm build:exe` / `pnpm build:mac`) | `✅ HECHO` | Automatizado en `harness/build/`. |
| Empaquetado macOS (`AutoProd-Setup.dmg`) | `✅ HECHO` | Script `build-macos.sh` y workflow GitHub Actions (`macos-latest`). |
| Pipeline CI/CD Multiplataforma (`.github/workflows/release-installers.yml`) | `✅ HECHO` | Compilación dual en la nube y subida a GitHub Releases. |
| Auto-Actualizador Silencioso (Silent Updater) | `📋 PLANIFICADO` | Verificación en background de nuevas versiones sin reinstalar. |
| Firma Digital de Código (Certificado EV Code Signing) | `💡 IDEA` | Para evitar la advertencia azul de Windows SmartScreen. |

---

## 🔮 4. Banco de Ideas de Escalabilidad
- **IDEA-INST-1 (Auto-Updater Silencioso):** Al arrancar el motor, consultar GitHub API para ver si hay un tag superior; de ser así, descargar el parche en segundo plano y avisar al usuario en el Dashboard.
- **IDEA-INST-2 (Paquete Todo-en-Uno Tauri / Electron):** Integrar la ventana web y el motor en un ejecutable de escritorio nativo único.
