'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { translations, Language } from '@/app/translations';
import { createClient } from '@/lib/supabase/client';

import UserSettingsModal from '@/components/dashboard/UserSettingsModal';
import ConversationSidebar from '@/components/dashboard/ConversationSidebar';
import Launchpad from '@/components/dashboard/Launchpad';
import ChatPanel from '@/components/dashboard/ChatPanel';
import RightInspector from '@/components/dashboard/RightInspector';

import { Channel, Conversation, Message } from '@/components/dashboard/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMessages(raw: any[]): Message[] {
  return raw.map((m) => ({
    sender: m.sender.toLowerCase() as 'user' | 'gemini',
    text: m.text,
    timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  // ── Language ──
  const [lang, setLang] = useState<Language>('es');
  useEffect(() => {
    const saved = localStorage.getItem('autoprod_lang') as Language;
    if (saved === 'es' || saved === 'en') setLang(saved);
  }, []);
  const toggleLanguage = () => {
    const next: Language = lang === 'es' ? 'en' : 'es';
    setLang(next);
    localStorage.setItem('autoprod_lang', next);
  };
  const t = translations[lang];

  // ── Auth & profile ──
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      let role = 'USER';
      try {
        const res = await fetch('/api/auth/sync', { method: 'POST' });
        if (res.ok) role = (await res.json())?.role ?? 'USER';
      } catch { /* non-fatal */ }
      setUserProfile({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        email: user.email || '',
        role,
      });
    };
    init();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada', { description: 'Vuelve pronto.' });
      setTimeout(() => { router.push('/'); router.refresh(); }, 1200);
    } catch (err: any) {
      toast.error(err.message || 'Error al cerrar sesión');
    }
  };

  // ── Data ──
  const [channels, setChannels] = useState<Channel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<any[]>([]);
  const [geminiKey, setGeminiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) { setGeminiKey(saved); setIsKeySaved(true); }
  }, []);

  useEffect(() => {
    if (!userProfile) return;
    const load = async () => {
      try {
        const [pr, cr, co] = await Promise.all([
          fetch('/api/prompts'),
          fetch('/api/channels'),
          fetch('/api/conversations'),
        ]);
        if (pr.ok) setPromptTemplates(await pr.json());
        if (cr.ok) {
          const ch = await cr.json();
          setChannels(ch);
        }
        if (co.ok) {
          const raw = await co.json();
          const formatted: Conversation[] = raw.map((c: any) => ({
            ...c, messages: formatMessages(c.messages),
          }));
          setConversations(formatted);
          if (formatted.length > 0) setActiveConversationId(formatted[0].id);
          else await createInitialConversation();
        }
      } catch (e) { console.error('load error', e); }
    };
    load();
  }, [userProfile]);

  // ── Navigation ──
  const [activeView, setActiveView] = useState<'home' | 'chat'>('home');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages ?? [];

  // ── Conversation actions ──
  const createInitialConversation = async () => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Nueva conversación' }),
    });
    if (res.ok) {
      const raw = await res.json();
      const conv: Conversation = { ...raw, messages: formatMessages(raw.messages) };
      setConversations([conv]);
      setActiveConversationId(conv.id);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: lang === 'es' ? 'Nueva conversación' : 'New conversation' }),
      });
      if (res.ok) {
        const raw = await res.json();
        const conv: Conversation = { ...raw, messages: formatMessages(raw.messages) };
        setConversations(prev => [conv, ...prev]);
        setActiveConversationId(conv.id);
        setActiveView('chat');
        toast.success(lang === 'es' ? 'Nueva conversación creada' : 'New conversation created');
      }
    } catch { toast.error('Error al crear conversación'); }
  };

  const handleNewConversationWithRole = async (roleType: 'channel' | 'video' | 'script' | 'prompt') => {
    const nameMap: Record<string, string> = { channel: 'crear_canal', video: 'crear_video', script: 'crear_guion', prompt: 'crear_prompt' };
    const template = promptTemplates.find(p => p.name === nameMap[roleType]);

    const FALLBACKS: Record<string, { title: { es: string; en: string }; systemPrompt: string; welcomeText: { es: string; en: string } }> = {
      channel: {
        title: { es: 'Crear Canal 📺', en: 'Create Channel 📺' },
        systemPrompt: 'Eres un especialista en optimización y configuración de canales de YouTube.',
        welcomeText: { es: '¡Hola! Diseñemos la estructura de tu nuevo canal. ¿De qué temática o nicho te gustaría que sea?', en: "Hello! Let's design your new channel. What topic or niche?" },
      },
      video: {
        title: { es: 'Crear Video 🎬', en: 'Create Video 🎬' },
        systemPrompt: 'Eres un experto productor de video para YouTube.',
        welcomeText: { es: '¡Hola! Planifiquemos la estructura para tu nuevo video.', en: "Hello! Let's plan the structure for your new video." },
      },
      script: {
        title: { es: 'Crear Guion 📄', en: 'Create Script 📄' },
        systemPrompt: 'Eres un guionista profesional especializado en videos virales de YouTube.',
        welcomeText: { es: '¡Hola! Redactemos el guion para tu próximo video.', en: "Hello! Let's write the script for your next video." },
      },
      prompt: {
        title: { es: 'Crear Prompt ✨', en: 'Create Prompt ✨' },
        systemPrompt: 'Eres un experto en prompt engineering para producción de contenido de YouTube.',
        welcomeText: { es: '¡Hola! Construyamos un prompt maestro para tu flujo de producción.', en: "Hello! Let's build a master prompt for your production workflow." },
      },
    };

    const fb = FALLBACKS[roleType];
    const title = template?.title ?? (lang === 'es' ? fb.title.es : fb.title.en);
    const systemPrompt = template?.systemPrompt ?? fb.systemPrompt;
    const welcomeText = template?.welcomeText ?? (lang === 'es' ? fb.welcomeText.es : fb.welcomeText.en);

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, systemPrompt, welcomeText }),
      });
      if (res.ok) {
        const raw = await res.json();
        const conv: Conversation = { ...raw, messages: formatMessages(raw.messages) };
        setConversations(prev => [conv, ...prev]);
        setActiveConversationId(conv.id);
        setActiveView('chat');
        toast.success(lang === 'es' ? 'Chat de trabajo inicializado' : 'Workspace chat initialized');
      }
    } catch { toast.error('Error al iniciar el chat de trabajo'); }
  };

  // ── Chat ──
  const [inputPrompt, setInputPrompt] = useState('');
  const [checklist, setChecklist] = useState({ cta: true, timestamps: false, tags: true, saveThumbnail: true });
  const [seoOutput, setSeoOutput] = useState({
    title: 'Aprende Next.js 15 en 10 Minutos - Guía Definitiva de App Router',
    tags: 'nextjs 15, react 19, web development, typescript, tutorial nextjs',
    description: 'En este tutorial aprenderás a dominar Next.js 15 utilizando el App Router.\n\n⏱️ Marcas de tiempo:\n0:00 - Introducción\n2:15 - Configuración inicial\n5:40 - Rutas Dinámicas',
  });

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || !activeConversationId) return;
    const text = inputPrompt;
    setInputPrompt('');
    const tempMsg: Message = { sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: [...c.messages, tempMsg] } : c));

    try {
      const res = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        const userMsg: Message = { sender: 'user', text: data.userMessage.text, timestamp: new Date(data.userMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const geminiMsg: Message = { sender: 'gemini', text: data.geminiMessage.text, timestamp: new Date(data.geminiMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setConversations(prev => prev.map(c => {
          if (c.id !== activeConversationId) return c;
          return { ...c, title: data.conversationTitle, messages: [...c.messages.filter(m => m !== tempMsg), userMsg, geminiMsg] };
        }));
        setSeoOutput({
          title: `Optimizado: ${text.substring(0, 45)}...`,
          tags: 'seo, gemini, autoprod, youtube automation',
          description: `Metadatos generados para: "${text}".\n\n📌 SEO aplicado.${checklist.cta ? '\n\n¡Dale Like y Suscríbete! 👍' : ''}`,
        });
      }
    } catch { toast.error('Error al enviar mensaje'); }
  };

  const handleAssociateChannel = async (channelId: string | null) => {
    try {
      const res = await fetch(`/api/conversations/${activeConversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      if (res.ok) {
        setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, channelId } : c));
        toast.success(lang === 'es' ? 'Canal asociado correctamente' : 'Channel associated successfully');
      }
    } catch { toast.error('Error al asociar canal'); }
  };

  // ── Render simulator ──
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  useEffect(() => {
    if (!isRendering || renderProgress >= 100) return;
    const iv = setInterval(() => setRenderProgress(p => {
      if (p >= 100) { setIsRendering(false); clearInterval(iv); return 100; }
      return p + 5;
    }), 300);
    return () => clearInterval(iv);
  }, [isRendering, renderProgress]);

  // ── Layout resize ──
  const [leftWidth, setLeftWidth] = useState(256);
  const [rightWidth, setRightWidth] = useState(320);

  const makeDragHandler = (
    current: number,
    set: (v: number) => void,
    min: number,
    max: number,
    invert = false,
  ) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const onMove = (mv: MouseEvent) => {
      const delta = mv.clientX - startX;
      set(Math.max(min, Math.min(max, current + (invert ? -delta : delta))));
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-[#09090b] text-zinc-200 flex flex-col font-sans overflow-hidden">

      {/* ── Header ── */}
      <header className="h-12 border-b border-zinc-800 bg-[#0f0f12] flex items-center justify-between px-4 shrink-0">
        <button
          onClick={() => { setActiveView('home'); setActiveConversationId(null); }}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <div className="h-6 w-6 rounded bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">A</div>
          <span className="font-bold tracking-tight text-sm text-white">AutoProd Console</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="text-xs font-semibold px-2 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 transition-colors text-zinc-400 hover:text-white"
          >
            {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
          </button>

          <div className="flex items-center gap-3 text-xs relative">
            <span className="text-zinc-400">{userProfile?.email || 'demo@autoprod.io'}</span>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(o => !o)}
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all"
              >
                {userProfile ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </button>
              {userProfile?.role === 'ADMIN' && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] leading-none" title="Admin">👑</span>
              )}
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 top-10 w-52 rounded-lg bg-[#18181b] border border-zinc-800 p-2 shadow-2xl z-50 text-xs">
                <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white">{t.myAccount}</p>
                    {userProfile?.role === 'ADMIN' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">👑 Admin</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{userProfile?.email}</p>
                </div>
                {userProfile?.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="w-full text-left px-3 py-2 hover:bg-amber-500/10 rounded transition-colors text-amber-400 flex items-center gap-2">
                    🛡️ Panel de Admin
                  </Link>
                )}
                <button onClick={() => { setIsSettingsModalOpen(true); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded transition-colors text-zinc-300 hover:text-white flex items-center gap-2">
                  ⚙️ {t.configGeneral}
                </button>
                <div className="border-t border-zinc-800 mt-1 pt-1">
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded transition-colors">
                    🚪 {t.logout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── 3-column workspace ── */}
      <div className="flex-1 flex overflow-hidden w-full">

        {/* Left sidebar */}
        <aside style={{ width: `${leftWidth}px` }} className="bg-[#0f0f12] shrink-0 overflow-hidden">
          <ConversationSidebar
            lang={lang}
            channels={channels}
            conversations={conversations}
            activeConversationId={activeConversationId}
            activeView={activeView}
            onNewConversation={handleNewConversation}
            onSelectConversation={(id) => { setActiveConversationId(id); setActiveView('chat'); }}
          />
        </aside>

        {/* Resize handle left */}
        <div
          onMouseDown={makeDragHandler(leftWidth, setLeftWidth, 180, 450)}
          className="w-[3px] hover:w-[5px] hover:bg-purple-500/40 active:bg-purple-500 cursor-col-resize h-full transition-all shrink-0 bg-zinc-800/40 relative z-30"
        />

        {/* Center — Launchpad or Chat */}
        <main className="flex-1 flex flex-col bg-[#121214] overflow-hidden">
          {activeView === 'home' ? (
            <Launchpad lang={lang} onSelect={handleNewConversationWithRole} />
          ) : (
            <ChatPanel
              lang={lang}
              messages={messages}
              activeConversation={activeConversation}
              channels={channels}
              activeConversationId={activeConversationId}
              inputPrompt={inputPrompt}
              checklist={checklist}
              onInputChange={setInputPrompt}
              onSend={handleSendMessage}
              onChecklistChange={(key, val) => setChecklist(prev => ({ ...prev, [key]: val }))}
              onAssociateChannel={handleAssociateChannel}
            />
          )}
        </main>

        {/* Resize handle right + Inspector — only in chat view */}
        {activeView === 'chat' && (
          <>
            <div
              onMouseDown={makeDragHandler(rightWidth, setRightWidth, 240, 500, true)}
              className="w-[3px] hover:w-[5px] hover:bg-purple-500/40 active:bg-purple-500 cursor-col-resize h-full transition-all shrink-0 bg-zinc-800/40 relative z-30"
            />
            <aside style={{ width: `${rightWidth}px` }} className="bg-[#0f0f12] shrink-0 overflow-hidden">
              <RightInspector
                lang={lang}
                seoOutput={seoOutput}
                isRendering={isRendering}
                renderProgress={renderProgress}
                onStartRender={() => { setIsRendering(true); setRenderProgress(0); }}
              />
            </aside>
          </>
        )}
      </div>

      {/* Settings modal */}
      <UserSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        lang={lang}
        user={userProfile}
      />
    </div>
  );
}
