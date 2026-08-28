'use client';

import { Language, translations } from '@/app/translations';

interface SeoOutput {
  title: string;
  tags: string;
  description: string;
}

interface Props {
  lang: Language;
  seoOutput: SeoOutput;
  isRendering: boolean;
  renderProgress: number;
  onStartRender: () => void;
}

export default function RightInspector({
  lang,
  seoOutput,
  isRendering,
  renderProgress,
  onStartRender,
}: Props) {
  const t = translations[lang];

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto minimal-scrollbar p-4">
      {/* Thumbnail preview */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t.thumbnailTitle}</h4>
        <div className="aspect-video w-full rounded-lg bg-zinc-900 border border-zinc-800 relative overflow-hidden flex items-center justify-center group cursor-pointer shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <div className="h-full w-full bg-gradient-to-tr from-purple-950/40 via-indigo-950/20 to-black flex flex-col justify-end p-3 relative z-20">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Preview</span>
            <span className="text-xs font-bold leading-snug line-clamp-2 text-white">Next.js 15: La Guía Completa de Cero a Pro</span>
          </div>
          <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex z-30 transition-all">
            <span className="text-xs font-semibold px-2.5 py-1 bg-white text-black rounded">{t.regenerateThumbnail}</span>
          </div>
        </div>
      </div>

      <span className="h-[1px] bg-zinc-800" />

      {/* SEO metadata */}
      <div className="space-y-4 flex-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t.metadataTitle}</h4>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">{t.optTitleLabel}</label>
            <div className="bg-[#18181b] border border-zinc-800 rounded p-2 text-xs text-white select-all">
              {seoOutput.title}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">{t.tagsLabel}</label>
            <div className="bg-[#18181b] border border-zinc-800 rounded p-2 text-xs text-zinc-300 font-mono break-all select-all">
              {seoOutput.tags}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">{t.descLabel}</label>
            <div className="bg-[#18181b] border border-zinc-800 rounded p-2 text-xs text-zinc-300 h-44 overflow-y-auto minimal-scrollbar whitespace-pre-line font-sans select-all leading-relaxed">
              {seoOutput.description}
            </div>
          </div>
        </div>
      </div>

      <span className="h-[1px] bg-zinc-800" />

      {/* Local render panel */}
      <div className="space-y-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">{t.localRenderTitle}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">FFmpeg</span>
        </div>

        {isRendering ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">{t.renderingProgress}</span>
              <span className="font-bold text-purple-400">{renderProgress}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={onStartRender}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition-opacity rounded-lg text-xs font-bold text-white shadow-md shadow-purple-500/10"
          >
            {t.startRenderBtn}
          </button>
        )}
        <p className="text-[10px] text-zinc-600 text-center leading-normal">
          {t.renderDisclaimer}
        </p>
      </div>
    </div>
  );
}
