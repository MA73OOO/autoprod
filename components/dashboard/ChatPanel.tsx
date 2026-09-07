'use client';

import { useState, useEffect, useRef } from 'react';
import { Language, translations } from '@/app/translations';
import { Channel, Conversation, Message } from './types';
import ChannelCreatorConsole from '@/components/agents/ChannelCreatorConsole';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Checklist {
  cta: boolean;
  timestamps: boolean;
  tags: boolean;
  saveThumbnail: boolean;
}

interface Props {
  lang: Language;
  messages: Message[];
  activeConversation: Conversation | undefined;
  channels: Channel[];
  activeConversationId: string | null;
  inputPrompt: string;
  checklist: Checklist;
  onInputChange: (val: string) => void;
  onSend: (customText?: string, agentSlug?: string) => void;
  onChecklistChange: (key: keyof Checklist, val: boolean) => void;
  onAssociateChannel: (channelId: string | null) => void;
  isGenerating?: boolean;
  onCancel?: () => void;
  workspacePath?: string | null;
  onSuccess?: () => void;
  isDeepThinking?: boolean;
  onToggleDeepThinking?: (val: boolean) => void;
}

export default function ChatPanel({
  lang,
  messages,
  activeConversation,
  channels,
  activeConversationId,
  inputPrompt,
  checklist,
  onInputChange,
  onSend,
  onChecklistChange,
  onAssociateChannel,
  isGenerating,
  onCancel,
  workspacePath,
  onSuccess,
  isDeepThinking = false,
  onToggleDeepThinking,
}: Props) {
  const t = translations[lang];

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timerStart, setTimerStart] = useState<number | null>(null);

  const PROMPT_TEMPLATES: Record<string, string> = {
    import_channel: `[Extracción y Análisis de Canal de YouTube]
• URL o Handle del canal (ej. https://youtube.com/@micanal o @micanal): 
• Cantidad de videos a analizar (por defecto 50): 50
• Objetivo principal (analizar tags ganadoras, métricas y generar inventario anti-duplicados): `,

    channel: `[Configuración de Nuevo Canal de YouTube]
• Nombre del canal: 
• Nicho o temática (ej. Finanzas Personales, Misterio, Gaming, Tutoriales Tech): 
• Público objetivo (edad, país, intereses): 
• Estilo y tono del canal (ej. entretenido, analítico, formal, dinámico): 
• Estructura de carpetas requerida (ej. Guiones, Miniaturas, Videos, Ambiente, prompts): `,

    video: `[Planificación de Nuevo Video]
• Canal de destino: 
• Idea central o título preliminar: 
• Formato (Short vertical / Video Largo horizontal): 
• Duración aproximada deseada: 
• Mensaje o aprendizaje clave para la audiencia: 
• Objetivo principal (viralidad, conseguir suscriptores, retención máxima): `,

    script: `[Redacción de Guion para Video]
• Canal y Tema del video: 
• Gancho inicial deseado (primeros 5-10 segundos): 
• Tono del narrador (ej. dramático, entusiasta, sarcástico, educativo): 
• Puntos clave o estructura deseada: 
• Llamado a la acción (CTA) final: `,

    image: `[Diseño de Miniatura / Arte Visual]
• Canal / Video: 
• Idea visual o concepto central de la miniatura: 
• Emoción principal a transmitir (ej. asombro, curiosidad extrema, advertencia, éxito): 
• Elementos visuales clave (ej. rostro en primer plano, gráfico impactante, flecha): 
• Texto corto en la imagen (máx 3-4 palabras de alto CTR): 
• Paleta de colores o estética visual (ej. alto contraste, oscuro y neón, minimalista): `,

    editor: `[Pauta de Edición y Montaje]
• Canal y Video: 
• Ritmo de corte (rápido para shorts con cortes cada 2s / pausado y cinematográfico): 
• Estilo de subtítulos (ej. dinámicos con colores y emojis / limpios y elegantes): 
• Música de fondo sugerida y diseño de sonido (SFX): 
• Recursos visuales o B-rolls requeridos: `
  };

  const handleInsertTemplate = (key: string) => {
    const template = PROMPT_TEMPLATES[key];
    if (template) {
      onInputChange(template);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
      }, 50);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isUp = scrollTop + clientHeight < scrollHeight - 50;
      setIsScrolledUp(isUp);
      if (!isUp) {
        setHasNewMessage(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
    setIsScrolledUp(false);
    setHasNewMessage(false);
  };

  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom();
    } else {
      setHasNewMessage(true);
    }
  }, [messages]);

  useEffect(() => {
    const isGenerating = messages.some(m => m.isGenerating);
    if (isGenerating && !timerStart) {
      setTimerStart(Date.now());
    } else if (!isGenerating && timerStart) {
      setTimerStart(null);
      setElapsedMs(0);
    }
  }, [messages, timerStart]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerStart) {
      interval = setInterval(() => {
        setElapsedMs(Date.now() - timerStart);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerStart]);

  // Determinar si debemos renderizar una consola de agente especial
  if (activeConversation?.title.includes('Crear Canal')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 h-full">
        <ChannelCreatorConsole
          workspacePath={workspacePath || ''}
          onSuccess={() => {
            if (onSuccess) onSuccess();
          }}
        />
      </div>
    );
  }

  const activeChannelObj = channels.find(c => c.id === activeConversation?.channelId);

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {/* Permanent Active Channel & Niche Governance Bar */}
      <div className="px-4 py-2 bg-zinc-950/80 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md z-20">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              📺 {lang === 'es' ? 'Canal Activo:' : 'Active Channel:'}
            </span>
            <select
              value={activeConversation?.channelId || ''}
              onChange={(e) => onAssociateChannel(e.target.value || null)}
              className="bg-[#18181b] border border-zinc-700/80 text-xs font-medium text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 cursor-pointer min-w-[190px] shadow-sm transition-all"
            >
              <option value="">{lang === 'es' ? '🌐 Sin canal específico (General)' : '🌐 No Channel (General)'}</option>
              {channels.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} {ch.niche ? `(${ch.niche})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Active Channel Details Pill */}
          {activeChannelObj ? (
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 font-medium">
                🎯 {lang === 'es' ? 'Nicho:' : 'Niche:'} {activeChannelObj.niche || activeChannelObj.name}
              </span>
              {activeChannelObj.localPath && (
                <span 
                  className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono max-w-[280px] truncate"
                  title={activeChannelObj.localPath}
                >
                  📁 {activeChannelObj.localPath}
                </span>
              )}
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                🛡️ {lang === 'es' ? 'Guardrail Activo: IA restringida a este nicho' : 'Active Guardrail: AI restricted to this niche'}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-500 italic hidden sm:inline">
              {lang === 'es'
                ? '💡 Selecciona un canal para enfocar las ideas y contenidos exclusivamente a su nicho'
                : '💡 Select a channel to lock AI ideation and content strictly to its niche'}
            </span>
          )}
        </div>
      </div>

      {/* Messages log */}
      <div
        className="flex-1 overflow-y-auto minimal-scrollbar p-6 space-y-4"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${msg.sender === 'user'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 text-purple-400 border border-zinc-700'
              }`}>
              {msg.sender === 'user' ? 'U' : 'G'}
            </div>
            <div className={`rounded-xl p-4 text-sm leading-relaxed ${msg.sender === 'user'
              ? 'bg-purple-600/10 border border-purple-500/20 text-purple-100'
              : 'bg-[#18181b] border border-zinc-800 text-zinc-300'
              }`}>
              {msg.text.includes('🛑 Proceso cancelado por el usuario.') ? (
                <>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text.replace('🛑 Proceso cancelado por el usuario.', '').trim()}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-400 bg-red-950/30 border border-red-900/50 rounded-md px-3 py-2 w-fit">
                    <span className="text-base">🛑</span> {lang === 'es' ? 'Proceso cancelado por el usuario.' : 'Process canceled by user.'}
                  </div>
                </>
              ) : (
                <div className="prose prose-invert max-w-none text-sm leading-relaxed break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
              <div className="flex justify-between items-center mt-2 gap-4">
                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 flex-wrap">
                  {msg.isQueued && <span className="text-amber-500 font-bold animate-pulse">⏳ {lang === 'es' ? 'En espera...' : 'Queued...'}</span>}
                  {msg.isDeepThinking && (
                    <span className="text-purple-300 bg-purple-950/70 border border-purple-800/50 rounded px-1.5 py-0.5 font-sans font-semibold flex items-center gap-1">
                      🧠 {lang === 'es' ? 'Pensamiento Profundo' : 'Deep Thinking'}
                    </span>
                  )}
                  {msg.modelName && <span>🤖 {msg.modelName}</span>}
                  {msg.isGenerating && <span className="text-emerald-400 font-bold">⏳ {(elapsedMs / 1000).toFixed(1)}s</span>}
                  {!msg.isGenerating && msg.generationTimeMs && <span>⏱️ {(msg.generationTimeMs / 1000).toFixed(2)}s</span>}
                </span>
                <span className="text-[10px] text-zinc-500 text-right shrink-0">{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll to bottom button */}
      {hasNewMessage && isScrolledUp && (
        <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={scrollToBottom}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce border border-purple-400/30"
          >
            ↓ {lang === 'es' ? 'Nuevo mensaje' : 'New message'}
          </button>
        </div>
      )}

      {/* Bottom input panel */}
      <div className="p-4 border-t border-zinc-800 bg-[#0f0f12] flex flex-col gap-3">
        {/* Templates and Deep Thinking Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-zinc-500 mr-1 flex items-center gap-1 select-none">
              📝 {lang === 'es' ? 'Plantillas:' : 'Templates:'}
            </span>
            <button
              type="button"
              onClick={() => handleInsertTemplate('import_channel')}
              className="text-xs bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 hover:border-emerald-600/60 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title={lang === 'es' ? 'Cargar plantilla para extraer un canal de YouTube' : 'Load template to extract a YouTube channel'}
            >
              📥 {lang === 'es' ? 'Extraer Canal' : 'Extract Channel'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('channel')}
              className="text-xs bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 hover:border-purple-600/60 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title={lang === 'es' ? 'Cargar preguntas para crear un canal' : 'Load questions to create a channel'}
            >
              🏗️ {lang === 'es' ? 'Crear Canal' : 'Create Channel'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('video')}
              className="text-xs bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 hover:border-blue-600/60 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title={lang === 'es' ? 'Cargar preguntas para planificar un video' : 'Load questions to plan a video'}
            >
              🎬 {lang === 'es' ? 'Crear Video' : 'Create Video'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('script')}
              className="text-xs bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 hover:border-indigo-600/60 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title={lang === 'es' ? 'Cargar preguntas para redactar guion' : 'Load questions to write script'}
            >
              ✍️ {lang === 'es' ? 'Guionista' : 'Script'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('image')}
              className="text-xs bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 hover:border-amber-600/60 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title={lang === 'es' ? 'Cargar preguntas para diseñar miniatura o imagen' : 'Load questions to design thumbnail'}
            >
              🎨 {lang === 'es' ? 'Miniatura / Arte' : 'Thumbnail'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('editor')}
              className="text-xs bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 hover:border-emerald-600/60 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title={lang === 'es' ? 'Cargar pauta de edición' : 'Load editing checklist'}
            >
              ✂️ {lang === 'es' ? 'Editor' : 'Editor'}
            </button>
          </div>

          {/* Deep Thinking Toggle */}
          <div className="flex items-center">
            <label 
              className={`cursor-pointer text-xs flex items-center gap-2 px-3 py-1 rounded-md border transition-all select-none ${
                isDeepThinking
                  ? 'bg-purple-900/40 border-purple-500/70 text-purple-200 shadow-sm shadow-purple-500/20 font-medium'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700'
              }`}
              title={lang === 'es' ? 'Activa razonamiento profundo paso a paso para tareas complejas' : 'Enable deep step-by-step reasoning for complex tasks'}
            >
              <input
                type="checkbox"
                checked={!!isDeepThinking}
                onChange={(e) => onToggleDeepThinking && onToggleDeepThinking(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer h-3.5 w-3.5"
              />
              <span className="flex items-center gap-1.5">
                🧠 {lang === 'es' ? 'Pensamiento Profundo' : 'Deep Thinking'}
              </span>
              {isDeepThinking && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              )}
            </label>
          </div>
        </div>

        {/* Input bar */}
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            rows={Math.min(6, Math.max(2, inputPrompt.split('\n').length))}
            placeholder={lang === 'es' ? 'Escribe tu mensaje o selecciona una plantilla de arriba... (Shift+Enter para salto de línea, Enter para enviar)' : 'Type a message or select a template above... (Shift+Enter for newline, Enter to send)'}
            value={inputPrompt}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none font-sans leading-relaxed minimal-scrollbar max-h-48"
          />
          <button
            onClick={() => onSend()}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 shrink-0 h-[42px]"
          >
            {t.sendBtn}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          {isGenerating && (
            <button
              onClick={onCancel}
              className="bg-red-900/40 hover:bg-red-800/50 text-red-400 border border-red-500/30 font-bold text-sm px-4 rounded-lg transition-colors flex items-center gap-2 shrink-0 h-[42px]"
              title={lang === 'es' ? 'Cancelar generación' : 'Cancel generation'}
            >
              🛑
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
