import os
import signal
import threading
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import workspace, chat

app = FastAPI(
    title="AutoProd Local Controlador",
    description="Motor local para procesar video y gestionar workspace en AutoProd",
    version="1.0.0"
)

# Configuración de CORS
origins = [
    "http://localhost:3000",
    "https://autoprod.com",
    "https://autoprod.vercel.app" # Reemplazar con el real si es diferente
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Routers
app.include_router(workspace.router)
app.include_router(chat.router)

@app.get("/status")
def get_status():
    return {"status": "online", "message": "Motor local conectado correctamente."}

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
