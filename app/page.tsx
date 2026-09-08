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
      {/* ── Navigation ── */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <AutoProdLogo className="h-9 w-9 text-purple-500 group-hover:scale-105 transition-transform" />
            <span className="text-lg font-bold tracking-tight text-white">
              AutoProd<span className="text-purple-500">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
            <a href="#sistema" className="hover:text-white transition-colors">{lang === 'es' ? 'El Sistema' : 'The System'}</a>
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/20"
            >
              {t.startFree}
            </Link>
          </div>
        </div>
      </header>

      {/* ── 01: HERO ── */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <AutoProdLogo className="h-24 w-24 sm:h-28 sm:w-28 text-purple-500 drop-shadow-[0_0_25px_rgba(134,41,254,0.4)]" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {t.heroMainHeadline}{" "}
            <span className="text-purple-400">
              {t.heroMainHeadlineHighlight}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-zinc-300 mb-4 max-w-2xl mx-auto">
            {t.heroSubheadline}
          </p>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/25"
            >
              {t.heroCtaPrimary}
            </Link>
            <a
              href="#sistema"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all"
            >
              {t.heroCtaSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* ── 02: EL PROBLEMA (10 Herramientas vs AutoProd) ── */}
      <section id="problema" className="py-20 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              {t.problemTitle}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t.problemSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tradicional */}
            <div className="p-7 rounded-2xl border border-red-500/20 bg-red-950/10 space-y-4">
              <h3 className="text-base font-bold text-red-300">
                {t.compOldHeader}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>{t.compOld1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>{t.compOld2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>{t.compOld3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>{t.compOld4}</span>
                </li>
              </ul>
            </div>

            {/* AutoProd */}
            <div className="p-7 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-4">
              <h3 className="text-base font-bold text-purple-200">
                {t.compNewHeader}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{t.compNew1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{t.compNew2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{t.compNew3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{t.compNew4}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03: LOS 4 PILARES ── */}
      <section id="sistema" className="py-20 border-t border-zinc-900 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              {t.pillarsHeadline}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t.pillarsSubtitle}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 min-h-[440px]">
            {/* 1. CREA */}
            <div
              onMouseEnter={() => setHoveredPillar('creative')}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => setHoveredPillar(hoveredPillar === 'creative' ? null : 'creative')}
              className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${hoveredPillar === 'creative'
                ? 'lg:flex-[2] border-cyan-400 bg-cyan-950/30'
                : 'lg:flex-1 border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
            >
              <div>
                <h3 className="text-2xl font-black text-white mb-1">{t.pillarCreativeTitle}</h3>
                <p className="text-xs text-cyan-400 font-medium mb-4">{t.pillarCreativeSlogan}</p>
              </div>

              {hoveredPillar === 'creative' ? (
                <div className="space-y-3 my-auto">
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <p className="text-xs font-bold text-cyan-300">{t.pillarCreativeF1Title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t.pillarCreativeF1Desc}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <p className="text-xs font-bold text-cyan-300">{t.pillarCreativeF2Title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t.pillarCreativeF2Desc}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 leading-relaxed">{t.pillarCreativePreview}</p>
              )}
            </div>

            {/* 2. PRODUCE */}
            <div
              onMouseEnter={() => setHoveredPillar('production')}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => setHoveredPillar(hoveredPillar === 'production' ? null : 'production')}
              className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${hoveredPillar === 'production'
                ? 'lg:flex-[2] border-purple-400 bg-purple-950/30'
                : 'lg:flex-1 border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
            >
              <div>
                <h3 className="text-2xl font-black text-white mb-1">{t.pillarProductionTitle}</h3>
                <p className="text-xs text-purple-400 font-medium mb-4">{t.pillarProductionSlogan}</p>
              </div>

              {hoveredPillar === 'production' ? (
                <div className="space-y-3 my-auto">
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <p className="text-xs font-bold text-purple-300">{t.pillarProductionF1Title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t.pillarProductionF1Desc}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <p className="text-xs font-bold text-purple-300">{t.pillarProductionF3Title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t.pillarProductionF3Desc}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 leading-relaxed">{t.pillarProductionPreview}</p>
              )}
            </div>

            {/* 3. ANALIZA */}
            <div
              onMouseEnter={() => setHoveredPillar('analytics')}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => setHoveredPillar(hoveredPillar === 'analytics' ? null : 'analytics')}
              className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${hoveredPillar === 'analytics'
                ? 'lg:flex-[2] border-amber-400 bg-amber-950/30'
                : 'lg:flex-1 border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
            >
              <div>
                <h3 className="text-2xl font-black text-white mb-1">{t.pillarAnalyticsTitle}</h3>
                <p className="text-xs text-amber-400 font-medium mb-4">{t.pillarAnalyticsSlogan}</p>
              </div>

              {hoveredPillar === 'analytics' ? (
                <div className="space-y-3 my-auto">
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <p className="text-xs font-bold text-amber-300">{t.pillarAnalyticsF1Title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t.pillarAnalyticsF1Desc}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <p className="text-xs font-bold text-amber-300">{t.pillarAnalyticsF3Title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t.pillarAnalyticsF3Desc}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 leading-relaxed">{t.pillarAnalyticsPreview}</p>
              )}
            </div>

            {/* 4. ESCALA */}
            <div
              onMouseEnter={() => setHoveredPillar('automation')}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => setHoveredPillar(hoveredPillar === 'automation' ? null : 'automation')}
              className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${hoveredPillar === 'automation'
                ? 'lg:flex-[2] border-emerald-400 bg-emerald-950/30'
                : 'lg:flex-1 border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
            >
              <div>
                <h3 className="text-2xl font-black text-white mb-1">{t.pillarAutomationTitle}</h3>
                <p className="text-xs text-emerald-400 font-medium mb-4">{t.pillarAutomationSlogan}</p>
              </div>

              {hoveredPillar === 'automation' ? (
                <div className="space-y-3 my-auto">
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <p className="text-xs font-bold text-emerald-300">{t.pillarAutomationF1Title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t.pillarAutomationF1Desc}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <p className="text-xs font-bold text-emerald-300">{t.pillarAutomationF2Title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t.pillarAutomationF2Desc}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 leading-relaxed">{t.pillarAutomationPreview}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 04: PRODUCCIÓN LOCAL ── */}
      <section id="local" className="py-20 border-t border-zinc-900 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              {t.localTitle}
            </h2>
            <p className="text-base sm:text-lg font-bold text-emerald-400 mb-3">
              {t.localHeadlineHighlight}
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t.localSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-2">
              <h3 className="text-base font-bold text-white">{t.localF1Title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.localF1Desc}</p>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-2">
              <h3 className="text-base font-bold text-white">{t.localF2Title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.localF2Desc}</p>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-2">
              <h3 className="text-base font-bold text-white">{t.localF3Title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.localF3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05: PLANES ── */}
      <section id="planes" className="py-20 border-t border-zinc-900 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              {t.pricingTitle}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t.pricingSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-white">{t.pricingStarterTitle}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {t.pricingStarterBadge}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-white">{t.pricingStarterPrice}</span>
                  <span className="text-xs text-zinc-500 ml-1">{t.pricingBilledMonthly}</span>
                  <p className="text-xs text-zinc-400 mt-1">{t.pricingStarterDesc}</p>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800 pt-4 mb-6">
                  <li>✓ {t.pricingStarterF1}</li>
                  <li>✓ {t.pricingStarterF2}</li>
                  <li>✓ {t.pricingStarterF3}</li>
                  <li>✓ {t.pricingStarterF4}</li>
                  <li>✓ {t.pricingStarterF5}</li>
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
            <div className="p-6 rounded-2xl border border-purple-500/50 bg-purple-950/20 flex flex-col justify-between relative shadow-xl shadow-purple-950/30">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-purple-200">{t.pricingProTitle}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {t.pricingProBadge}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-white">{t.pricingProPrice}</span>
                  <span className="text-xs text-zinc-400 ml-1">{t.pricingBilledMonthly}</span>
                  <p className="text-xs text-zinc-400 mt-1">{t.pricingProDesc}</p>
                </div>
                <ul className="space-y-2 text-xs text-zinc-200 border-t border-zinc-800 pt-4 mb-6">
                  <li>✓ {t.pricingProF1}</li>
                  <li>✓ {t.pricingProF2}</li>
                  <li>✓ {t.pricingProF3}</li>
                  <li>✓ {t.pricingProF4}</li>
                  <li>✓ {t.pricingProF5}</li>
                  <li>✓ {t.pricingProF6}</li>
                </ul>
              </div>
              <Link
                href="/login?plan=pro"
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                {t.pricingProCta}
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-white">{t.pricingEnterpriseTitle}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {t.pricingEnterpriseBadge}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-white">{t.pricingEnterprisePrice}</span>
                  <span className="text-xs text-zinc-500 ml-1">{t.pricingBilledMonthly}</span>
                  <p className="text-xs text-zinc-400 mt-1">{t.pricingEnterpriseDesc}</p>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800 pt-4 mb-6">
                  <li>✓ {t.pricingEnterpriseF1}</li>
                  <li>✓ {t.pricingEnterpriseF2}</li>
                  <li>✓ {t.pricingEnterpriseF3}</li>
                  <li>✓ {t.pricingEnterpriseF4}</li>
                  <li>✓ {t.pricingEnterpriseF5}</li>
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

      {/* ── 06: FAQ & MANIFIESTO ── */}
      <section id="faq" className="py-20 border-t border-zinc-900 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {t.faqTitle}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
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
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {t.manifestoTitle}
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed max-w-xl mx-auto">
              "{t.manifestoDesc}"
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-7 py-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/20"
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
            <a href="#sistema" className="hover:text-white transition-colors">{lang === 'es' ? 'El Sistema' : 'The System'}</a>
            <a href="#planes" className="hover:text-white transition-colors">{lang === 'es' ? 'Planes' : 'Pricing'}</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-bold">{t.login}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
