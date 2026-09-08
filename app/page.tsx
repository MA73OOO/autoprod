'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, Language } from "./translations";
import { AutoProdLogo } from "@/components/AutoProdLogo";

export default function Home() {
  const [lang, setLang] = useState<Language>('es');
  const [activeMockupTab, setActiveMockupTab] = useState<'agent' | 'looper' | 'whisper' | 'images' | 'workspace'>('agent');
  const [hoveredPillar, setHoveredPillar] = useState<'creative' | 'production' | 'analytics' | 'automation' | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Load language from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('autoprod_lang') as Language;
    if (savedLang === 'es' || savedLang === 'en') {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'es' ? 'en' : 'es';
    setLang(nextLang);
    localStorage.setItem('autoprod_lang', nextLang);
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 selection:bg-purple-500 selection:text-white relative overflow-hidden font-body">
      {/* ── Ambient Background Glows ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-[800px] -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[180px]" />
        <div className="absolute top-[1800px] -right-40 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[180px]" />
      </div>

      {/* ── Navigation ── */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-20 w-20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AutoProdLogo className="h-12 w-12 drop-shadow-[0_0_14px_rgba(134,41,254,0.5)]" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-logo text-xl font-extrabold tracking-tight text-white leading-none">
                  {t.logo}
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-zinc-400">
            <a href="#pillars" className="hover:text-white transition-colors">{t.features}</a>
            <a href="#studios" className="hover:text-white transition-colors">{t.studios}</a>
            <a href="#comparison" className="hover:text-white transition-colors">{t.comparison}</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">{t.howItWorks}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t.pricing}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t.faq}</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Toggler */}
            <button
              onClick={toggleLanguage}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-colors text-zinc-300 hover:text-white"
              title="Cambiar idioma / Switch language"
            >
              {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>

            <Link
              href="/login"
              className="font-btn text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 transition-colors hidden sm:block"
            >
              {t.login}
            </Link>
            <Link
              href="/login"
              className="font-btn px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all shadow-md shadow-purple-600/30 hover:scale-[1.02]"
            >
              {t.startFree}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">

          {/* Monumental Brand Identity: Grande, Centrado y Protagonista Absoluto */}
          <div className="flex flex-col items-center justify-center mb-8 sm:mb-10">
            <div className="relative group flex items-center justify-center mb-4 sm:mb-5">
              {/* Gran Aura y Resplandor Violeta de Marca */}
              <div className="absolute w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-[#8629FE]/30 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#8629FE]/45 transition-all duration-700" />

              {/* Monograma Oficial AP Enorme sin Fondo */}
              <AutoProdLogo className="h-32 w-32 sm:h-44 sm:w-44 md:h-52 md:w-52 lg:h-60 lg:w-60 drop-shadow-[0_0_45px_rgba(134,41,254,0.85)] group-hover:scale-105 transition-transform duration-500" />
            </div>

            {/* Nombre de Marca Monumental: AutoProdAI en Plus Jakarta Sans 800 */}
            <h1 className="font-logo text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white drop-shadow-2xl">
              AutoProd<span className="text-[#8629FE]">AI</span>
            </h1>
          </div>

          {/* Tagline / Titular Emocional Complementario — Space Grotesk 700 */}
          <h2 className="font-title text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 mb-4 max-w-4xl mx-auto leading-tight">
            {t.heroMainHeadline}{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              {t.heroMainHeadlineHighlight}
            </span>
          </h2>

          {/* Subtitular — Space Grotesk 500 */}
          <p className="font-subtitle text-base sm:text-xl font-medium text-zinc-400 max-w-2xl mx-auto mb-3 tracking-tight">
            {t.heroSubheadline}
          </p>

          {/* Párrafo Descriptivo Ligero y Equilibrado — Inter 400 */}
          <p className="font-body text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            {t.heroSubtitle}
          </p>

          {/* CTAs Principales */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/login"
              className="font-btn px-7 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white hover:opacity-95 transition-all shadow-lg shadow-purple-600/35 hover:scale-[1.02] flex items-center gap-2"
            >
              <span>{t.heroCtaPrimary}</span>
              <span>→</span>
            </Link>
            <a
              href="#pillars"
              className="font-btn px-6 py-3.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 transition-all flex items-center gap-2"
            >
              <span>{t.heroCtaSecondary}</span>
              <span>↓</span>
            </a>
          </div>

          {/* Badges de Confianza */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 mb-14">
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400 font-bold">✓</span>
              <span>{t.heroTrust1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400 font-bold">✓</span>
              <span>{t.heroTrust2}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400 font-bold">✓</span>
              <span>{t.heroTrust3}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400 font-bold">✓</span>
              <span>{t.heroTrust4}</span>
            </div>
          </div>

          {/* ── 4 PILARES DEL SISTEMA: CREA, PRODUCE, ANALIZA, ESCALA ── */}
          <div id="pillars" className="max-w-6xl mx-auto mb-20 text-left scroll-mt-24">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3">
                {t.pillarsBadge}
              </div>
              <h3 className="font-title text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t.pillarsHeadline}
              </h3>
            </div>

            {/* 4 Columnas Interactivas */}
            <div className="flex flex-col lg:flex-row gap-3 min-h-[500px]">

              {/* ── 1. CREATIVO (Cyan / Electric Blue) ── */}
              <div
                onMouseEnter={() => setHoveredPillar('creative')}
                onMouseLeave={() => setHoveredPillar(null)}
                onClick={() => setHoveredPillar(hoveredPillar === 'creative' ? null : 'creative')}
                className={`relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between p-6 cursor-pointer group ${hoveredPillar === 'creative'
                  ? 'lg:flex-[2.2] border-cyan-400/80 bg-gradient-to-b from-cyan-950/50 via-cyan-900/20 to-[#0c0e17] shadow-2xl shadow-cyan-950/80'
                  : hoveredPillar !== null
                    ? 'lg:flex-[0.7] border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-zinc-950/60 to-[#07070a] opacity-60 hover:opacity-100'
                    : 'lg:flex-1 border-cyan-500/30 bg-gradient-to-b from-cyan-950/25 via-zinc-950/40 to-[#08090f] hover:border-cyan-400/60'
                  }`}
              >
                {/* Background Aura Glow */}
                <div className="absolute top-0 left-0 right-0 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

                {/* Background Watermark Vertical Typography */}
                <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="font-title text-8xl font-black text-cyan-300 tracking-tighter uppercase leading-none block">
                    CREATE
                  </span>
                </div>

                {/* Top Section */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      💡
                    </div>
                    <div>
                      <h4 className="font-logo text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                        {t.pillarCreativeTitle}
                      </h4>
                      <p className="font-subtitle text-xs text-cyan-300/80 font-medium">
                        {t.pillarCreativeSlogan}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Section: Alternates between Slogan Callout and Full Functionalities on Hover */}
                <div className="relative z-10 my-auto py-4">
                  {hoveredPillar === 'creative' ? (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="p-3 rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-title">
                          <span>📝</span>
                          <span>{t.pillarCreativeF1Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarCreativeF1Desc}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-title">
                          <span>🎨</span>
                          <span>{t.pillarCreativeF2Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarCreativeF2Desc}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-title">
                          <span>🗃️</span>
                          <span>{t.pillarCreativeF3Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarCreativeF3Desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-1 w-12 bg-cyan-400/40 rounded-full" />
                      <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                        {t.pillarCreativePreview}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400/80">
                        <span>✦</span>
                        <span>{lang === 'es' ? 'Pasa el cursor para ver herramientas' : 'Hover to see tools'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── 2. PRODUCCIÓN (Neon Purple / Violet #8629FE) ── */}
              <div
                onMouseEnter={() => setHoveredPillar('production')}
                onMouseLeave={() => setHoveredPillar(null)}
                onClick={() => setHoveredPillar(hoveredPillar === 'production' ? null : 'production')}
                className={`relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between p-6 cursor-pointer group ${hoveredPillar === 'production'
                  ? 'lg:flex-[2.2] border-purple-400/80 bg-gradient-to-b from-purple-950/50 via-[#8629FE]/15 to-[#0c0e17] shadow-2xl shadow-purple-950/80'
                  : hoveredPillar !== null
                    ? 'lg:flex-[0.7] border-purple-500/20 bg-gradient-to-b from-purple-950/20 via-zinc-950/60 to-[#07070a] opacity-60 hover:opacity-100'
                    : 'lg:flex-1 border-purple-500/30 bg-gradient-to-b from-purple-950/25 via-zinc-950/40 to-[#08090f] hover:border-purple-400/60'
                  }`}
              >
                <div className="absolute top-0 left-0 right-0 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

                <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="font-title text-8xl font-black text-purple-300 tracking-tighter uppercase leading-none block">
                    PRODUCE
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      🎬
                    </div>
                    <div>
                      <h4 className="font-logo text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors">
                        {t.pillarProductionTitle}
                      </h4>
                      <p className="font-subtitle text-xs text-purple-300/80 font-medium">
                        {t.pillarProductionSlogan}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 my-auto py-4">
                  {hoveredPillar === 'production' ? (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="p-3 rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold font-title">
                          <span>🔁</span>
                          <span>{t.pillarProductionF1Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarProductionF1Desc}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold font-title">
                          <span>✂️</span>
                          <span>{t.pillarProductionF2Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarProductionF2Desc}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold font-title">
                          <span>🎙️</span>
                          <span>{t.pillarProductionF3Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarProductionF3Desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-1 w-12 bg-purple-400/40 rounded-full" />
                      <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                        {t.pillarProductionPreview}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-400/80">
                        <span>✦</span>
                        <span>{lang === 'es' ? 'Pasa el cursor para ver herramientas' : 'Hover to see tools'}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* ── 3. ANALYTICS (Amber / Golden Orange) ── */}
              <div
                onMouseEnter={() => setHoveredPillar('analytics')}
                onMouseLeave={() => setHoveredPillar(null)}
                onClick={() => setHoveredPillar(hoveredPillar === 'analytics' ? null : 'analytics')}
                className={`relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between p-6 cursor-pointer group ${hoveredPillar === 'analytics'
                  ? 'lg:flex-[2.2] border-amber-400/80 bg-gradient-to-b from-amber-950/50 via-amber-900/20 to-[#0c0e17] shadow-2xl shadow-amber-950/80'
                  : hoveredPillar !== null
                    ? 'lg:flex-[0.7] border-amber-500/20 bg-gradient-to-b from-amber-950/20 via-zinc-950/60 to-[#07070a] opacity-60 hover:opacity-100'
                    : 'lg:flex-1 border-amber-500/30 bg-gradient-to-b from-amber-950/25 via-zinc-950/40 to-[#08090f] hover:border-amber-400/60'
                  }`}
              >
                <div className="absolute top-0 left-0 right-0 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

                <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="font-title text-8xl font-black text-amber-300 tracking-tighter uppercase leading-none block">
                    ANALYZE
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      📊
                    </div>
                    <div>
                      <h4 className="font-logo text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors">
                        {t.pillarAnalyticsTitle}
                      </h4>
                      <p className="font-subtitle text-xs text-amber-300/80 font-medium">
                        {t.pillarAnalyticsSlogan}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 my-auto py-4">
                  {hoveredPillar === 'analytics' ? (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="p-3 rounded-xl border border-amber-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-title">
                          <span>📺</span>
                          <span>{t.pillarAnalyticsF1Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarAnalyticsF1Desc}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-amber-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-title">
                          <span>🎯</span>
                          <span>{t.pillarAnalyticsF2Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarAnalyticsF2Desc}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-amber-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-title">
                          <span>📈</span>
                          <span>{t.pillarAnalyticsF3Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarAnalyticsF3Desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-1 w-12 bg-amber-400/40 rounded-full" />
                      <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                        {t.pillarAnalyticsPreview}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400/80">
                        <span>✦</span>
                        <span>{lang === 'es' ? 'Pasa el cursor para ver herramientas' : 'Hover to see tools'}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* ── 4. AUTOMATIZACIÓN (Emerald / Mint Green) ── */}
              <div
                onMouseEnter={() => setHoveredPillar('automation')}
                onMouseLeave={() => setHoveredPillar(null)}
                onClick={() => setHoveredPillar(hoveredPillar === 'automation' ? null : 'automation')}
                className={`relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between p-6 cursor-pointer group ${hoveredPillar === 'automation'
                  ? 'lg:flex-[2.2] border-emerald-400/80 bg-gradient-to-b from-emerald-950/50 via-emerald-900/20 to-[#0c0e17] shadow-2xl shadow-emerald-950/80'
                  : hoveredPillar !== null
                    ? 'lg:flex-[0.7] border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 via-zinc-950/60 to-[#07070a] opacity-60 hover:opacity-100'
                    : 'lg:flex-1 border-emerald-500/30 bg-gradient-to-b from-emerald-950/25 via-zinc-950/40 to-[#08090f] hover:border-emerald-400/60'
                  }`}
              >
                <div className="absolute top-0 left-0 right-0 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

                <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="font-title text-8xl font-black text-emerald-300 tracking-tighter uppercase leading-none block">
                    SCALE
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      🤖
                    </div>
                    <div>
                      <h4 className="font-logo text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                        {t.pillarAutomationTitle}
                      </h4>
                      <p className="font-subtitle text-xs text-emerald-300/80 font-medium">
                        {t.pillarAutomationSlogan}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 my-auto py-4">
                  {hoveredPillar === 'automation' ? (
                    <div className="space-y-2.5 animate-fadeIn">
                      {/* Featured Smart Calendar Card */}
                      <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 backdrop-blur-md">
                        <div className="flex items-center justify-between text-emerald-300 text-xs font-bold font-title">
                          <div className="flex items-center gap-2">
                            <span>🗓️</span>
                            <span>{t.pillarAutomationF1Title}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                            PROGRAMADO
                          </span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarAutomationF1Desc}
                        </p>

                        {/* Calendar Mini-Preview Widget */}
                        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                          <div className="p-1.5 rounded-lg bg-black/50 border border-zinc-800">
                            <span className="text-zinc-500 block text-[8px] font-mono">LUN 10 · 18:00</span>
                            <span className="font-bold text-white truncate block">Loop 3h 4K</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50">
                            <span className="text-emerald-400 block text-[8px] font-mono">MIÉ 12 · 14:00</span>
                            <span className="font-bold text-emerald-300 truncate block">Shorts x3</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-black/50 border border-zinc-800">
                            <span className="text-zinc-500 block text-[8px] font-mono">VIE 14 · 20:00</span>
                            <span className="font-bold text-white truncate block">Video 1h</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-emerald-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold font-title">
                          <span>⚡</span>
                          <span>{t.pillarAutomationF2Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarAutomationF2Desc}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-emerald-500/30 bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold font-title">
                          <span>🔄</span>
                          <span>{t.pillarAutomationF3Title}</span>
                        </div>
                        <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                          {t.pillarAutomationF3Desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-1 w-12 bg-emerald-400/40 rounded-full" />
                      <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                        {t.pillarAutomationPreview}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400/80">
                        <span>✦</span>
                        <span>{lang === 'es' ? 'Pasa el cursor para ver herramientas' : 'Hover to see tools'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── INTERACTIVE CREATOR SHOWCASE (MOCKUP VIVO) ── */}
          <div id="interactive-demo" className="max-w-5xl mx-auto text-left relative scroll-mt-24">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-2xl blur-xl opacity-25 group-hover:opacity-100 transition duration-1000" />

            <div className="relative rounded-2xl border border-zinc-800 bg-[#0d0d11] shadow-2xl overflow-hidden">

              {/* Mockup Window Top Bar */}
              <div className="bg-[#121217] border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-zinc-400 ml-3 font-semibold">AutoProd Creator Studio</span>
                </div>

              </div>

              {/* Studio Selector Tabs */}
              <div className="bg-[#0a0a0d] border-b border-zinc-800/80 px-3 py-2 flex gap-1.5 overflow-x-auto minimal-scrollbar">
                <button
                  onClick={() => setActiveMockupTab('agent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeMockupTab === 'agent'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                  {t.mockupTabAgent}
                </button>
                <button
                  onClick={() => setActiveMockupTab('looper')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeMockupTab === 'looper'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                  {t.mockupTabLooper}
                </button>
                <button
                  onClick={() => setActiveMockupTab('whisper')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeMockupTab === 'whisper'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                  {t.mockupTabWhisper}
                </button>
                <button
                  onClick={() => setActiveMockupTab('images')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeMockupTab === 'images'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                  {t.mockupTabImages}
                </button>
                <button
                  onClick={() => setActiveMockupTab('workspace')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeMockupTab === 'workspace'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                  {t.mockupTabWorkspace}
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="p-5 sm:p-7 min-h-[380px] flex flex-col justify-center">

                {/* 1. ASISTENTE CREATIVO */}
                {activeMockupTab === 'agent' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Header del Tab con Jerarquía Clara */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          💡
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                              {t.mockupAgentTitle}
                            </h3>
                          </div>
                          <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                            {t.mockupAgentDesc}
                          </p>
                        </div>
                      </div>
                      <div className="self-start sm:self-auto shrink-0">
                        <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                          Planificación Creativa Activa
                        </span>
                      </div>
                    </div>

                    {/* Chat Flow */}
                    <div className="space-y-3">
                      {/* Creator Input Bubble */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3 shadow-md">
                        <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                          Tú
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block font-btn">
                            Instrucción del Creador:
                          </span>
                          <p className="text-xs sm:text-sm font-medium text-zinc-100 leading-snug">
                            "Quiero preparar un proyecto sobre <span className="text-purple-300 font-semibold">'Paisajes sonoros para lectura y concentración profunda'</span>. Ayúdame a estructurar la progresión narrativa, los recursos visuales y la escaleta de producción."
                          </p>
                        </div>
                      </div>

                      {/* Agent Response Card */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#161320] via-[#111018] to-[#0c0c12] border border-purple-500/30 shadow-xl space-y-3.5">

                        {/* Status bar */}
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-purple-500/20 pb-2.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                            <span>⚡</span>
                            <span className="uppercase tracking-wider font-btn">Estructura Narrativa & Recursos Definidos</span>
                          </div>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium">
                            ✓ Proyecto Estructurado
                          </span>
                        </div>

                        {/* HIGHLIGHTED PREMISE */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-purple-950/30 border-l-4 border-purple-500 border-y border-r border-purple-500/20 space-y-1">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-purple-300 uppercase tracking-wider font-btn">
                            <span>🎯</span>
                            <span>Premisa Narrativa y Apertura:</span>
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-white italic leading-relaxed">
                            "En un entorno saturado de distracciones, encontrar calma y concentración es un ritual valioso. Esta sesión combina lluvia continua, frecuencias binaurales suaves y una atmósfera inmersiva..."
                          </p>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 space-y-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-btn">⏱️ Duración Óptima</span>
                            <p className="text-xs sm:text-sm font-bold text-white">3 Horas Continuas</p>
                            <span className="text-[10px] text-zinc-400 block">Bucles suaves cada 30 min</span>
                          </div>
                          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 space-y-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-btn">🎨 Dirección Visual</span>
                            <p className="text-xs sm:text-sm font-bold text-white">Atmósfera Lofi en Acuarela</p>
                            <span className="text-[10px] text-zinc-400 block">Tono azulado cálido</span>
                          </div>
                          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 space-y-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-btn">📁 Espacio de Trabajo</span>
                            <p className="text-xs sm:text-sm font-bold text-purple-300">Listo para Ensamble</p>
                            <span className="text-[10px] text-zinc-400 block">Recursos en /Videos y /Musica</span>
                          </div>
                        </div>

                        {/* Action Badges */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                            ✓ Escaleta y guion técnico listos
                          </span>
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                            ✓ Recursos asignados a la carpeta del canal
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* 2. VIDEOS LARGOS Y BUCLES */}
                {activeMockupTab === 'looper' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                          🎬
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                              {t.mockupLooperTitle}
                            </h3>
                          </div>
                          <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                            {t.mockupLooperDesc}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shrink-0">
                        Calidad 4K Ultra HD
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 bg-black/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-zinc-300 mb-3">
                          <span className="font-semibold text-white">Video: Lluvia_Tokio_Lofi.mp4</span>
                          <span className="text-purple-400 font-bold">Duración Elegida: 3 Horas</span>
                        </div>
                        {/* Fake Waveform / Timeline */}
                        <div className="h-16 w-full bg-zinc-900/80 rounded-lg flex items-center px-3 gap-1 overflow-hidden border border-zinc-800 relative">
                          <div className="absolute inset-y-0 left-0 w-3/4 bg-purple-500/15 border-r-2 border-purple-400" />
                          {[...Array(48)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full"
                              style={{ height: `${25 + ((i * 19) % 60)}%` }}
                            />
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                          <span>Música: Chillhop_Study_Mix.mp3</span>
                          <span className="text-emerald-400 font-semibold">Fundido Cruzado Suave sin Cortes</span>
                        </div>
                      </div>

                      <div className="bg-[#121217] border border-zinc-800 rounded-xl p-4 space-y-3 text-xs">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-btn">Configuración Rápida</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Resolución:</span>
                            <span className="text-white font-bold">4K (3840x2160)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Duración:</span>
                            <span className="text-purple-300 font-bold">180 Minutos</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Procesamiento:</span>
                            <span className="text-emerald-400 font-bold">Acelerado por GPU</span>
                          </div>
                        </div>
                        <button className="font-btn w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg text-xs shadow-md hover:opacity-95 transition-opacity">
                          🎬 Generar Video Completo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SUBTÍTULOS DINÁMICOS */}
                {activeMockupTab === 'whisper' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                          🎙️
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                              {t.mockupWhisperTitle}
                            </h3>
                          </div>
                          <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                            {t.mockupWhisperDesc}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold shrink-0">
                        Sincronización Palabra por Palabra
                      </span>
                    </div>

                    <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 text-xs space-y-3">
                      <div className="flex items-center gap-3 text-zinc-300 text-xs border-b border-zinc-800/80 pb-2 flex-wrap">
                        <span className="font-semibold text-white">Audio: narracion_youtube.mp3</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">100% Sincronizado</span>
                        <span>•</span>
                        <span className="text-purple-400 font-medium">Pausas Eliminadas Automáticamente</span>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-100 flex items-start gap-3 text-sm">
                          <span className="text-purple-400 font-bold shrink-0 font-mono">[00:01]</span>
                          <span>"La clave para construir un canal sólido no es la prisa ni las fórmulas mágicas..."</span>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-100 flex items-start gap-3 text-sm">
                          <span className="text-purple-400 font-bold shrink-0 font-mono">[00:03]</span>
                          <span>"Es tener un sistema de trabajo que te permita publicar con consistencia y calidad."</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                        <span className="text-xs text-zinc-400">Exportar directo a tu editor:</span>
                        <div className="flex gap-2">
                          <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 text-[11px] font-bold">CapCut (.SRT)</span>
                          <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 text-[11px] font-bold">Premiere (.VTT)</span>
                          <span className="px-2.5 py-1 rounded bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold">Subtítulos Animados</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MINIATURAS Y PORTADAS */}
                {activeMockupTab === 'images' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                          🎯
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                              {t.mockupImagesTitle}
                            </h3>
                          </div>
                          <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                            {t.mockupImagesDesc}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold shrink-0">
                        16:9 Clásica & 9:16 Shorts
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="aspect-video rounded-xl bg-gradient-to-tr from-purple-900/60 via-indigo-950 to-zinc-900 border border-purple-500/40 p-4 flex flex-col justify-between relative overflow-hidden group shadow-lg">
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
                          Identidad Visual Coherente ✨
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-purple-400 font-bold tracking-wider font-btn">CANAL: PAISAJES SONOROS</span>
                          <h4 className="text-base font-black text-white leading-tight font-title">SESIÓN PARA CONCENTRACIÓN PROFUNDA</h4>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span>Optimizado para Pantallas Móviles</span>
                          <span className="text-emerald-400 font-semibold">Alta Definición</span>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs text-zinc-300">
                        <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
                          <span className="text-[11px] font-bold text-purple-400 uppercase font-btn">Consistencia de Marca:</span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-body">
                            Diseña carátulas que reflejan la personalidad de tu canal, manteniendo coherencia tipográfica y cromática tanto en formato horizontal (16:9) como en Shorts (9:16).
                          </p>
                        </div>
                        <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                          <span className="text-zinc-300 font-medium">Exportación:</span>
                          <span className="text-purple-300 text-xs font-bold font-btn">PNG / JPG Listo para YouTube</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GESTIÓN DE CANALES */}
                {activeMockupTab === 'workspace' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                          🗂️
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                              {t.mockupWorkspaceTitle}
                            </h3>
                          </div>
                          <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                            {t.mockupWorkspaceDesc}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-bold text-xs shrink-0">
                        Organización Automática
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl border border-purple-500/40 bg-purple-950/20 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-white text-xs">
                          <span>🎵</span>
                          <span className="font-title">Canal: Lofi Chill</span>
                        </div>
                        <p className="text-xs text-zinc-300 font-body">12 videos producidos • 3 en borrador</p>
                        <span className="inline-block text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded font-btn">
                          Guiones y Portadas Listas
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-white text-xs">
                          <span>💼</span>
                          <span className="font-title">Canal: Finanzas Simples</span>
                        </div>
                        <p className="text-xs text-zinc-300 font-body">8 videos producidos • 1 en render</p>
                        <span className="inline-block text-[10px] text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded font-btn">
                          Subtítulos Sincronizados
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-white text-xs">
                          <span>🚀</span>
                          <span className="font-title">Canal: Historias Cortas</span>
                        </div>
                        <p className="text-xs text-zinc-300 font-body">24 Shorts producidos</p>
                        <span className="inline-block text-[10px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded font-btn">
                          Formato 9:16 Vertical
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── COMPARISON: WORKFLOW FRAGMENTADO VS SISTEMA OPERATIVO AUTOPROD ── */}
      <section id="comparison" className="py-24 border-t border-zinc-900 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4">
              ⚖️ {lang === 'es' ? 'LA COMPARATIVA' : 'THE COMPARISON'}
            </div>
            <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {t.compTitle}
            </h2>
            <p className="font-body text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {t.compSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Columna Tradicional (Caos Fragmentado) */}
            <div className="p-7 sm:p-8 rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-950/15 via-zinc-950/80 to-[#0d090a] space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 border-b border-red-500/20 pb-4 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-lg shrink-0">
                    ✕
                  </div>
                  <div>
                    <h3 className="font-title text-base sm:text-lg font-bold text-red-300">
                      {t.compOldHeader}
                    </h3>
                    <span className="font-body text-[11px] text-zinc-500 font-medium">El ciclo agotador de 10 herramientas</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-zinc-400 font-body">
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 font-bold mt-0.5 text-base">✕</span>
                    <p className="leading-relaxed">{t.compOld1}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 font-bold mt-0.5 text-base">✕</span>
                    <p className="leading-relaxed">{t.compOld2}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 font-bold mt-0.5 text-base">✕</span>
                    <p className="leading-relaxed">{t.compOld3}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 font-bold mt-0.5 text-base">✕</span>
                    <p className="leading-relaxed">{t.compOld4}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-red-500/10 text-[11px] text-red-400/80 font-medium">
                Resultado: Menos tiempo creando, más tiempo como puente técnico manual.
              </div>
            </div>

            {/* Columna AutoProd (Sistema Operativo Unificado) */}
            <div className="p-7 sm:p-8 rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-950/25 via-zinc-950/90 to-[#0e0c18] shadow-2xl shadow-purple-950/30 space-y-6 flex flex-col justify-between relative overflow-hidden ring-1 ring-purple-500/30">
              <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-lg shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-title text-base sm:text-lg font-bold text-purple-200">
                      {t.compNewHeader}
                    </h3>
                    <span className="font-body text-[11px] text-emerald-400 font-medium">Todo tu canal en un solo entorno unificado</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-zinc-200 font-body">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold mt-0.5 text-base">✓</span>
                    <p className="leading-relaxed">{t.compNew1}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold mt-0.5 text-base">✓</span>
                    <p className="leading-relaxed">{t.compNew2}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold mt-0.5 text-base">✓</span>
                    <p className="leading-relaxed">{t.compNew3}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold mt-0.5 text-base">✓</span>
                    <p className="leading-relaxed">{t.compNew4}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/20 text-[11px] text-emerald-400 font-medium">
                Resultado: Automatizas el trabajo mecánico y conservas el control absoluto.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE 4 PRODUCTION STUDIOS (FEATURES) ── */}
      <section id="studios" className="py-24 border-t border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4">
              🛠️ SUITE PARA CREADORES
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              {t.featuresTitle}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Studio 1: Looper */}
            <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 hover:border-purple-500/50 transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🎬
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
                  {t.studioLooperBadge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                {t.studioLooperTitle}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {t.studioLooperDesc}
              </p>
              <div className="pt-4 border-t border-zinc-900 flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Resolución hasta 4K • Transiciones suaves • Sincronización musical</span>
              </div>
            </div>

            {/* Studio 2: Whisper */}
            <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 hover:border-emerald-500/50 transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🎙️
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                  {t.studioWhisperBadge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                {t.studioWhisperTitle}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {t.studioWhisperDesc}
              </p>
              <div className="pt-4 border-t border-zinc-900 flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Exportación a CapCut y Premiere (.srt, .vtt) • Estilo viral dinámico</span>
              </div>
            </div>

            {/* Studio 3: Thumbnails */}
            <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 hover:border-indigo-500/50 transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
                  {t.studioImagesBadge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {t.studioImagesTitle}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {t.studioImagesDesc}
              </p>
              <div className="pt-4 border-t border-zinc-900 flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Formatos 16:9 y 9:16 Shorts • Colores de alto impacto y contraste</span>
              </div>
            </div>

            {/* Studio 4: Asset Library */}
            <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 hover:border-cyan-500/50 transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🗂️
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                  {t.studioAssetsBadge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                {t.studioAssetsTitle}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {t.studioAssetsDesc}
              </p>
              <div className="pt-4 border-t border-zinc-900 flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Pistas de audio, clips y efectos de sonido siempre listos para usar</span>
              </div>
            </div>

          </div>

          {/* Central Assistant Banner */}
          <div className="mt-8 p-8 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-zinc-950 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-purple-600/30">
                💡
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-black text-white">{t.studioAgentTitle}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                    {t.studioAgentBadge}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                  {t.studioAgentDesc}
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-colors shrink-0 shadow-lg"
            >
              {lang === 'es' ? 'Probar Asistente Gratis' : 'Try Assistant Free'}
            </Link>
          </div>

        </div>
      </section>

      {/* ── TU CONTENIDO. TU EQUIPO. TU CONTROL. ── */}
      <section id="local-advantage" className="py-24 border-t border-zinc-900 bg-gradient-to-b from-[#08080c] via-zinc-950/60 to-[#070709] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-950/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4">
              🛡️ {lang === 'es' ? 'SOBERANÍA Y PRIVACIDAD' : 'SOVEREIGNTY & PRIVACY'}
            </div>
            <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {t.localTitle}
            </h2>
            <p className="font-body text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {t.localSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-emerald-500/40 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="font-title text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                {t.localF1Title}
              </h3>
              <p className="font-body text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {t.localF1Desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-purple-500/40 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                💎
              </div>
              <h3 className="font-title text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                {t.localF2Title}
              </h3>
              <p className="font-body text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {t.localF2Desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-cyan-500/40 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🔒
              </div>
              <h3 className="font-title text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                {t.localF3Title}
              </h3>
              <p className="font-body text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {t.localF3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 border-t border-zinc-900 bg-zinc-950/70 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-4">
              ✨ FLUJO SIMPLE
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              {t.howItWorksTitle}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

            {/* Step 1 */}
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 relative">
              <div className="h-12 w-12 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black text-xl mb-6">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t.step1Title}</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {t.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 relative">
              <div className="h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black text-xl mb-6">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t.step2Title}</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {t.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 relative">
              <div className="h-12 w-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xl mb-6">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t.step3Title}</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {t.step3Desc}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" className="py-24 border-t border-zinc-900 bg-zinc-950/70 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4">
              ⚡ {t.pricingBadge}
            </div>
            <h2 className="font-title text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              {t.pricingTitle}
            </h2>
            <p className="font-body text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t.pricingSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Free Trial */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/80 flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-title text-xs font-bold uppercase tracking-wider text-zinc-400">{t.pricingFreeTrialTitle}</span>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-title text-3xl font-extrabold text-white">{t.pricingFreeTrialPrice}</span>
                    <span className="text-xs text-zinc-500">USD</span>
                  </div>
                  <p className="font-body text-[11px] text-zinc-400 mt-1">{t.pricingFreeTrialDesc}</p>
                </div>
                <div className="space-y-2 text-xs text-zinc-400 mb-6 border-t border-zinc-900 pt-4 font-body">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">{lang === 'es' ? 'Incluye:' : 'Includes:'}</p>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingFreeF1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingFreeF2}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingFreeF3}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingFreeF4}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/login"
                className="font-btn w-full py-2.5 rounded-xl text-center text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
              >
                {t.pricingFreeTrialCta}
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-title text-xs font-bold uppercase tracking-wider text-zinc-400">{t.pricingStarterTitle}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    {t.pricingStarterBadge}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-title text-3xl font-extrabold text-white">{t.pricingStarterPrice}</span>
                    <span className="text-xs text-zinc-500">{t.pricingBilledMonthly}</span>
                  </div>
                  <p className="font-body text-[11px] text-zinc-400 mt-1">{t.pricingStarterDesc}</p>
                </div>
                <div className="space-y-2 text-xs text-zinc-400 mb-6 border-t border-zinc-900 pt-4 font-body">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">{lang === 'es' ? 'Incluye:' : 'Includes:'}</p>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingStarterF1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingStarterF2}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingStarterF3}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingStarterF4}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingStarterF5}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/login?plan=starter"
                className="font-btn w-full py-2.5 rounded-xl text-center text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                {t.pricingStarterCta}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-6 rounded-2xl border border-purple-500/50 bg-gradient-to-b from-purple-950/40 via-zinc-900 to-[#14141b] flex flex-col justify-between relative shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-black uppercase text-white tracking-wider shadow-md">
                🔥 {t.pricingProPopular}
              </div>
              <div>
                <div className="flex justify-between items-center mb-3 mt-1">
                  <span className="font-title text-xs font-bold uppercase tracking-wider text-purple-300">{t.pricingProTitle}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {t.pricingProBadge}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-title text-4xl font-black text-white">{t.pricingProPrice}</span>
                    <span className="text-xs text-zinc-400">{t.pricingBilledMonthly}</span>
                  </div>
                  <p className="font-body text-[11px] text-zinc-400 mt-1">{t.pricingProDesc}</p>
                </div>
                <div className="space-y-2 text-xs text-zinc-300 mb-6 border-t border-zinc-800 pt-4 font-body">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">{lang === 'es' ? 'Incluye:' : 'Includes:'}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>{t.pricingProF1}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>{t.pricingProF2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>{t.pricingProF3}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>{t.pricingProF4}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>{t.pricingProF5}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>{t.pricingProF6}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/login?plan=pro"
                className="font-btn w-full py-3 rounded-xl text-center text-xs font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-lg shadow-purple-600/30 transition-opacity"
              >
                {t.pricingProCta}
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-title text-xs font-bold uppercase tracking-wider text-zinc-400">{t.pricingEnterpriseTitle}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {t.pricingEnterpriseBadge}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-title text-3xl font-extrabold text-white">{t.pricingEnterprisePrice}</span>
                    <span className="text-xs text-zinc-500">{t.pricingBilledMonthly}</span>
                  </div>
                  <p className="font-body text-[11px] text-zinc-400 mt-1">{t.pricingEnterpriseDesc}</p>
                </div>
                <div className="space-y-2 text-xs text-zinc-400 mb-6 border-t border-zinc-900 pt-4 font-body">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">{lang === 'es' ? 'Incluye:' : 'Includes:'}</p>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span><strong>{t.pricingEnterpriseF1}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingEnterpriseF2}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingEnterpriseF3}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingEnterpriseF4}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/login?plan=enterprise"
                className="font-btn w-full py-2.5 rounded-xl text-center text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                {t.pricingEnterpriseCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-24 border-t border-zinc-900 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-title text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              {t.faqTitle}
            </h2>
            <p className="font-body text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t.faqSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            {[
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
              { q: t.faq4Q, a: t.faq4A },
            ].map((faqItem, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-title text-sm sm:text-base font-bold text-white">{faqItem.q}</span>
                  <span className="text-zinc-400 text-lg shrink-0 font-mono">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 pt-4 animate-in fade-in duration-200 font-body">
                    {faqItem.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFIESTO DE CIERRE ── */}
      <section className="py-24 border-t border-zinc-900 relative overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#050507]">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-[#8629FE]/20 border border-[#8629FE]/40 flex items-center justify-center text-3xl shadow-xl shadow-[#8629FE]/20">
            ✨
          </div>
          <h2 className="font-title text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t.manifestoTitle}
          </h2>
          <p className="font-subtitle text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            "{t.manifestoDesc}"
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 font-btn px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-xl shadow-purple-600/30 hover:scale-[1.02] transition-all"
            >
              <span>{t.manifestoCta}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-900 py-12 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center">
              <AutoProdLogo className="h-7 w-7" />
            </div>
            <div>
              <span className="font-logo font-extrabold text-zinc-200 text-sm tracking-tight">{t.logo}</span>
              <p className="font-body text-[11px] text-zinc-500">{t.footerDesc}</p>
            </div>
          </div>
          <div className="flex gap-6 text-zinc-400">
            <a href="#studios" className="hover:text-white transition-colors">{t.features}</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">{t.howItWorks}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t.pricing}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t.faq}</a>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-bold">{t.login}</Link>
          </div>
          <div>
            <span>© 2026 AutoProd. {t.allRightsReserved}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
