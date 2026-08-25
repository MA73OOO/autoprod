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
              href="/dashboard" 
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              {t.login}
            </Link>
            <Link
              href="/dashboard"
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
              href="/dashboard"
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
