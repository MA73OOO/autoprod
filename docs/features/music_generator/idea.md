# 💡 Idea de Negocio & Escalabilidad: Generador de Música IA & Soundscapes (AI Music Studio)

> **Ruta:** `docs/features/music_generator/idea.md`  
> **Estado:** `💡 IDEA / PLANIFICADO`  
> **Propósito:** Proveer a los creadores de canales generación y curaduría de pistas musicales de fondo y soundscapes libres de derechos de autor (Content ID safe), optimizados para bucles y ambientación de videos.

---

## 🎯 1. Problema del Creador
- Los creadores de contenido sufren constantemente por reclamos de derechos de autor (Content ID en YouTube) al usar música comercial o bancos tradicionales.
- En canales temáticos (lo-fi, meditación, terror, divulgación, podcasts), encontrar música de la duración exacta y con el tono adecuado requiere horas de búsqueda manual o suscripciones costosas a librerías de stock.
- La música descargada manualmente rara vez tiene la duración exacta del metraje, obligando a cortes abruptos o bucles imperfectos en editores NLE.

---

## 🚀 2. Propuesta de Solución en AutoProd
1. **Generación con Intención por Estilo y Emoción:**
   - Selección guiada por nicho del canal: *Lo-Fi Chill, Ambient Synth, Cinematic Dark, Acústico Corporativo, Cyberpunk, Meditación 432Hz*.
   - Control de BPM, tonalidad, instrumentos principales y nivel de dinamismo.
2. **Arquitectura Híbrida $0 Costo / BYOK:**
   - **Modo Local ($0 Costo Servidor):** Inferencia en GPU/CPU del usuario con modelos de código abierto como `MusicGen` / `Audiocraft` a través del Motor Local de Python (`localhost:8000`).
   - **Modo Cloud BYOK / API Providers:** Conexión opcional para creadores con claves propias a servicios como Suno, Udio, Stable Audio o Mubert API.
3. **Flujo Integrado con el Sistema de Archivos de AutoProd:**
   - La pista generada se guarda automáticamente en `{Workspace}/{Canal}/{Titulo_Video}/Musica/track_{slug}.mp3`.
   - Conexión nativa con el **Video Looper Studio (FEAT-04)** para ajustar automáticamente la duración del video a la pista musical generada.

---

## 📊 3. Matriz de Alcance

| Capacidad | Estado | Notas |
|---|:---:|---|
| Detección y escaneo de carpetas `Musica/` | `✅ HECHO` | Integrado en Video Looper Studio. |
| Mezcla y ajuste de volumen de audio en render | `✅ HECHO` | Motor FFmpeg en Video Looper. |
| Preescucha interactiva en UI | `📋 PLANIFICADO` | Reproductor de samples previo a guardado. |
| Inferencia local MusicGen (FastAPI) | `💡 IDEA` | Requiere GPU (NVIDIA CUDA) o quantización CPU. |
| Integración Cloud BYOK (Suno / Stable Audio) | `💡 IDEA` | Supabase Vault para llaves API seguras. |
| Generación de Bucles Perfectos (Seamless Loop) | `💡 IDEA` | Algoritmo de crossfade suave en los extremos. |

---

## 🔮 4. Banco de Ideas de Escalabilidad
- **IDEA-MUS-1 (Soundscape Adaptativo):** Generación de capas de efectos ambientales sonoros (lluvia, chimenea, grillos, ruido blanco) directo a la carpeta `Ambiente/`.
- **IDEA-MUS-2 (Music-to-Video BPM Sync):** Detección automática de transiciones y golpes de ritmo para sincronizar cambios de escena en el Video Looper.
