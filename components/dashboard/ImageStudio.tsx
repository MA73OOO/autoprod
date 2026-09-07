'use client';

import React, { useState } from 'react';
import { Language } from '@/app/translations';
import { toast } from 'sonner';

interface ChannelOption {
  id: string;
  name: string;
}

interface Props {
  lang: Language;
  channels: ChannelOption[];
  workspacePath: string | null;
  onBackToDashboard?: () => void;
  onOpenAssets?: () => void;
}

const STYLE_PRESETS = [
  { id: 'anime_lofi', label: 'Anime Lofi Studio Ghibli', prompt: 'in the warm, nostalgic hand-drawn anime style of Studio Ghibli and Makoto Shinkai, soft pastel lighting, whimsical and aesthetic, highly detailed background' },
  { id: '3d_pixar', label: '3D Render Pixar / Disney', prompt: 'in modern 3D digital animation style of Pixar and Dreamworks, subsurface scattering, expressive character lighting, vibrant colors, raytraced cinematic depth of field' },
  { id: 'cinematic_photo', label: 'Cinematográfico Hiperrealista', prompt: 'cinematic hyperrealistic photograph, 35mm lens, shallow depth of field, natural dramatic golden hour rim lighting, 8k resolution, photorealistic' },
  { id: 'cyberpunk_neon', label: 'Cyberpunk Neón Retro', prompt: 'futuristic cyberpunk synthwave aesthetic, vibrant neon magenta and cyan lighting, wet reflective streets, volumetric fog, moody dark atmosphere' },
  { id: 'fantasy_epic', label: 'Fantasía Épica & Mágica', prompt: 'epic fantasy digital concept art, glowing magical particles, dramatic wide composition, mythical atmosphere, highly intricate details' },
  { id: 'minimal_vector', label: 'Ilustración Vectorial Moderna', prompt: 'clean minimalist vector illustration, bold geometric shapes, flat vibrant color palette, modern graphic design aesthetic' },
];

