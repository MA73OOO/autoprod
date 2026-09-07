import os
import sys
import json
import shutil
import subprocess
import uuid
import time
import math
import mimetypes
import urllib.request
import urllib.error
from pathlib import Path
from typing import List, Optional, Dict, Any

# Garantizar que el directorio raíz del controlador esté en sys.path
_controlador_dir = str(Path(__file__).resolve().parent.parent)
if _controlador_dir not in sys.path:
    sys.path.insert(0, _controlador_dir)

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from hardware import governor
from routers.video_looper import (
    default_workspace_path,
    get_temp_render_dir,
    get_ffmpeg_path,
    get_ffprobe_path,
    probe_duration,
    format_time_hms
)

router = APIRouter(
    prefix="/subtitles",
    tags=["subtitles"],
)

# ──────────────────────────────────────────────
# Estado de Trabajos de Subtitulado
# ──────────────────────────────────────────────
SUB_JOBS: Dict[str, Dict[str, Any]] = {}

def get_openai_api_key() -> str:
    """Busca la API key de OpenAI en el entorno o en el archivo .env raíz."""
    key = os.environ.get("OPENAI_API_KEY", "")
    if key and key.startswith("sk-"):
        return key

    # Intentar leer del .env del proyecto
    env_paths = [
        Path(__file__).resolve().parent.parent.parent / ".env",
        Path(__file__).resolve().parent.parent / ".env",
    ]
    for p in env_paths:
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("OPENAI_API_KEY="):
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val:
                                return val
            except Exception:
                pass
    return ""

def format_srt_time(seconds: float) -> str:
    """Convierte segundos a formato SRT: 00:00:00,000"""
    millis = int((seconds % 1) * 1000)
    s = int(seconds)
    hours = s // 3600
    minutes = (s % 3600) // 60
    secs = s % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def format_vtt_time(seconds: float) -> str:
    """Convierte segundos a formato WebVTT: 00:00:00.000"""
    millis = int((seconds % 1) * 1000)
    s = int(seconds)
    hours = s // 3600
    minutes = (s % 3600) // 60
    secs = s % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"

def segments_to_srt(segments: List[Dict[str, Any]]) -> str:
    """Convierte segmentos de transcripción a formato SRT estándar."""
    lines = []
    for i, seg in enumerate(segments, 1):
        start = format_srt_time(seg.get("start", 0.0))
        end = format_srt_time(seg.get("end", 0.0))
        text = seg.get("text", "").strip()
        lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(lines)

def segments_to_vtt(segments: List[Dict[str, Any]]) -> str:
    """Convierte segmentos de transcripción a formato WebVTT estándar."""
    lines = ["WEBVTT\n"]
    for seg in segments:
        start = format_vtt_time(seg.get("start", 0.0))
        end = format_vtt_time(seg.get("end", 0.0))
        text = seg.get("text", "").strip()
        lines.append(f"{start} --> {end}\n{text}\n")
    return "\n".join(lines)

def call_openai_whisper(audio_path: Path, api_key: str, language: Optional[str] = None) -> Dict[str, Any]:
    """
    Llama a la API de Whisper de OpenAI usando la librería estándar urllib
    (sin dependencias externas, cero consumo de CPU/GPU local).
    """
    boundary = f"----AutoProdWhisperBoundary{uuid.uuid4().hex}"
    body = bytearray()

    def add_field(name: str, value: str):
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"))
        body.extend(f"{value}\r\n".encode("utf-8"))

    add_field("model", "whisper-1")
    add_field("response_format", "verbose_json")
    if language and language.lower() not in ["auto", ""]:
        add_field("language", language.lower())

    # Adjuntar archivo de audio
    mime_type = mimetypes.guess_type(audio_path.name)[0] or "audio/mpeg"
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="file"; filename="{audio_path.name}"\r\n'.encode("utf-8"))
    body.extend(f"Content-Type: {mime_type}\r\n\r\n".encode("utf-8"))
    with open(audio_path, "rb") as f:
        body.extend(f.read())
    body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        "https://api.openai.com/v1/audio/transcriptions",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=300) as response:
        resp_data = response.read().decode("utf-8")
        return json.loads(resp_data)

