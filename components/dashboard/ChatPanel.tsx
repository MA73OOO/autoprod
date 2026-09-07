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
}: Props) {
  const t = translations[lang];

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timerStart, setTimerStart] = useState<number | null>(null);

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

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {/* Channel Association Banner - only shown on first message */}
      {activeConversation && activeConversation.messages.length <= 1 && (
        <div className="p-4 bg-zinc-950/40 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              💡 {lang === 'es' ? 'Asociar conversación a un Canal' : 'Associate conversation to a Channel'}
            </p>
            <p className="text-[10px] text-zinc-500">
              {lang === 'es'
                ? 'Vincula este chat a un canal para segmentar y organizar mejor tus optimizaciones.'
                : 'Link this chat to a channel to better segment and organize your optimizations.'}
            </p>
          </div>
          <select
            value={activeConversation.channelId || ''}
            onChange={(e) => onAssociateChannel(e.target.value || null)}
            className="bg-[#18181b] border border-zinc-800 text-[11px] text-zinc-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer min-w-[150px]"
          >
            <option value="">{lang === 'es' ? 'Sin Canal (General)' : 'No Channel (General)'}</option>
            {channels.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.name}</option>
            ))}
          </select>
        </div>
      )}

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
                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                  {msg.isQueued && <span className="text-amber-500 font-bold animate-pulse">⏳ {lang === 'es' ? 'En espera...' : 'Queued...'}</span>}
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
        {/* Agent Triggers / Switches */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSend('¡Inicia tu trabajo Arquitecto!', 'channel_architect')}
            className="text-xs bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 border border-purple-700/50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            🏗️ {lang === 'es' ? 'Arquitecto de Canales' : 'Channel Architect'}
          </button>
          <button
            onClick={() => onSend('¡Redacta un guion Guionista!', 'script_writer')}
            className="text-xs bg-indigo-900/30 hover:bg-indigo-800/50 text-indigo-300 border border-indigo-700/50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            ✍️ {lang === 'es' ? 'Guionista' : 'Script Writer'}
          </button>
          <button
            onClick={() => onSend('¡Edita este contenido Editor!', 'editor')}
            className="text-xs bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 border border-emerald-700/50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            ✂️ Editor
          </button>
        </div>


        {/* Input bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t.promptPlaceholder}
            value={inputPrompt}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => onSend()}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {t.sendBtn}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          {isGenerating && (
            <button
              onClick={onCancel}
              className="bg-red-900/40 hover:bg-red-800/50 text-red-400 border border-red-500/30 font-bold text-sm px-4 rounded-lg transition-colors flex items-center gap-2"
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
