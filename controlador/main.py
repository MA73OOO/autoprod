from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import workspace

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

@app.get("/status")
def get_status():
    return {"status": "online", "message": "Motor local conectado correctamente."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
