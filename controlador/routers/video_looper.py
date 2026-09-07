import os
import sys
import json
import shutil
import subprocess
import uuid
import time
import math
import threading
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from hardware import governor

router = APIRouter(
    prefix="/video",
    tags=["video_looper"],
)

# ──────────────────────────────────────────────
# Estado de Jobs en Memoria
# ──────────────────────────────────────────────
JOBS: Dict[str, Dict[str, Any]] = {}

def default_workspace_path() -> Path:
    config_path = Path(__file__).resolve().parent.parent.parent / ".autoprod-config.json"
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
                if "basePath" in config:
                    return (Path(config["basePath"]) / "youtube").resolve()
        except Exception:
            pass
    return (Path.home() / "AutoProd" / "youtube").resolve()

def get_temp_render_dir() -> Path:
    config_path = Path(__file__).resolve().parent.parent.parent / ".autoprod-config.json"
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
                if "basePath" in config:
                    temp_dir = Path(config["basePath"]) / "temp_renders"
                    temp_dir.mkdir(parents=True, exist_ok=True)
                    return temp_dir.resolve()
        except Exception:
            pass
    temp_dir = Path.home() / "AutoProd" / "temp_renders"
    temp_dir.mkdir(parents=True, exist_ok=True)
    return temp_dir.resolve()

def get_ffmpeg_path() -> Path:
    # 1. E:\AutoProdAI\bin\ffmpeg.exe
    config_path = Path(__file__).resolve().parent.parent.parent / ".autoprod-config.json"
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
                if "basePath" in config:
                    cand = Path(config["basePath"]) / "bin" / ("ffmpeg.exe" if sys.platform == "win32" else "ffmpeg")
                    if cand.exists():
                        return cand
        except Exception:
            pass

    # 2. Carpeta bin local en controlador/bin/
    local_bin = Path(__file__).resolve().parent.parent / "bin" / ("ffmpeg.exe" if sys.platform == "win32" else "ffmpeg")
    if local_bin.exists():
        return local_bin

    # 3. PATH del sistema
    found = shutil.which("ffmpeg")
    if found:
        return Path(found)

    return Path("ffmpeg.exe" if sys.platform == "win32" else "ffmpeg")

def get_ffprobe_path() -> Path:
    config_path = Path(__file__).resolve().parent.parent.parent / ".autoprod-config.json"
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
                if "basePath" in config:
                    cand = Path(config["basePath"]) / "bin" / ("ffprobe.exe" if sys.platform == "win32" else "ffprobe")
                    if cand.exists():
                        return cand
        except Exception:
            pass

    local_bin = Path(__file__).resolve().parent.parent / "bin" / ("ffprobe.exe" if sys.platform == "win32" else "ffprobe")
    if local_bin.exists():
        return local_bin

    found = shutil.which("ffprobe")
    if found:
        return Path(found)

    return Path("ffprobe.exe" if sys.platform == "win32" else "ffprobe")

def format_time_hms(seconds: float) -> str:
    s = int(seconds)
    hours = s // 3600
    minutes = (s % 3600) // 60
    secs = s % 60
    if hours > 0:
        return f"{hours}h {minutes:02d}m {secs:02d}s"
    return f"{minutes}m {secs:02d}s"

