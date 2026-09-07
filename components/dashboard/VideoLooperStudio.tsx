'use client';

import { useState, useEffect, useRef } from 'react';
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
  // ── Videos seleccionados para la Línea de Tiempo del Loop ──
  const [selectedVideos, setSelectedVideos] = useState<VideoItem[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [resolution, setResolution] = useState<string>('original');
  const [quality, setQuality] = useState<string>('lossless_copy'); // 'lossless_copy' (1:1 stream copy), 'master' (CRF 12), 'high' (CRF 15), 'balanced' (CRF 18)
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

  // ── Inspeccionar metadatos de un video ──
  const inspectAndAttachMeta = async (filePath: string) => {
    try {
      const meta = await ControladorClient.inspectMedia(filePath);
      setSelectedVideos(prev => prev.map(v => v.path === filePath ? {
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
  };

  // ── Subir videos directamente desde el explorador del PC ──
  const handleFilesUploaded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processUploadedFiles(Array.from(files));
  };

  const processUploadedFiles = async (files: File[]) => {
    setIsInspecting(true);
    const toastId = toast.loading(lang === 'es' ? `Importando ${files.length} video(s) a la línea de tiempo...` : `Importing ${files.length} video(s)...`);
    try {
      for (const file of files) {
        const isVid = ['.mp4', '.mov', '.mkv', '.webm', '.avi'].some(ext => file.name.toLowerCase().endsWith(ext));
        if (!isVid) {
          toast.error(`${file.name} no es un video compatible.`);
          continue;
        }

        // Convertir archivo a base64 para guardarlo en el workspace local
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const base64Data = await base64Promise;

        const saved = await ControladorClient.saveBinaryFile({
          base64_data: base64Data,
          file_name: file.name,
          channel_name: selectedChannel || undefined,
          subfolder: 'Videos',
        });

        if (saved && saved.path) {
          const newItem: VideoItem = { name: file.name, path: saved.path };
          setSelectedVideos(prev => [...prev, newItem]);
          inspectAndAttachMeta(saved.path);
        }
      }
      toast.success(lang === 'es' ? 'Videos añadidos a la línea de tiempo con éxito' : 'Videos added to timeline successfully', { id: toastId });
      if (onRefreshWorkspace) onRefreshWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Error al importar videos', { id: toastId });
    } finally {
      setIsInspecting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Manejadores de Drag & Drop de Videos (Workspace Tree o Archivos de Windows) ──
  const handleDropVideos = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverVideo(false);

    // 1. Si soltó archivos directos desde el Explorador de Windows
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUploadedFiles(Array.from(e.dataTransfer.files));
      return;
    }
    
    // 2. Si arrastró desde el explorador del workspace de AutoProd
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
      
      const fileName = p.split(/[\\/]/).pop() || 'video.mp4';
      const newItem: VideoItem = { name: fileName, path: p };
      setSelectedVideos(prev => [...prev, newItem]);
      inspectAndAttachMeta(p);
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

  // Mover videos en la línea de tiempo (izquierda/derecha)
  const moveVideo = (index: number, direction: 'left' | 'right' | 'up' | 'down') => {
    const isMoveBack = direction === 'left' || direction === 'up';
    if ((isMoveBack && index === 0) || (!isMoveBack && index === selectedVideos.length - 1)) return;
    const targetIndex = isMoveBack ? index - 1 : index + 1;
    const newItems = [...selectedVideos];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setSelectedVideos(newItems);
  };

  const duplicateVideo = (index: number) => {
    const item = selectedVideos[index];
    if (!item) return;
    const newItems = [...selectedVideos];
    newItems.splice(index + 1, 0, { ...item });
    setSelectedVideos(newItems);
    toast.success(lang === 'es' ? 'Clip duplicado en la línea de tiempo' : 'Clip duplicated in timeline');
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const clearTimeline = () => {
    setSelectedVideos([]);
    setPreviewVideoUrl(null);
    setCompletedOutputPath(null);
    toast.info(lang === 'es' ? 'Línea de tiempo vaciada' : 'Timeline cleared');
  };

  const handleClipDragStart = (e: React.DragEvent, index: number) => {
    setDraggedClipIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClipDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedClipIndex === null || draggedClipIndex === targetIndex) return;
    const items = [...selectedVideos];
    const [draggedItem] = items.splice(draggedClipIndex, 1);
    items.splice(targetIndex, 0, draggedItem);
    setSelectedVideos(items);
    setDraggedClipIndex(null);
    toast.success(lang === 'es' ? 'Orden actualizado en la línea de tiempo' : 'Timeline order updated');
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

    // Limpiar previsualizador antes de iniciar el render completo
    setPreviewVideoUrl(null);
    setPreviewJobId(null);

    setIsRenderingFull(true);
    setRenderProgress(5);
    setRenderMessage(lang === 'es' ? 'Limpiando previsualización e iniciando renderizado en alta fidelidad...' : 'Clearing preview and starting high fidelity encode...');
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

            {/* Hidden Native File Input for PC Uploads */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesUploaded}
              multiple
              accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/avi"
              className="hidden"
            />

            {/* Drop Zone & Upload Trigger */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOverVideo(true); }}
              onDragLeave={() => setIsDraggingOverVideo(false)}
              onDrop={handleDropVideos}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                isDraggingOverVideo
                  ? 'border-purple-500 bg-purple-950/25 text-purple-200 scale-[1.01] shadow-lg shadow-purple-900/20'
                  : 'border-zinc-800 hover:border-purple-600/60 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900/40'
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-lg text-purple-400">
                📥
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs font-semibold text-zinc-200">
                  {lang === 'es' 
                    ? 'Haz clic para subir videos desde tu PC o arrástralos aquí' 
                    : 'Click to upload videos from your PC or drag them here'}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {lang === 'es'
                    ? 'También puedes arrastrar desde el explorador del Workspace de AutoProd • MP4, MOV, WEBM'
                    : 'You can also drag from AutoProd Workspace explorer • MP4, MOV, WEBM'}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 font-semibold flex items-center gap-1">
                  📂 {lang === 'es' ? 'Explorar PC' : 'Browse PC'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {lang === 'es' ? 'Admite múltiples archivos' : 'Supports multiple files'}
                </span>
              </div>
            </div>

            {/* Visual Timeline Section */}
            {selectedVideos.length > 0 ? (
              <div className="flex flex-col gap-3 mt-1 bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4">
                {/* Timeline Header & Actions */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">⏱️</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      {lang === 'es' ? 'Línea de Tiempo Multiclip' : 'Multiclip Sequence Timeline'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40 font-mono font-bold">
                      {selectedVideos.length} {selectedVideos.length === 1 ? 'clip' : 'clips'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title={lang === 'es' ? 'Añadir más videos' : 'Add more videos'}
                    >
                      <span>➕</span> {lang === 'es' ? 'Añadir Clip' : 'Add Clip'}
                    </button>
                    <button
                      type="button"
                      onClick={clearTimeline}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-red-950/30 hover:bg-red-950/60 text-red-300 border border-red-800/40 transition-colors flex items-center gap-1 cursor-pointer"
                      title={lang === 'es' ? 'Vaciar toda la línea de tiempo' : 'Clear timeline'}
                    >
                      <span>🗑️</span> {lang === 'es' ? 'Vaciar' : 'Clear'}
                    </button>
                  </div>
                </div>

                {/* Timeline Stats Ribbon */}
                <div className="flex items-center justify-between text-[11px] bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 font-mono">
                  <div className="flex items-center gap-3">
                    <span>
                      {lang === 'es' ? 'Secuencia:' : 'Sequence:'}{' '}
                      <strong className="text-zinc-200 font-bold">
                        {selectedVideos.map((_, i) => `#${i + 1}`).join(' ➔ ')}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{lang === 'es' ? '1 Ciclo Master:' : '1 Master Cycle:'}</span>
                    <strong className="text-purple-300 font-bold">{Math.round(cycleDuration)}s</strong>
                    <span className="text-zinc-600">•</span>
                    <span>{loopsCount} {lang === 'es' ? 'repeticiones para la duración final' : 'loops for target duration'}</span>
                  </div>
                </div>

                {/* Instructions Hint */}
                <p className="text-[10px] text-zinc-500 italic px-1">
                  💡 {lang === 'es' 
                    ? 'Arrastra los clips horizontalmente para cambiar el orden, o usa las flechas ◀ ▶. Al terminar el último clip, se reinicia el bucle.' 
                    : 'Drag clips horizontally to reorder, or use ◀ ▶ buttons. When the last clip ends, it loops back to clip #1.'}
                </p>

                {/* Horizontal Scrolling Timeline Track */}
                <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                  <div className="flex items-center gap-2.5 min-w-max">
                    {selectedVideos.map((video, idx) => {
                      const isDragged = draggedClipIndex === idx;
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          {/* Timeline Card */}
                          <div
                            draggable
                            onDragStart={(e) => handleClipDragStart(e, idx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleClipDrop(e, idx)}
                            className={`w-64 bg-zinc-900/90 rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-all shadow-md select-none cursor-grab active:cursor-grabbing ${
                              isDragged
                                ? 'opacity-40 border-purple-500 scale-95 ring-2 ring-purple-500/50'
                                : 'border-zinc-800 hover:border-purple-500/60 hover:bg-zinc-900'
                            }`}
                          >
                            {/* Card Top: Order Badge & Delete */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="h-5 px-2 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow">
                                  Clip #{idx + 1}
                                </span>
                                {video.hasAudio !== undefined && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium border ${
                                    video.hasAudio 
                                      ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40' 
                                      : 'bg-zinc-800/60 text-zinc-500 border-zinc-700/50'
                                  }`}>
                                    {video.hasAudio ? '🔊 Audio' : '🔇 Mudo'}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => removeVideo(idx)}
                                className="h-5 w-5 rounded hover:bg-red-950/60 text-zinc-500 hover:text-red-400 flex items-center justify-center text-xs transition-colors cursor-pointer"
                                title={lang === 'es' ? 'Quitar clip' : 'Remove clip'}
                              >
                                ✕
                              </button>
                            </div>

                            {/* Card Middle: Video Icon, Name & Meta */}
                            <div className="flex items-start gap-2.5">
                              <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg text-purple-400 shrink-0">
                                🎞️
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-xs text-zinc-100 truncate" title={video.name}>
                                  {video.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400 font-mono">
                                  <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300">
                                    ⏱️ {video.durationFormatted || 'Calculando...'}
                                  </span>
                                  {video.width && video.height && (
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                                      {video.width}x{video.height}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Card Bottom: Reordering & Duplication Controls */}
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveVideo(idx, 'left')}
                                  disabled={idx === 0}
                                  className="h-6 w-6 rounded bg-zinc-800 hover:bg-purple-900/50 hover:text-purple-200 text-zinc-300 flex items-center justify-center text-xs disabled:opacity-20 cursor-pointer transition-colors"
                                  title={lang === 'es' ? 'Mover antes' : 'Move earlier'}
                                >
                                  ◀
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveVideo(idx, 'right')}
                                  disabled={idx === selectedVideos.length - 1}
                                  className="h-6 w-6 rounded bg-zinc-800 hover:bg-purple-900/50 hover:text-purple-200 text-zinc-300 flex items-center justify-center text-xs disabled:opacity-20 cursor-pointer transition-colors"
                                  title={lang === 'es' ? 'Mover después' : 'Move later'}
                                >
                                  ▶
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => duplicateVideo(idx)}
                                className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                title={lang === 'es' ? 'Duplicar este clip en la secuencia' : 'Duplicate clip in sequence'}
                              >
                                <span>📋</span> {lang === 'es' ? 'Duplicar' : 'Duplicate'}
                              </button>
                            </div>
                          </div>

                          {/* Connector Arrow Between Clips */}
                          {idx < selectedVideos.length - 1 && (
                            <div className="flex flex-col items-center justify-center text-zinc-600 px-1">
                              <span className="text-base font-bold text-purple-400">➔</span>
                              <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500">
                                {lang === 'es' ? 'Unión' : 'Join'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* End Loop Indicator (Bucle Infinito) */}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center justify-center text-zinc-600 px-1">
                        <span className="text-base font-bold text-purple-400">➔</span>
                      </div>

                      <div className="w-48 bg-purple-950/30 border border-dashed border-purple-700/50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5">
                        <div className="h-7 w-7 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-sm">
                          🔁
                        </div>
                        <p className="text-[11px] font-bold text-purple-200">
                          {lang === 'es' ? 'Bucle al Clip #1' : 'Loop to Clip #1'}
                        </p>
                        <p className="text-[9px] text-purple-300/70">
                          {lang === 'es' 
                            ? 'La secuencia se repite continuamente hasta la duración final.' 
                            : 'Sequence repeats continuously until final duration.'}
                        </p>
                      </div>

                      {/* Quick Add Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-32 rounded-xl border border-dashed border-zinc-800 hover:border-purple-500 bg-zinc-950/40 hover:bg-purple-950/20 text-zinc-500 hover:text-purple-300 flex flex-col items-center justify-center gap-1 text-xs transition-all cursor-pointer"
                        title={lang === 'es' ? 'Añadir otro clip' : 'Add another clip'}
                      >
                        <span className="text-lg">➕</span>
                        <span className="text-[10px] font-semibold">{lang === 'es' ? 'Añadir' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

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
                <option value="original">🎯 Original (Conservar resolución y aspecto nativo sin barras negras) [Recomendado]</option>
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
                <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Cero Pérdida</span>
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="lossless_copy">⚡ Copia Directa 1:1 (Cero Pérdida / 100% Calidad Original / Ultra Rápido) [Recomendado]</option>
                <option value="master">💎 Calidad Master (CRF 12 / Máxima Nitidez sin macrobloques)</option>
                <option value="high">✨ Alta Nitidez Pro (CRF 15 / Con optimización para fondos oscuros)</option>
                <option value="balanced">⚖️ Equilibrado (CRF 18 / Menor tamaño de archivo)</option>
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
              <div className="flex items-center gap-2">
                {previewVideoUrl && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-bold">
                    ✓ Listo
                  </span>
                )}
                {(previewVideoUrl || (!isRenderingPreview && !previewVideoUrl && selectedVideos.length > 0)) && (
                  <button
                    onClick={handleRenderPreview}
                    disabled={isRenderingPreview || isRenderingFull || selectedVideos.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border bg-zinc-800 hover:bg-zinc-700 border-zinc-700 hover:border-purple-500 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    title={lang === 'es' ? 'Regenerar previsualización con la configuración actual' : 'Regenerate preview with current settings'}
                  >
                    🔄 {lang === 'es' ? 'Regenerar' : 'Regenerate'}
                  </button>
                )}
              </div>
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
                      {quality === 'lossless_copy' ? '⚡ 1:1 Stream Copy' : quality === 'master' ? 'CRF 12 Master' : quality === 'balanced' ? 'CRF 18' : 'CRF 15 Pro'}
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
                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <span className="text-emerald-400">✓</span> Muestra lista — 
                    <span className="text-zinc-500 font-mono">{resolution.toUpperCase()} • {quality === 'lossless_copy' ? '1:1 Stream Copy (Sin compresión)' : quality === 'master' ? 'CRF 12' : quality === 'balanced' ? 'CRF 18' : 'CRF 15'}{muteOriginalAudio ? ' • 🔇' : ''}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRenderPreview}
                      disabled={isRenderingPreview || selectedVideos.length === 0}
                      className="flex items-center gap-1 text-zinc-400 hover:text-white font-semibold cursor-pointer transition-colors disabled:opacity-40"
                      title="Regenerar preview con la configuración actual"
                    >
                      🔄 Regenerar
                    </button>
                    <span className="text-zinc-700">|</span>
                    <button
                      onClick={() => window.open(previewVideoUrl, '_blank')}
                      className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline"
                    >
                      Abrir ↗
                    </button>
                  </div>
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
