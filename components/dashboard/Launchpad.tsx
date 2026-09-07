'use client';

import { Language } from '@/app/translations';
import { toast } from 'sonner';

interface Props {
  lang: Language;
  onSelect: (role: 'channel' | 'video' | 'script' | 'prompt' | 'import_channel') => void;
  onSelectLooper?: () => void;
  onSelectSubtitles?: () => void;
}

interface Card {
  role: 'channel' | 'video' | 'script' | 'prompt' | 'import_channel';
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
    role: 'import_channel',
    icon: '📥',
    labelEs: 'Extraer Canal',
    labelEn: 'Extract Channel',
    descEs: 'Extrae un canal existente de YouTube con API v3 para analizar etiquetas y evitar duplicar ideas.',
    descEn: 'Extract an existing YouTube channel with API v3 to analyze tags and avoid duplicate ideas.',
    color: 'indigo',
  },
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

export default function Launchpad({ lang, onSelect, onSelectLooper, onSelectSubtitles }: Props) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">

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

        {/* Subtitular Video — Whisper Studio */}
        <button
          onClick={onSelectSubtitles ? onSelectSubtitles : () => toast.info(lang === 'es' ? 'Subtitulado automático' : 'Auto subtitles')}
          className="h-44 text-left bg-[#18181b]/60 border border-emerald-800/40 hover:border-emerald-500/80 rounded-2xl p-5 flex flex-col justify-between hover:bg-[#18181b] transition-all group shadow-lg cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold rounded-full uppercase tracking-wider">
            WHISPER IA
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 group-hover:scale-110 transition-transform">
            🎧
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
              {lang === 'es' ? 'Subtitular Video / Canciones' : 'Subtitle Video & Songs'}
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {lang === 'es'
                ? 'Subtitula videos o carpetas completas de canciones con Whisper API ultrarrápido y control de CPU/GPU.'
                : 'Subtitle videos or songs folders with ultrafast Whisper API and CPU/GPU throttling.'}
            </p>
          </div>
        </button>

        {/* Crear Loop (Video Looper) */}
        <button
          onClick={onSelectLooper}
          className="h-44 text-left bg-[#18181b]/60 border border-purple-800/40 hover:border-purple-500/80 rounded-2xl p-5 flex flex-col justify-between hover:bg-[#18181b] transition-all group shadow-lg cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold rounded-full uppercase tracking-wider">
            {lang === 'es' ? 'NUEVO' : 'NEW'}
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-xl text-purple-400 group-hover:scale-110 transition-transform">
            🔁
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">
              {lang === 'es' ? 'Crear Loop (Video Looper)' : 'Create Loop (Video Looper)'}
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {lang === 'es'
                ? 'Concatena videos en bucle continuo de alta fidelidad con duración personalizada o sincronizada con música.'
                : 'Concatenate videos in continuous high fidelity loop synced with songs or custom time.'}
            </p>
          </div>
        </button>

      </div>
    </div>
  );
}
