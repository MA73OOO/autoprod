import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(
    prefix="/workspace",
    tags=["workspace"],
)

class InitWorkspaceRequest(BaseModel):
    base_path: str
    channel_name: str
    video_name: str
    folders: Optional[List[str]] = ["Musica", "Ambiente", "miniature", "Videos", "Resultado"]

@router.get("/")
def list_workspace(base_path: str):
    """Lista los canales y videos en la ruta base proporcionada."""
    workspace_path = Path(base_path)
    if not workspace_path.exists() or not workspace_path.is_dir():
        raise HTTPException(status_code=404, detail="La ruta del workspace no existe.")
    
    try:
        channels = []
        for item in workspace_path.iterdir():
            if item.is_dir():
                videos = [v.name for v in item.iterdir() if v.is_dir()]
                channels.append({"name": item.name, "videos": videos})
        return {"workspace": base_path, "channels": channels}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/init")
def init_workspace(req: InitWorkspaceRequest):
    """Inicializa la estructura de carpetas para un canal y video."""
    video_path = Path(req.base_path) / req.channel_name / req.video_name
    
    try:
        # Crear ruta base del video
        video_path.mkdir(parents=True, exist_ok=True)
        
        # Crear subcarpetas requeridas
        for folder in req.folders:
            (video_path / folder).mkdir(exist_ok=True)
            
        return {"status": "success", "message": f"Estructura creada en {video_path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando carpetas: {str(e)}")
