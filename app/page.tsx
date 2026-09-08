'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, Language } from "./translations";
import { AutoProdLogo } from "@/components/AutoProdLogo";

export default function Home() {
  const [lang, setLang] = useState<Language>('es');
  const [activeMockupTab, setActiveMockupTab] = useState<'agent' | 'looper' | 'whisper' | 'images' | 'workspace'>('agent');
  const [hoveredPillar, setHoveredPillar] = useState<'creative' | 'production' | 'analytics' | 'automation' | null>(null);
  const [activeLifecycleStep, setActiveLifecycleStep] = useState<number>(0);
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

  const lifecycleSteps = [
    { num: "01", name: t.lifecycleStep1Name, desc: t.lifecycleStep1Desc, icon: "🏛️" },
    { num: "02", name: t.lifecycleStep2Name, desc: t.lifecycleStep2Desc, icon: "💡" },
    { num: "03", name: t.lifecycleStep3Name, desc: t.lifecycleStep3Desc, icon: "📋" },
    { num: "04", name: t.lifecycleStep4Name, desc: t.lifecycleStep4Desc, icon: "🎬" },
    { num: "05", name: t.lifecycleStep5Name, desc: t.lifecycleStep5Desc, icon: "🎧" },
    { num: "06", name: t.lifecycleStep6Name, desc: t.lifecycleStep6Desc, icon: "🎨" },
    { num: "07", name: t.lifecycleStep7Name, desc: t.lifecycleStep7Desc, icon: "📊" },
    { num: "08", name: t.lifecycleStep8Name, desc: t.lifecycleStep8Desc, icon: "🧠" },
    { num: "09", name: t.lifecycleStep9Name, desc: t.lifecycleStep9Desc, icon: "🚀" },
  ];

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

          <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <a href="#problem" className="hover:text-white transition-colors">{t.navProblem}</a>
            <a href="#pillars" className="hover:text-white transition-colors">{t.features}</a>
            <a href="#local-advantage" className="hover:text-white transition-colors">{t.navLocal}</a>
            <a href="#lifecycle" className="hover:text-white transition-colors">{t.navLifecycle}</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">{t.howItWorks}</a>
            <a href="#target" className="hover:text-white transition-colors">{t.navTarget}</a>
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

      {/* ═══════════════════════════════════════════════════════════════
          01 — HERO: Tu canal. Tu contenido. Tu sistema.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-14 pb-20 md:pt-20 md:pb-28 overflow-hidden z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">

          {/* Monumental Brand Identity */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative group flex items-center justify-center mb-4">
              <div className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-[#8629FE]/25 rounded-full blur-[90px] pointer-events-none group-hover:bg-[#8629FE]/40 transition-all duration-700" />
              <AutoProdLogo className="h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 drop-shadow-[0_0_35px_rgba(134,41,254,0.8)] group-hover:scale-105 transition-transform duration-500" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-4 tracking-wide uppercase font-mono">
              {t.heroBadge}
            </div>

            {/* Titular Principal Exacto */}
            <h1 className="font-logo text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              {t.heroMainHeadline}{" "}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                {t.heroMainHeadlineHighlight}
              </span>
            </h1>

            {/* Subtítulo / Posicionamiento */}
            <p className="font-title text-xl sm:text-2xl md:text-3xl font-bold text-zinc-200 max-w-3xl mx-auto mb-4 tracking-tight">
              {t.heroSubheadline}
            </p>

            {/* Párrafo Descriptivo Equilibrado */}
            <p className="font-body text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
              {t.heroSubtitle}
            </p>

            {/* CTAs Principales */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
              <Link
                href="/login"
                className="font-btn px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white hover:opacity-95 transition-all shadow-lg shadow-purple-600/35 hover:scale-[1.02] flex items-center gap-2"
              >
                <span>{t.heroCtaPrimary}</span>
                <span>→</span>
              </Link>
              <a
                href="#problem"
                className="font-btn px-7 py-3.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 transition-all flex items-center gap-2"
              >
                <span>{t.heroCtaSecondary}</span>
                <span>↓</span>
              </a>
            </div>

            {/* Tira Pequeña Inferior */}
            <div className="text-xs font-semibold text-zinc-400 tracking-wider uppercase font-mono mb-10">
              {t.heroUnderTag}
            </div>

            {/* Badges de Confianza */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
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

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          02 — EL PROBLEMA: Tu workflow no debería vivir entre diez herramientas
      ═══════════════════════════════════════════════════════════════ */}
      <section id="problem" className="py-24 border-t border-zinc-900 relative scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold mb-4 uppercase font-mono">
              ⚠️ {t.problemBadge}
            </div>
            <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {t.problemTitle}
            </h2>
            <p className="font-body text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {t.problemSubtitle}
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

      {/* ═══════════════════════════════════════════════════════════════
          03 — LOS 4 PILARES: CREA, PRODUCE, ANALIZA, ESCALA
      ═══════════════════════════════════════════════════════════════ */}
      <section id="pillars" className="py-24 border-t border-zinc-900 relative scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 uppercase font-mono">
              ⚡ {t.pillarsBadge}
            </div>
            <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {t.pillarsHeadline}
            </h2>
            <p className="font-body text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {t.pillarsSubtitle}
            </p>
          </div>

          {/* 4 Columnas Interactivas */}
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
                <span className="font-title text-8xl font-black text-cyan-300 tracking-tighter uppercase leading-none block">
                  CREATE
                </span>
              </div>

              <div className="relative z-10">
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
                <span className="font-title text-8xl font-black text-purple-300 tracking-tighter uppercase leading-none block">
                  PRODUCE
                </span>
              </div>

              <div className="relative z-10">
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
                <span className="font-title text-8xl font-black text-amber-300 tracking-tighter uppercase leading-none block">
                  ANALYZE
                </span>
              </div>

              <div className="relative z-10">
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
                <span className="font-title text-8xl font-black text-emerald-300 tracking-tighter uppercase leading-none block">
                  SCALE
                </span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    🚀
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
                    <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 backdrop-blur-md">
                      <div className="flex items-center justify-between text-emerald-300 text-xs font-bold font-title">
                        <div className="flex items-center gap-2">
                          <span>🗂️</span>
                          <span>{t.pillarAutomationF1Title}</span>
                        </div>
                      </div>
                      <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarAutomationF1Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold font-title">
                        <span>🗓️</span>
                        <span>{t.pillarAutomationF2Title}</span>
                      </div>
                      <p className="font-body text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {t.pillarAutomationF2Desc}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold font-title">
                        <span>⚡</span>
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
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          04 — PRODUCCIÓN LOCAL: Tu contenido. Tu equipo. Tu control.
      ═══════════════════════════════════════════════════════════════ */}
      <section id="local-advantage" className="py-24 border-t border-zinc-900 bg-gradient-to-b from-[#08080c] via-zinc-950/60 to-[#070709] relative overflow-hidden scroll-mt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-950/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 uppercase font-mono">
              🛡️ {t.localBadge}
            </div>
            <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
              {t.localTitle}
            </h2>
            <p className="font-title text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              {t.localHeadlineHighlight}
            </p>
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

      {/* ═══════════════════════════════════════════════════════════════
          05 — TU CANAL EN UN SOLO LUGAR: Ciclo de Vida & Studio Showcase
      ═══════════════════════════════════════════════════════════════ */}
      <section id="lifecycle" className="py-24 border-t border-zinc-900 relative scroll-mt-20 bg-gradient-to-b from-[#060608] via-zinc-950 to-[#08080c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-4 uppercase font-mono">
              🔄 {t.lifecycleBadge}
            </div>
            <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {t.lifecycleTitle}
            </h2>
            <p className="font-body text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {t.lifecycleSubtitle}
            </p>
          </div>

          {/* Mapa Visual Interactivo de 9 Fases Conectadas */}
          <div className="mb-14">
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              {lifecycleSteps.map((step, idx) => {
                const isActive = activeLifecycleStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveLifecycleStep(idx)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[95px] cursor-pointer ${isActive
                      ? 'border-purple-400 bg-purple-950/40 shadow-lg shadow-purple-900/30'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={`font-mono font-bold ${isActive ? 'text-purple-300' : 'text-zinc-500'}`}>
                        {step.num}
                      </span>
                      <span className="text-sm">{step.icon}</span>
                    </div>
                    <div>
                      <div className={`font-title text-xs font-bold leading-tight mb-0.5 ${isActive ? 'text-white' : 'text-zinc-200'}`}>
                        {step.name}
                      </div>
                      <div className="font-body text-[10px] text-zinc-400 leading-snug line-clamp-2">
                        {step.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Creator Showcase (Mockup de Consola) */}
          <div className="relative rounded-2xl border border-zinc-800 bg-[#0d0d11] shadow-2xl overflow-hidden">
            {/* Mockup Window Top Bar */}
            <div className="bg-[#121217] border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-zinc-400 ml-3 font-semibold">AutoProd Creator Studio — Entorno Unificado</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                5 Herramientas Integradas
              </span>
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
            <div className="p-5 sm:p-7 min-h-[360px] flex flex-col justify-center">

              {/* 1. ASISTENTE CREATIVO */}
              {activeMockupTab === 'agent' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                        💡
                      </div>
                      <div>
                        <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                          {t.mockupAgentTitle}
                        </h3>
                        <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                          {t.mockupAgentDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3 shadow-md">
                      <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                        Tú
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block font-btn">
                          Instrucción del Creador:
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-zinc-100 leading-snug">
                          "Quiero estructurar una serie de tres partes sobre <span className="text-purple-300 font-semibold">'Hábitos de enfoque profundo en creadores digitales'</span>. Ayúdame con las premisas y la escaleta de producción."
                        </p>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#161320] via-[#111018] to-[#0c0c12] border border-purple-500/30 shadow-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <span>✓</span>
                          <span className="uppercase tracking-wider font-btn">Estructura y Escaleta Definidas</span>
                        </div>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium">
                          Listo para Producción
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-body">
                        Hemos dividido el tema en 3 entregas con apertura de impacto, desarrollo central y llamada a la acción consistente con la voz de tu canal.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. VIDEOS LARGOS */}
              {activeMockupTab === 'looper' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                        🎬
                      </div>
                      <div>
                        <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                          {t.mockupLooperTitle}
                        </h3>
                        <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                          {t.mockupLooperDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Duración</span>
                      <span className="text-lg font-bold text-white">1 a 3 Horas</span>
                      <p className="text-xs text-zinc-400 mt-1">Bucle perfecto con audio continuo</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Resolución</span>
                      <span className="text-lg font-bold text-emerald-400">1080p y 4K</span>
                      <p className="text-xs text-zinc-400 mt-1">Calidad máxima sin compresión web</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Procesamiento</span>
                      <span className="text-lg font-bold text-purple-400">Nativo en tu Equipo</span>
                      <p className="text-xs text-zinc-400 mt-1">Sin esperas ni colas en la nube</p>
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
                        <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                          {t.mockupWhisperTitle}
                        </h3>
                        <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                          {t.mockupWhisperDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/50 border border-zinc-800 flex flex-col items-center justify-center text-center py-8">
                    <span className="text-xs font-mono text-zinc-500 mb-2">Vista Previa de Sincronización</span>
                    <p className="text-lg sm:text-xl font-black text-white max-w-lg">
                      "La clave de un gran canal{" "}
                      <span className="text-purple-400 underline decoration-purple-500 font-extrabold">no es la suerte</span>,{" "}
                      sino la consistencia del proceso."
                    </p>
                    <span className="text-[11px] text-zinc-400 mt-3">Exportable directamente a CapCut, Premiere o YouTube (.srt, .vtt)</span>
                  </div>
                </div>
              )}

              {/* 4. PORTADAS Y MINIATURAS */}
              {activeMockupTab === 'images' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                        🎨
                      </div>
                      <div>
                        <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                          {t.mockupImagesTitle}
                        </h3>
                        <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                          {t.mockupImagesDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-purple-300 font-mono">16:9 HORIZONTAL</span>
                        <h4 className="text-sm font-bold text-white mt-1">Carátulas Clásicas de YouTube</h4>
                        <p className="text-xs text-zinc-400 mt-1">Alto contraste y tipografía nítida para destacar en el feed principal.</p>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-3">Exportación directa en alta resolución</span>
                    </div>

                    <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-indigo-300 font-mono">9:16 VERTICAL</span>
                        <h4 className="text-sm font-bold text-white mt-1">Portadas para Shorts & Reels</h4>
                        <p className="text-xs text-zinc-400 mt-1">Composición optimizada para el centro de la pantalla en dispositivos móviles.</p>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-3">Adaptadas a márgenes seguros de interfaz</span>
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
                        <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-tight">
                          {t.mockupWorkspaceTitle}
                        </h3>
                        <p className="font-body text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mt-0.5 max-w-2xl">
                          {t.mockupWorkspaceDesc}
                        </p>
                      </div>
                    </div>
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
                        <span className="font-title">Canal: Finanzas Claras</span>
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
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          06 — CÓMO FUNCIONA: 5 Momentos Claros
      ═══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 border-t border-zinc-900 bg-zinc-950/70 relative scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-4 uppercase font-mono">
              ✨ {t.howItWorksBadge}
            </div>
            <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {t.howItWorksTitle}
            </h2>
            <p className="font-body text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {t.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Paso 1 */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black text-base mb-4 font-mono">
                  01
                </div>
                <h4 className="font-title text-base font-bold text-white mb-2">{t.step1Title}</h4>
                <p className="font-body text-xs text-zinc-400 leading-relaxed">
                  {t.step1Desc}
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
              <div>
                <div className="h-10 w-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black text-base mb-4 font-mono">
                  02
                </div>
                <h4 className="font-title text-base font-bold text-white mb-2">{t.step2Title}</h4>
                <p className="font-body text-xs text-zinc-400 leading-relaxed">
                  {t.step2Desc}
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black text-base mb-4 font-mono">
                  03
                </div>
                <h4 className="font-title text-base font-bold text-white mb-2">{t.step3Title}</h4>
                <p className="font-body text-xs text-zinc-400 leading-relaxed">
                  {t.step3Desc}
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
              <div>
                <div className="h-10 w-10 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-base mb-4 font-mono">
                  04
                </div>
                <h4 className="font-title text-base font-bold text-white mb-2">{t.step4Title}</h4>
                <p className="font-body text-xs text-zinc-400 leading-relaxed">
                  {t.step4Desc}
                </p>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-base mb-4 font-mono">
                  05
                </div>
                <h4 className="font-title text-base font-bold text-white mb-2">{t.step5Title}</h4>
                <p className="font-body text-xs text-zinc-400 leading-relaxed">
                  {t.step5Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          07 — PARA QUIÉN ES: Creadores Construyendo con Intención
      ═══════════════════════════════════════════════════════════════ */}
      <section id="target" className="py-24 border-t border-zinc-900 relative scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 uppercase font-mono">
              👥 {t.targetBadge}
            </div>
            <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {t.targetTitle}
            </h2>
            <p className="font-body text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {t.targetSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Persona 1 */}
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl">
                  🎙️
                </div>
                <h3 className="font-title text-lg font-bold text-white">
                  {t.target1Title}
                </h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {t.target1Desc}
              </p>
            </div>

            {/* Persona 2 */}
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl">
                  📚
                </div>
                <h3 className="font-title text-lg font-bold text-white">
                  {t.target2Title}
                </h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {t.target2Desc}
              </p>
            </div>

            {/* Persona 3 */}
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
                  🎧
                </div>
                <h3 className="font-title text-lg font-bold text-white">
                  {t.target3Title}
                </h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {t.target3Desc}
              </p>
            </div>

            {/* Persona 4 */}
            <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl">
                  🏢
                </div>
                <h3 className="font-title text-lg font-bold text-white">
                  {t.target4Title}
                </h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {t.target4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          08 — PRICING SECTION: Orientado a Capacidad y Canales
      ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 border-t border-zinc-900 bg-zinc-950/70 relative overflow-hidden scroll-mt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 uppercase font-mono">
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
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>{t.pricingEnterpriseF5}</span>
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

      {/* ═══════════════════════════════════════════════════════════════
          09 — FAQ & MANIFIESTO DE CIERRE
      ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 border-t border-zinc-900 relative scroll-mt-20">
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

      {/* ── Manifiesto de Marca ── */}
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

      {/* ── Footer ── */}
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
          <div className="flex flex-wrap gap-6 text-zinc-400">
            <a href="#problem" className="hover:text-white transition-colors">{t.navProblem}</a>
            <a href="#pillars" className="hover:text-white transition-colors">{t.features}</a>
            <a href="#local-advantage" className="hover:text-white transition-colors">{t.navLocal}</a>
            <a href="#lifecycle" className="hover:text-white transition-colors">{t.navLifecycle}</a>
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
