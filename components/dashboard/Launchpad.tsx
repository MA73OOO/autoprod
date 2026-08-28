'use client';

import { Language } from '@/app/translations';
import { toast } from 'sonner';

interface Props {
  lang: Language;
  onSelect: (role: 'channel' | 'video' | 'script' | 'prompt') => void;
}

interface Card {
  role: 'channel' | 'video' | 'script' | 'prompt';
  icon: string;
  labelEs: string;
  labelEn: string;
  descEs: string;
  descEn: string;
  color: 'purple' | 'indigo';
  soon?: boolean;
  pro?: boolean;
}

const ACTIVE_CARDS: Card[] = [
  {
    role: 'channel',
    icon: '📺',
    labelEs: 'Crear Canal',
    labelEn: 'Create Channel',
    descEs: 'Configura un nuevo canal de YouTube y prepáralo para integraciones de subida.',
    descEn: 'Set up a new YouTube channel and prepare it for upload integrations.',
    color: 'purple',
  },
  {
    role: 'video',
    icon: '🎬',
    labelEs: 'Crear Video',
    labelEn: 'Create Video',
    descEs: 'Planifica una nueva producción de video, define recursos y renders locales.',
    descEn: 'Plan a new video production, define assets and local renders.',
    color: 'purple',
  },
  {
    role: 'script',
    icon: '📔',
    labelEs: 'Crear Guion',
    labelEn: 'Create Script',
    descEs: 'Redacta el guión o guías estructuradas usando tu co-pilot de IA.',
    descEn: 'Draft script details or structured guides using your AI co-pilot.',
    color: 'purple',
  },
  {
    role: 'prompt',
    icon: '✨',
    labelEs: 'Crear Prompt',
    labelEn: 'Create Prompt',
    descEs: 'Construye y refina prompts maestros para guiar al co-pilot en cualquier flujo.',
    descEn: 'Build and refine master prompts to guide the co-pilot across any production workflow.',
    color: 'indigo',
  },
];

export default function Launchpad({ lang, onSelect }: Props) {
  return (
    <div className="h-full overflow-y-auto minimal-scrollbar p-6 flex flex-col justify-center items-center w-full gap-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          {lang === 'es' ? 'Consola de Creación AutoProd' : 'AutoProd Creation Console'}
        </h2>
        <p className="text-xs text-zinc-400 max-w-md">
          {lang === 'es'
            ? 'Selecciona una base de trabajo rápida para comenzar a planificar tus contenidos.'
            : 'Select a quick launchpad workspace to start planning your contents.'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">

        {/* Active cards */}
        {ACTIVE_CARDS.map(card => (
          <button
            key={card.role}
            onClick={() => onSelect(card.role)}
            className="h-44 text-left bg-[#18181b]/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/40 hover:bg-[#18181b] transition-all group shadow-lg cursor-pointer"
          >
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform ${
              card.color === 'indigo'
                ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400'
                : 'bg-purple-600/10 border border-purple-500/20 text-purple-400'
            }`}>
              {card.icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                {lang === 'es' ? card.labelEs : card.labelEn}
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {lang === 'es' ? card.descEs : card.descEn}
              </p>
            </div>
          </button>
        ))}

        {/* Subtitular Video — PRO */}
        <button
          onClick={() => toast.info(lang === 'es' ? 'Subtitulado automático próximamente...' : 'Auto subtitles coming soon...')}
          className="h-44 text-left bg-[#18181b]/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/30 hover:bg-[#18181b]/60 transition-all group shadow-lg cursor-pointer opacity-75 hover:opacity-100 relative overflow-hidden"
        >
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold rounded-full uppercase tracking-wider">
            PRO
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-600/5 border border-purple-500/10 flex items-center justify-center text-xl text-purple-400/80 group-hover:scale-110 transition-transform">
            🎧
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
              {lang === 'es' ? 'Subtitular Video' : 'Subtitle Video'}
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              {lang === 'es'
                ? 'Genera subtítulos sincronizados con VAD + Whisper y exporta .srt/.vtt listos para YouTube.'
                : 'Generate synced subtitles with VAD + Whisper and export .srt/.vtt ready for YouTube.'}
            </p>
          </div>
        </button>

        {/* Edición Automática — Pronto */}
        <button
          onClick={() => toast.info(lang === 'es' ? 'Edición automática próximamente...' : 'Automatic editing coming soon...')}
          className="h-44 text-left bg-[#18181b]/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/30 hover:bg-[#18181b]/60 transition-all group shadow-lg cursor-pointer opacity-75 hover:opacity-100 relative overflow-hidden"
        >
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold rounded-full uppercase tracking-wider">
            {lang === 'es' ? 'Pronto' : 'Soon'}
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-600/5 border border-purple-500/10 flex items-center justify-center text-xl text-purple-400/80 group-hover:scale-110 transition-transform">
            🐍
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
              {lang === 'es' ? 'Edición Automática' : 'Automatic Editing'}
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              {lang === 'es'
                ? 'Compila y edita tus videos de forma automatizada uniendo música, ambientes y miniaturas locales.'
                : 'Automatically compile and edit your videos by joining audio, ambient tracks, and local miniatures.'}
            </p>
          </div>
        </button>

      </div>
    </div>
  );
}
