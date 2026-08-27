from fastapi import APIRouter, HTTPException
import subprocess
import platform
import os
import urllib.request
import threading

router = APIRouter(
    prefix="/ollama",
    tags=["Ollama"],
)

def install_ollama_windows():
    installer_path = os.path.join(os.environ.get('TEMP', 'C:\\Temp'), 'OllamaSetup.exe')
    try:
        print("Downloading Ollama installer...")
        urllib.request.urlretrieve("https://ollama.com/download/OllamaSetup.exe", installer_path)
        print("Starting installation...")
        # Lanza el instalador. Requerirá permisos de admin interactivos
        subprocess.Popen([installer_path])
    except Exception as e:
        print(f"Error installing Ollama: {e}")

def install_ollama_mac_linux():
    try:
        subprocess.Popen("curl -fsSL https://ollama.com/install.sh | sh", shell=True)
    except Exception as e:
        print(f"Error installing Ollama: {e}")

@router.post("/install")
def install_ollama():
    """
    Descarga e instala Ollama dependiendo del sistema operativo.
    """
    sys_os = platform.system()
    
    if sys_os == "Windows":
        # Correr en un hilo para no bloquear la respuesta HTTP
        threading.Thread(target=install_ollama_windows).start()
        return {"status": "success", "message": "Descargando e iniciando instalación de Ollama para Windows. Revisa tu barra de tareas."}
    elif sys_os in ["Linux", "Darwin"]:
        threading.Thread(target=install_ollama_mac_linux).start()
        return {"status": "success", "message": "Instalación de Ollama iniciada en segundo plano."}
    else:
        raise HTTPException(status_code=400, detail="Sistema operativo no soportado automáticamente.")
