'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, Language } from "../translations";

interface Message {
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export default function Dashboard() {
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

  // Channels and projects state
  const [channels, setChannels] = useState([
    {
      id: 'c1',
      name: 'TechVids Latam',
      projects: [
        { id: 'p1', name: 'Curso Next.js 15 desde Cero', status: 'DRAFT' },
        { id: 'p2', name: 'Supabase vs Firebase en 2026', status: 'PUBLISHED' }
      ]
    },
    {
      id: 'c2',
      name: 'Cocina con IA',
      projects: [
        { id: 'p3', name: 'Recetas Rápidas con Gemini', status: 'DRAFT' }
      ]
    }
  ]);

  const [activeProject, setActiveProject] = useState('p1');
  const [geminiKey, setGeminiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize chat welcome message on language change
  useEffect(() => {
    setMessages([
      { 
        sender: 'gemini', 
        text: t.welcomeChatMsg, 
        timestamp: '12:00' 
      }
    ]);
  }, [lang, t.welcomeChatMsg]);

  const [inputPrompt, setInputPrompt] = useState('');

  // Prompt Interceptor Checklist
  const [checklist, setChecklist] = useState({
    cta: true,
    timestamps: false,
    tags: true,
    saveThumbnail: true
  });

  // Generated SEO metadata output
  const [seoOutput, setSeoOutput] = useState({
    title: 'Aprende Next.js 15 en 10 Minutos - Guía Definitiva de App Router',
    tags: 'nextjs 15, react 19, web development, typescript, tutorial nextjs, supabase integration, vercel',
    description: 'En este tutorial aprenderás a dominar Next.js 15 utilizando las últimas novedades del App Router. Conectaremos base de datos Postgres con Supabase de manera gratuita.\n\n⏱️ Marcas de tiempo:\n0:00 - Introducción\n2:15 - Configuración inicial\n5:40 - Rutas Dinámicas\n8:10 - Despliegue en Vercel\n\n¡No olvides suscribirte y dejar tu like! 👍'
  });

  // Render simulator state
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  // Profile dropdown & Modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'billing' | 'password'>('profile');

  // Load API Key from LocalStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setGeminiKey(savedKey);
      setIsKeySaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('gemini_api_key', geminiKey);
      setIsKeySaved(true);
    } else {
      localStorage.removeItem('gemini_api_key');
      setIsKeySaved(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputPrompt.trim()) return;

    // Simulate prompt interceptor modifying the prompt
    let enrichedPrompt = inputPrompt;
    const requirements = [];
    if (checklist.cta) requirements.push(t.chkCta);
    if (checklist.timestamps) requirements.push(t.chkTimestamps);
    if (checklist.tags) requirements.push(t.chkTags);
    if (checklist.saveThumbnail) requirements.push(t.chkThumbnail);

    if (requirements.length > 0) {
      enrichedPrompt += ` [Checklist: ${requirements.join(', ')}]`;
    }

    const newMsg: Message = {
      sender: 'user',
      text: inputPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputPrompt('');

    // Simulate AI response
    setTimeout(() => {
      const responseText = lang === 'es' 
        ? `Entendido. He optimizado el contenido para tu proyecto utilizando la configuración enriquecida. He actualizado el panel de resultados SEO a la derecha con la información formateada y lista para publicar.`
        : `Understood. I have optimized the content for your project using the enriched configuration. I updated the SEO results panel on the right with the formatted info ready to publish.`;

      const aiResponse: Message = {
        sender: 'gemini',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);

      // Mock output update based on input
      setSeoOutput({
        title: `Optimizado / Optimized: ${inputPrompt.substring(0, 45)}...`,
        tags: 'seo, gemini, autoprod, render, youtube automation, tailwind, backend',
        description: lang === 'es' 
          ? `Metadatos generados dinámicamente para: "${inputPrompt}".\n\n📌 Recomendaciones SEO aplicadas.\n\n${checklist.cta ? 'Recuerda dar Like y Suscribirte al canal para más contenido.' : ''}`
          : `Metadata dynamically generated for: "${inputPrompt}".\n\n📌 SEO recommendations applied.\n\n${checklist.cta ? 'Remember to Like and Subscribe to the channel for more content.' : ''}`
      });
    }, 1500);
  };

  const startLocalRender = () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderProgress(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRendering && renderProgress < 100) {
      interval = setInterval(() => {
        setRenderProgress(prev => {
          if (prev >= 100) {
            setIsRendering(false);
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isRendering, renderProgress]);

  return (
    <div className="h-screen w-screen bg-[#09090b] text-zinc-200 flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-12 border-b border-zinc-800 bg-[#0f0f12] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              A
            </div>
            <span className="font-bold tracking-tight text-sm text-white">AutoProd Console</span>
          </Link>
          <span className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400">Helper Local:</span>
            <span className="text-emerald-400 font-semibold">{t.helperLocalActive}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Toggle in Dashboard Header */}
          <button 
            onClick={toggleLanguage}
            className="text-xs font-semibold px-2 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 transition-colors text-zinc-400 hover:text-white"
          >
            {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
          </button>

          <div className="flex items-center gap-3 text-xs relative">
            <span className="text-zinc-400">demo@autoprod.io</span>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all animate-none"
            >
              D
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 top-10 w-48 rounded-lg bg-[#18181b] border border-zinc-800 p-2 shadow-2xl z-50 text-xs">
                <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                  <p className="font-bold text-white">{t.myAccount}</p>
                  <p className="text-[10px] text-zinc-500">demo@autoprod.io</p>
                </div>
                <button 
                  onClick={() => { setIsSettingsModalOpen(true); setIsProfileOpen(false); }} 
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded transition-colors text-zinc-300 hover:text-white flex items-center gap-2"
                >
                  ⚙️ {t.configGeneral}
                </button>
                <div className="border-t border-zinc-800 mt-1 pt-1">
                  <Link 
                    href="/" 
                    className="w-full block text-left px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded transition-colors"
                  >
                    🚪 {t.logout}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Area (3 Columns Layout) */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* Column 1: Left Navigation & Resources */}
        <aside className="w-64 border-r border-zinc-800 bg-[#0f0f12] flex flex-col overflow-y-auto p-4 gap-6 shrink-0">
          {/* Section: Gemini API Key */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t.geminiKeyTitle}</h4>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-[#18181b] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSaveKey}
                className={`w-full py-1.5 rounded text-xs font-bold transition-all ${
                  isKeySaved 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {isKeySaved ? t.savedKeyBtn : t.saveKeyBtn}
              </button>
            </div>
          </div>

          <span className="h-[1px] bg-zinc-800" />

          {/* Section: Channels and Projects */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t.channelsTitle}</h4>
            <div className="space-y-3">
              {channels.map(channel => (
                <div key={channel.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                    <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    {channel.name}
                  </div>
                  <div className="pl-4 space-y-1 border-l border-zinc-800">
                    {channel.projects.map(proj => (
                      <button
                        key={proj.id}
                        onClick={() => setActiveProject(proj.id)}
                        className={`w-full text-left py-1 px-2 rounded text-xs transition-colors flex justify-between items-center ${
                          activeProject === proj.id 
                            ? 'bg-purple-500/10 text-purple-400 font-semibold' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="truncate">{proj.name}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          proj.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <span className="h-[1px] bg-zinc-800" />

          {/* Section: Templates Manager */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t.activeTemplatesTitle}</h4>
            <div className="space-y-1">
              <div className="text-xs py-1 px-2 rounded hover:bg-zinc-800/50 cursor-pointer text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-2">
                📄 PLANTILLA_DESCRIPCIONES.md
              </div>
              <div className="text-xs py-1 px-2 rounded hover:bg-zinc-800/50 cursor-pointer text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-2">
                📄 PROMPT_OPTIMIZADOR_SEO.md
              </div>
            </div>
          </div>
        </aside>

        {/* Column 2: Center (Chat & Prompt Interceptor) */}
        <main className="flex-1 flex flex-col bg-[#121214] overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                  msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-purple-400 border border-zinc-700'
                }`}>
                  {msg.sender === 'user' ? 'U' : 'G'}
                </div>
                <div className={`rounded-xl p-4 text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-purple-600/10 border border-purple-500/20 text-purple-100' 
                    : 'bg-[#18181b] border border-zinc-800 text-zinc-300'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="text-[10px] text-zinc-500 block mt-2 text-right">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Prompt Control Panel */}
          <div className="p-4 border-t border-zinc-800 bg-[#0f0f12]">
            {/* Prompt Interceptor Checkbox Row */}
            <div className="mb-3 flex flex-wrap items-center gap-4 px-2 py-1.5 bg-[#18181b] border border-zinc-800 rounded-lg text-xs">
              <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px] pr-2 border-r border-zinc-800">
                {t.interceptorTitle}
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={checklist.cta}
                  onChange={(e) => setChecklist(prev => ({ ...prev, cta: e.target.checked }))}
                  className="accent-purple-600"
                />
                {t.chkCta}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={checklist.timestamps}
                  onChange={(e) => setChecklist(prev => ({ ...prev, timestamps: e.target.checked }))}
                  className="accent-purple-600"
                />
                {t.chkTimestamps}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={checklist.tags}
                  onChange={(e) => setChecklist(prev => ({ ...prev, tags: e.target.checked }))}
                  className="accent-purple-600"
                />
                {t.chkTags}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={checklist.saveThumbnail}
                  onChange={(e) => setChecklist(prev => ({ ...prev, saveThumbnail: e.target.checked }))}
                  className="accent-purple-600"
                />
                {t.chkThumbnail}
              </label>
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t.promptPlaceholder}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                {t.sendBtn}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </main>

        {/* Column 3: Right Inspector (SEO Results & Rendering Status) */}
        <aside className="w-80 border-l border-zinc-800 bg-[#0f0f12] flex flex-col overflow-y-auto p-4 gap-6 shrink-0">
          
          {/* Section: Preview Cover (Thumbnail) */}
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

          {/* Section: SEO Outputs (Title, Tags, Desc) */}
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
                <div className="bg-[#18181b] border border-zinc-800 rounded p-2 text-xs text-zinc-300 h-44 overflow-y-auto whitespace-pre-line font-sans select-all leading-relaxed">
                  {seoOutput.description}
                </div>
              </div>
            </div>
          </div>

          <span className="h-[1px] bg-zinc-800" />

          {/* Section: Local Helper Render Panel */}
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
                onClick={startLocalRender}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition-opacity rounded-lg text-xs font-bold text-white shadow-md shadow-purple-500/10"
              >
                {t.startRenderBtn}
              </button>
            )}
            <p className="text-[10px] text-zinc-600 text-center leading-normal">
              {t.renderDisclaimer}
            </p>
          </div>

        </aside>

      </div>

      {/* Settings Modal Dialog */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[450px]">
            {/* Modal Sidebar */}
            <div className="w-full md:w-48 bg-[#0f0f12] border-r border-zinc-800 p-4 flex flex-col gap-1 shrink-0">
              <div className="mb-4 px-2">
                <h3 className="font-bold text-white text-sm">{t.configGeneral}</h3>
                <p className="text-[10px] text-zinc-500">demo@autoprod.io</p>
              </div>

              <button
                onClick={() => setActiveSettingsTab('profile')}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${
                  activeSettingsTab === 'profile'
                    ? 'bg-purple-500/10 text-purple-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                👤 {t.myInfo}
              </button>
              <button
                onClick={() => setActiveSettingsTab('billing')}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${
                  activeSettingsTab === 'billing'
                    ? 'bg-purple-500/10 text-purple-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                💳 {t.billingPlan}
              </button>
              <button
                onClick={() => setActiveSettingsTab('password')}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${
                  activeSettingsTab === 'password'
                    ? 'bg-purple-500/10 text-purple-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                🔑 {t.changePassword}
              </button>

              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="mt-auto w-full py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors text-center"
              >
                {lang === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>

            {/* Modal Content Panel */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col bg-[#121214]">
              {/* Profile Tab */}
              {activeSettingsTab === 'profile' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">{t.myInfo}</h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-zinc-500 block mb-1">{lang === 'es' ? 'Nombre Completo' : 'Full Name'}</label>
                      <input
                        type="text"
                        defaultValue="Mateo Orangél"
                        className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">{lang === 'es' ? 'Correo Electrónico' : 'Email Address'}</label>
                      <input
                        type="email"
                        disabled
                        value="demo@autoprod.io"
                        className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-zinc-500 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => alert(lang === 'es' ? 'Datos guardados correctamente.' : 'Data saved successfully.')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors"
                    >
                      {lang === 'es' ? 'Guardar Cambios' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeSettingsTab === 'billing' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">{t.billingPlan}</h4>
                  <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{lang === 'es' ? 'Plan Actual: Gratuito' : 'Current Plan: Free'}</p>
                        <p className="text-[10px] text-zinc-500">{lang === 'es' ? 'Límite de 5 canales integrados' : 'Up to 5 integrated channels'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 text-[10px]">
                        $0 / USD
                      </span>
                    </div>
                    <div className="border-t border-zinc-800 pt-3">
                      <p className="text-zinc-400 mb-2 leading-relaxed">
                        {lang === 'es' 
                          ? 'Sube de nivel para conectar canales ilimitados, renderizar más rápido en la nube (opcional) y obtener prompts inteligentes avanzados.' 
                          : 'Upgrade to connect unlimited channels, render faster in the cloud (optional), and unlock advanced smart prompts.'}
                      </p>
                      <button
                        onClick={() => alert('Próximamente... / Coming Soon...')}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 rounded font-bold text-white transition-opacity"
                      >
                        {lang === 'es' ? 'Actualizar a Pro' : 'Upgrade to Pro'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeSettingsTab === 'password' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">{t.changePassword}</h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-zinc-500 block mb-1">{lang === 'es' ? 'Contraseña Actual' : 'Current Password'}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">{lang === 'es' ? 'Nueva Contraseña' : 'New Password'}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">{lang === 'es' ? 'Confirmar Nueva Contraseña' : 'Confirm New Password'}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <button
                      onClick={() => alert(lang === 'es' ? 'Contraseña cambiada correctamente.' : 'Password updated successfully.')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors"
                    >
                      {lang === 'es' ? 'Cambiar Contraseña' : 'Update Password'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
