'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, Language } from "./translations";
import { AutoProdLogo } from "@/components/AutoProdLogo";

export default function Home() {
  const [lang, setLang] = useState<Language>('es');
  const [hoveredPillar, setHoveredPillar] = useState<'organize' | 'creative' | 'production' | 'analytics' | 'automation' | null>(null);
  const [activeCycleStep, setActiveCycleStep] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <div className="min-h-screen bg-[#070709] text-zinc-100 selection:bg-purple-500 selection:text-white relative overflow-hidden font-sans">
      {/* ── Ambient Background Glows ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/15 rounded-full blur-[160px]" />
        <div className="absolute top-[800px] -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[180px]" />
      </div>

      {/* ── Navigation ── */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <AutoProdLogo className="h-9 w-9 text-purple-500 group-hover:scale-105 transition-transform drop-shadow-[0_0_12px_rgba(134,41,254,0.5)]" />
            <span className="text-lg font-bold tracking-tight text-white">
              AutoProd<span className="text-[#8629FE]">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
            <a href="#workflow" className="hover:text-white transition-colors">{t.navWorkflow}</a>
            <a href="#ciclo" className="hover:text-white transition-colors">{t.navCycle}</a>
            <a href="#planes" className="hover:text-white transition-colors">{t.pricing}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t.faq}</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-colors text-zinc-300 hover:text-white"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>

            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 transition-colors hidden sm:block"
            >
              {t.login}
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white transition-all shadow-md shadow-purple-600/30 hover:scale-[1.02]"
            >
              {t.startFree}
            </Link>
          </div>
        </div>
      </header>

      {/* ── 01: HERO CON ILUMINACIÓN ATMOSFÉRICA PROTAGONISTA ── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 text-center px-4 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo AP con su halo violeta envolvente */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-56 h-56 sm:w-72 sm:h-72 bg-[#8629FE]/30 rounded-full blur-[100px] pointer-events-none" />
            <AutoProdLogo className="h-28 w-28 sm:h-36 sm:w-36 drop-shadow-[0_0_40px_rgba(134,41,254,0.85)] hover:scale-105 transition-transform duration-500" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {t.heroMainHeadline}{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              {t.heroMainHeadlineHighlight}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-zinc-200 mb-4 max-w-2xl mx-auto tracking-tight">
            {t.heroSubheadline}
          </p>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white transition-all shadow-lg shadow-purple-600/35 hover:scale-[1.02]"
            >
              {t.heroCtaPrimary}
            </Link>
            <a
              href="#workflow"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 transition-all"
            >
              {lang === 'es' ? 'Ver el Workflow' : 'Explore the Workflow'}
            </a>
          </div>
        </div>
      </section>

      {/* ── 02: EL WORKFLOW Y LAS HERRAMIENTAS (4 PILARES RESTAURADOS CON ILUMINACIÓN) ── */}
      <section id="workflow" className="py-24 border-t border-zinc-900 scroll-mt-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              {t.pillarsHeadline}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t.pillarsSubtitle}
            </p>
          </div>

          {/* 5 Columnas Interactivas con su Iluminación y Estructura Original */}
          <div className="flex flex-col lg:flex-row gap-3 min-h-[500px]">

            {/* ── 1. ORGANIZA (Indigo) ── */}
            <div
              onMouseEnter={() => setHoveredPillar('organize')}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => setHoveredPillar(hoveredPillar === 'organize' ? null : 'organize')}
              className={`relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between p-5 sm:p-6 cursor-pointer group ${hoveredPillar === 'organize'
                ? 'lg:flex-[2.0] border-indigo-400/80 bg-gradient-to-b from-indigo-950/50 via-indigo-900/20 to-[#0c0e17] shadow-2xl shadow-indigo-950/80'
                : hoveredPillar !== null
                  ? 'lg:flex-[0.75] border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 via-zinc-950/60 to-[#07070a] opacity-60 hover:opacity-100'
                  : 'lg:flex-1 border-indigo-500/30 bg-gradient-to-b from-indigo-950/25 via-zinc-950/40 to-[#08090f] hover:border-indigo-400/60'
                }`}
            >
              <div className="absolute top-0 left-0 right-0 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

              <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-7xl xl:text-8xl font-black text-indigo-300 tracking-tighter uppercase leading-none block">
                  ORGANIZE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    🗂️
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg xl:text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-indigo-300 transition-colors truncate">
                      {t.pillarOrganizeTitle}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-indigo-300/80 font-medium truncate">
                      {t.pillarOrganizeSlogan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-3">
                {hoveredPillar === 'organize' ? (
                  <div className="space-y-2.5 animate-fadeIn">
                    <div className="p-3 rounded-xl border border-indigo-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                        <span>📁</span>
                        <span>{t.pillarOrganizeF1Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarOrganizeF1Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-indigo-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                        <span>🧠</span>
                        <span>{t.pillarOrganizeF2Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarOrganizeF2Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-indigo-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                        <span>📋</span>
                        <span>{t.pillarOrganizeF3Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarOrganizeF3Desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-1 w-10 bg-indigo-400/40 rounded-full" />
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {t.pillarOrganizePreview}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400/80">
                      <span>✦</span>
                      <span>{lang === 'es' ? 'Ver herramientas' : 'Hover for tools'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 2. CREA (Cyan) ── */}
            <div
              onMouseEnter={() => setHoveredPillar('creative')}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => setHoveredPillar(hoveredPillar === 'creative' ? null : 'creative')}
              className={`relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between p-5 sm:p-6 cursor-pointer group ${hoveredPillar === 'creative'
                ? 'lg:flex-[2.0] border-cyan-400/80 bg-gradient-to-b from-cyan-950/50 via-cyan-900/20 to-[#0c0e17] shadow-2xl shadow-cyan-950/80'
                : hoveredPillar !== null
                  ? 'lg:flex-[0.75] border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-zinc-950/60 to-[#07070a] opacity-60 hover:opacity-100'
                  : 'lg:flex-1 border-cyan-500/30 bg-gradient-to-b from-cyan-950/25 via-zinc-950/40 to-[#08090f] hover:border-cyan-400/60'
                }`}
            >
              <div className="absolute top-0 left-0 right-0 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

              <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-7xl xl:text-8xl font-black text-cyan-300 tracking-tighter uppercase leading-none block">
                  CREATE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    💡
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg xl:text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-cyan-300 transition-colors truncate">
                      {t.pillarCreativeTitle}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-cyan-300/80 font-medium truncate">
                      {t.pillarCreativeSlogan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-3">
                {hoveredPillar === 'creative' ? (
                  <div className="space-y-2.5 animate-fadeIn">
                    <div className="p-3 rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                        <span>📝</span>
                        <span>{t.pillarCreativeF1Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarCreativeF1Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                        <span>🎨</span>
                        <span>{t.pillarCreativeF2Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarCreativeF2Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                        <span>🗃️</span>
                        <span>{t.pillarCreativeF3Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarCreativeF3Desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-1 w-10 bg-cyan-400/40 rounded-full" />
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {t.pillarCreativePreview}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400/80">
                      <span>✦</span>
                      <span>{lang === 'es' ? 'Ver herramientas' : 'Hover for tools'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 3. PRODUCE (Neon Purple #8629FE) ── */}
            <div
              onMouseEnter={() => setHoveredPillar('production')}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => setHoveredPillar(hoveredPillar === 'production' ? null : 'production')}
              className={`relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between p-5 sm:p-6 cursor-pointer group ${hoveredPillar === 'production'
                ? 'lg:flex-[2.0] border-purple-400/80 bg-gradient-to-b from-purple-950/50 via-[#8629FE]/15 to-[#0c0e17] shadow-2xl shadow-purple-950/80'
                : hoveredPillar !== null
                  ? 'lg:flex-[0.75] border-purple-500/20 bg-gradient-to-b from-purple-950/20 via-zinc-950/60 to-[#07070a] opacity-60 hover:opacity-100'
                  : 'lg:flex-1 border-purple-500/30 bg-gradient-to-b from-purple-950/25 via-zinc-950/40 to-[#08090f] hover:border-purple-400/60'
                }`}
            >
              <div className="absolute top-0 left-0 right-0 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

              <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-7xl xl:text-8xl font-black text-purple-300 tracking-tighter uppercase leading-none block">
                  PRODUCE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    🎬
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg xl:text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors truncate">
                      {t.pillarProductionTitle}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-purple-300/80 font-medium truncate">
                      {t.pillarProductionSlogan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-3">
                {hoveredPillar === 'production' ? (
                  <div className="space-y-2.5 animate-fadeIn">
                    <div className="p-3 rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                        <span>🔁</span>
                        <span>{t.pillarProductionF1Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarProductionF1Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                        <span>✂️</span>
                        <span>{t.pillarProductionF2Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarProductionF2Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                        <span>🎙️</span>
                        <span>{t.pillarProductionF3Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarProductionF3Desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-1 w-10 bg-purple-400/40 rounded-full" />
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {t.pillarProductionPreview}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-400/80">
                      <span>✦</span>
                      <span>{lang === 'es' ? 'Ver herramientas' : 'Hover for tools'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 4. ANALIZA (Amber) ── */}
            <div
              onMouseEnter={() => setHoveredPillar('analytics')}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => setHoveredPillar(hoveredPillar === 'analytics' ? null : 'analytics')}
              className={`relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between p-5 sm:p-6 cursor-pointer group ${hoveredPillar === 'analytics'
                ? 'lg:flex-[2.0] border-amber-400/80 bg-gradient-to-b from-amber-950/50 via-amber-900/20 to-[#0c0e17] shadow-2xl shadow-amber-950/80'
                : hoveredPillar !== null
                  ? 'lg:flex-[0.75] border-amber-500/20 bg-gradient-to-b from-amber-950/20 via-zinc-950/60 to-[#07070a] opacity-60 hover:opacity-100'
                  : 'lg:flex-1 border-amber-500/30 bg-gradient-to-b from-amber-950/25 via-zinc-950/40 to-[#08090f] hover:border-amber-400/60'
                }`}
            >
              <div className="absolute top-0 left-0 right-0 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

              <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-7xl xl:text-8xl font-black text-amber-300 tracking-tighter uppercase leading-none block">
                  ANALYZE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    📊
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg xl:text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors truncate">
                      {t.pillarAnalyticsTitle}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-amber-300/80 font-medium truncate">
                      {t.pillarAnalyticsSlogan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-3">
                {hoveredPillar === 'analytics' ? (
                  <div className="space-y-2.5 animate-fadeIn">
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                        <span>📺</span>
                        <span>{t.pillarAnalyticsF1Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarAnalyticsF1Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-amber-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                        <span>🎯</span>
                        <span>{t.pillarAnalyticsF2Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarAnalyticsF2Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-amber-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                        <span>📈</span>
                        <span>{t.pillarAnalyticsF3Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarAnalyticsF3Desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-1 w-10 bg-amber-400/40 rounded-full" />
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {t.pillarAnalyticsPreview}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400/80">
                      <span>✦</span>
                      <span>{lang === 'es' ? 'Ver herramientas' : 'Hover for tools'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 5. ESCALA (Emerald) ── */}
            <div
              onMouseEnter={() => setHoveredPillar('automation')}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => setHoveredPillar(hoveredPillar === 'automation' ? null : 'automation')}
              className={`relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between p-5 sm:p-6 cursor-pointer group ${hoveredPillar === 'automation'
                ? 'lg:flex-[2.0] border-emerald-400/80 bg-gradient-to-b from-emerald-950/50 via-emerald-900/20 to-[#0c0e17] shadow-2xl shadow-emerald-950/80'
                : hoveredPillar !== null
                  ? 'lg:flex-[0.75] border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 via-zinc-950/60 to-[#07070a] opacity-60 hover:opacity-100'
                  : 'lg:flex-1 border-emerald-500/30 bg-gradient-to-b from-emerald-950/25 via-zinc-950/40 to-[#08090f] hover:border-emerald-400/60'
                }`}
            >
              <div className="absolute top-0 left-0 right-0 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

              <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-7xl xl:text-8xl font-black text-emerald-300 tracking-tighter uppercase leading-none block">
                  SCALE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    🚀
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg xl:text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-emerald-300 transition-colors truncate">
                      {t.pillarAutomationTitle}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-emerald-300/80 font-medium truncate">
                      {t.pillarAutomationSlogan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-3">
                {hoveredPillar === 'automation' ? (
                  <div className="space-y-2.5 animate-fadeIn">
                    <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                        <span>🗂️</span>
                        <span>{t.pillarAutomationF1Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarAutomationF1Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                        <span>🗓️</span>
                        <span>{t.pillarAutomationF2Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarAutomationF2Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                        <span>⚡</span>
                        <span>{t.pillarAutomationF3Title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarAutomationF3Desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-1 w-10 bg-emerald-400/40 rounded-full" />
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {t.pillarAutomationPreview}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400/80">
                      <span>✦</span>
                      <span>{lang === 'es' ? 'Ver herramientas' : 'Hover for tools'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 03: EL CICLO CIRCULAR (Tu canal en un solo lugar) ── */}
      <section id="ciclo" className="py-24 border-t border-zinc-900 scroll-mt-16 bg-gradient-to-b from-[#08080c] via-zinc-950/70 to-[#070709] relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-950/20 rounded-full blur-[180px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 inline-block mb-3">
              {t.lifecycleBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              {t.lifecycleTitle}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {t.lifecycleSubtitle}
            </p>
          </div>

          {/* ── VISTA ORBITAL CIRCULAR (Desktop & Tablet: md+) ── */}
          <div className="hidden md:flex relative w-full max-w-5xl mx-auto h-[780px] items-center justify-center select-none">
            {/* Anillos orbitales en SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 800">
              <defs>
                <linearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8629FE" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              {/* Órbita principal punteada */}
              <circle
                cx="400"
                cy="400"
                r="300"
                fill="none"
                stroke="url(#orbitGlow)"
                strokeWidth="2"
                strokeDasharray="6 8"
                className="animate-[spin_90s_linear_infinite]"
                style={{ transformOrigin: '400px 400px' }}
              />
              {/* Anillo de pulso interior */}
              <circle
                cx="400"
                cy="400"
                r="220"
                fill="none"
                stroke="#8629FE"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
            </svg>

            {/* 9 Nodos Interactivos colocados en la órbita (R = 300px, 40° entre cada uno) */}
            {[
              {
                num: "01",
                icon: "🏛️",
                name: t.lifecycleStep1Name,
                desc: t.lifecycleStep1Desc,
                detail: t.lifecycleStep1Detail,
                badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
                activeRing: "ring-purple-500/70 border-purple-400 bg-purple-950/80 text-purple-200 shadow-xl shadow-purple-950/80",
                glow: "rgba(134, 41, 254, 0.4)",
              },
              {
                num: "02",
                icon: "💡",
                name: t.lifecycleStep2Name,
                desc: t.lifecycleStep2Desc,
                detail: t.lifecycleStep2Detail,
                badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
                activeRing: "ring-amber-500/70 border-amber-400 bg-amber-950/80 text-amber-200 shadow-xl shadow-amber-950/80",
                glow: "rgba(245, 158, 11, 0.4)",
              },
              {
                num: "03",
                icon: "📋",
                name: t.lifecycleStep3Name,
                desc: t.lifecycleStep3Desc,
                detail: t.lifecycleStep3Detail,
                badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30",
                activeRing: "ring-blue-500/70 border-blue-400 bg-blue-950/80 text-blue-200 shadow-xl shadow-blue-950/80",
                glow: "rgba(59, 130, 246, 0.4)",
              },
              {
                num: "04",
                icon: "🎬",
                name: t.lifecycleStep4Name,
                desc: t.lifecycleStep4Desc,
                detail: t.lifecycleStep4Detail,
                badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/30",
                activeRing: "ring-rose-500/70 border-rose-400 bg-rose-950/80 text-rose-200 shadow-xl shadow-rose-950/80",
                glow: "rgba(244, 63, 94, 0.4)",
              },
              {
                num: "05",
                icon: "🎧",
                name: t.lifecycleStep5Name,
                desc: t.lifecycleStep5Desc,
                detail: t.lifecycleStep5Detail,
                badgeColor: "bg-violet-500/10 text-violet-300 border-violet-500/30",
                activeRing: "ring-violet-500/70 border-violet-400 bg-violet-950/80 text-violet-200 shadow-xl shadow-violet-950/80",
                glow: "rgba(139, 92, 246, 0.4)",
              },
              {
                num: "06",
                icon: "🎨",
                name: t.lifecycleStep6Name,
                desc: t.lifecycleStep6Desc,
                detail: t.lifecycleStep6Detail,
                badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/30",
                activeRing: "ring-teal-500/70 border-teal-400 bg-teal-950/80 text-teal-200 shadow-xl shadow-teal-950/80",
                glow: "rgba(20, 184, 166, 0.4)",
              },
              {
                num: "07",
                icon: "📊",
                name: t.lifecycleStep7Name,
                desc: t.lifecycleStep7Desc,
                detail: t.lifecycleStep7Detail,
                badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
                activeRing: "ring-cyan-500/70 border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-xl shadow-cyan-950/80",
                glow: "rgba(6, 182, 212, 0.4)",
              },
              {
                num: "08",
                icon: "🧠",
                name: t.lifecycleStep8Name,
                desc: t.lifecycleStep8Desc,
                detail: t.lifecycleStep8Detail,
                badgeColor: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
                activeRing: "ring-fuchsia-500/70 border-fuchsia-400 bg-fuchsia-950/80 text-fuchsia-200 shadow-xl shadow-fuchsia-950/80",
                glow: "rgba(217, 70, 239, 0.4)",
              },
              {
                num: "09",
                icon: "🚀",
                name: t.lifecycleStep9Name,
                desc: t.lifecycleStep9Desc,
                detail: t.lifecycleStep9Detail,
                badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
                activeRing: "ring-emerald-500/70 border-emerald-400 bg-emerald-950/80 text-emerald-200 shadow-xl shadow-emerald-950/80",
                glow: "rgba(16, 185, 129, 0.4)",
                isLoopBack: true
              },
            ].map((step, idx) => {
              const angleDeg = -90 + idx * 40;
              const rad = (angleDeg * Math.PI) / 180;
              const radius = 300;
              const x = Math.round(Math.cos(rad) * radius);
              const y = Math.round(Math.sin(rad) * radius);
              const isActive = activeCycleStep === idx;

              return (
                <button
                  key={step.num}
                  onClick={() => setActiveCycleStep(idx)}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl transition-all duration-300 backdrop-blur-md cursor-pointer group ${
                    isActive
                      ? `${step.activeRing} ring-2 scale-110 z-30`
                      : 'border border-zinc-800/80 bg-zinc-900/90 hover:border-zinc-700 hover:bg-zinc-800/90 text-zinc-400 hover:text-white scale-100'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-base transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {step.icon}
                  </div>
                  <div className="text-left pr-1 hidden lg:block">
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-black tracking-wider ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                        {step.num}
                      </span>
                      {step.isLoopBack && (
                        <span className="text-[10px] text-emerald-400 font-bold" title="Cierra el ciclo">↺</span>
                      )}
                    </div>
                    <p className={`text-[11px] font-bold leading-tight whitespace-nowrap ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {step.name}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Tarjeta Central Interactiva Proporcionada */}
            {(() => {
              const stepsData = [
                { num: "01", icon: "🏛️", name: t.lifecycleStep1Name, desc: t.lifecycleStep1Desc, detail: t.lifecycleStep1Detail, badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30" },
                { num: "02", icon: "💡", name: t.lifecycleStep2Name, desc: t.lifecycleStep2Desc, detail: t.lifecycleStep2Detail, badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
                { num: "03", icon: "📋", name: t.lifecycleStep3Name, desc: t.lifecycleStep3Desc, detail: t.lifecycleStep3Detail, badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
                { num: "04", icon: "🎬", name: t.lifecycleStep4Name, desc: t.lifecycleStep4Desc, detail: t.lifecycleStep4Detail, badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
                { num: "05", icon: "🎧", name: t.lifecycleStep5Name, desc: t.lifecycleStep5Desc, detail: t.lifecycleStep5Detail, badgeColor: "bg-violet-500/10 text-violet-300 border-violet-500/30" },
                { num: "06", icon: "🎨", name: t.lifecycleStep6Name, desc: t.lifecycleStep6Desc, detail: t.lifecycleStep6Detail, badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/30" },
                { num: "07", icon: "📊", name: t.lifecycleStep7Name, desc: t.lifecycleStep7Desc, detail: t.lifecycleStep7Detail, badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" },
                { num: "08", icon: "🧠", name: t.lifecycleStep8Name, desc: t.lifecycleStep8Desc, detail: t.lifecycleStep8Detail, badgeColor: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30" },
                { num: "09", icon: "🚀", name: t.lifecycleStep9Name, desc: t.lifecycleStep9Desc, detail: t.lifecycleStep9Detail, badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", isLoopBack: true },
              ];
              const cur = stepsData[activeCycleStep] || stepsData[0];

              return (
                <div className="relative z-20 w-[290px] sm:w-[310px] p-5 sm:p-6 rounded-3xl border border-zinc-700/60 bg-gradient-to-b from-[#111117]/95 via-zinc-900/95 to-[#0b0b10]/95 backdrop-blur-2xl shadow-2xl text-center space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${cur.badgeColor}`}>
                      {lang === 'es' ? 'Fase' : 'Phase'} {cur.num} / 09
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono font-medium">
                      AutoProd Loop
                    </span>
                  </div>

                  <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-center text-2xl shadow-inner">
                    {cur.icon}
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight">
                      {cur.num}. {cur.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">
                      {cur.desc}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-zinc-800/80">
                    {cur.detail}
                  </p>

                  {cur.isLoopBack && (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5">
                      <span>↺</span>
                      <span>{t.lifecycleLoopBack}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => setActiveCycleStep((activeCycleStep - 1 + 9) % 9)}
                      className="text-[11px] font-bold text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 transition-colors"
                    >
                      ← {lang === 'es' ? 'Anterior' : 'Prev'}
                    </button>

                    <div className="flex items-center gap-1">
                      {stepsData.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setActiveCycleStep(dotIdx)}
                          className={`h-1.5 rounded-full transition-all ${
                            activeCycleStep === dotIdx ? 'w-3.5 bg-purple-400' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveCycleStep((activeCycleStep + 1) % 9)}
                      className="text-[11px] font-bold text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 transition-colors"
                    >
                      {lang === 'es' ? 'Siguiente' : 'Next'} →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── VISTA RESPONSIVA ADAPTADA (Móvil: < md) ── */}
          <div className="md:hidden space-y-6">
            {/* Selector horizontal deslizable */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {[
                { num: "01", icon: "🏛️", name: t.lifecycleStep1Name },
                { num: "02", icon: "💡", name: t.lifecycleStep2Name },
                { num: "03", icon: "📋", name: t.lifecycleStep3Name },
                { num: "04", icon: "🎬", name: t.lifecycleStep4Name },
                { num: "05", icon: "🎧", name: t.lifecycleStep5Name },
                { num: "06", icon: "🎨", name: t.lifecycleStep6Name },
                { num: "07", icon: "📊", name: t.lifecycleStep7Name },
                { num: "08", icon: "🧠", name: t.lifecycleStep8Name },
                { num: "09", icon: "🚀", name: t.lifecycleStep9Name, isLoopBack: true },
              ].map((item, idx) => (
                <button
                  key={item.num}
                  onClick={() => setActiveCycleStep(idx)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    activeCycleStep === idx
                      ? 'border-purple-500/80 bg-purple-950/60 text-white shadow-lg shadow-purple-950/50'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.num}</span>
                  {item.isLoopBack && <span className="text-emerald-400 font-bold">↺</span>}
                </button>
              ))}
            </div>

            {/* Tarjeta de detalle activa para móvil */}
            {(() => {
              const mobileSteps = [
                { num: "01", icon: "🏛️", name: t.lifecycleStep1Name, desc: t.lifecycleStep1Desc, detail: t.lifecycleStep1Detail, badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30" },
                { num: "02", icon: "💡", name: t.lifecycleStep2Name, desc: t.lifecycleStep2Desc, detail: t.lifecycleStep2Detail, badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
                { num: "03", icon: "📋", name: t.lifecycleStep3Name, desc: t.lifecycleStep3Desc, detail: t.lifecycleStep3Detail, badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
                { num: "04", icon: "🎬", name: t.lifecycleStep4Name, desc: t.lifecycleStep4Desc, detail: t.lifecycleStep4Detail, badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
                { num: "05", icon: "🎧", name: t.lifecycleStep5Name, desc: t.lifecycleStep5Desc, detail: t.lifecycleStep5Detail, badgeColor: "bg-violet-500/10 text-violet-300 border-violet-500/30" },
                { num: "06", icon: "🎨", name: t.lifecycleStep6Name, desc: t.lifecycleStep6Desc, detail: t.lifecycleStep6Detail, badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/30" },
                { num: "07", icon: "📊", name: t.lifecycleStep7Name, desc: t.lifecycleStep7Desc, detail: t.lifecycleStep7Detail, badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" },
                { num: "08", icon: "🧠", name: t.lifecycleStep8Name, desc: t.lifecycleStep8Desc, detail: t.lifecycleStep8Detail, badgeColor: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30" },
                { num: "09", icon: "🚀", name: t.lifecycleStep9Name, desc: t.lifecycleStep9Desc, detail: t.lifecycleStep9Detail, badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", isLoopBack: true },
              ];
              const cur = mobileSteps[activeCycleStep] || mobileSteps[0];

              return (
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${cur.badgeColor}`}>
                      {lang === 'es' ? 'Fase' : 'Phase'} {cur.num} / 09
                    </span>
                    <span className="text-2xl">{cur.icon}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {cur.num}. {cur.name}
                    </h3>
                    <p className="text-xs font-medium text-zinc-400 mt-0.5">
                      {cur.desc}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-zinc-800">
                    {cur.detail}
                  </p>

                  {cur.isLoopBack && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                      <span>↺</span>
                      <span>{t.lifecycleLoopBack}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => setActiveCycleStep((activeCycleStep - 1 + 9) % 9)}
                      className="text-xs font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700/50"
                    >
                      ← {lang === 'es' ? 'Anterior' : 'Prev'}
                    </button>
                    <button
                      onClick={() => setActiveCycleStep((activeCycleStep + 1) % 9)}
                      className="text-xs font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700/50"
                    >
                      {lang === 'es' ? 'Siguiente' : 'Next'} →
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Indicador de cierre de ciclo */}
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-center">
              <p className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                <span>↺</span>
                <span>{lang === 'es' ? 'Flujo circular continuo: el paso 09 alimenta directamente al paso 01' : 'Continuous circular loop: step 09 directly enriches step 01'}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04: PLANES ── */}
      <section id="planes" className="py-24 border-t border-zinc-900 scroll-mt-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
              {t.pricingTitle}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t.pricingSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-white">{t.pricingStarterTitle}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {t.pricingStarterBadge}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-white">{t.pricingStarterPrice}</span>
                  <span className="text-xs text-zinc-500 ml-1">{t.pricingBilledMonthly}</span>
                  <p className="text-xs text-zinc-400 mt-1">{t.pricingStarterDesc}</p>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 border-t border-zinc-800 pt-4 mb-6">
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingStarterF1}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingStarterF2}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingStarterF3}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingStarterF4}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingStarterF5}</span></li>
                </ul>
              </div>
              <Link
                href="/login?plan=starter"
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                {t.pricingStarterCta}
              </Link>
            </div>

            {/* Pro */}
            <div className="p-7 rounded-2xl border border-purple-500/50 bg-gradient-to-b from-purple-950/40 via-zinc-900 to-[#14141b] flex flex-col justify-between relative shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-black uppercase text-white tracking-wider shadow-md">
                🔥 {t.pricingProPopular}
              </div>
              <div>
                <div className="flex justify-between items-center mb-3 mt-1">
                  <h3 className="text-base font-bold text-purple-200">{t.pricingProTitle}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {t.pricingProBadge}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-white">{t.pricingProPrice}</span>
                  <span className="text-xs text-zinc-400 ml-1">{t.pricingBilledMonthly}</span>
                  <p className="text-xs text-zinc-400 mt-1">{t.pricingProDesc}</p>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-200 border-t border-zinc-800 pt-4 mb-6">
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span><strong>{t.pricingProF1}</strong></span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingProF2}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingProF3}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingProF4}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingProF5}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingProF6}</span></li>
                </ul>
              </div>
              <Link
                href="/login?plan=pro"
                className="w-full py-3 rounded-xl text-center text-xs font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white transition-opacity shadow-lg shadow-purple-600/30"
              >
                {t.pricingProCta}
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-white">{t.pricingEnterpriseTitle}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {t.pricingEnterpriseBadge}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-white">{t.pricingEnterprisePrice}</span>
                  <span className="text-xs text-zinc-500 ml-1">{t.pricingBilledMonthly}</span>
                  <p className="text-xs text-zinc-400 mt-1">{t.pricingEnterpriseDesc}</p>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 border-t border-zinc-800 pt-4 mb-6">
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span><strong>{t.pricingEnterpriseF1}</strong></span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingEnterpriseF2}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingEnterpriseF3}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingEnterpriseF4}</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">✓</span><span>{t.pricingEnterpriseF5}</span></li>
                </ul>
              </div>
              <Link
                href="/login?plan=enterprise"
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                {t.pricingEnterpriseCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05: FAQ & MANIFIESTO ── */}
      <section id="faq" className="py-24 border-t border-zinc-900 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-2">
              {t.faqTitle}
            </h2>
            <p className="text-zinc-400 text-sm">
              {t.faqSubtitle}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
              { q: t.faq4Q, a: t.faq4A },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-white cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span className="text-zinc-400 ml-2">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Manifiesto */}
          <div className="mt-20 p-8 rounded-2xl border border-purple-500/20 bg-purple-950/10 text-center space-y-4">
            <h3 className="text-2xl font-extrabold text-white">
              {t.manifestoTitle}
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed max-w-xl mx-auto">
              "{t.manifestoDesc}"
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-7 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white transition-all shadow-md shadow-purple-600/30"
              >
                {t.manifestoCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-900 py-10 bg-[#050507]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <AutoProdLogo className="h-6 w-6 text-purple-500" />
            <span className="font-bold text-zinc-300">{t.logo}</span>
            <span>— {t.footerDesc}</span>
          </div>
          <div className="flex gap-6 text-zinc-400">
            <a href="#workflow" className="hover:text-white transition-colors">{lang === 'es' ? 'El Workflow' : 'The Workflow'}</a>
            <a href="#planes" className="hover:text-white transition-colors">{lang === 'es' ? 'Planes' : 'Pricing'}</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-bold">{t.login}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
