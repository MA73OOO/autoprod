'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/app/translations';
import { ControladorClient } from '@/lib/controlador-client';
import { Channel } from './types';
import { toast } from 'sonner';

interface VideoItem {
  name: string;
  path: string;
  duration?: number;
  durationFormatted?: string;
  width?: number;
  height?: number;
  sizeMb?: number;
  hasAudio?: boolean;
}

interface SongItem {
  name: string;
  path: string;
  duration_seconds: number;
  duration_formatted: string;
  size_mb: number;
}

interface Props {
  lang: Language;
  channels: Channel[];
  workspacePath?: string | null;
  onBack: () => void;
  onRefreshWorkspace?: () => void;
}

export default function VideoLooperStudio({
  lang,
  channels,
  workspacePath,
  onBack,
  onRefreshWorkspace,
}: Props) {
  // ── Videos seleccionados para el Loop ──
  const [selectedVideos, setSelectedVideos] = useState<VideoItem[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);

  // ── Modo de Duración ──
  const [durationMode, setDurationMode] = useState<'custom' | 'audio_folder'>('custom');
  const [customMinutes, setCustomMinutes] = useState<number>(30); // 30 min por defecto
  
  // ── Carpeta de Canciones / Música ──
  const [audioFolderPath, setAudioFolderPath] = useState<string>('');
  const [scannedSongs, setScannedSongs] = useState<SongItem[]>([]);
  const [totalAudioSeconds, setTotalAudioSeconds] = useState<number>(0);
  const [totalAudioFormatted, setTotalAudioFormatted] = useState<string>('0s');
  const [isScanningAudio, setIsScanningAudio] = useState(false);

  // ── Calidad y Resolución ──
  const [resolution, setResolution] = useState<string>('1080p');
  const [quality, setQuality] = useState<string>('high'); // 'high' (CRF 18), 'master' (CRF 16), 'balanced' (CRF 22)
  const [selectedChannel, setSelectedChannel] = useState<string>(channels[0]?.id || '');
  const [outputFilename, setOutputFilename] = useState<string>('loop_produccion.mp4');
  const [muteOriginalAudio, setMuteOriginalAudio] = useState<boolean>(false);

  // ── Previsualización y Render ──
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [isRenderingFull, setIsRenderingFull] = useState(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderMessage, setRenderMessage] = useState<string>('');
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [completedOutputPath, setCompletedOutputPath] = useState<string | null>(null);

  // Drag over states
  const [isDraggingOverVideo, setIsDraggingOverVideo] = useState(false);
  const [isDraggingOverAudio, setIsDraggingOverAudio] = useState(false);

  // Calcular duración del ciclo base
  const cycleDuration = selectedVideos.reduce((acc, v) => acc + (v.duration || 10), 0);
  const targetDurationSeconds = durationMode === 'audio_folder' && totalAudioSeconds > 0
    ? totalAudioSeconds
    : customMinutes * 60;

  const loopsCount = cycleDuration > 0 ? Math.ceil(targetDurationSeconds / cycleDuration) : 1;

  // ── Manejadores de Drag & Drop de Videos ──
  const handleDropVideos = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverVideo(false);
    
    let droppedPath = e.dataTransfer.getData('text/plain');
    let customJson = e.dataTransfer.getData('application/json');

    let pathsToAdd: string[] = [];
    if (customJson) {
      try {
        const parsed = JSON.parse(customJson);
        if (parsed.path) pathsToAdd.push(parsed.path);
      } catch { /* ignore */ }
    } else if (droppedPath) {
      pathsToAdd.push(droppedPath);
    }

    if (pathsToAdd.length === 0) return;

    for (const p of pathsToAdd) {
      const isVid = ['.mp4', '.mov', '.mkv', '.webm', '.avi'].some(ext => p.toLowerCase().endsWith(ext));
      if (!isVid) {
        toast.error(lang === 'es' ? 'El archivo arrastrado no parece un formato de video compatible.' : 'Dropped file is not a supported video format.');
        continue;
      }
      
      // Evitar duplicados consecutivos
      if (selectedVideos.some(v => v.path === p)) {
        toast.info(lang === 'es' ? 'El video ya está en la lista.' : 'Video already in playlist.');
        continue;
      }

      const fileName = p.split(/[\\/]/).pop() || 'video.mp4';
      const newItem: VideoItem = { name: fileName, path: p };
      setSelectedVideos(prev => [...prev, newItem]);

      // Inspeccionar metadatos en segundo plano
      try {
        const meta = await ControladorClient.inspectMedia(p);
        setSelectedVideos(prev => prev.map(v => v.path === p ? {
          ...v,
          duration: meta.duration_seconds,
          durationFormatted: meta.duration_formatted,
          width: meta.width,
          height: meta.height,
          sizeMb: meta.size_mb,
          hasAudio: meta.has_audio
        } : v));
      } catch (err) {
        console.warn('Could not inspect media:', err);
      }
    }
  };

  // ── Manejadores de Drag & Drop de Carpeta de Canciones ──
  const handleDropAudioFolder = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverAudio(false);
    let droppedPath = e.dataTransfer.getData('text/plain');
    let customJson = e.dataTransfer.getData('application/json');
    let p = droppedPath;

    if (customJson) {
      try {
        const parsed = JSON.parse(customJson);
        if (parsed.path) p = parsed.path;
      } catch { /* ignore */ }
    }

    if (p) {
      setAudioFolderPath(p);
      scanSongs(p);
    }
  };

  // Escanear canciones
  const scanSongs = async (folder: string) => {
    if (!folder.trim()) return;
    setIsScanningAudio(true);
    const toastId = toast.loading(lang === 'es' ? 'Analizando canciones en carpeta...' : 'Scanning songs in folder...');
    try {
      const data = await ControladorClient.scanAudioFolder(folder);
      setScannedSongs(data.songs || []);
      setTotalAudioSeconds(data.total_duration_seconds || 0);
      setTotalAudioFormatted(data.total_duration_formatted || '0s');
      toast.success(
        lang === 'es'
          ? `Detectadas ${data.total_songs} canciones (${data.total_duration_formatted})`
          : `Detected ${data.total_songs} songs (${data.total_duration_formatted})`,
        { id: toastId }
      );
    } catch (err: any) {
      toast.error(err.message || 'Error escaneando carpeta de audio', { id: toastId });
    } finally {
      setIsScanningAudio(false);
    }
  };

  // Mover videos arriba/abajo
  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === selectedVideos.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...selectedVideos];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setSelectedVideos(newItems);
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  // ── Renderizado de Previsualización (Máx 5 min) ──
  const handleRenderPreview = async () => {
    if (selectedVideos.length === 0) {
      toast.error(lang === 'es' ? 'Añade al menos un video para generar el loop.' : 'Add at least one video to generate the loop.');
      return;
    }

    setIsRenderingPreview(true);
    setRenderProgress(10);
    setRenderMessage(lang === 'es' ? 'Iniciando previsualización rápida...' : 'Starting fast preview...');
    setPreviewVideoUrl(null);

    // Para previsualización rápida, calculamos entre 30 y 90 segundos (2-3 repeticiones del ciclo)
    const previewTargetDuration = Math.min(90, Math.max(Math.round((cycleDuration || 15) * 2.5), 30));

    try {
      const res = await ControladorClient.createVideoLoop({
        videoPaths: selectedVideos.map(v => v.path),
        durationMode,
        targetDurationSeconds: previewTargetDuration,
        audioFolderPath: durationMode === 'audio_folder' ? audioFolderPath : null,
        resolution,
        quality,
        isPreview: true,
        muteOriginalAudio,
      });

      const jobId = res.job_id;
      setPreviewJobId(jobId);

      // Polling del estado
      const interval = setInterval(async () => {
        try {
          const statusData = await ControladorClient.getVideoJobStatus(jobId);
          setRenderProgress(statusData.progress || 20);
          setRenderMessage(statusData.message || 'Procesando...');

          if (statusData.status === 'completed') {
            clearInterval(interval);
            setIsRenderingPreview(false);
            setRenderProgress(100);
            const streamUrl = ControladorClient.getPreviewVideoUrl(jobId);
            setPreviewVideoUrl(streamUrl);
            toast.success(lang === 'es' ? '¡Previsualización de loop lista para reproducir!' : 'Loop preview ready to play!');
          } else if (statusData.status === 'error') {
            clearInterval(interval);
            setIsRenderingPreview(false);
            toast.error(statusData.error || 'Error al generar previsualización');
          }
        } catch {
          clearInterval(interval);
          setIsRenderingPreview(false);
        }
      }, 1000);

    } catch (err: any) {
      setIsRenderingPreview(false);
      toast.error(err.message || 'Error al iniciar renderizado de previsualización');
    }
  };

  // ── Renderizado Final Completo ──
  const handleRenderFull = async () => {
    if (selectedVideos.length === 0) {
      toast.error(lang === 'es' ? 'Añade al menos un video para generar el loop.' : 'Add at least one video to generate the loop.');
      return;
    }

    setIsRenderingFull(true);
    setRenderProgress(5);
    setRenderMessage(lang === 'es' ? 'Iniciando codificación en alta fidelidad...' : 'Starting high fidelity encode...');
    setCompletedOutputPath(null);

    try {
      const res = await ControladorClient.createVideoLoop({
        videoPaths: selectedVideos.map(v => v.path),
        durationMode,
        targetDurationSeconds,
        audioFolderPath: durationMode === 'audio_folder' ? audioFolderPath : null,
        resolution,
        quality,
        isPreview: false,
        muteOriginalAudio,
        outputChannel: selectedChannel,
        outputFilename,
      });

      const jobId = res.job_id;

      const interval = setInterval(async () => {
        try {
          const statusData = await ControladorClient.getVideoJobStatus(jobId);
          setRenderProgress(statusData.progress || 15);
          setRenderMessage(statusData.message || 'Renderizando...');

          if (statusData.status === 'completed') {
            clearInterval(interval);
            setIsRenderingFull(false);
            setRenderProgress(100);
            setCompletedOutputPath(statusData.output_path);
            toast.success(
              lang === 'es'
                ? `¡Video Loop exportado con éxito! (${statusData.file_size_mb} MB)`
                : `Video Loop exported successfully! (${statusData.file_size_mb} MB)`
            );
            if (onRefreshWorkspace) onRefreshWorkspace();
          } else if (statusData.status === 'error') {
            clearInterval(interval);
            setIsRenderingFull(false);
            toast.error(statusData.error || 'Error al renderizar el video');
          }
        } catch {
          clearInterval(interval);
          setIsRenderingFull(false);
        }
      }, 1500);

    } catch (err: any) {
      setIsRenderingFull(false);
      toast.error(err.message || 'Error al iniciar renderizado completo');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121214] text-zinc-200 overflow-y-auto minimal-scrollbar p-6">
      
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800 shrink-0">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors mb-2 cursor-pointer"
          >
            ← {lang === 'es' ? 'Volver al Inicio' : 'Back to Home'}
          </button>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🔁</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Video Looper Studio
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300">
              Pro HD
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === 'es'
              ? 'Concatena y repite clips en bucle infinito sin pérdida de nitidez. Sincroniza la duración con tu música o defínela manualmente.'
              : 'Concatenate and repeat clips in seamless infinite loop with master clarity. Sync duration with songs or set manually.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRenderPreview}
            disabled={isRenderingPreview || isRenderingFull || selectedVideos.length === 0}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              isRenderingPreview
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 animate-pulse cursor-wait'
                : 'bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700 text-zinc-200 hover:border-purple-500'
            }`}
          >
            ⚡ {isRenderingPreview ? (lang === 'es' ? 'Previsualizando...' : 'Previewing...') : (lang === 'es' ? 'Previsualizar (Máx 5 min)' : 'Preview (Max 5 min)')}
          </button>

          <button
            onClick={handleRenderFull}
            disabled={isRenderingPreview || isRenderingFull || selectedVideos.length === 0}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isRenderingFull
                ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50 animate-pulse cursor-wait'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
            }`}
          >
            🚀 {isRenderingFull ? (lang === 'es' ? 'Renderizando Loop...' : 'Rendering Loop...') : (lang === 'es' ? 'Exportar al Workspace' : 'Export to Workspace')}
          </button>
        </div>
      </div>

      {/* Progress Bar Banner (if active) */}
      {(isRenderingPreview || isRenderingFull) && (
        <div className="my-4 p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-purple-300 flex items-center gap-2">
              ⏳ {renderMessage}
            </span>
            <span className="font-mono text-purple-400 font-bold">{renderProgress}%</span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${renderProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Column: Playlist & Audio Sync (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Video Drop Zone & Sequence */}
          <div className="bg-[#18181b] border border-zinc-800/90 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎬</span>
                <h2 className="text-sm font-bold text-white">
                  {lang === 'es' ? 'Secuencia de Videos a Repetir' : 'Video Sequence to Repeat'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  {selectedVideos.length} {selectedVideos.length === 1 ? 'clip' : 'clips'}
                </span>
              </div>
              {selectedVideos.length > 0 && (
                <span className="text-[11px] text-zinc-400 font-mono">
                  1 ciclo = <strong className="text-purple-300">{Math.round(cycleDuration)}s</strong> ({loopsCount} repeticiones estimadas)
                </span>
              )}
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOverVideo(true); }}
              onDragLeave={() => setIsDraggingOverVideo(false)}
              onDrop={handleDropVideos}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                isDraggingOverVideo
                  ? 'border-purple-500 bg-purple-950/20 text-purple-200 scale-[1.01]'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-400'
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-lg text-purple-400">
                📁
              </div>
              <p className="text-xs font-semibold text-zinc-300">
                {lang === 'es' ? 'Arrastra videos desde el explorador del workspace aquí' : 'Drag videos from workspace file tree here'}
              </p>
              <p className="text-[11px] text-zinc-500">
                {lang === 'es'
                  ? 'Formatos compatibles: .mp4, .mov, .mkv, .webm. Puedes añadir varios para crear un ciclo.'
                  : 'Supported formats: .mp4, .mov, .mkv, .webm. Add multiple to create a loop cycle.'}
              </p>
            </div>

            {/* Playlist Table */}
            {selectedVideos.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-1 flex justify-between">
                  <span>Orden de Reproducción</span>
                  <span>Acciones</span>
                </div>
                {selectedVideos.map((video, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 p-3 rounded-lg text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="h-6 w-6 rounded bg-purple-950/50 border border-purple-800/40 text-purple-300 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-semibold text-zinc-200 truncate">{video.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {video.width && video.height ? `${video.width}x${video.height}` : 'Video'} • {video.durationFormatted || 'Calculando...'} {video.sizeMb ? `• ${video.sizeMb} MB` : ''}
                          </span>
                          {video.hasAudio !== undefined && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium border ${
                              video.hasAudio 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                                : 'bg-zinc-800/60 text-zinc-500 border-zinc-700/50'
                            }`}>
                              {video.hasAudio ? '🔊 Con audio' : '🔇 Sin audio'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => moveVideo(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Mover arriba"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveVideo(idx, 'down')}
                        disabled={idx === selectedVideos.length - 1}
                        className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Mover abajo"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeVideo(idx)}
                        className="p-1.5 rounded hover:bg-red-950/50 text-zinc-400 hover:text-red-400 cursor-pointer ml-1"
                        title="Eliminar de la lista"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Audio Strip / Mute Control */}
            {selectedVideos.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mt-1">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base border transition-colors shrink-0 ${
                    muteOriginalAudio 
                      ? 'bg-amber-950/50 text-amber-300 border-amber-800/50' 
                      : 'bg-purple-950/50 text-purple-300 border-purple-800/50'
                  }`}>
                    {muteOriginalAudio ? '🔇' : '🔊'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                      {muteOriginalAudio 
                        ? (lang === 'es' ? 'Audio de los clips silenciado' : 'Clips audio muted') 
                        : (lang === 'es' ? 'Audio original de los clips activo' : 'Original clips audio active')}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                        muteOriginalAudio 
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60' 
                          : 'bg-purple-950/70 text-purple-300 border border-purple-800/60'
                      }`}>
                        {muteOriginalAudio ? (lang === 'es' ? 'Silenciado' : 'Muted') : (lang === 'es' ? 'Activo' : 'Active')}
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {muteOriginalAudio
                        ? (lang === 'es' 
                            ? 'Se eliminarán todas las pistas de audio originales del video para un loop mudo o con música de fondo limpia.' 
                            : 'All original audio tracks will be stripped for a mute loop or clean background music.')
                        : (lang === 'es'
                            ? 'Se mantendrá el audio nativo de tus videos. Si añades música de fondo, se reemplazará o sincronizará.' 
                            : 'Keep the native audio of your clips. If you add background songs, they will sync accordingly.')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMuteOriginalAudio(!muteOriginalAudio)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer border shadow-sm ${
                    muteOriginalAudio
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:border-purple-500 hover:text-white'
                  }`}
                >
                  {muteOriginalAudio 
                    ? (lang === 'es' ? '🔊 Conservar Audio Original' : '🔊 Keep Original Audio') 
                    : (lang === 'es' ? '🔇 Quitar / Silenciar Audio' : '🔇 Mute / Remove Audio')}
                </button>
              </div>
            )}
          </div>

          {/* Audio-Sync & Duration Configuration */}
          <div className="bg-[#18181b] border border-zinc-800/90 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">⏱️</span>
                <h2 className="text-sm font-bold text-white">
                  {lang === 'es' ? 'Duración del Loop y Música' : 'Loop Duration & Music'}
                </h2>
              </div>
              
              {/* Duration Mode Tabs */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 flex">
                <button
                  type="button"
                  onClick={() => setDurationMode('custom')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    durationMode === 'custom'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ⏱️ {lang === 'es' ? 'Manual' : 'Manual'}
                </button>
                <button
                  type="button"
                  onClick={() => setDurationMode('audio_folder')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    durationMode === 'audio_folder'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🎵 {lang === 'es' ? 'Carpeta de Canciones' : 'Song Playlist'}
                </button>
              </div>
            </div>

            {durationMode === 'custom' ? (
              <div className="space-y-4 pt-1">
                <p className="text-xs text-zinc-400">
                  {lang === 'es'
                    ? 'Selecciona un preset de tiempo o ingresa la duración en minutos deseada para tu video loop:'
                    : 'Select a duration preset or type the custom minutes for your video loop:'}
                </p>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '15 min', val: 15 },
                    { label: '30 min', val: 30 },
                    { label: '1 hora', val: 60 },
                    { label: '2 horas', val: 120 },
                    { label: '3 horas', val: 180 },
                    { label: '8 horas', val: 480 },
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setCustomMinutes(p.val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        customMinutes === p.val
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-sm font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Minutes Input */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-zinc-400">{lang === 'es' ? 'O especifica minutos:' : 'Or specify minutes:'}</span>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <span className="text-xs text-zinc-500 font-mono">
                    = {Math.floor(customMinutes / 60)}h {customMinutes % 60}m ({customMinutes * 60}s)
                  </span>
                </div>
              </div>
            ) : (
              /* Song Folder Mode */
              <div className="space-y-4 pt-1">
                <p className="text-xs text-zinc-400">
                  {lang === 'es'
                    ? 'Arrastra o indica la carpeta que contiene las canciones (ej. Ambiente, canciones). El loop durará exactamente lo que duren los audios:'
                    : 'Drag or select the folder containing the songs. The video loop will automatically match the total songs length:'}
                </p>

                {/* Audio Drop Zone / Input */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOverAudio(true); }}
                  onDragLeave={() => setIsDraggingOverAudio(false)}
                  onDrop={handleDropAudioFolder}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center gap-2 ${
                    isDraggingOverAudio
                      ? 'border-indigo-500 bg-indigo-950/20 text-indigo-200'
                      : 'border-zinc-800 bg-zinc-950/40 text-zinc-400'
                  }`}
                >
                  <span className="text-xl">🎵</span>
                  <div className="flex w-full gap-2 mt-1">
                    <input
                      type="text"
                      placeholder={lang === 'es' ? 'Ruta de la carpeta de canciones o arrastra aquí...' : 'Folder path with songs or drop here...'}
                      value={audioFolderPath}
                      onChange={(e) => setAudioFolderPath(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => scanSongs(audioFolderPath)}
                      disabled={isScanningAudio || !audioFolderPath.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      {isScanningAudio ? 'Escaneando...' : 'Escanear'}
                    </button>
                  </div>
                </div>

                {/* Audio Scan Results */}
                {totalAudioSeconds > 0 && (
                  <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-indigo-200">
                        {lang === 'es' ? 'Duración de Música Sincronizada:' : 'Synchronized Music Duration:'}
                      </p>
                      <p className="text-[11px] text-indigo-400 mt-0.5">
                        {scannedSongs.length} canciones encontradas
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-white">
                        {totalAudioFormatted}
                      </span>
                      <p className="text-[10px] text-indigo-300 font-mono">
                        ({Math.round(totalAudioSeconds)} segundos)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings & Live Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Quality & Resolution Settings (Anti-Pixelado) */}
          <div className="bg-[#18181b] border border-zinc-800/90 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base">⚙️</span>
              <h2 className="text-sm font-bold text-white">
                {lang === 'es' ? 'Calidad de Codificación Anti-Pixelado' : 'Anti-Pixelation Quality Settings'}
              </h2>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400">
                {lang === 'es' ? 'Resolución de Salida:' : 'Output Resolution:'}
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="original">🎯 Original (Conservar resolución nativa sin reescalar)</option>
                <option value="1080p">📺 1080p Full HD (1920x1080) - Estándar YouTube</option>
                <option value="4k">🌟 4K Ultra HD (3840x2160) - Máxima Definición</option>
                <option value="720p">⚡ 720p HD (1280x720) - Rápido / Liviano</option>
                <option value="shorts">📱 1080x1920 Vertical (Shorts / Reels / TikTok)</option>
              </select>
            </div>

            {/* Quality Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                <span>{lang === 'es' ? 'Nitidez y Compresión:' : 'Clarity & Compression:'}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Sin artefactos</span>
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="high">✨ Alta Nitidez Pro (CRF 17 / Sin artefactos de compresión) [Recomendado]</option>
                <option value="master">💎 Calidad Master / Ultra Estudio (CRF 14 / Máxima fidelidad)</option>
                <option value="balanced">⚖️ Equilibrado (CRF 21 / Menor tamaño de archivo)</option>
              </select>
            </div>

            {/* Destination Channel & Filename */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Canal Destino:</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="">Raíz del Workspace</option>
                  {channels.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Nombre Archivo:</label>
                <input
                  type="text"
                  value={outputFilename}
                  onChange={(e) => setOutputFilename(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Embedded Video Preview Player */}
          <div className="bg-[#18181b] border border-zinc-800/90 rounded-xl p-5 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📺</span>
                <h2 className="text-sm font-bold text-white">
                  {lang === 'es' ? 'Previsualizador de Loop (HD)' : 'Loop Previsualizer (HD)'}
                </h2>
              </div>
              {previewVideoUrl && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-bold">
                  ✓ Listo
                </span>
              )}
            </div>

            {isRenderingPreview ? (
              <div className="border border-purple-500/50 rounded-xl p-8 flex-1 flex flex-col items-center justify-center text-center gap-5 bg-gradient-to-b from-purple-950/40 via-[#18181b] to-black min-h-[260px] animate-in fade-in duration-300 shadow-2xl">
                {/* Animated Glowing Dual Spinner */}
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-900/40 border-t-purple-500 animate-spin" />
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-900/40 border-b-indigo-400 animate-spin absolute" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
                  <span className="text-xl absolute">⚡</span>
                </div>

                {/* Stage & Progress Information */}
                <div className="space-y-3 max-w-sm w-full">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5 truncate">
                      <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
                      <span className="truncate">{renderMessage || (lang === 'es' ? 'Procesando bucle en alta fidelidad...' : 'Processing loop in high fidelity...')}</span>
                    </span>
                    <span className="font-mono text-purple-300 font-bold text-sm shrink-0 ml-2">{renderProgress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-purple-900/50 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400 h-full transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                      style={{ width: `${Math.max(8, renderProgress)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-300">
                      {resolution.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-300">
                      {quality === 'master' ? 'CRF 14 Master' : quality === 'balanced' ? 'CRF 21' : 'CRF 17 Pro'}
                    </span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                      muteOriginalAudio 
                        ? 'bg-amber-950/40 text-amber-400 border-amber-800/40' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {muteOriginalAudio ? '🔇 Mudo' : '🔊 Con audio'}
                    </span>
                  </div>
                </div>
              </div>
            ) : previewVideoUrl ? (
              <div className="flex flex-col gap-3">
                <video
                  src={previewVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full rounded-lg border border-purple-500/40 shadow-2xl bg-black aspect-video object-contain"
                />
                <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                  <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <span className="text-emerald-400">✓</span> Muestra renderizada en alta fidelidad.
                  </span>
                  <button
                    onClick={() => window.open(previewVideoUrl, '_blank')}
                    className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline"
                  >
                    Abrir video en pestaña nueva ↗
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-zinc-800/60 rounded-xl p-8 flex-1 flex flex-col items-center justify-center text-center gap-3 bg-black/30 min-h-[220px]">
                <div className="h-12 w-12 rounded-full bg-purple-600/5 border border-purple-500/10 flex items-center justify-center text-2xl text-purple-400">
                  ⚡
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-300">
                    {lang === 'es' ? 'Ninguna muestra previsualizada aún' : 'No preview rendered yet'}
                  </p>
                  <p className="text-[11px] text-zinc-500 max-w-xs">
                    {lang === 'es'
                      ? 'Haz clic en "Previsualizar" arriba para renderizar un fragmento rápido y comprobar la calidad y el bucle.'
                      : 'Click "Preview" above to quickly generate a sample and check quality and transitions.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRenderPreview}
                  disabled={selectedVideos.length === 0 || isRenderingPreview}
                  className="mt-2 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-700/40 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Generar Previsualización
                </button>
              </div>
            )}

            {/* Full Output Path Notification */}
            {completedOutputPath && (
              <div className="mt-2 p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 flex flex-col gap-1">
                <span className="font-bold flex items-center gap-1.5">
                  ✅ Video Loop exportado con éxito:
                </span>
                <span className="font-mono text-[10px] text-zinc-300 break-all">
                  {completedOutputPath}
                </span>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
