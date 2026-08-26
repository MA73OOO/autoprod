import os
import sys
import subprocess
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(
    prefix="/workspace",
    tags=["workspace"],
)



@router.get("/pick")
def pick_workspace():
    """Abre el explorador de archivos nativo del SO para elegir una carpeta."""
    folder_path = ""
    try:
        if sys.platform == "win32":
            ps_script = (
                "Add-Type -AssemblyName System.windows.forms; "
                "$f = New-Object System.Windows.Forms.FolderBrowserDialog; "
                "$f.Description = 'Selecciona la carpeta raíz de tu Proyecto'; "
                "$f.ShowNewFolderButton = $true; "
                "if ($f.ShowDialog() -eq 'OK') { Write-Output $f.SelectedPath }"
            )
            result = subprocess.run(["powershell", "-NoProfile", "-Command", ps_script], capture_output=True, text=True)
            folder_path = result.stdout.strip()
        elif sys.platform == "darwin":
            scpt = 'POSIX path of (choose folder with prompt "Selecciona la carpeta raíz del Proyecto")'
            result = subprocess.run(['osascript', '-e', scpt], capture_output=True, text=True)
            folder_path = result.stdout.strip()
        else:
            raise HTTPException(status_code=500, detail="Sistema operativo no soportado para el explorador nativo.")

        if folder_path:
            return {"path": str(Path(folder_path).resolve())}
        else:
            raise HTTPException(status_code=400, detail="No se seleccionó ninguna carpeta")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error abriendo explorador: {str(e)}")

@router.get("/")
def list_workspace(base_path: str):
    """Lista el contenido recursivo del workspace para el Tree View."""
    workspace_path = Path(base_path)
    if not workspace_path.exists() or not workspace_path.is_dir():
        raise HTTPException(status_code=404, detail="La ruta del workspace no existe.")
    
    def build_tree(current_path: Path, current_depth: int, max_depth: int = 4):
        if current_depth > max_depth:
            return []
        
        tree = []
        try:
            # Sort directories first, then files
            items = sorted(current_path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
            for item in items:
                # Ignore hidden files/folders
                if item.name.startswith('.'):
                    continue
                node = {
                    "name": item.name,
                    "path": str(item),
                    "type": "directory" if item.is_dir() else "file"
                }
                if item.is_dir():
                    node["children"] = build_tree(item, current_depth + 1, max_depth)
                tree.append(node)
        except PermissionError:
            pass # Skip folders without read permission
        return tree

    try:
        tree_data = build_tree(workspace_path, 0)
        return {"workspace": base_path, "tree": tree_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CreateFolderRequest(BaseModel):
    target_path: str
    folder_name: str
    subfolders: Optional[List[str]] = []

@router.post("/create")
def create_folder(req: CreateFolderRequest):
    """Crea una carpeta y sus subcarpetas asociadas."""
    new_path = Path(req.target_path) / req.folder_name
    
    try:
        # Crear la carpeta principal
        new_path.mkdir(parents=True, exist_ok=True)
        
        # Crear subcarpetas requeridas si existen
        if req.subfolders:
            for folder in req.subfolders:
                (new_path / folder).mkdir(exist_ok=True)
                
        return {"status": "success", "message": f"Estructura creada en {new_path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando carpetas: {str(e)}")
