'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, Language } from "./translations";
import { AutoProdLogo } from "@/components/AutoProdLogo";

export default function Home() {
  const [lang, setLang] = useState<Language>('es');
  const [hoveredPillar, setHoveredPillar] = useState<'creative' | 'production' | 'analytics' | 'automation' | null>(null);
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
            <a href="#workflow" className="hover:text-white transition-colors">{lang === 'es' ? 'El Workflow' : 'The Workflow'}</a>
            <a href="#local" className="hover:text-white transition-colors">{lang === 'es' ? 'Producción Local' : 'Local Engine'}</a>
            <a href="#planes" className="hover:text-white transition-colors">{lang === 'es' ? 'Planes' : 'Pricing'}</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
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

          {/* 4 Columnas Interactivas con su Iluminación y Estructura Original */}
          <div className="flex flex-col lg:flex-row gap-3 min-h-[500px]">

            {/* ── 1. CREA (Cyan) ── */}
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
              <div className="absolute top-0 left-0 right-0 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

              <div className="absolute -right-6 bottom-4 select-none pointer-events-none text-right opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-8xl font-black text-cyan-300 tracking-tighter uppercase leading-none block">
                  CREATE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    💡
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                      {t.pillarCreativeTitle}
                    </h3>
                    <p className="text-xs text-cyan-300/80 font-medium">
                      {t.pillarCreativeSlogan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-4">
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
                  <div className="space-y-4">
                    <div className="h-1 w-12 bg-cyan-400/40 rounded-full" />
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
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

            {/* ── 2. PRODUCE (Neon Purple #8629FE) ── */}
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
                <span className="text-8xl font-black text-purple-300 tracking-tighter uppercase leading-none block">
                  PRODUCE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    🎬
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors">
                      {t.pillarProductionTitle}
                    </h3>
                    <p className="text-xs text-purple-300/80 font-medium">
                      {t.pillarProductionSlogan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-4">
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
                  <div className="space-y-4">
                    <div className="h-1 w-12 bg-purple-400/40 rounded-full" />
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
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

            {/* ── 3. ANALIZA (Amber) ── */}
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
                <span className="text-8xl font-black text-amber-300 tracking-tighter uppercase leading-none block">
                  ANALYZE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    📊
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors">
                      {t.pillarAnalyticsTitle}
                    </h3>
                    <p className="text-xs text-amber-300/80 font-medium">
                      {t.pillarAnalyticsSlogan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-4">
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
                  <div className="space-y-4">
                    <div className="h-1 w-12 bg-amber-400/40 rounded-full" />
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
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

            {/* ── 4. ESCALA (Emerald) ── */}
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
                <span className="text-8xl font-black text-emerald-300 tracking-tighter uppercase leading-none block">
                  SCALE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                      {t.pillarAutomationTitle}
                    </h3>
                    <p className="text-xs text-emerald-300/80 font-medium">
                      {t.pillarAutomationSlogan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-4">
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
                  <div className="space-y-4">
                    <div className="h-1 w-12 bg-emerald-400/40 rounded-full" />
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
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
      </section>

      {/* ── 03: PRODUCCIÓN LOCAL (Tu equipo. Tus archivos. Tu control) ── */}
      <section id="local" className="py-24 border-t border-zinc-900 scroll-mt-16 bg-gradient-to-b from-[#08080c] via-zinc-950/60 to-[#070709] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-950/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
              {t.localTitle}
            </h2>
            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              {t.localHeadlineHighlight}
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t.localSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-emerald-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                ⚡
              </div>
              <h3 className="text-base font-bold text-white">{t.localF1Title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.localF1Desc}</p>
            </div>

            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-purple-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
                💎
              </div>
              <h3 className="text-base font-bold text-white">{t.localF2Title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.localF2Desc}</p>
            </div>

            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-cyan-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl">
                🔒
              </div>
              <h3 className="text-base font-bold text-white">{t.localF3Title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.localF3Desc}</p>
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
