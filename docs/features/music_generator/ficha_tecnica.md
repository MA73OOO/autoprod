# ⚙️ Ficha Técnica: Generador de Música IA & Soundscapes (AI Music Studio)

> **Ruta:** `docs/features/music_generator/ficha_tecnica.md`  
> **Estado:** `💡 EN DISEÑO TÉCNICO`  
> **Capa Técnica:** Next.js UI + FastAPI Motor Local (`localhost:8000`) + MusicGen / Stable Audio API + FFmpeg Audio Processor

---

## 🛠️ 1. Pipeline de Procesamiento & Enrutamiento de Audio

```mermaid
flowchart TD
    A[Usuario / Orquestador] --> B[UI: MusicStudio.tsx / Tool: generar_musica]
    B --> C{¿Qué motor usar?}
    
    C -->|Motor Local: MusicGen / Audiocraft| D[FastAPI: POST /music/generate_local]
    D -->|Inferencia GPU CUDA / DirectML| E[Archivo WAV / MP3 Master]
    
    C -->|Cloud BYOK: Stable Audio / Suno| F[app/api/music/generate: Provider API]
    F -->|Descarga Stream de Audio| E
    
    E --> G[FFmpeg Post-Proceso: Normalización LUFS + Seamless Loop Crossfade]
    G --> H[Guardado en Disco: {Canal}/{Video}/Musica/pista_ia.mp3]
    H --> I[Conexión Directa a Video Looper Studio]
```

---

## 🔌 2. Especificación de Endpoints Propuestos

### A. Motor Local (FastAPI `localhost:8000`)

| Endpoint | Método | Parámetros Clave | Descripción |
|---|:---:|---|---|
| `/music/models` | `GET` | N/A | Consulta modelos locales instalados (MusicGen-small/medium) y aceleración disponible (CUDA/CPU). |
| `/music/preview` | `POST` | `{ prompt, genre, bpm, duration_seconds: 10 }` | Genera una muestra de 10 segundos en memoria y la retorna en Base64 para preescucha rápida. |
| `/music/generate` | `POST` | `{ prompt, genre, bpm, duration_seconds, loop_seamless, output_path }` | Genera la pista completa con post-proceso de bucle y normalización a -14 LUFS para YouTube. |

### B. Capa Next.js / Cerebro Agéntico

| Endpoint | Método | Parámetros Clave | Descripción |
|---|:---:|---|---|
| `/api/tools/generar_musica` | `POST` | `{ prompt, genre, bpm, duration, channelName, videoTitle }` | Tool invocable por el Orquestador central para componer música de fondo según el tema del video. |

---

## 🎛️ 3. Parámetros de Audio & Normalización FFmpeg
- **Tasa de Muestreo:** 44.1 kHz / 48 kHz estéreo a 320 kbps.
- **Normalización Estándar:** `-af loudnorm=I=-14:LRA=11:TP=-1.5` (estándar de sonoridad para YouTube).
- **Seamless Loop:** Aplicación de filtro `acrossfade` de 1.5s entre inicio y final para bucles infinitos en el Video Looper sin saltos audibles.