def probe_duration(file_path: Path) -> float:
    ffprobe = get_ffprobe_path()
    try:
        cmd = [
            str(ffprobe),
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(file_path)
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        val = float(res.stdout.strip())
        return val if val > 0 else 0.0
    except Exception:
        # Si ffprobe falla, intentar con ffmpeg
        try:
            ffmpeg = get_ffmpeg_path()
            cmd = [str(ffmpeg), "-i", str(file_path)]
            res = subprocess.run(cmd, capture_output=True, text=True)
            # Buscar Duration: 00:01:23.45
            for line in res.stderr.splitlines():
                if "Duration:" in line:
                    part = line.split("Duration:")[1].split(",")[0].strip()
                    h, m, s = part.split(":")
                    return float(h) * 3600 + float(m) * 60 + float(s)
        except Exception:
            pass
    return 10.0 # Fallback por defecto si no se puede leer

def probe_video_meta(file_path: Path) -> Dict[str, Any]:
    ffprobe = get_ffprobe_path()
    meta = {
        "width": 1920,
        "height": 1080,
        "duration": 0.0,
        "fps": 30.0,
        "codec": "h264",
        "has_audio": False
    }
    try:
        cmd = [
            str(ffprobe),
            "-v", "error",
            "-show_entries", "stream=width,height,r_frame_rate,codec_name,codec_type",
            "-show_entries", "format=duration",
            "-of", "json",
            str(file_path)
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(res.stdout)
        if "format" in data and "duration" in data["format"]:
            meta["duration"] = float(data["format"]["duration"])
        
        if "streams" in data:
            for st in data["streams"]:
                if st.get("codec_type") == "video":
                    meta["width"] = st.get("width", 1920)
                    meta["height"] = st.get("height", 1080)
                    meta["codec"] = st.get("codec_name", "h264")
                    r_fps = st.get("r_frame_rate", "30/1")
                    if "/" in r_fps:
                        num, den = r_fps.split("/")
                        if float(den) > 0:
                            meta["fps"] = round(float(num) / float(den), 2)
                elif st.get("codec_type") == "audio":
                    meta["has_audio"] = True
    except Exception:
        meta["duration"] = probe_duration(file_path)
    return meta

# ──────────────────────────────────────────────
# Modelos Pydantic
# ──────────────────────────────────────────────
class ScanAudioFolderRequest(BaseModel):
    folder_path: str

class InspectMediaRequest(BaseModel):
    file_path: str

class CreateLoopRequest(BaseModel):
    video_paths: List[str]
    duration_mode: str = "custom"                # "custom" | "audio_folder"
    target_duration_seconds: float = 300.0        # En segundos
    audio_folder_path: Optional[str] = None       # Carpeta de canciones
    resolution: str = "1080p"                     # "1080p" | "4k" | "720p" | "shorts" | "original"
    quality: str = "high"                         # "master" | "high" | "balanced"
    is_preview: bool = False                      # Si es true, limita a max 5 min y usa preset ultrafast
    output_channel: Optional[str] = None          # Nombre de canal de destino opcional
    output_filename: Optional[str] = None         # Nombre de archivo deseado

# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@router.post("/inspect_media")
def inspect_media(req: InspectMediaRequest):
    """Inspecciona las propiedades de un archivo de video o audio."""
    path_obj = Path(req.file_path)
    if not path_obj.exists():
        raise HTTPException(status_code=404, detail=f"Archivo no encontrado: {req.file_path}")
    
    meta = probe_video_meta(path_obj)
    return {
        "file_name": path_obj.name,
        "path": path_obj.as_posix(),
        "size_mb": round(path_obj.stat().st_size / (1024 * 1024), 2),
        "duration_seconds": meta["duration"],
        "duration_formatted": format_time_hms(meta["duration"]),
        "width": meta["width"],
        "height": meta["height"],
        "fps": meta["fps"],
        "has_audio": meta["has_audio"]
    }

@router.post("/scan_audio_folder")
def scan_audio_folder(req: ScanAudioFolderRequest):
    """
    Escanea una carpeta en busca de canciones o pistas de audio,
    calcula la duración de cada una y devuelve la suma total exacta.
    """
    folder_path = Path(req.folder_path)
    if not folder_path.is_absolute():
        folder_path = (default_workspace_path() / folder_path).resolve()

    if not folder_path.exists() or not folder_path.is_dir():
        raise HTTPException(status_code=404, detail=f"Carpeta de música no encontrada: '{folder_path}'")

    audio_exts = {".mp3", ".wav", ".aac", ".m4a", ".flac", ".ogg", ".wma"}
    songs = []
    total_seconds = 0.0

    for item in sorted(folder_path.iterdir(), key=lambda x: x.name.lower()):
        if item.is_file() and item.suffix.lower() in audio_exts:
            dur = probe_duration(item)
            total_seconds += dur
            songs.append({
                "name": item.name,
                "path": item.as_posix(),
                "duration_seconds": round(dur, 2),
                "duration_formatted": format_time_hms(dur),
                "size_mb": round(item.stat().st_size / (1024 * 1024), 2)
            })

    return {
        "folder_path": folder_path.as_posix(),
        "total_songs": len(songs),
        "total_duration_seconds": round(total_seconds, 2),
        "total_duration_formatted": format_time_hms(total_seconds),
        "songs": songs
    }

def run_loop_render(job_id: str, req: CreateLoopRequest):
    """Worker en segundo plano para renderizar el loop con FFmpeg de máxima fidelidad."""
    ffmpeg = get_ffmpeg_path()
    temp_dir = get_temp_render_dir()
    
    JOBS[job_id]["status"] = "rendering"
    JOBS[job_id]["progress"] = 5

    try:
        # 1. Validar archivos de video de entrada
        valid_videos: List[Path] = []
        for vp in req.video_paths:
            v_path = Path(vp)
            if not v_path.is_absolute():
                v_path = (default_workspace_path() / v_path).resolve()
            if v_path.exists() and v_path.is_file():
                valid_videos.append(v_path)

        if not valid_videos:
            raise Exception("No se proporcionó ningún archivo de video válido existente.")

        # Calcular duración del ciclo individual
        cycle_duration = 0.0
        for v in valid_videos:
            cycle_duration += probe_duration(v)

        if cycle_duration <= 0.1:
            cycle_duration = 10.0 * len(valid_videos)

        # 2. Determinar duración objetivo
        target_duration = req.target_duration_seconds

        # Si el modo es audio_folder, la duración del loop es EXACTAMENTE la duración de las canciones
        audio_files_to_concat: List[Path] = []
        if req.duration_mode == "audio_folder" and req.audio_folder_path:
            af_dir = Path(req.audio_folder_path)
            if not af_dir.is_absolute():
                af_dir = (default_workspace_path() / af_dir).resolve()
            if af_dir.exists() and af_dir.is_dir():
                audio_exts = {".mp3", ".wav", ".aac", ".m4a", ".flac", ".ogg"}
                for item in sorted(af_dir.iterdir(), key=lambda x: x.name.lower()):
                    if item.is_file() and item.suffix.lower() in audio_exts:
                        audio_files_to_concat.append(item)
                
                if audio_files_to_concat:
                    total_audio_dur = sum(probe_duration(a) for a in audio_files_to_concat)
                    if total_audio_dur > 1.0:
                        target_duration = total_audio_dur

        # Si es modo previsualización, limitar a máximo 300 segundos (5 minutos)
        if req.is_preview:
            target_duration = min(300.0, target_duration)
            JOBS[job_id]["message"] = "Renderizando previsualización rápida (máx. 5 minutos)..."
        else:
            JOBS[job_id]["message"] = f"Renderizando loop completo ({format_time_hms(target_duration)})..."

        # 3. Calcular repeticiones necesarias para cubrir la duración
        loops_needed = max(1, math.ceil(target_duration / cycle_duration))

        # Crear archivo de texto para concat demuxer de FFmpeg
        video_concat_txt = temp_dir / f"concat_v_{job_id}.txt"
        with open(video_concat_txt, "w", encoding="utf-8") as f:
            for _ in range(loops_needed):
                for v in valid_videos:
                    # FFmpeg concat file format: file 'path' (con barras inclinadas)
                    f.write(f"file '{v.as_posix()}'\n")

        # 4. Preparar concat de audio si existe
        audio_concat_txt = None
        if audio_files_to_concat:
            audio_concat_txt = temp_dir / f"concat_a_{job_id}.txt"
            with open(audio_concat_txt, "w", encoding="utf-8") as f:
                for a in audio_files_to_concat:
                    f.write(f"file '{a.as_posix()}'\n")

        # 5. Configurar resolución y parámetros anti-pixelado
        res_map = {
            "1080p": (1920, 1080),
            "4k": (3840, 2160),
            "720p": (1280, 720),
            "shorts": (1080, 1920),
        }
        w, h = res_map.get(req.resolution.lower(), (1920, 1080))
        vf_filter = f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2,setsar=1"

        # Parámetros de calidad anti-pixelado
        if req.quality == "master":
            crf = "16"
            b_v = "35M"
            maxrate = "45M"
            bufsize = "70M"
        elif req.quality == "balanced":
            crf = "22"
            b_v = "8M"
            maxrate = "12M"
            bufsize = "18M"
        else: # "high" (por defecto)
            crf = "18"
            b_v = "18M"
            maxrate = "25M"
            bufsize = "35M"

        # Preset: ultrafast para preview para que salga en pocos segundos, medium para export final
        preset = "ultrafast" if req.is_preview else "medium"

        # 6. Definir archivo de salida
        if req.is_preview:
            output_file = temp_dir / f"preview_{job_id}.mp4"
        else:
            # Carpeta destino en workspace
            ws_root = default_workspace_path()
            if req.output_channel:
                channel_dir = ws_root / req.output_channel
                target_out_dir = channel_dir / "Videos" if (channel_dir / "Videos").exists() else channel_dir
            else:
                target_out_dir = ws_root

            target_out_dir.mkdir(parents=True, exist_ok=True)
            fname = req.output_filename or f"loop_{int(time.time())}.mp4"
            if not fname.endswith(".mp4"):
                fname += ".mp4"
            output_file = target_out_dir / fname

        JOBS[job_id]["progress"] = 25

        # 7. Construir comando FFmpeg
        cmd = [
            str(ffmpeg),
            "-y", # Sobrescribir
            "-f", "concat",
            "-safe", "0",
            "-i", str(video_concat_txt)
        ]

        if audio_concat_txt:
            cmd.extend([
                "-f", "concat",
                "-safe", "0",
                "-i", str(audio_concat_txt)
            ])

        cmd.extend([
            "-t", str(target_duration),
            "-vf", vf_filter,
            "-c:v", "libx264",
            "-crf", crf,
            "-preset", preset,
            "-pix_fmt", "yuv420p",
            "-threads", str(governor.get_hardware_specs()["safe_threads"]),
            "-b:v", b_v,
            "-maxrate", maxrate,
            "-bufsize", bufsize
        ])

        if audio_concat_txt:
            cmd.extend([
                "-c:a", "aac",
                "-b:a", "320k",
                "-map", "0:v:0",
                "-map", "1:a:0"
            ])
        else:
            cmd.extend([
                "-c:a", "aac",
                "-b:a", "192k"
            ])

        cmd.append(str(output_file))

        JOBS[job_id]["progress"] = 40
        JOBS[job_id]["message"] = "Codificando video con calidad visual sin pixelado..."

        # Ejecutar FFmpeg
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        _, stderr = process.communicate()

        if process.returncode != 0:
            raise Exception(f"FFmpeg falló (código {process.returncode}): {stderr[-600:]}")

        # Limpieza de archivos temporales de concat
        try:
            if video_concat_txt.exists():
                video_concat_txt.unlink()
            if audio_concat_txt and audio_concat_txt.exists():
                audio_concat_txt.unlink()
        except Exception:
            pass

        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["progress"] = 100
        JOBS[job_id]["output_path"] = output_file.as_posix()
        JOBS[job_id]["duration_seconds"] = round(target_duration, 2)
        JOBS[job_id]["duration_formatted"] = format_time_hms(target_duration)
        JOBS[job_id]["file_size_mb"] = round(output_file.stat().st_size / (1024 * 1024), 2)
        JOBS[job_id]["is_preview"] = req.is_preview
        JOBS[job_id]["message"] = "Renderizado completado con éxito."

    except Exception as e:
        JOBS[job_id]["status"] = "error"
        JOBS[job_id]["error"] = str(e)
        JOBS[job_id]["message"] = f"Error en renderizado: {str(e)}"
    finally:
        governor.release_job_slot(job_id)

@router.post("/create_loop")
def create_loop(req: CreateLoopRequest, background_tasks: BackgroundTasks):
    """
    Inicia la concatenación y creación de loop de video.
    Soporta modo previsualización (máx 5 min) y modo completo.
    """
    job_id = str(uuid.uuid4())
    slot_acquired = governor.acquire_job_slot(job_id, "video_loop", {
        "is_preview": req.is_preview,
        "resolution": req.resolution
    })

    initial_msg = "Iniciando renderizado..." if slot_acquired else "En cola: esperando que finalice otra tarea pesada..."
    JOBS[job_id] = {
        "id": job_id,
        "status": "queued",
        "progress": 0,
        "message": initial_msg,
        "output_path": None,
        "is_preview": req.is_preview,
        "created_at": time.time()
    }

    # Iniciar renderizado en hilo de fondo
    background_tasks.add_task(run_loop_render, job_id, req)

    return {
        "job_id": job_id,
        "status": "processing" if slot_acquired else "queued",
        "slot_acquired": slot_acquired,
        "is_preview": req.is_preview,
        "message": initial_msg
    }

@router.get("/status/{job_id}")
def get_job_status(job_id: str):
    """Consulta el progreso y estado de un job de renderizado."""
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado.")
    return job

@router.get("/preview/{job_id}")
def get_preview_video(job_id: str):
    """Sirve el video de previsualización renderizado para reproducirlo directamente en la UI."""
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado.")
    
    if job.get("status") != "completed" or not job.get("output_path"):
        raise HTTPException(status_code=400, detail="El video aún no está listo o falló.")

    file_path = Path(job["output_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="El archivo de video generado no se encuentra en disco.")

    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        filename=file_path.name
    )
