'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { translations, Language } from "../translations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import UserSettingsModal from "@/components/dashboard/UserSettingsModal";

interface Message {
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export default function Dashboard() {
  const [lang, setLang] = useState<Language>('es');
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Sesión cerrada', {
        description: 'Vuelve pronto.',
      });

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || 'Error al cerrar sesión');
    }
  };

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

  interface Video {
    id: string;
    name: string;
    status: string;
  }

  interface Channel {
    id: string;
    name: string;
    videos: Video[];
  }

  interface Conversation {
    id: string;
    title: string;
    channelId: string | null;
    messages: Message[];
    createdAt: string;
  }

  // Channels and videos state
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeVideo, setActiveVideo] = useState<string>('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  // Chat/Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Navigation View ('home' is the initial workspace, 'chat' is the chat dashboard)
  const [activeView, setActiveView] = useState<'home' | 'chat'>('home');

  // Prompts from DB
  const [promptTemplates, setPromptTemplates] = useState<any[]>([]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const messages = activeConversation?.messages || [];

  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lang === 'es' ? 'Nueva conversación' : 'New conversation'
        })
      });
      if (res.ok) {
        const newConv = await res.json();
        const formattedConv: Conversation = {
          ...newConv,
          messages: newConv.messages.map((m: any) => ({
            sender: m.sender.toLowerCase() as 'user' | 'gemini',
            text: m.text,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        };
        setConversations(prev => [formattedConv, ...prev]);
        setActiveConversationId(formattedConv.id);
        setActiveView('chat');
        toast.success(lang === 'es' ? 'Nueva conversación creada' : 'New conversation created');
      }
    } catch (err) {
      toast.error('Error al crear conversación');
    }
  };

  const handleNewConversationWithRole = async (roleType: 'channel' | 'video' | 'script') => {
    const templateName = roleType === 'channel' ? 'crear_canal' : roleType === 'video' ? 'crear_video' : 'crear_guion';
    const template = promptTemplates.find(p => p.name === templateName);

    let title = '';
    let systemPrompt = '';
    let welcomeText = '';

    if (template) {
      systemPrompt = template.systemPrompt;
      welcomeText = template.welcomeText || '';
      title = roleType === 'channel' 
        ? (lang === 'es' ? 'Crear Canal 📺' : 'Create Channel 📺')
        : roleType === 'video'
        ? (lang === 'es' ? 'Crear Video 🎬' : 'Create Video 🎬')
        : (lang === 'es' ? 'Crear Guion 📄' : 'Create Script 📄');
    } else {
      // Fallback
      if (roleType === 'channel') {
        title = lang === 'es' ? 'Crear Canal 📺' : 'Create Channel 📺';
        systemPrompt = "Eres un especialista en optimización y configuración de canales de YouTube. Tu labor es guiar al usuario a definir la temática, nicho, logotipo, banner, configuración de subida del canal y SEO básico. Mantén tus respuestas claras y estructuradas.";
        welcomeText = lang === 'es' 
          ? "¡Hola! Soy tu asistente de configuración de canales. Diseñemos la estructura de tu nuevo canal de YouTube. ¿De qué temática o nicho te gustaría que sea?" 
          : "Hello! I am your channel configuration assistant. Let's design the structure of your new YouTube channel. What topic or niche would you like it to be about?";
      } else if (roleType === 'video') {
        title = lang === 'es' ? 'Crear Video 🎬' : 'Create Video 🎬';
        systemPrompt = "Eres un experto productor de video para YouTube. Tu labor es ayudar a planificar la producción del video, la estructura de carpetas (videos, musica, ambiente, miniatura) y guiar al usuario para compilar los recursos necesarios para el script de renderizado local. Mantén tus respuestas en un formato instruccional.";
        welcomeText = lang === 'es'
          ? "¡Hola! Planifiquemos la estructura y recursos para tu nuevo video. Define el título general y te guiaré para organizar tus carpetas locales (Música, Ambiente, Miniatura, Videos)."
          : "Hello! Let's plan the structure and resources for your new video. Define the general title and I will guide you to organize your local folders (Music, Ambient, Thumbnail, Videos).";
      } else if (roleType === 'script') {
        title = lang === 'es' ? 'Crear Guion 📄' : 'Create Script 📄';
        systemPrompt = "Eres un guionista profesional especializado en videos virales de YouTube. Tu labor es escribir guiones estructurados escena por escena en formato Markdown (.md). Ayuda al usuario a estructurar introducciones de gancho, contenido principal dinámico y llamados a la acción efectivos.";
        welcomeText = lang === 'es'
          ? "¡Hola! Redactemos el guion para tu próximo video en formato Markdown. Bríndame la idea general y estructuraremos el contenido por escenas."
          : "Hello! Let's write the script for your next video in Markdown format. Give me the general idea and we will structure the content by scenes.";
      }
    }

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, systemPrompt, welcomeText })
      });
      if (res.ok) {
        const newConv = await res.json();
        const formattedConv: Conversation = {
          ...newConv,
          messages: newConv.messages.map((m: any) => ({
            sender: m.sender.toLowerCase() as 'user' | 'gemini',
            text: m.text,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        };
        setConversations(prev => [formattedConv, ...prev]);
        setActiveConversationId(formattedConv.id);
        setActiveView('chat');
        toast.success(lang === 'es' ? 'Chat de trabajo inicializado' : 'Workspace chat initialized');
      }
    } catch (err) {
      toast.error('Error al iniciar el chat de trabajo');
    }
  };

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
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);

  // Layout Panel Widths (Resizable)
  const [leftWidth, setLeftWidth] = useState(256); // 256px / w-64 default
  const [rightWidth, setRightWidth] = useState(320); // 320px / w-80 default

  const handleLeftMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(450, startWidth + (moveEvent.clientX - startX)));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(240, Math.min(500, startWidth - (moveEvent.clientX - startX)));
      setRightWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Load user session on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Sync user to PostgreSQL database in case they don't exist yet (e.g. database resets)
        try {
          await fetch('/api/auth/sync', { method: 'POST' });
        } catch (err) {
          console.error('Error syncing user session to DB:', err);
        }

        setUserProfile({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || ''
        });
      }
    };
    fetchUser();
  }, [supabase]);

  // Load channels and conversations from database
  useEffect(() => {
    if (!userProfile) return;

    const loadData = async () => {
      try {
        // Load Prompts from database
        const promptsRes = await fetch('/api/prompts');
        if (promptsRes.ok) {
          const promptsData = await promptsRes.json();
          setPromptTemplates(promptsData);
        }

        // Load Channels & Videos
        const channelsRes = await fetch('/api/channels');
        if (channelsRes.ok) {
          const channelsData = await channelsRes.json();
          setChannels(channelsData);
          if (channelsData.length > 0 && channelsData[0].videos?.length > 0) {
            setActiveVideo(channelsData[0].videos[0].id);
          }
        }

        // Load Conversations
        const convsRes = await fetch('/api/conversations');
        if (convsRes.ok) {
          const convsData = await convsRes.json();
          const formattedConvs = convsData.map((c: any) => ({
            ...c,
            messages: c.messages.map((m: any) => ({
              sender: m.sender.toLowerCase(),
              text: m.text,
              timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          }));
          setConversations(formattedConvs);
          if (formattedConvs.length > 0) {
            setActiveConversationId(formattedConvs[0].id);
          } else {
            // Auto-create initial conversation if empty
            await createInitialConversation();
          }
        }
      } catch (err) {
        console.error('Error loading initial dashboard data:', err);
      }
    };

    const createInitialConversation = async () => {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Nueva conversación' })
        });
        if (res.ok) {
          const newConv = await res.json();
          const formattedConv = {
            ...newConv,
            messages: newConv.messages.map((m: any) => ({
              sender: m.sender.toLowerCase(),
              text: m.text,
              timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          };
          setConversations([formattedConv]);
          setActiveConversationId(formattedConv.id);
        }
      } catch (err) {
        console.error('Error creating initial conversation:', err);
      }
    };

    loadData();
  }, [userProfile]);

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

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || !activeConversationId) return;

    const currentPrompt = inputPrompt;
    setInputPrompt('');

    // Optimistically add user message to UI
    const tempUserMsg: Message = {
      sender: 'user',
      text: currentPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setConversations(prev => prev.map(c => 
      c.id === activeConversationId ? { ...c, messages: [...c.messages, tempUserMsg] } : c
    ));

    try {
      const res = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentPrompt })
      });

      if (res.ok) {
        const data = await res.json(); // { userMessage, geminiMessage, conversationTitle }
        
        // Format messages returned from DB
        const formattedUserMsg: Message = {
          sender: 'user',
          text: data.userMessage.text,
          timestamp: new Date(data.userMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const formattedGeminiMsg: Message = {
          sender: 'gemini',
          text: data.geminiMessage.text,
          timestamp: new Date(data.geminiMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
            // Replace the optimistic message with the database ones to match server-side timestamp
            const cleanedMessages = c.messages.filter(m => m !== tempUserMsg);
            return {
              ...c,
              title: data.conversationTitle,
              messages: [...cleanedMessages, formattedUserMsg, formattedGeminiMsg]
            };
          }
          return c;
        }));

        // Mock output update based on input
        setSeoOutput({
          title: `Optimizado / Optimized: ${currentPrompt.substring(0, 45)}...`,
          tags: 'seo, gemini, autoprod, render, youtube automation, tailwind, backend',
          description: lang === 'es'
            ? `Metadatos generados dinámicamente para: "${currentPrompt}".\n\n📌 Recomendaciones SEO aplicadas.\n\n${checklist.cta ? 'Recuerda dar Like y Suscribirte al canal para más contenido.' : ''}`
            : `Metadata dynamically generated for: "${currentPrompt}".\n\n📌 SEO recommendations applied.\n\n${checklist.cta ? 'Remember to Like and Subscribe to the channel for more content.' : ''}`
        });
      }
    } catch (err) {
      toast.error('Error al enviar mensaje');
    }
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
          <button
            onClick={() => {
              setActiveView('home');
              setActiveConversationId(null);
            }}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              A
            </div>
            <span className="font-bold tracking-tight text-sm text-white">AutoProd Console</span>
          </button>
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
            <span className="text-zinc-400">{userProfile?.email || 'demo@autoprod.io'}</span>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all animate-none"
            >
              {userProfile ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-10 w-48 rounded-lg bg-[#18181b] border border-zinc-800 p-2 shadow-2xl z-50 text-xs">
                <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                  <p className="font-bold text-white">{t.myAccount}</p>
                  <p className="text-[10px] text-zinc-500">{userProfile?.email || 'demo@autoprod.io'}</p>
                </div>
                <button
                  onClick={() => { setIsSettingsModalOpen(true); setIsProfileOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded transition-colors text-zinc-300 hover:text-white flex items-center gap-2"
                >
                  ⚙️ {t.configGeneral}
                </button>
                <div className="border-t border-zinc-800 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded transition-colors cursor-pointer"
                  >
                    🚪 {t.logout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Area (3 Columns Layout) */}
      <div className="flex-1 flex overflow-hidden w-full">

        {/* Column 1: Left Navigation & Resources */}
        <aside
          style={{ width: `${leftWidth}px` }}
          className="bg-[#0f0f12] flex flex-col overflow-y-auto p-4 gap-6 shrink-0"
        >

          {/* New Conversation Button */}
          <button
            onClick={handleNewConversation}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 rounded-lg text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            💬 {lang === 'es' ? 'Nueva Conversación' : 'New Conversation'}
          </button>

          {/* Conversations History */}
          <div className="space-y-2 shrink-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {lang === 'es' ? 'Historial de Chats' : 'Chat History'}
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setActiveView('chat');
                  }}
                  className={`w-full text-left py-2 px-2.5 rounded-lg text-xs transition-all flex flex-col gap-1 ${
                    activeView === 'chat' && activeConversationId === conv.id
                      ? 'bg-zinc-800 text-purple-400 font-semibold border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <span className="truncate w-full font-medium text-left">{conv.title}</span>
                  <div className="flex justify-between items-center w-full text-[9px] text-zinc-600 font-mono">
                    <span>{conv.createdAt}</span>
                    {conv.channelId && (
                      <span className="text-[8px] px-1 py-0.2 bg-purple-500/10 text-purple-400 rounded">
                        {channels.find(ch => ch.id === conv.channelId)?.name || 'Canal'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {channels.length > 0 && (
            <>
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
                        {channel.videos.map(video => (
                          <button
                            key={video.id}
                            onClick={() => setActiveVideo(video.id)}
                            className={`w-full text-left py-1 px-2 rounded text-xs transition-colors flex justify-between items-center ${activeVideo === video.id
                              ? 'bg-purple-500/10 text-purple-400 font-semibold'
                              : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                          >
                            <span className="truncate">{video.name}</span>
                            <span className={`h-1.5 w-1.5 rounded-full ${video.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Resize Handle Left */}
        <div
          onMouseDown={handleLeftMouseDown}
          className="w-[3px] hover:w-[5px] hover:bg-purple-500/40 active:bg-purple-500 cursor-col-resize h-full transition-all shrink-0 bg-zinc-800/40 relative z-30"
          title="Arrastra para cambiar el tamaño"
        />

        {/* Column 2: Center (Chat & Prompt Interceptor) */}
        <main className="flex-1 flex flex-col bg-[#121214] overflow-hidden">

          {activeView === 'home' ? (
            /* Home Launchpad View */
            <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-center items-center max-w-4xl mx-auto w-full space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {lang === 'es' ? 'Consola de Creación AutoProd' : 'AutoProd Creation Console'}
                </h2>
                <p className="text-xs text-zinc-400 max-w-md">
                  {lang === 'es'
                    ? 'Selecciona una base de trabajo rápida para comenzar a planificar tus contenidos.'
                    : 'Select a quick launchpad workspace to start planning your contents.'}
                </p>
                         {/* Card 1: Crear Canal */}
                <div
                  onClick={() => handleNewConversationWithRole('channel')}
                  className="bg-[#18181b]/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 hover:bg-[#18181b] transition-all group shadow-lg cursor-pointer animate-none"
                >
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-lg text-purple-400 group-hover:scale-110 transition-transform">
                      📺
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">
                        {lang === 'es' ? 'Crear Canal' : 'Create Channel'}
                      </h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        {lang === 'es'
                          ? 'Configura un nuevo canal de YouTube y prepáralo para integraciones de subida.'
                          : 'Set up a new YouTube channel and prepare it for upload integrations.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Crear Video */}
                <div
                  onClick={() => handleNewConversationWithRole('video')}
                  className="bg-[#18181b]/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 hover:bg-[#18181b] transition-all group shadow-lg cursor-pointer animate-none"
                >
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-lg text-purple-400 group-hover:scale-110 transition-transform">
                      🎬
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">
                        {lang === 'es' ? 'Crear Video' : 'Create Video'}
                      </h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        {lang === 'es'
                          ? 'Planifica una nueva producción de video, define recursos y renders locales.'
                          : 'Plan a new video production, define assets and local renders.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Crear Guion */}
                <div
                  onClick={() => handleNewConversationWithRole('script')}
                  className="bg-[#18181b]/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 hover:bg-[#18181b] transition-all group shadow-lg cursor-pointer animate-none"
                >
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-lg text-purple-400 group-hover:scale-110 transition-transform">
                      📄
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">
                        {lang === 'es' ? 'Crear Guion' : 'Create Script'}
                      </h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        {lang === 'es'
                          ? 'Redacta el guion o guías estructuradas usando tu co-pilot de inteligencia artificial.'
                          : 'Draft script details or structured guides using your AI co-pilot.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 4: Estadísticas de YouTube */}
                <div
                  onClick={() => toast.info(lang === 'es' ? 'Métricas de canal próximamente...' : 'Channel analytics coming soon...')}
                  className="bg-[#18181b]/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/30 hover:bg-[#18181b]/60 transition-all group shadow-lg cursor-pointer opacity-75 hover:opacity-100 relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold rounded-full uppercase tracking-wider">
                    {lang === 'es' ? 'Pronto' : 'Soon'}
                  </div>
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-600/5 border border-purple-500/10 flex items-center justify-center text-lg text-purple-400/80 group-hover:scale-110 transition-transform">
                      📈
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                        {lang === 'es' ? 'YouTube Stats' : 'YouTube Stats'}
                      </h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        {lang === 'es'
                          ? 'Analiza el rendimiento e historial de tu canal para guiar las propuestas de la IA.'
                          : 'Analyze your channel performance and history to guide new AI creative recommendations.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 6: Edición Automática */}
                <div
                  onClick={() => toast.info(lang === 'es' ? 'Edición automática próximamente...' : 'Automatic editing coming soon...')}
                  className="bg-[#18181b]/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/30 hover:bg-[#18181b]/60 transition-all group shadow-lg cursor-pointer opacity-75 hover:opacity-100 relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold rounded-full uppercase tracking-wider">
                    {lang === 'es' ? 'Pronto' : 'Soon'}
                  </div>
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-600/5 border border-purple-500/10 flex items-center justify-center text-lg text-purple-400/80 group-hover:scale-110 transition-transform">
                      🐍
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                        {lang === 'es' ? 'Edición Automática' : 'Automatic Editing'}
                      </h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        {lang === 'es'
                          ? 'Compila y edita tus videos de forma automatizada uniendo música, ambientes y miniaturas locales.'
                          : 'Automatically compile and edit your videos by joining audio, ambient tracks, and local miniatures.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Chat View */
            <>
              {/* Channel Association Banner */}
              {activeConversation && activeConversation.messages.length <= 1 && (
                <div className="p-4 bg-zinc-950/40 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      📺 {lang === 'es' ? 'Asociar conversación a un Canal' : 'Associate conversation to a Channel'}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {lang === 'es'
                        ? 'Vincula este chat a un canal para segmentar y organizar mejor tus optimizaciones.'
                        : 'Link this chat to a channel to better segment and organize your optimizations.'}
                    </p>
                  </div>
                  <select
                    value={activeConversation.channelId || ''}
                    onChange={async (e) => {
                      const val = e.target.value;
                      try {
                        const res = await fetch(`/api/conversations/${activeConversationId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ channelId: val || null })
                        });
                        if (res.ok) {
                          setConversations(prev => prev.map(c => 
                            c.id === activeConversationId ? { ...c, channelId: val || null } : c
                          ));
                          toast.success(lang === 'es' ? 'Canal asociado correctamente' : 'Channel associated successfully');
                        }
                      } catch (err) {
                        toast.error('Error al asociar canal');
                      }
                    }}
                    className="bg-[#18181b] border border-zinc-800 text-[11px] text-zinc-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer min-w-[150px]"
                  >
                    <option value="">{lang === 'es' ? 'Sin Canal (General)' : 'No Channel (General)'}</option>
                    {channels.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-purple-400 border border-zinc-700'
                      }`}>
                      {msg.sender === 'user' ? 'U' : 'G'}
                    </div>
                    <div className={`rounded-xl p-4 text-sm leading-relaxed ${msg.sender === 'user'
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
            </>
          )}
        </main>

        {/* Resize Handle Right */}
        {activeView === 'chat' && (
          <div
            onMouseDown={handleRightMouseDown}
            className="w-[3px] hover:w-[5px] hover:bg-purple-500/40 active:bg-purple-500 cursor-col-resize h-full transition-all shrink-0 bg-zinc-800/40 relative z-30"
            title="Arrastra para cambiar el tamaño"
          />
        )}

        {/* Column 3: Right Inspector (SEO Results & Rendering Status) */}
        {activeView === 'chat' && (
          <aside
            style={{ width: `${rightWidth}px` }}
            className="bg-[#0f0f12] flex flex-col overflow-y-auto p-4 gap-6 shrink-0"
          >

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
      )}

      </div>

      {/* Settings Modal Dialog */}
      <UserSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        lang={lang}
        user={userProfile}
      />
    </div>
  );
}
