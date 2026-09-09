import os
import signal
import threading
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import workspace, chat, ollama_manager, video_looper, subtitles
from hardware import governor

# Inyectar subcarpeta bin/ al PATH de entorno (para ffmpeg y yt-dlp portables)
base_dir = os.path.dirname(os.path.abspath(__file__))
possible_bin_dirs = [
    os.path.join(base_dir, "bin"),
    os.path.join(os.path.dirname(base_dir), "bin"),
]
for b_dir in possible_bin_dirs:
    if os.path.exists(b_dir) and b_dir not in os.environ.get("PATH", ""):
        os.environ["PATH"] = b_dir + os.pathsep + os.environ["PATH"]

app = FastAPI(
    title="AutoProd Local Controlador",
    description="Motor local para procesar video y gestionar workspace en AutoProd",
    version="1.0.0"
)

# Configuración de CORS universal para permitir conexión desde el dashboard (localhost o producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registrar Routers
app.include_router(workspace.router)
app.include_router(chat.router)
app.include_router(ollama_manager.router)
app.include_router(video_looper.router)
app.include_router(subtitles.router)

@app.get("/status")
def get_status():
    return {"status": "online", "message": "Motor local conectado correctamente."}

@app.get("/system/hardware")
def get_system_hardware():
    """Retorna las especificaciones de hardware y el estado de concurrencia del equipo."""
    return governor.get_hardware_specs()

@app.post("/shutdown")
def shutdown_server():
    """Apaga el servidor de manera remota matando el proceso actual."""
    def kill_it():
        time.sleep(1) # Dar un segundo para que la respuesta HTTP se envíe
        os.kill(os.getpid(), signal.SIGTERM)
    
    threading.Thread(target=kill_it).start()
    return {"status": "success", "message": "Apagando el motor local..."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
