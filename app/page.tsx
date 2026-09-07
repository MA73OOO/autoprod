'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, Language } from "./translations";

export default function Home() {
  const [lang, setLang] = useState<Language>('es');

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
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-purple-500 selection:text-black">
      {/* Navigation */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
              A
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {t.logo}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">{t.features}</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">{t.howItWorks}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t.pricing}</a>
            <a href="file:///e:/AutoProd/docs/frontend/README.md" className="hover:text-white transition-colors">{t.docs}</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Toggler */}
            <button 
              onClick={toggleLanguage}
              className="text-xs font-semibold px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-colors text-zinc-400 hover:text-white mr-2"
            >
              {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>

            <Link 
              href="/login" 
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              {t.login}
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-md"
            >
              {t.startFree}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-400 text-xs font-semibold mb-8 animate-fade-in">
            {t.heroBadge}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 max-w-4xl mx-auto leading-[1.1]">
            {t.heroTitle}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              {t.heroTitleHighlight}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
            >
              {t.startFree}
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors border border-zinc-800"
            >
              {t.howItWorksBtn}
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.featuresTitle}
            </h2>
            <p className="text-zinc-400">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-all hover:-translate-y-1 group">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.feat1Title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.feat1Desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-all hover:-translate-y-1 group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.feat2Title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.feat2Desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-all hover:-translate-y-1 group">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.feat3Title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.feat3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Architecture Section */}
      <section id="how-it-works" className="py-24 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.howItWorksTitle}
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              {t.howItWorksSubtitle}
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">{t.step1Title}</h4>
                <p className="text-zinc-400">
                  {t.step1Desc}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">{t.step2Title}</h4>
                <p className="text-zinc-400">
                  {t.step2Desc}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">{t.step3Title}</h4>
                <p className="text-zinc-400">
                  {t.step3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-zinc-900 bg-zinc-950/70 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4">
              ⚡ {lang === 'es' ? 'Precios Transparentes & Tokens' : 'Transparent Pricing & Tokens'}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              {lang === 'es' ? 'Planes para Creadores y Canales Automatizados' : 'Plans for Creators and Automated Channels'}
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              {lang === 'es'
                ? 'AutoProd Brain™ (Cerebro Autónomo 24/7) es 100% GRATIS e ILIMITADO en todos los planes de pago. Tu presupuesto mensual se convierte en créditos para Whisper, video y modelos de razonamiento avanzado.'
                : 'AutoProd Brain™ (24/7 Autonomous AI) is 100% FREE and UNLIMITED on all paid plans. Your monthly budget turns into credits for Whisper, video, and heavy models.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Free Trial */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/80 flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Prueba Gratuita</span>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">$0</span>
                    <span className="text-xs text-zinc-500">USD</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">50 créditos de cortesía para empezar</p>
                </div>
                <div className="space-y-2 text-xs text-zinc-400 mb-6 border-t border-zinc-900 pt-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">Incluye:</p>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>1 Canal de YouTube para pruebas</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>50 créditos de bienvenida</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 line-through">
                    <span className="text-red-400/80 font-bold">✗</span>
                    <span>Descarga de Motor Local (Solo planes pagos)</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>Video Looper Web (hasta 720p)</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400/80 text-[11px]">
                    <span>•</span>
                    <span>AutoProd Brain™: 1 crédito/acción</span>
                  </div>
                </div>
              </div>
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
              >
                {lang === 'es' ? 'Comenzar Gratis' : 'Start Free'}
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Starter</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    1 Canal Único
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">$70</span>
                    <span className="text-xs text-zinc-500">USD / mes</span>
                  </div>
                  <div className="mt-2 text-[10px] bg-black/40 border border-zinc-800/80 rounded p-2 text-zinc-300 space-y-0.5">
                    <p className="text-emerald-400 font-bold">🧠 AutoProd Brain™ 100% GRATIS</p>
                    <p className="text-zinc-400">🪙 1,800 créditos netos mensuales</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-zinc-400 mb-6 border-t border-zinc-900 pt-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">Incluye:</p>
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold">
                    <span className="text-amber-400 font-bold">⚡</span>
                    <span><strong>Descarga de Motor Local</strong> (GPU/CPU en PC)</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span><strong>1 Canal de YouTube</strong> Profesional</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>Video Looper Studio 1080p (1 hora)</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>Whisper Local ilimitado + 60m Cloud</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>Exportación SRT / ASS</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>Subida guiada YouTube API v3</span>
                  </div>
                </div>
              </div>
              <Link
                href="/login?plan=starter"
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                {lang === 'es' ? 'Elegir Starter' : 'Choose Starter'}
              </Link>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="p-6 rounded-2xl border border-purple-500/50 bg-gradient-to-b from-purple-950/40 via-zinc-900 to-[#14141b] flex flex-col justify-between relative shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-black uppercase text-white tracking-wider shadow-md">
                🔥 MÁS POPULAR
              </div>
              <div>
                <div className="flex justify-between items-center mb-3 mt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Pro</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Hasta 3 Canales
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">$100</span>
                    <span className="text-xs text-zinc-400">USD / mes</span>
                  </div>
                  <div className="mt-2 text-[10px] bg-black/50 border border-purple-500/30 rounded p-2 text-zinc-200 space-y-0.5">
                    <p className="text-emerald-400 font-bold">🧠 AutoProd Brain™ 100% GRATIS</p>
                    <p className="text-zinc-300">🪙 2,700 créditos netos mensuales</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-zinc-300 mb-6 border-t border-zinc-800 pt-4">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Incluye:</p>
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold">
                    <span className="text-amber-400 font-bold">⚡</span>
                    <span><strong>Motor Local Completo</strong> (Aceleración GPU CUDA)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>Hasta 3 Canales simultáneos</strong> (Multi-nicho)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>Video Looper 4K (3 hrs) + Batch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>Modo Carpeta Canciones (Whisper)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>180 min Cloud Whisper</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>Memoria Vectorial Semántica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>Programación masiva YouTube API</span>
                  </div>
                </div>
              </div>
              <Link
                href="/login?plan=pro"
                className="w-full py-3 rounded-xl text-center text-xs font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-lg shadow-purple-600/30 transition-opacity"
              >
                {lang === 'es' ? 'Empezar con Plan Pro' : 'Start with Pro Plan'}
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Enterprise</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    👑 Canales Ilimitados
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">$150</span>
                    <span className="text-xs text-zinc-500">USD / mes</span>
                  </div>
                  <div className="mt-2 text-[10px] bg-black/40 border border-zinc-800/80 rounded p-2 text-zinc-300 space-y-0.5">
                    <p className="text-emerald-400 font-bold">🧠 AutoProd Brain™ 100% GRATIS</p>
                    <p className="text-zinc-400">🪙 4,500 créditos netos mensuales</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-zinc-400 mb-6 border-t border-zinc-900 pt-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">Incluye:</p>
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold">
                    <span className="text-amber-400 font-bold">⚡</span>
                    <span><strong>Motor Local Enterprise</strong> (Render masivo)</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span><strong>Canales de YouTube ILIMITADOS</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>Looper 4K 60fps sin compresión</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>500 min Cloud Whisper</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>Swarm de agentes autónomos continuos</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-purple-400">✓</span>
                    <span>Soporte VIP 1 a 1 y Onboarding</span>
                  </div>
                </div>
              </div>
              <Link
                href="/login?plan=enterprise"
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                {lang === 'es' ? 'Elegir Enterprise' : 'Choose Enterprise'}
              </Link>
            </div>
          </div>

          {/* Payment Methods Footer Banner */}
          <div className="mt-12 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-bold text-white">Múltiples métodos de pago habilitados</p>
                <p className="text-[11px] text-zinc-400">
                  Tarjetas de crédito/débito internacionales vía Lemon Squeezy y pagos directos por Nequi, Daviplata o Transferencia Bancolombia con activación en minutos.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded bg-black/60 border border-zinc-800 text-zinc-300 font-mono text-[11px]">Lemon Squeezy</span>
              <span className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">Nequi</span>
              <span className="px-2.5 py-1 rounded bg-yellow-950/40 border border-yellow-500/30 text-yellow-400 font-bold text-[11px]">Bancolombia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">{t.logo}</span>
            <span>© 2026. {t.allRightsReserved}</span>
          </div>
          <div className="flex gap-6">
            <a href="file:///e:/AutoProd/docs/frontend/README.md" className="hover:text-zinc-300 transition-colors">{t.docs}</a>
            <a href="file:///e:/AutoProd/harness/README.md" className="hover:text-zinc-300 transition-colors">{t.harness}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
