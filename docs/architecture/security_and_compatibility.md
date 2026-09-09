# COMPATIBILITY_AND_SECURITY_GUIDELINES

## 1. Introducción
Este documento define el estándar obligatorio de desarrollo y las directrices arquitectónicas para el proyecto **AutoProd** (Consola Next.js + Motor de Agentes Python con FastAPI). 

El objetivo primordial es garantizar que todo script, endpoint o paquete de Python sea **100% compatible y seguro** en entornos **Windows (Microsoft), macOS (Apple Silicon y x86_64) y Linux**, sin comprometer permisos del sistema operativo base ni generar violaciones a las políticas de seguridad (Windows Defender SmartScreen, Apple Gatekeeper, SELinux, etc.).

Cualquier PR o contribución al código fuente debe adherirse estrictamente a estas reglas.

---

## 2. Reglas de Compatibilidad de Rutas y File System

La gestión de rutas es el punto de falla número uno en aplicaciones multiplataforma. Queda prohibida la manipulación de rutas basada en concatenación de strings de texto puro.

### 2.1. Prohibición de Rutas Hardcodeadas
**Regla:** Nunca se deben incluir rutas absolutas fijas en el código fuente (ej. `E:\Youtube` o `/Users/admin/Youtube`).

**❌ Incorrecto:**
```python
# Provocará fallos en cualquier otra máquina o SO
WORKSPACE_PATH = "E:\\Youtube"
```

### 2.2. Uso Obligatorio de `pathlib.Path`
**Regla:** Toda operación de archivos debe realizarse a través de la librería estándar `pathlib`. Se debe utilizar resolución dinámica basada en el directorio del usuario o variables de entorno.

**✅ Correcto:**
```python
import os
from pathlib import Path

# Resolución dinámica
USER_HOME = Path.home()
DEFAULT_WORKSPACE = USER_HOME / "Youtube"

# O mediante variables de entorno con fallback
WORKSPACE_PATH = Path(os.getenv("AUTOPROD_WORKSPACE", DEFAULT_WORKSPACE)).resolve()
```

### 2.3. Manejo Universal de Separadores y Normalización
**Regla:** Jamás usar `\` o `/` manualmente para concatenar directorios. Usar el operador `/` de `pathlib` que el OS resuelve internamente, y aplicar siempre `.resolve()` para evitar ataques de *Directory Traversal* (`../`).

**✅ Correcto:**
```python
def get_channel_dir(channel_name: str) -> Path:
    # pathlib usa el separador nativo del SO automáticamente
    channel_path = (WORKSPACE_PATH / channel_name).resolve()
    return channel_path
```

### 2.4. Codificación Universal (UTF-8)
**Regla:** Toda operación de entrada/salida (I/O) de archivos de texto o Markdown (`.md`) DEBE especificar explícitamente `encoding='utf-8'`. Windows utiliza `cp1252` por defecto, lo que corromperá los emojis y tildes si el archivo fue creado en macOS/Linux.

**✅ Correcto:**
```python
# Escritura segura y universal
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

# Lectura segura y universal
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()
```

---

## 3. Gestión de Dependencias y Criterios de Selección de Paquetes

Para que AutoProd pueda distribuirse y empaquetarse fácilmente (vía PyInstaller o Nuitka) en cualquier SO, el control sobre las librerías de terceros debe ser riguroso.

### 3.1. Librerías Multiplataforma
**Regla:** Evitar dependencias que usen APIs propietarias de un sistema operativo (ej. `pywin32`, exclusivas de Darwin/macOS, o llamadas directas a `bash`).
Si una función OS-específica es absolutamente necesaria, debe aislarse con bloques `try/except` o verificaciones de `sys.platform`, garantizando un *fallback* gracefully para otros sistemas.

### 3.2. Wheels Binarios (PyPI)
**Regla:** Dar prioridad a paquetes que provean *wheels* precompilados (`.whl`) en PyPI para Windows, Linux y macOS (arm64/x86_64). Esto evita que el usuario final necesite instalar compiladores de C++ (ej. Build Tools for Visual Studio) durante el `pip install`.

### 3.3. Dependencias Multimedia Externas (FFmpeg, Whisper)
**Regla:** Las herramientas de línea de comandos externas NO deben asumir que están instaladas globalmente en el `PATH` del usuario. El motor debe permitir configurar la ruta al ejecutable (vía `.env`) o incluir el binario empacado de forma relativa.

**✅ Correcto:**
```python
import sys
from pathlib import Path

