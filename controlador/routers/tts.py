import os
import sys
import uuid
import time
import asyncio
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

# Garantizar sys.path para imports de módulos hermanos
_controlador_dir = str(Path(__file__).resolve().parent.parent)
if _controlador_dir not in sys.path:
    sys.path.insert(0, _controlador_dir)

from routers.video_looper import (
    default_workspace_path,
    get_temp_render_dir,
    probe_duration,
)

router = APIRouter(
    prefix="/tts",
    tags=["TextToSpeech"],
)

# ──────────────────────────────────────────────
# Voces Curadas de Alta Calidad
# ──────────────────────────────────────────────
VOICES_CATALOG = {
    "edge_tts": [
        {
            "id": "es-ES-AlvaroNeural",
            "name": "Álvaro (España)",
            "gender": "Masculino",
            "lang": "es-ES",
            "style": "Documental / Narrador profundo",
            "sample_text": "Este es un ejemplo de locución con la voz de Álvaro."
        },
        {
            "id": "es-ES-ElviraNeural",
            "name": "Elvira (España)",
            "gender": "Femenino",
            "lang": "es-ES",
            "style": "Clara / Educativa / Profesional",
            "sample_text": "Este es un ejemplo de narración explicativa con Elvira."
        },
        {
            "id": "es-MX-DaliaNeural",
            "name": "Dalia (México)",
            "gender": "Femenino",
            "lang": "es-MX",
            "style": "Cálida / Cercana / Comercial",
            "sample_text": "Hola, así se escucha la voz de Dalia para tus videos."
        },
        {
            "id": "es-MX-JorgeNeural",
            "name": "Jorge (México)",
            "gender": "Masculino",
            "lang": "es-MX",
            "style": "Dinámico / Moderno",
            "sample_text": "Qué tal, esta es una prueba de locución con la voz de Jorge."
        },
        {
            "id": "es-CO-GonzaloNeural",
            "name": "Gonzalo (Colombia)",
            "gender": "Masculino",
            "lang": "es-CO",
            "style": "Formal / Neutro / Corporativo",
            "sample_text": "Esta es una muestra de audio generada con la voz de Gonzalo."
        },
        {
            "id": "es-CO-SalomeNeural",
            "name": "Salomé (Colombia)",
            "gender": "Femenino",
            "lang": "es-CO",
            "style": "Suave / Cautivadora",
            "sample_text": "Así suena la voz de Salomé para guiones y narraciones."
        },
        {
            "id": "es-AR-TomasNeural",
            "name": "Tomás (Argentina)",
            "gender": "Masculino",
            "lang": "es-AR",
            "style": "Narración rítmica / Enérgica",
            "sample_text": "Muestra de audio generada con la voz de Tomás."
        },
        {
            "id": "en-US-ChristopherNeural",
            "name": "Christopher (EE.UU.)",
            "gender": "Masculino",
            "lang": "en-US",
            "style": "Storytelling / Deep Documentary",
            "sample_text": "This is a voice sample using the Christopher neural voice."
        },
        {
            "id": "en-US-JennyNeural",
            "name": "Jenny (EE.UU.)",
            "gender": "Femenino",
            "lang": "en-US",
            "style": "Friendly / Natural Assistant",
            "sample_text": "Hi there! This is a demo using the Jenny neural voice."
        }
    ],
    "openai": [
        {
            "id": "onyx",
            "name": "Onyx (OpenAI)",
            "gender": "Masculino",
            "lang": "Multi",
            "style": "Profundo / Misterio / Documental",
            "sample_text": "Esta es la voz de Onyx de OpenAI, ideal para historias y misterio."
        },
        {
            "id": "echo",
            "name": "Echo (OpenAI)",
            "gender": "Masculino",
            "lang": "Multi",
            "style": "Neutro / Educativo / Fiel",
            "sample_text": "Esta es la voz Echo de OpenAI para explicaciones claras."
        },
        {
            "id": "nova",
            "name": "Nova (OpenAI)",
            "gender": "Femenino",
            "lang": "Multi",
            "style": "Enérgica / Noticias / Tendencias",
            "sample_text": "Así se escucha la voz Nova de OpenAI en español."
        },
        {
            "id": "alloy",
            "name": "Alloy (OpenAI)",
            "gender": "Neutro",
            "lang": "Multi",
            "style": "Versátil / Equilibrada",
            "sample_text": "Esta es una prueba de la voz Alloy de OpenAI."
        },
        {
            "id": "shimmer",
            "name": "Shimmer (OpenAI)",
            "gender": "Femenino",
            "lang": "Multi",
            "style": "Expresiva / Emotiva",
            "sample_text": "Prueba de la voz Shimmer de OpenAI."
        },
        {
            "id": "fable",
            "name": "Fable (OpenAI)",
            "gender": "Masculino",
            "lang": "Multi",
            "style": "Narración teatral / Relatos",
            "sample_text": "Prueba de la voz Fable de OpenAI para narraciones épicas."
        }
    ]
}

# ──────────────────────────────────────────────
# Modelos de Datos
# ──────────────────────────────────────────────
class TTSPreviewRequest(BaseModel):
    provider: str = "edge_tts"         # "edge_tts" | "openai"
    voice: str = "es-ES-AlvaroNeural"
    text: str = "Hola, esta es una prueba de locución con AutoProd."
    api_key: Optional[str] = None
    rate: Optional[str] = "+0%"        # Ej: "+10%", "-5%"

class TTSGenerateRequest(BaseModel):
    provider: str = "edge_tts"         # "edge_tts" | "openai"
    voice: str = "es-ES-AlvaroNeural"
    text: str
    target_path: Optional[str] = None  # Ruta de la carpeta del video o archivo de destino
    channel_name: Optional[str] = None
    video_title: Optional[str] = None
    filename: Optional[str] = None
    api_key: Optional[str] = None
    rate: Optional[str] = "+0%"

