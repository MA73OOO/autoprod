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

interface FolderOption {
  name: string;
  path: string;
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
  // ── Clips & Timeline ──
  const [selectedVideos, setSelectedVideos] = useState<VideoItem[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Carpeta de Destino ──
  const [availableFolders, setAvailableFolders] = useState<FolderOption[]>([]);
  const [targetFolder, setTargetFolder] = useState<string>('');
  const [outputFilename, setOutputFilename] = useState<string>('loop_final.mp4');

  // ── Control de Audio & Mute ──
  const [muteOriginalAudio, setMuteOriginalAudio] = useState<boolean>(false);

  // ── Duración & Música ──
  const [durationMode, setDurationMode] = useState<'custom' | 'audio_folder'>('custom');
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [audioFolderPath, setAudioFolderPath] = useState<string>('');
  const [scannedSongs, setScannedSongs] = useState<SongItem[]>([]);
  const [totalAudioSeconds, setTotalAudioSeconds] = useState<number>(0);
  const [totalAudioFormatted, setTotalAudioFormatted] = useState<string>('0s');
  const [isScanningAudio, setIsScanningAudio] = useState(false);

  // ── Calidad y Resolución ──
  const [resolution, setResolution] = useState<string>('1080p');
  const [quality, setQuality] = useState<string>('high'); // 'master' | 'high' | 'balanced'

  // ── Estados de Renderizado ──
  const [isRenderingPreview, setIsRenderingPreview] = useState<boolean>(false);
  const [isRenderingFull, setIsRenderingFull] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderMessage, setRenderMessage] = useState<string>('');
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [completedOutputPath, setCompletedOutputPath] = useState<string | null>(null);

  // ── Drag over states ──
  const [isDraggingOverVideo, setIsDraggingOverVideo] = useState(false);
  const [isDraggingOverAudio, setIsDraggingOverAudio] = useState(false);