export default function ImageStudio({
  lang,
  channels,
  workspacePath,
  onBackToDashboard,
  onOpenAssets,
}: Props) {
  const [mode, setMode] = useState<'reference' | 'guided'>('reference');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [customFileName, setCustomFileName] = useState('');

  // Reference Mode States
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null);
  const [analyzingRef, setAnalyzingRef] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    style?: string;
    lighting?: string;
    palette?: string;
    composition?: string;
    summary?: string;
    suggestedQuestions?: string[];
    draftPrompt?: string;
  } | null>(null);
  const [userRefAnswers, setUserRefAnswers] = useState<Record<number, string>>({});

  // Guided Mode States
  const [selectedPreset, setSelectedPreset] = useState(STYLE_PRESETS[0].id);
  const [subjectInput, setSubjectInput] = useState('');
  const [emotionInput, setEmotionInput] = useState('Épico y misterioso');
  const [paletteInput, setPaletteInput] = useState('Morado y cian con alto contraste');

  // Final Generation States
  const [finalPrompt, setFinalPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<any | null>(null);

  // Drag & drop or paste handler for reference image
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(lang === 'es' ? 'Por favor sube un archivo de imagen válido (.png, .jpg, .webp)' : 'Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRefImageBase64(reader.result as string);
      setAnalysisResult(null);
      toast.success(lang === 'es' ? 'Imagen de referencia cargada' : 'Reference image loaded');
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageUpload(file);
          break;
        }
      }
    }
  };

  // Analyze reference image with AI
  const handleAnalyzeReference = async () => {
    if (!refImageBase64) return;
    setAnalyzingRef(true);
    const toastId = toast.loading(lang === 'es' ? 'Analizando estilo visual con IA (GPT-4o Vision)...' : 'Analyzing visual style with AI...');
    try {
      const res = await fetch('/api/images/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: refImageBase64,
          userIntent: subjectInput || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al analizar la imagen');

      setAnalysisResult(data.analysis);
      if (data.analysis?.draftPrompt) {
        setFinalPrompt(data.analysis.draftPrompt);
      }
      toast.success(lang === 'es' ? '¡Estilo desglosado con éxito!' : 'Style analyzed successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setAnalyzingRef(false);
    }
  };

  // Build prompt in Guided Mode
  const handleBuildGuidedPrompt = () => {
    const preset = STYLE_PRESETS.find(p => p.id === selectedPreset);
    const presetText = preset ? preset.prompt : '';
    const subject = subjectInput.trim() || 'A lone traveler with a lantern overlooking an ancient glowing city';
    const emotion = emotionInput.trim() ? `, conveying a feeling of ${emotionInput.trim()}` : '';
    const palette = paletteInput.trim() ? `, color scheme featuring ${paletteInput.trim()}` : '';
    const aspectDesc = aspectRatio === '16:9' ? ', wide cinematic composition for YouTube thumbnail' : aspectRatio === '9:16' ? ', vertical composition for YouTube Shorts' : ', balanced square composition';

    const constructed = `${subject}${emotion}${palette}, ${presetText}${aspectDesc}, masterpiece, trending on artstation, 8k resolution.`;
    setFinalPrompt(constructed);
    toast.success(lang === 'es' ? 'Prompt maestro generado' : 'Master prompt built');
  };

  // Update prompt when answering reference questions
  const handleUpdatePromptFromAnswers = () => {
    if (!analysisResult) return;
    let base = analysisResult.draftPrompt || '';
    const answers = Object.values(userRefAnswers).filter(a => a && a.trim());
    if (answers.length > 0) {
      base += ` Additional user specifications: ${answers.join('. ')}.`;
    }
    setFinalPrompt(base);
    toast.success(lang === 'es' ? 'Prompt adaptado con tus respuestas' : 'Prompt adapted with your answers');
  };

  // Generate Image with DALL-E 3
  const handleGenerate = async () => {
    const promptToUse = finalPrompt.trim() || subjectInput.trim();
    if (!promptToUse) {
      toast.error(lang === 'es' ? 'Por favor escribe o genera un prompt primero' : 'Please provide or generate a prompt first');
      return;
    }

    setGenerating(true);
    setGeneratedAsset(null);
    const toastId = toast.loading(lang === 'es' ? 'Generando imagen HD con DALL-E 3 y guardando en disco...' : 'Generating HD image with DALL-E 3 and saving locally...');

    try {
      const selectedChannel = channels.find(c => c.id === selectedChannelId);
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          aspectRatio,
          channelId: selectedChannelId || undefined,
          channelName: selectedChannel?.name || undefined,
          customFileName: customFileName.trim() || undefined,
          type: aspectRatio === '16:9' ? 'THUMBNAIL' : 'IMAGE',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar la imagen');

      setGeneratedAsset(data.asset);
      toast.success(lang === 'es' ? '¡Imagen generada y guardada exitosamente!' : 'Image generated and saved successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLocalPath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast.success(lang === 'es' ? 'Ruta local copiada al portapapeles' : 'Local path copied to clipboard');
  };

  return (
    <div className="h-full flex flex-col bg-[#121214] text-zinc-200 overflow-hidden" onPaste={handlePaste}>
      
      {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
      <div className="p-5 border-b border-zinc-800 bg-[#16161a]/90 backdrop-blur shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              ←
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <h1 className="text-lg font-bold text-white tracking-wide">
                {lang === 'es' ? 'Estudio de Creación de Imágenes con IA' : 'AI Image & Thumbnail Studio'}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                DALL-E 3 + Multimodal Co-pilot
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {lang === 'es'
                ? 'Analiza imágenes de referencia con pensamiento profundo o construye prompts guiados para miniaturas y videos.'
                : 'Analyze reference images with deep vision or build guided prompts for YouTube thumbnails and video frames.'}
            </p>
          </div>
        </div>

        {/* View Assets Shortcut */}
        {onOpenAssets && (
          <button
            onClick={onOpenAssets}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>🗃️</span>
            <span>{lang === 'es' ? 'Ver Biblioteca de Recursos' : 'View Asset Library'}</span>
          </button>
        )}
      </div>

      {/* ── MODE SELECTOR & CONFIG BAR ──────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-zinc-800 bg-[#141418] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('reference')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'reference'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <span>🖼️</span>
            <span>{lang === 'es' ? 'Con Imagen de Referencia' : 'With Reference Image'}</span>
          </button>
          <button
            onClick={() => setMode('guided')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'guided'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <span>🪄</span>
            <span>{lang === 'es' ? 'Cuestionario Guiado (Sin Imagen)' : 'Guided Questionnaire'}</span>
          </button>
        </div>

        {/* Channels & Aspect Ratio */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5">
            <span>📺</span>
            <select
              value={selectedChannelId}
              onChange={e => setSelectedChannelId(e.target.value)}
              className="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer"
            >
              {channels.map(ch => (
                <option key={ch.id} value={ch.id} className="bg-zinc-900">
                  {ch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
            {[
              { id: '16:9', label: '16:9 Miniatura' },
              { id: '9:16', label: '9:16 Shorts' },
              { id: '1:1', label: '1:1 Cuadrado' },
            ].map(aspect => (
              <button
                key={aspect.id}
                onClick={() => setAspectRatio(aspect.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  aspectRatio === aspect.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {aspect.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── WORKSPACE BODY ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto minimal-scrollbar p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT COLUMN: Input & Assistant Flow */}
          <div className="space-y-6">

            {mode === 'reference' ? (
              /* ── FLOW 1: REFERENCE IMAGE ANALYSIS ───────────────────────────── */
              <div className="bg-[#18181b]/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🔍</span> {lang === 'es' ? 'Imagen de Referencia' : 'Reference Image'}
                  </h3>
                  <span className="text-[10px] text-zinc-400">Pega con Ctrl+V o arrastra</span>
                </div>

                {/* Dropzone */}
                {!refImageBase64 ? (
                  <label className="border-2 border-dashed border-zinc-700 hover:border-purple-500/60 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/80 transition-all text-center">
                    <span className="text-3xl">📷</span>
                    <span className="text-xs font-semibold text-zinc-300">
                      {lang === 'es' ? 'Haz clic para seleccionar o presiona Ctrl+V' : 'Click to select or press Ctrl+V'}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Soporta JPG, PNG, WEBP de alta resolución
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center max-h-56">
                      <img src={refImageBase64} alt="Referencia" className="max-h-56 object-contain" />
                      <button
                        onClick={() => {
                          setRefImageBase64(null);
                          setAnalysisResult(null);
                        }}
                        className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 hover:bg-red-900 text-white text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        ✕ Quitar
                      </button>
                    </div>

                    <button
                      onClick={handleAnalyzeReference}
                      disabled={analyzingRef}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{analyzingRef ? '⏳' : '🤖'}</span>
                      <span>
                        {analyzingRef
                          ? (lang === 'es' ? 'Analizando con Visión Artificial...' : 'Analyzing with Vision AI...')
                          : (lang === 'es' ? 'Analizar Estilo con GPT-4o Vision' : 'Analyze Style with GPT-4o Vision')}
                      </span>
                    </button>
                  </div>
                )}

                {/* Analysis Breakdown */}
                {analysisResult && (
                  <div className="space-y-4 pt-3 border-t border-zinc-800 animate-in fade-in">
                    <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-3.5 space-y-2 text-xs">
                      <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                        <span>✨</span> {lang === 'es' ? 'Diagnóstico Estilístico IA' : 'AI Style Diagnostics'}
                      </h4>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">{analysisResult.summary}</p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] mt-2 pt-2 border-t border-purple-800/30 font-mono">
                        <div>
                          <span className="text-purple-400 block font-bold">ESTILO:</span>
                          <span className="text-zinc-300">{analysisResult.style}</span>
                        </div>
                        <div>
                          <span className="text-purple-400 block font-bold">ILUMINACIÓN:</span>
                          <span className="text-zinc-300">{analysisResult.lighting}</span>
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Questions for the client */}
                    {analysisResult.suggestedQuestions && analysisResult.suggestedQuestions.length > 0 && (
                      <div className="space-y-2 bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 text-xs">
                        <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <span>🎯</span> {lang === 'es' ? 'Preguntas Guiadas de Adaptación' : 'Guided Alignment Questions'}
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          {lang === 'es'
                            ? 'Responde para que el orquestador adapte esta referencia exactamente a tu canal:'
                            : 'Answer to align this style with your exact channel idea:'}
                        </p>
                        {analysisResult.suggestedQuestions.map((q, idx) => (
                          <div key={idx} className="space-y-1">
                            <label className="text-[11px] font-semibold text-zinc-300 block">
                              {idx + 1}. {q}
                            </label>
                            <input
                              type="text"
                              value={userRefAnswers[idx] || ''}
                              onChange={e => setUserRefAnswers({ ...userRefAnswers, [idx]: e.target.value })}
                              placeholder={lang === 'es' ? 'Escribe tu respuesta aquí...' : 'Type your answer here...'}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        ))}
                        <button
                          onClick={handleUpdatePromptFromAnswers}
                          className="mt-2 w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          🪄 Aplicar Respuestas al Prompt Maestro
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ── FLOW 2: GUIDED QUESTIONNAIRE (WITHOUT REFERENCE) ─────────── */
              <div className="bg-[#18181b]/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🪄</span> {lang === 'es' ? 'Asistente de Preguntas Guiadas' : 'Guided Questionnaire Assistant'}
                </h3>

                {/* Step 1: Estilo Preset */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    1. ¿Qué estilo visual buscas?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLE_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          selectedPreset === preset.id
                            ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Sujeto central */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    2. ¿Cuál es el sujeto, personaje o escena central?
                  </label>
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={e => setSubjectInput(e.target.value)}
                    placeholder="Ej. Un programador con laptop flotando en el espacio exterior frente a un agujero negro"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Step 3: Emoción & Atmósfera */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    3. ¿Qué emoción principal debe transmitir la miniatura?
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['Épico y revelador', 'Misterioso y oscuro', 'Relajante y nostálgico', 'Alegre y enérgico', 'Futurista'].map(emo => (
                      <button
                        key={emo}
                        onClick={() => setEmotionInput(emo)}
                        className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                          emotionInput === emo ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Paleta Cromática */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    4. Paleta de Colores
                  </label>
                  <input
                    type="text"
                    value={paletteInput}
                    onChange={e => setPaletteInput(e.target.value)}
                    placeholder="Ej. Azul medianoche, neón cian y toques de amarillo dorado"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={handleBuildGuidedPrompt}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🪄</span>
                  <span>{lang === 'es' ? 'Construir Prompt Maestro Optimizado' : 'Build Master Prompt'}</span>
                </button>
              </div>
            )}

            {/* Prompt Editor & Generator Form */}
            <div className="bg-[#18181b]/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>⚡</span> {lang === 'es' ? 'Prompt Maestro para DALL-E 3' : 'Master Prompt for DALL-E 3'}
              </h3>

              <textarea
                rows={4}
                value={finalPrompt}
                onChange={e => setFinalPrompt(e.target.value)}
                placeholder={lang === 'es' ? 'Aquí se formulará el prompt maestro optimizado...' : 'Optimized master prompt will appear here...'}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
              />

              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-400 font-medium block">
                  Nombre de archivo personalizado (opcional)
                </label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={e => setCustomFileName(e.target.value)}
                  placeholder="ej. miniatura_episodio_01"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || (!finalPrompt.trim() && !subjectInput.trim())}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{generating ? '⏳' : '🚀'}</span>
                <span>
                  {generating
                    ? (lang === 'es' ? 'Generando con DALL-E 3 y Guardando Dual...' : 'Generating & Dual Saving...')
                    : (lang === 'es' ? 'Generar Imagen HD y Guardar' : 'Generate HD Image & Save')}
                </span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Real-time Output & Dual Storage Showcase */}
          <div className="space-y-6">

            <div className="bg-[#18181b]/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl min-h-[480px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🖼️</span> {lang === 'es' ? 'Resultado Generado' : 'Generated Result'}
                  </h3>
                  {generatedAsset && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      💾 Guardado Dual Listo
                    </span>
                  )}
                </div>

                {/* Display Box */}
                {!generatedAsset ? (
                  <div className="h-80 bg-zinc-950/60 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 text-center p-6">
                    <span className="text-4xl mb-2">🎨</span>
                    <p className="text-xs font-semibold text-zinc-400">
                      {generating
                        ? (lang === 'es' ? 'Renderizando imagen de alta fidelidad...' : 'Rendering high fidelity image...')
                        : (lang === 'es' ? 'La imagen generada aparecerá aquí' : 'Generated image will appear here')}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-1 max-w-xs">
                      Se guardará automáticamente en tu disco local y en tu biblioteca de la nube.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden border border-purple-500/30 bg-black shadow-2xl flex items-center justify-center max-h-96">
                      <img
                        src={generatedAsset.storageUrl || `http://127.0.0.1:8000/workspace/file?path=${encodeURIComponent(generatedAsset.localPath || '')}`}
                        alt={generatedAsset.name}
                        className="w-full max-h-96 object-contain"
                      />
                    </div>

                    {/* Dual Storage Paths Details */}
                    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-purple-300 font-bold border-b border-zinc-800 pb-1.5">
                        <span>{generatedAsset.name}</span>
                        <span>{aspectRatio} • {generatedAsset.format.toUpperCase()}</span>
                      </div>

                      {generatedAsset.localPath && (
                        <div className="space-y-1">
                          <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                            <span>💻</span> RUTA FÍSICA LOCAL (CapCut / Premiere):
                          </span>
                          <div className="flex items-center justify-between gap-2 bg-black/50 p-2 rounded border border-zinc-800 text-[10px] text-zinc-300">
                            <span className="truncate">{generatedAsset.localPath}</span>
                            <button
                              onClick={() => handleCopyLocalPath(generatedAsset.localPath)}
                              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white shrink-0 cursor-pointer font-sans"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      )}

                      {generatedAsset.storageUrl && (
                        <div className="space-y-1">
                          <span className="text-purple-400 font-bold text-[10px] flex items-center gap-1">
                            <span>☁️</span> ENLACE EN LA NUBE (Supabase Storage):
                          </span>
                          <div className="flex items-center justify-between gap-2 bg-black/50 p-2 rounded border border-zinc-800 text-[10px] text-zinc-300">
                            <span className="truncate">{generatedAsset.storageUrl}</span>
                            <a
                              href={generatedAsset.storageUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={generatedAsset.name}
                              className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white shrink-0 cursor-pointer font-sans"
                            >
                              Descargar
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {generatedAsset && onOpenAssets && (
                <button
                  onClick={onOpenAssets}
                  className="w-full py-2.5 mt-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🗃️</span>
                  <span>{lang === 'es' ? 'Ver en la Biblioteca de Recursos (CRUD)' : 'View in Resource Library'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