def extract_optimized_audio(source_file: Path, temp_dir: Path, target_id: str) -> Path:
    """
    Extrae o comprime el audio a 16kHz mono 64kbps MP3 usando FFmpeg
    para que pese muy pocos megabytes y no supere el límite de 25MB de OpenAI.
    """
    ffmpeg = get_ffmpeg_path()
    out_audio = temp_dir / f"audio_opt_{target_id}_{int(time.time())}.mp3"
    
    cmd = [
        str(ffmpeg),
        "-y",
        "-i", str(source_file),
        "-vn",
        "-acodec", "libmp3lame",
        "-ar", "16000",
        "-ac", "1",
        "-b:a", "64k",
        str(out_audio)
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        if out_audio.exists() and out_audio.stat().st_size > 0:
            return out_audio
    except Exception:
        pass

    # Si FFmpeg falla o no está, devolver el archivo original
    return source_file

# ──────────────────────────────────────────────
# Modelos de Datos
# ──────────────────────────────────────────────
class SubtitlesEstimateRequest(BaseModel):
    target_type: str = "video"                   # "video" | "songs_folder"
    path: str
    engine: str = "openai_api"                   # "openai_api" | "local_gpu" | "local_cpu"

class SubtitlesGenerateRequest(BaseModel):
    target_type: str = "video"                   # "video" | "songs_folder"
    path: str
    channel_name: Optional[str] = None
    engine: str = "openai_api"                   # "openai_api" | "local_gpu" | "local_cpu"
    language: str = "es"                         # "es" | "en" | "auto"
    formats: List[str] = [".srt", ".vtt", ".json"]
    burn_to_video: bool = False                  # Si es true y es video, quema subtítulos con FFmpeg

class SubtitleFileSaveRequest(BaseModel):
    path: str
    content: str

# ──────────────────────────────────────────────
# Worker de Ejecución
# ──────────────────────────────────────────────
def run_subtitles_worker(job_id: str, req: SubtitlesGenerateRequest):
    """
    Worker en segundo plano para procesar subtítulos respetando el HardwareGovernor.
    """
    temp_dir = get_temp_render_dir()
    api_key = get_openai_api_key()

    SUB_JOBS[job_id]["status"] = "processing"
    SUB_JOBS[job_id]["progress"] = 5
    SUB_JOBS[job_id]["message"] = "Iniciando análisis de medios..."

    try:
        source_path = Path(req.path)
        if not source_path.is_absolute():
            source_path = (default_workspace_path() / source_path).resolve()

        if not source_path.exists():
            raise Exception(f"La ruta indicada no existe: {req.path}")

        # Recopilar archivos a transcribir
        files_to_process: List[Path] = []
        is_folder = req.target_type == "songs_folder" or source_path.is_dir()

        if is_folder:
            audio_exts = {".mp3", ".wav", ".aac", ".m4a", ".flac", ".ogg", ".wma"}
            for item in sorted(source_path.iterdir(), key=lambda x: x.name.lower()):
                if item.is_file() and item.suffix.lower() in audio_exts:
                    files_to_process.append(item)
            if not files_to_process:
                raise Exception(f"No se encontraron archivos de audio compatibles en la carpeta: {source_path}")
        else:
            files_to_process.append(source_path)

        SUB_JOBS[job_id]["total_tracks"] = len(files_to_process)
        SUB_JOBS[job_id]["processed_tracks"] = 0
        SUB_JOBS[job_id]["results"] = []

        total_files = len(files_to_process)

        # Crear carpeta de destino de subtítulos
        if is_folder:
            output_folder = source_path / "Subtitulos"
        else:
            output_folder = source_path.parent / "Subtitulos"
        output_folder.mkdir(parents=True, exist_ok=True)

        for idx, file_item in enumerate(files_to_process):
            track_num = idx + 1
            SUB_JOBS[job_id]["current_track"] = file_item.name
            SUB_JOBS[job_id]["message"] = f"Transcribiendo pista {track_num} de {total_files}: {file_item.name}..."
            base_progress = int((idx / total_files) * 85) + 5
            SUB_JOBS[job_id]["progress"] = base_progress

            # 1. Extraer / optimizar audio
            SUB_JOBS[job_id]["message"] = f"Optimizando audio para {file_item.name}..."
            opt_audio = extract_optimized_audio(file_item, temp_dir, f"{job_id}_{idx}")

            # 2. Transcribir según el motor
            transcription_data = None
            if req.engine == "openai_api":
                if not api_key:
                    raise Exception("No se encontró la OPENAI_API_KEY en las variables de entorno o archivo .env.")
                SUB_JOBS[job_id]["message"] = f"Transcribiendo con OpenAI Whisper API (ultrarrápido): {file_item.name}..."
                transcription_data = call_openai_whisper(opt_audio, api_key, req.language)
            else:
                # Motor local (GPU o CPU con limitación de hilos)
                specs = governor.get_hardware_specs()
                safe_threads = specs["safe_threads"]
                device = "cuda" if (req.engine == "local_gpu" and specs["has_cuda"]) else "cpu"
                
                # Verificar si whisper CLI está disponible
                whisper_bin = shutil.which("whisper")
                if whisper_bin:
                    cmd = [
                        whisper_bin,
                        str(opt_audio),
                        "--model", "base",
                        "--output_dir", str(temp_dir),
                        "--output_format", "all",
                        "--threads", str(safe_threads),
                        "--device", device
                    ]
                    if req.language and req.language != "auto":
                        cmd.extend(["--language", req.language])

                    SUB_JOBS[job_id]["message"] = f"Transcribiendo en local ({device.upper()} - {safe_threads} hilos): {file_item.name}..."
                    subprocess.run(cmd, capture_output=True, check=True)
                    
                    json_out = temp_dir / f"{opt_audio.stem}.json"
                    if json_out.exists():
                        with open(json_out, "r", encoding="utf-8") as f:
                            transcription_data = json.load(f)
                else:
                    # Fallback suave a Whisper API si está la key
                    if api_key:
                        SUB_JOBS[job_id]["message"] = f"Whisper local no detectado en PATH, usando OpenAI Whisper API: {file_item.name}..."
                        transcription_data = call_openai_whisper(opt_audio, api_key, req.language)
                    else:
                        raise Exception("El binario de Whisper local no está en el PATH y no hay API Key de OpenAI configurada.")

            # Limpiar archivo temporal de audio si se creó uno nuevo
            if opt_audio != file_item and opt_audio.exists():
                try:
                    opt_audio.unlink()
                except Exception:
                    pass

            # 3. Procesar y guardar los formatos generados
            segments = transcription_data.get("segments", [])
            raw_text = transcription_data.get("text", "").strip()

            stem_name = file_item.stem
            srt_path = output_folder / f"{stem_name}.srt"
            vtt_path = output_folder / f"{stem_name}.vtt"
            json_path = output_folder / f"{stem_name}.json"

            # Generar contenido SRT
            srt_content = segments_to_srt(segments) if segments else f"1\n00:00:00,000 --> 00:00:10,000\n{raw_text}\n"
            with open(srt_path, "w", encoding="utf-8") as f:
                f.write(srt_content)

            # Generar contenido VTT
            vtt_content = segments_to_vtt(segments) if segments else f"WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n{raw_text}\n"
            with open(vtt_path, "w", encoding="utf-8") as f:
                f.write(vtt_content)

            # Guardar JSON con timestamps
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump({
                    "track_name": file_item.name,
                    "language": transcription_data.get("language", req.language),
                    "duration": transcription_data.get("duration", 0.0),
                    "text": raw_text,
                    "segments": segments
                }, f, indent=2, ensure_ascii=False)

            result_entry = {
                "file_name": file_item.name,
                "srt_path": srt_path.as_posix(),
                "vtt_path": vtt_path.as_posix(),
                "json_path": json_path.as_posix(),
                "segments_count": len(segments),
                "text_snippet": raw_text[:140] + ("..." if len(raw_text) > 140 else "")
            }

            SUB_JOBS[job_id]["results"].append(result_entry)
            SUB_JOBS[job_id]["processed_tracks"] += 1

        # 4. Quemar subtítulos en video si se solicitó
        if req.burn_to_video and not is_folder:
            SUB_JOBS[job_id]["progress"] = 92
            SUB_JOBS[job_id]["message"] = "Quemando subtítulos en el video con FFmpeg..."
            ffmpeg = get_ffmpeg_path()
            subbed_video_path = output_folder / f"{source_path.stem}_subtitulado.mp4"
            
            # Escapar ruta para el filtro de ffmpeg
            escaped_srt = str(srt_path).replace("\\", "/").replace(":", "\\:")
            burn_cmd = [
                str(ffmpeg),
                "-y",
                "-i", str(source_path),
                "-vf", f"subtitles='{escaped_srt}'",
                "-c:a", "copy",
                str(subbed_video_path)
            ]
            try:
                subprocess.run(burn_cmd, capture_output=True, check=True)
                SUB_JOBS[job_id]["subtitled_video_path"] = subbed_video_path.as_posix()
            except Exception as e:
                SUB_JOBS[job_id]["burn_warning"] = f"No se pudo quemar en el video: {str(e)}"

        SUB_JOBS[job_id]["status"] = "completed"
        SUB_JOBS[job_id]["progress"] = 100
        SUB_JOBS[job_id]["output_folder"] = output_folder.as_posix()
        SUB_JOBS[job_id]["message"] = f"¡Subtitulado completado con éxito! ({total_files} pistas procesadas)"

    except Exception as e:
        SUB_JOBS[job_id]["status"] = "error"
        SUB_JOBS[job_id]["error"] = str(e)
        SUB_JOBS[job_id]["message"] = f"Error generando subtítulos: {str(e)}"

    finally:
        # Liberar slot del HardwareGovernor
        governor.release_job_slot(job_id)

# ──────────────────────────────────────────────
# Endpoints de la API
# ──────────────────────────────────────────────

@router.post("/estimate")
def estimate_subtitles(req: SubtitlesEstimateRequest):
    """
    Calcula la duración del medio (video o canciones) y proporciona la estimación
    de tiempo y consumo de recursos para el modal previo a la ejecución.
    """
    target_path = Path(req.path)
    if not target_path.is_absolute():
        target_path = (default_workspace_path() / target_path).resolve()

    if not target_path.exists():
        raise HTTPException(status_code=404, detail=f"Ruta no encontrada: {req.path}")

    total_duration = 0.0
    files_list = []
    is_folder = req.target_type == "songs_folder" or target_path.is_dir()

    if is_folder:
        audio_exts = {".mp3", ".wav", ".aac", ".m4a", ".flac", ".ogg", ".wma"}
        for item in sorted(target_path.iterdir(), key=lambda x: x.name.lower()):
            if item.is_file() and item.suffix.lower() in audio_exts:
                dur = probe_duration(item)
                total_duration += dur
                files_list.append({
                    "name": item.name,
                    "duration_seconds": round(dur, 2),
                    "duration_formatted": format_time_hms(dur)
                })
        if not files_list:
            raise HTTPException(status_code=400, detail="No se encontraron archivos de audio en la carpeta especificada.")
    else:
        dur = probe_duration(target_path)
        total_duration = dur
        files_list.append({
            "name": target_path.name,
            "duration_seconds": round(dur, 2),
            "duration_formatted": format_time_hms(dur)
        })

    # Obtener estimación adaptada del HardwareGovernor
    estimate_data = governor.estimate_subtitles_time(total_duration, req.engine)
    hardware_specs = governor.get_hardware_specs()

    return {
        "target_type": "songs_folder" if is_folder else "video",
        "path": target_path.as_posix(),
        "total_files": len(files_list),
        "files": files_list,
        "total_duration_seconds": round(total_duration, 2),
        "total_duration_formatted": format_time_hms(total_duration),
        "hardware_specs": hardware_specs,
        "estimate": estimate_data
    }

@router.post("/generate")
def generate_subtitles(req: SubtitlesGenerateRequest, background_tasks: BackgroundTasks):
    """
    Inicia la generación de subtítulos controlada por el HardwareGovernor.
    """
    job_id = str(uuid.uuid4())

    SUB_JOBS[job_id] = {
        "id": job_id,
        "status": "queued",
        "progress": 0,
        "message": "En cola para iniciar procesamiento...",
        "current_track": "",
        "total_tracks": 1,
        "processed_tracks": 0,
        "results": [],
        "output_folder": None,
        "created_at": time.time()
    }

    # Intentar adquirir slot en el HardwareGovernor
    slot_acquired = governor.acquire_job_slot(job_id, "subtitles", {
        "path": req.path,
        "engine": req.engine,
        "target_type": req.target_type
    })

    if not slot_acquired:
        SUB_JOBS[job_id]["message"] = "En cola: otra tarea pesada está en ejecución en el equipo..."

    # Añadir a tareas en segundo plano
    background_tasks.add_task(run_subtitles_worker, job_id, req)

    return {
        "job_id": job_id,
        "status": "processing" if slot_acquired else "queued",
        "slot_acquired": slot_acquired,
        "message": "Generación de subtítulos iniciada con éxito."
    }

@router.get("/status/{job_id}")
def get_subtitles_status(job_id: str):
    """Consulta el estado y progreso en tiempo real de una tarea de subtitulado."""
    job = SUB_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Trabajo de subtitulado no encontrado.")
    return job

@router.get("/preview_file")
def preview_subtitle_file(path: str):
    """Obtiene el texto de un archivo .srt, .vtt o .json para editarlo en el navegador."""
    file_path = Path(path)
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Archivo de subtítulo no encontrado.")

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        return {
            "path": file_path.as_posix(),
            "name": file_path.name,
            "content": content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save_file")
def save_subtitle_file(req: SubtitleFileSaveRequest):
    """Guarda los cambios editados de un archivo de subtítulo."""
    file_path = Path(req.path)
    if not file_path.parent.exists():
        file_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(req.content)
        return {"success": True, "message": "Subtítulo guardado correctamente."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