# ──────────────────────────────────────────────
# Funciones Helper Asíncronas
# ──────────────────────────────────────────────
async def synthesize_edge_tts(text: str, voice: str, rate: str = "+0%") -> bytes:
    """Sintetiza audio MP3 usando la librería edge-tts en memoria."""
    try:
        import edge_tts
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="La librería edge-tts no está instalada en el motor local. Ejecuta: pip install edge-tts"
        )

    communicate = edge_tts.Communicate(text, voice, rate=rate)
    audio_chunks = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
    
    return b"".join(audio_chunks)

def synthesize_openai_tts(text: str, voice: str, api_key: str, model: str = "tts-1") -> bytes:
    """Sintetiza audio MP3 llamando a la API de OpenAI TTS."""
    import urllib.request
    import json

    req = urllib.request.Request(
        "https://api.openai.com/v1/audio/speech",
        data=json.dumps({
            "model": model,
            "input": text,
            "voice": voice,
            "response_format": "mp3"
        }).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=120) as response:
        return response.read()

# ──────────────────────────────────────────────
# Endpoints de la API
# ──────────────────────────────────────────────

@router.get("/voices")
def get_voices():
    """Retorna el catálogo curado de voces disponibles para Edge-TTS y OpenAI TTS."""
    return {
        "success": True,
        "providers": {
            "edge_tts": {
                "name": "Edge-TTS (Local Gratuito)",
                "cost_label": "$0 Costo",
                "requires_api_key": False,
                "voices": VOICES_CATALOG["edge_tts"]
            },
            "openai": {
                "name": "OpenAI TTS",
                "cost_label": "Económico (Créditos / BYOK)",
                "requires_api_key": True,
                "voices": VOICES_CATALOG["openai"]
            }
        }
    }

@router.post("/preview")
async def preview_tts(req: TTSPreviewRequest):
    """Genera una muestra breve de audio MP3 y la devuelve como stream binario para reproducción inmediata."""
    clean_text = req.text.strip()
    if not clean_text:
        clean_text = "Esta es una muestra de audio."
    
    # Limitar longitud para previsualización rápida
    if len(clean_text) > 300:
        clean_text = clean_text[:300] + "..."

    try:
        if req.provider == "edge_tts":
            audio_data = await synthesize_edge_tts(clean_text, req.voice, req.rate or "+0%")
        elif req.provider == "openai":
            key = req.api_key or os.environ.get("OPENAI_API_KEY", "")
            if not key:
                raise HTTPException(status_code=400, detail="Se requiere una API Key de OpenAI para previsualizar esta voz.")
            audio_data = synthesize_openai_tts(clean_text, req.voice, key)
        else:
            raise HTTPException(status_code=400, detail=f"Proveedor no soportado: {req.provider}")

        return Response(content=audio_data, media_type="audio/mpeg")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error en preview de voz: {str(e)}")

@router.post("/generate")
async def generate_tts(req: TTSGenerateRequest):
    """
    Genera el archivo completo de locución .mp3 y lo guarda directamente en la estructura
    del video en el workspace ({Canal}/{Titulo_Del_Video}/Ambiente/locucion_{voz}.mp3).
    """
    clean_text = req.text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="El texto para la locución no puede estar vacío.")

    # 1. Determinar ruta física de guardado
    ws_base = default_workspace_path()
    
    if req.target_path:
        target_dir = Path(req.target_path)
        if not target_dir.is_absolute():
            target_dir = (ws_base / target_dir).resolve()
    elif req.channel_name and req.video_title:
        target_dir = ws_base / req.channel_name / req.video_title
    else:
        target_dir = ws_base

    # Si es una carpeta de video, ubicar dentro de la subcarpeta Ambiente/
    if target_dir.exists() and (target_dir / "Guiones").exists():
        out_folder = target_dir / "Ambiente"
    elif target_dir.name.lower() in ["ambiente", "musica", "guiones"]:
        out_folder = target_dir
    else:
        out_folder = target_dir / "Ambiente"

    out_folder.mkdir(parents=True, exist_ok=True)

    # Nombre de archivo estandarizado
    safe_voice_name = req.voice.split("-")[-1].replace("Neural", "").lower()
    file_name = req.filename or f"locucion_{safe_voice_name}_{int(time.time())}.mp3"
    if not file_name.endswith(".mp3"):
        file_name += ".mp3"

    output_path = out_folder / file_name

    # 2. Generar el audio
    try:
        if req.provider == "edge_tts":
            audio_bytes = await synthesize_edge_tts(clean_text, req.voice, req.rate or "+0%")
        elif req.provider == "openai":
            key = req.api_key or os.environ.get("OPENAI_API_KEY", "")
            if not key:
                raise HTTPException(status_code=400, detail="No se encontró API Key de OpenAI para generar la locución.")
            audio_bytes = synthesize_openai_tts(clean_text, req.voice, key)
        else:
            raise HTTPException(status_code=400, detail=f"Proveedor no soportado: {req.provider}")

        # Escribir archivo en disco
        with open(output_path, "wb") as f:
            f.write(audio_bytes)

        duration = probe_duration(output_path)
        file_size = output_path.stat().st_size

        return {
            "success": True,
            "message": "Locución generada exitosamente.",
            "file_name": file_name,
            "file_path": output_path.as_posix(),
            "relative_path": output_path.relative_to(ws_base).as_posix() if output_path.is_relative_to(ws_base) else output_path.as_posix(),
            "duration_seconds": round(duration, 2),
            "file_size_bytes": file_size,
            "provider": req.provider,
            "voice": req.voice,
            "characters_count": len(clean_text)
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generando locución: {str(e)}")