def get_ffmpeg_path() -> Path:
    # Busca en una carpeta "bin" relativa a la ejecución actual
    base_dir = Path(__file__).resolve().parent
    exe_name = "ffmpeg.exe" if sys.platform == "win32" else "ffmpeg"
    local_ffmpeg = base_dir / "bin" / exe_name
    
    if local_ffmpeg.exists():
        return local_ffmpeg
    return Path(exe_name) # Fallback al PATH global
```

---

## 4. Marco de Seguridad, Sandbox y Legalidad de Ejecución

La arquitectura agéntica manipula archivos del usuario local de forma autónoma. La seguridad es prioritaria para prevenir inyecciones y daños en el sistema operativo.

### 4.1. Principio de Menor Privilegio (Least Privilege)
**Regla:** El motor de Python (FastAPI) y todos los scripts deben funcionar correctamente en el Espacio de Usuario Estándar (`User Space`). 
- **PROHIBIDO:** Requerir permisos de `Administrator` (Windows) o `root/sudo` (Unix) para tareas de la aplicación.

### 4.2. Delimitación Estricta (Directory Scoping)
**Regla:** El motor de Python opera dentro de un "Sandbox" lógico. Toda operación de lectura, escritura o eliminación DEBE validar que la ruta de destino es hija del `WORKSPACE_PATH`.

**✅ Correcto:**
```python
from pathlib import Path
from fastapi import HTTPException

def ensure_safe_path(requested_path: str, workspace_root: Path) -> Path:
    target = Path(requested_path).resolve()
    
    # Validar que el target está dentro del workspace autorizado
    try:
        target.relative_to(workspace_root.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Violación de seguridad: Acceso fuera del Workspace prohibido.")
        
    return target
```

### 4.3. Prevención de Inyección de Comandos (Subprocess)
**Regla:** Prohibido el uso de `shell=True` en `subprocess`. Los argumentos deben pasarse siempre como una lista de strings para evitar que el intérprete del sistema inyecte comandos maliciosos (ej. `video.mp4; rm -rf /`).

**❌ Incorrecto (Riesgo Crítico):**
```python
import subprocess
# ¡Peligro de inyección!
subprocess.run(f"ffmpeg -i {user_input} output.mp4", shell=True)
```

**✅ Correcto:**
```python
import subprocess
# Los parámetros se escapan de forma segura a nivel sistema operativo
subprocess.run(["ffmpeg", "-i", user_input, "output.mp4"], check=True)
```

---

## 5. Directrices de Refactorización y Auditoría del Código Actual

Para adaptar el código actual de AutoProd a estos estándares, sigue este checklist de auditoría obligatoria:

### Checklist de Auditoría:
- [ ] **Búsqueda de Rutas Fijas:** Buscar en el código de Python patrones como `"C:\\"`, `"E:\\"`, o `"/Users/"` y reemplazarlos por variables configurables o `Path.home()`.
- [ ] **Revisión de Subprocess:** Buscar todos los usos de `subprocess.run`, `os.system` o `os.popen`. Eliminar `shell=True` y convertir todos los argumentos a Listas de Python.
- [ ] **Revisión de I/O de archivos (`open`):** Buscar la palabra clave `open(` y asegurar que TODO llamado contiene el argumento `encoding="utf-8"`.
- [ ] **Scoping de Endpoints API:** Verificar que endpoints como `/workspace/file` implementen la función de validación de paths (Directory Scoping) descrita en la sección 4.2 para evitar que el frontend solicite leer `C:\Windows\System32\drivers\etc\hosts` o `/etc/passwd`.

### Instrucciones de Migración de Endpoints Actuales
Si un endpoint en `controlador/routers/workspace.py` recibe una ruta absoluta generada por el frontend, el backend debe:
1. Recibir la ruta.
2. Convertirla a `pathlib.Path` e invocar `.resolve()`.
3. Comprobar que pertenece al ecosistema aprobado.
4. Aplicar los cambios y retornar resultados estandarizados al frontend sin romper el contrato actual del JSON (ej. `{"status": "success"}`).
