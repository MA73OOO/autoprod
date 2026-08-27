'use client';

import { useState, useEffect } from 'react';
import { Language, translations } from '@/app/translations';
import { Channel, Conversation, Message } from './types';

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
  onSend: () => void;
  onChecklistChange: (key: keyof Checklist, val: boolean) => void;
  onAssociateChannel: (channelId: string | null) => void;
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
}: Props) {
  const t = translations[lang];

  const [readyClis, setReadyClis] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/chat/detect_clis').then(res => res.json()).catch(() => ({ detected: [] })),
      fetch('/api/settings/keys').then(res => res.json()).catch(() => ({ configured: [] }))
    ]).then(([localData, cloudData]) => {
      
      // Filtra motores locales (Ollama)
      const localReady = (localData.detected || []).filter((cli: any) => cli.is_authenticated);
      
      // Motores Cloud configurados en Vault
      const cloudReady = (cloudData.configured || []).map((provider: string) => {
        if (provider === 'gemini') return { id: 'gemini', name: 'Google Gemini (Cloud)' };
        if (provider === 'openai' || provider === 'chatgpt') return { id: 'openai', name: 'OpenAI ChatGPT (Cloud)' };
        return { id: provider, name: provider };
      });

      setReadyClis([...cloudReady, ...localReady]);
    });
  }, []);

  return (
    <>
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
              msg.sender === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-purple-400 border border-zinc-700'
            }`}>
              {msg.sender === 'user' ? 'U' : 'G'}
            </div>
            <div className={`rounded-xl p-4 text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-purple-600/10 border border-purple-500/20 text-purple-100'
                : 'bg-[#18181b] border border-zinc-800 text-zinc-300'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              <span className="text-[10px] text-zinc-500 block mt-2 text-right">{msg.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom input panel */}
      <div className="p-4 border-t border-zinc-800 bg-[#0f0f12]">
        {/* Interceptor checklist */}
        <div className="mb-3 flex flex-wrap items-center gap-4 px-2 py-1.5 bg-[#18181b] border border-zinc-800 rounded-lg text-xs">
          <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px] pr-2 border-r border-zinc-800">
            {t.interceptorTitle}
          </span>
          {([
            { key: 'cta', label: t.chkCta },
            { key: 'timestamps', label: t.chkTimestamps },
            { key: 'tags', label: t.chkTags },
            { key: 'saveThumbnail', label: t.chkThumbnail },
          ] as { key: keyof Checklist; label: string }[]).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white">
              <input
                type="checkbox"
                checked={checklist[key]}
                onChange={(e) => onChecklistChange(key, e.target.checked)}
                className="accent-purple-600"
              />
              {label}
            </label>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex gap-2">
          {readyClis.length === 0 ? (
             <div className="flex-1 flex items-center justify-center bg-[#18181b] border border-zinc-800 rounded-lg px-4 py-2 text-xs text-zinc-500">
               {lang === 'es' ? 'Ve a Ajustes ⚙️ para iniciar sesión en tus motores locales' : 'Go to Settings ⚙️ to login to your local engines'}
             </div>
          ) : (
            <>
              <select 
                className="bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 cursor-pointer min-w-[140px]"
                defaultValue={typeof window !== 'undefined' ? localStorage.getItem('autoprod_ai_provider') || readyClis[0].id : readyClis[0].id}
                onChange={(e) => {
                  if (typeof window !== 'undefined') localStorage.setItem('autoprod_ai_provider', e.target.value);
                }}
              >
                {readyClis.map(cli => (
                  <option key={cli.id} value={cli.id}>{cli.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder={t.promptPlaceholder}
                value={inputPrompt}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSend()}
                className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={onSend}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                {t.sendBtn}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