  // Cargar carpetas de video disponibles del workspace al montar
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const folders = await ControladorClient.getVideoFolders();
        setAvailableFolders(folders);
        if (folders.length > 0 && !targetFolder) {
          setTargetFolder(folders[0].path);
        }
      } catch (err) {
        console.warn('Could not load video folders:', err);
      }
    };
    loadFolders();
  }, []);

  // Calcular duración del ciclo base
  const cycleDuration = selectedVideos.reduce((acc, v) => acc + (v.duration || 10), 0);
  const targetDurationSeconds = durationMode === 'audio_folder' && totalAudioSeconds > 0
    ? totalAudioSeconds
    : customMinutes * 60;

  const loopsCount = cycleDuration > 0 ? Math.ceil(targetDurationSeconds / cycleDuration) : 1;

  // Auto-detectar carpeta destino si se agrega un clip que esté dentro de una carpeta Videos
  const autoDetectTargetFolder = (filePath: string) => {
    const normalized = filePath.replace(/\\/g, '/');
    const idx = normalized.lastIndexOf('/Videos');
    if (idx !== -1) {
      const detected = normalized.substring(0, idx + 7);
      setTargetFolder(detected.replace(/\//g, '\\'));
    }
  };

  // Inspeccionar metadatos de un video
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

  // Subir videos desde PC
  const handleFilesUploaded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processUploadedFiles(Array.from(files));
  };

  const processUploadedFiles = async (files: File[]) => {
    setIsInspecting(true);
    const toastId = toast.loading(lang === 'es' ? `Importando ${files.length} video(s)...` : `Importing ${files.length} video(s)...`);
    try {
      for (const file of files) {
        const isVid = ['.mp4', '.mov', '.mkv', '.webm', '.avi'].some(ext => file.name.toLowerCase().endsWith(ext));
        if (!isVid) {
          toast.error(`${file.name} no es un video compatible.`);
          continue;
        }

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const base64Data = await base64Promise;

        const saved = await ControladorClient.saveBinaryFile({
          base64Data,
          fileName: file.name,
          targetPath: targetFolder || undefined,
          subfolder: 'Videos',
        });

        if (saved && saved.path) {
          autoDetectTargetFolder(saved.path);
          addVideoToSequence({
            name: file.name,
            path: saved.path,
          });
          inspectAndAttachMeta(saved.path);
        }
      }
      toast.success(lang === 'es' ? 'Clips añadidos a la línea de tiempo' : 'Clips added to timeline', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Error importando videos', { id: toastId });
    } finally {
      setIsInspecting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and Drop de videos desde FileTree
  const handleDropVideos = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverVideo(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.type === 'file') {
        const ext = data.path.split('.').pop()?.toLowerCase();
        if (['mp4', 'mov', 'mkv', 'webm', 'avi'].includes(ext || '')) {
          autoDetectTargetFolder(data.path);
          addVideoToSequence({
            name: data.name,
            path: data.path,
          });
          inspectAndAttachMeta(data.path);
          toast.success(lang === 'es' ? `Añadido: ${data.name}` : `Added: ${data.name}`);
        } else {
          toast.error(lang === 'es' ? 'Solo se admiten archivos de video (.mp4, .mov, etc.)' : 'Only video files allowed (.mp4, .mov, etc.)');
        }
      }
    } catch (err) {
      console.error('Error handling video drop:', err);
    }
  };

  // Drag and Drop de carpeta de audio
  const handleDropAudioFolder = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverAudio(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.type === 'directory') {
        setAudioFolderPath(data.path);
        scanAudioFolder(data.path);
      } else {
        toast.error(lang === 'es' ? 'Arrastra una CARPETA de música, no un archivo individual.' : 'Drag a music FOLDER, not a single file.');
      }
    } catch (err) {
      console.error('Error handling audio folder drop:', err);
    }
  };

  const scanAudioFolder = async (path: string) => {
    if (!path.trim()) return;
    setIsScanningAudio(true);
    try {
      const res = await ControladorClient.scanAudioFolder(path);
      setScannedSongs(res.songs || []);
      setTotalAudioSeconds(res.total_duration_seconds || 0);
      setTotalAudioFormatted(res.total_duration_formatted || '0s');
      toast.success(lang === 'es' ? `Escaneadas ${res.total_songs} canciones (${res.total_duration_formatted})` : `Found ${res.total_songs} songs (${res.total_duration_formatted})`);
    } catch (err: any) {
      toast.error(err.message || 'Error escaneando carpeta de canciones');
    } finally {
      setIsScanningAudio(false);
    }
  };

  const addVideoToSequence = (video: VideoItem) => {
    setSelectedVideos(prev => [...prev, video]);
  };

  const moveVideo = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedVideos.length) return;
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
    toast.success(lang === 'es' ? 'Clip duplicado en la secuencia' : 'Clip duplicated');
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const clearTimeline = () => {
    setSelectedVideos([]);
    setPreviewVideoUrl(null);
    setCompletedOutputPath(null);
    toast.info(lang === 'es' ? 'Secuencia vaciada' : 'Timeline cleared');
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
  };

  // ── Previsualización Rápida HD ──
  const handleRenderPreview = async () => {
    if (selectedVideos.length === 0) {
      toast.error(lang === 'es' ? 'Añade al menos un video para generar el loop.' : 'Add at least one video to generate the loop.');
      return;
    }

    setIsRenderingPreview(true);
    setRenderProgress(10);
    setRenderMessage(lang === 'es' ? 'Generando muestra en alta fidelidad...' : 'Rendering high-clarity sample...');
    setPreviewVideoUrl(null);

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
        outputFolderPath: targetFolder || null,
      });

      const jobId = res.job_id;
      setPreviewJobId(jobId);

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
            toast.success(lang === 'es' ? '¡Previsualización lista en la carpeta seleccionada!' : 'Preview ready in target folder!');
            if (onRefreshWorkspace) onRefreshWorkspace();
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

    // Limpiar previsualizador antes del render completo
    setPreviewVideoUrl(null);
    setPreviewJobId(null);

    setIsRenderingFull(true);
    setRenderProgress(5);
    setRenderMessage(lang === 'es' ? 'Limpiando previsualizaciones y codificando video final...' : 'Cleaning preview & rendering full video...');
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
        outputFolderPath: targetFolder || null,
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
                ? `¡Video Loop exportado con éxito a su carpeta! (${statusData.file_size_mb} MB)`
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
    <div className="flex-1 flex flex-col h-full bg-[#0d0d10] text-zinc-200 overflow-y-auto minimal-scrollbar p-5">

      {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 shrink-0">
        <div>
          <button
            onClick={onBack}
            className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors mb-1 cursor-pointer"
          >
            ← {lang === 'es' ? 'Volver al Inicio' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔁</span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Video Looper Studio
            </h1>
            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-800/60 text-purple-300">
              Pro HD
            </span>
          </div>
        </div>

        {/* Selector de Carpeta de Destino */}
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl shadow-sm">
          <span className="text-xs text-zinc-400 flex items-center gap-1 shrink-0 font-medium">
            📁 {lang === 'es' ? 'Guardar en:' : 'Save in:'}
          </span>
          <select
            value={targetFolder}
            onChange={(e) => setTargetFolder(e.target.value)}
            className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs text-purple-200 font-mono focus:outline-none focus:border-purple-500 cursor-pointer max-w-[280px] truncate"
          >
            {availableFolders.map((f) => (
              <option key={f.path} value={f.path} className="bg-zinc-900 text-zinc-200">
                {f.name}
              </option>
            ))}
            {targetFolder && !availableFolders.some(f => f.path === targetFolder) && (
              <option value={targetFolder} className="bg-zinc-900 text-purple-300">
                {targetFolder.split(/[/\\]/).slice(-3).join('/')}
              </option>
            )}
          </select>
        </div>
      </div>

      {/* Progress Banner si está renderizando */}
      {(isRenderingPreview || isRenderingFull) && (
        <div className="my-3 p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 flex flex-col gap-1.5 animate-pulse">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
              ⏳ {renderMessage}
            </span>
            <span className="font-mono text-purple-300 font-bold">{renderProgress}%</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${renderProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── 2-COLUMN MAIN STUDIO ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">

        {/* COLUMNA IZQUIERDA: Configuración Compacta (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* TARJETA 1: Secuencia de Clips + Toggle Mute Compacto */}
          <div className="bg-[#141418] border border-zinc-800/90 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🎞️</span>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === 'es' ? 'Clips del Bucle' : 'Loop Clips'}
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono font-bold">
                  {selectedVideos.length}
                </span>
              </div>

              {/* Botón Mute Compacto de 1 línea */}
              <button
                type="button"
                onClick={() => setMuteOriginalAudio(!muteOriginalAudio)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${muteOriginalAudio
                    ? 'bg-amber-950/60 border-amber-600/60 text-amber-300 hover:bg-amber-950'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                title={muteOriginalAudio ? 'Audio silenciado (clic para activar)' : 'Con audio original (clic para silenciar)'}
              >
                <span>{muteOriginalAudio ? '🔇' : '🔊'}</span>
                <span>{muteOriginalAudio ? (lang === 'es' ? 'Audio Mudo' : 'Audio Muted') : (lang === 'es' ? 'Con Audio' : 'With Audio')}</span>
              </button>
            </div>

            {/* Hidden Input for Native Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesUploaded}
              multiple
              accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
              className="hidden"
            />

            {/* Dropzone Compacta */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOverVideo(true); }}
              onDragLeave={() => setIsDraggingOverVideo(false)}
              onDrop={handleDropVideos}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-lg p-3 text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${isDraggingOverVideo
                  ? 'border-purple-500 bg-purple-950/30 text-purple-200'
                  : 'border-zinc-800 hover:border-purple-500/60 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900/40'
                }`}
            >
              <span className="text-base">📥</span>
              <p className="text-xs font-medium text-zinc-300">
                {lang === 'es' ? 'Arrastra clips aquí o haz clic para subir del PC' : 'Drag clips here or click to browse PC'}
              </p>
            </div>

            {/* Lista de Clips Compacta */}
            {selectedVideos.length > 0 && (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto minimal-scrollbar pr-1">
                {selectedVideos.map((video, idx) => (
                  <div
                    key={`${video.path}-${idx}`}
                    draggable
                    onDragStart={(e) => handleClipDragStart(e, idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleClipDrop(e, idx)}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 hover:border-purple-500/50 text-xs transition-all select-none group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-zinc-200 truncate" title={video.name}>
                        {video.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                        ⏱️ {video.durationFormatted || 'Calculando...'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => moveVideo(idx, 'left')}
                        disabled={idx === 0}
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] disabled:opacity-20 cursor-pointer"
                        title="Subir orden"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveVideo(idx, 'right')}
                        disabled={idx === selectedVideos.length - 1}
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] disabled:opacity-20 cursor-pointer"
                        title="Bajar orden"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateVideo(idx)}
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] cursor-pointer"
                        title="Duplicar clip"
                      >
                        📋
                      </button>
                      <button
                        type="button"
                        onClick={() => removeVideo(idx)}
                        className="w-5 h-5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center text-xs cursor-pointer"
                        title="Eliminar clip"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ciclo Info Bar */}
            {selectedVideos.length > 0 && (
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                <span>1 ciclo = <strong className="text-purple-300">{Math.round(cycleDuration)}s</strong></span>
                <span className="font-mono text-zinc-400">~{loopsCount} repeticiones para la duración final</span>
                <button
                  onClick={clearTimeline}
                  className="text-red-400 hover:text-red-300 text-[10px] font-semibold cursor-pointer underline"
                >
                  Vaciar
                </button>
              </div>
            )}
          </div>

          {/* TARJETA 2: Duración & Música de Fondo */}
          <div className="bg-[#141418] border border-zinc-800/90 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⏱️</span>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === 'es' ? 'Duración & Música' : 'Duration & Audio'}
                </h2>
              </div>

              {/* Tabs Compactos */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 flex text-[11px]">
                <button
                  type="button"
                  onClick={() => setDurationMode('custom')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${durationMode === 'custom' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  ⏱️ Minutos
                </button>
                <button
                  type="button"
                  onClick={() => setDurationMode('audio_folder')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${durationMode === 'audio_folder' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  🎵 Música
                </button>
              </div>
            </div>

            {durationMode === 'custom' ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {[15, 30, 60, 120, 180].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCustomMinutes(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${customMinutes === m
                          ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                      {m >= 60 ? `${m / 60}h` : `${m}m`}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-zinc-400">Minutos:</span>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-zinc-500 font-mono text-[11px]">
                    = {Math.floor(customMinutes / 60)}h {customMinutes % 60}m
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOverAudio(true); }}
                  onDragLeave={() => setIsDraggingOverAudio(false)}
                  onDrop={handleDropAudioFolder}
                  className={`border border-dashed rounded-lg p-2.5 text-center transition-all cursor-pointer ${isDraggingOverAudio
                      ? 'border-purple-500 bg-purple-950/30 text-purple-200'
                      : 'border-zinc-800 hover:border-purple-500/60 bg-zinc-950/40 text-zinc-400'
                    }`}
                >
                  <p className="text-xs font-medium text-zinc-300">
                    {audioFolderPath ? `🎵 ${audioFolderPath.split(/[/\\]/).pop()}` : (lang === 'es' ? 'Arrastra la carpeta Canciones del canal aquí' : 'Drag Songs folder here')}
                  </p>
                  {totalAudioSeconds > 0 && (
                    <p className="text-[11px] text-purple-300 font-mono mt-0.5 font-bold">
                      {scannedSongs.length} canciones • Duración: {totalAudioFormatted}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TARJETA 3: Calidad & Formato de Salida */}
          <div className="bg-[#141418] border border-zinc-800/90 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚙️</span>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === 'es' ? 'Formato & Calidad' : 'Format & Quality'}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">Resolución</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="original">🎯 Original (Nativa)</option>
                  <option value="1080p">📺 1080p Full HD</option>
                  <option value="4k">💎 4K Ultra HD</option>
                  <option value="720p">⚡ 720p Ligero</option>
                  <option value="shorts">📱 9:16 Shorts</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">Fidelidad CRF</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="high">✨ Alta Nitidez (CRF 17)</option>
                  <option value="master">💎 Master Ultra (CRF 14)</option>
                  <option value="balanced">⚖️ Equilibrado (CRF 21)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Nombre del Archivo</label>
              <input
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                placeholder="loop_final.mp4"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Monitor de Renderizado & Acciones Principales (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">

          {/* MONITOR HD */}
          <div className="bg-[#141418] border border-zinc-800/90 rounded-xl p-4 flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">👁️</span>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === 'es' ? 'Monitor de Video (HD)' : 'Loop Monitor (HD)'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {previewVideoUrl && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-bold">
                    ✓ Muestra Lista
                  </span>
                )}
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {resolution.toUpperCase()} • {quality === 'master' ? 'CRF 14' : quality === 'balanced' ? 'CRF 21' : 'CRF 17'}{muteOriginalAudio ? ' • 🔇' : ' • 🔊'}
                </span>
              </div>
            </div>

            {/* Pantalla del Reproductor / Loading */}
            <div className="flex-1 min-h-[340px] flex items-center justify-center bg-black rounded-xl border border-zinc-800/80 overflow-hidden relative">
              {isRenderingPreview || isRenderingFull ? (
                <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
                  <div className="relative w-12 h-12">
                    <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-indigo-400/20 border-b-indigo-400 animate-spin" style={{ animationDirection: 'reverse' }} />
                  </div>
                  <p className="text-xs font-semibold text-purple-200">{renderMessage}</p>
                  <p className="text-[11px] font-mono text-purple-400 font-bold">{renderProgress}%</p>
                </div>
              ) : previewVideoUrl ? (
                <div className="w-full h-full flex flex-col justify-between">
                  <video
                    src={previewVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full max-h-[420px] object-contain bg-black"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 gap-2">
                  <span className="text-3xl">🎬</span>
                  <p className="text-xs font-medium text-zinc-400">
                    {lang === 'es' ? 'No hay muestra generada aún' : 'No preview rendered yet'}
                  </p>
                  <p className="text-[11px] text-zinc-600 max-w-xs">
                    {lang === 'es'
                      ? 'Añade clips a la izquierda y pulsa "Previsualizar Muestra" para validar la fidelidad en segundos.'
                      : 'Add clips on the left and click "Preview" to validate quality in seconds.'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer del Monitor con Regenerar y Abrir */}
            {previewVideoUrl && (
              <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
                <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                  ✓ Previsualizador guardado como <code className="text-zinc-300 font-mono">preview_loop.mp4</code>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRenderPreview}
                    disabled={isRenderingPreview || isRenderingFull}
                    className="text-zinc-300 hover:text-white font-semibold cursor-pointer text-xs flex items-center gap-1"
                  >
                    🔄 Regenerar
                  </button>
                  <span className="text-zinc-700">|</span>
                  <button
                    onClick={() => window.open(previewVideoUrl, '_blank')}
                    className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline text-xs"
                  >
                    Abrir ↗
                  </button>
                </div>
              </div>
            )}

            {/* Aviso de Video Completo Exportado */}
            {completedOutputPath && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-medium">
                  ✅ Video exportado en: <code className="font-mono text-white">{completedOutputPath.split(/[/\\]/).pop()}</code>
                </span>
                <button
                  onClick={() => window.open(`http://127.0.0.1:8000/workspace/raw?path=${encodeURIComponent(completedOutputPath)}`, '_blank')}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded text-[11px] cursor-pointer"
                >
                  Ver Video ↗
                </button>
              </div>
            )}

            {/* ACCIONES PRINCIPALES DE RENDER (Sticky / Prominentes) */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
              <button
                onClick={handleRenderPreview}
                disabled={isRenderingPreview || isRenderingFull || selectedVideos.length === 0}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${isRenderingPreview
                    ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 animate-pulse cursor-wait'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 hover:border-purple-500 text-zinc-200'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                ⚡ {isRenderingPreview ? (lang === 'es' ? 'Previsualizando...' : 'Previewing...') : (lang === 'es' ? 'Previsualizar Muestra (HD)' : 'Fast Preview (HD)')}
              </button>

              <button
                onClick={handleRenderFull}
                disabled={isRenderingPreview || isRenderingFull || selectedVideos.length === 0}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${isRenderingFull
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50 animate-pulse cursor-wait'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                🚀 {isRenderingFull ? (lang === 'es' ? 'Renderizando Loop...' : 'Rendering...') : (lang === 'es' ? 'Generar Video Completo' : 'Render Full Video')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
