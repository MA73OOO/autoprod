'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { translations, Language } from '@/app/translations';
import { createClient } from '@/lib/supabase/client';
import { ControladorClient } from '@/lib/controlador-client';

import UserSettingsModal from '@/components/dashboard/UserSettingsModal';
import ConversationSidebar from '@/components/dashboard/ConversationSidebar';
import Launchpad from '@/components/dashboard/Launchpad';
import ChatPanel from '@/components/dashboard/ChatPanel';
import FilePreviewer from '@/components/dashboard/FilePreviewer';
import WorkspaceModal from '@/components/dashboard/WorkspaceModal';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import MarkdownEditor from '@/components/dashboard/MarkdownEditor';
import CreditCounter from '@/components/dashboard/CreditCounter';

import { Conversation, Message } from '@/components/dashboard/types';
import { FileNode } from '@/components/dashboard/FileTree';

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
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; role: string; maxChannels: number } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // ── Workspace State ──
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [workspaceTree, setWorkspaceTree] = useState<FileNode[]>([]);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [modalParentPath, setModalParentPath] = useState<string | null>(null);
  const [creationMode, setCreationMode] = useState<'channel' | 'video' | null>(null);
  const [motorStatus, setMotorStatus] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadWorkspaceTree = async (path: string) => {
    try {
      const data = await ControladorClient.getWorkspace(path);
      setWorkspaceTree(data.tree || []);
    } catch (error) {
      console.warn("Could not load workspace tree:", error);
    }
  };

  useEffect(() => {
    let treeLoaded = false;
    // Poll Motor Status every 5 seconds
    const checkMotor = async () => {
      const isOnline = await ControladorClient.checkStatus();
      setMotorStatus(isOnline);
      if (isOnline) {
        // Only load tree if we haven't loaded it yet since coming online
        if (!treeLoaded) {
          let savedPath = localStorage.getItem('autoprod_workspace_path');
          if (!savedPath) {
            try {
              const defaultWs = await ControladorClient.getDefaultWorkspace();
              savedPath = defaultWs.path;
              localStorage.setItem('autoprod_workspace_path', savedPath);
              setWorkspacePath(savedPath);
            } catch (e) {
              console.warn("Could not get default workspace path");
            }
          }
          if (savedPath) {
            loadWorkspaceTree(savedPath);
            treeLoaded = true;
          }
        }
      } else {
        treeLoaded = false;
      }
    };
    checkMotor();
    const interval = setInterval(checkMotor, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedPath = localStorage.getItem('autoprod_workspace_path');
    if (savedPath) {
      setWorkspacePath(savedPath);
      if (motorStatus) loadWorkspaceTree(savedPath);
    }
  }, [motorStatus]);

  const handleLinkWorkspace = (path: string) => {
    localStorage.setItem('autoprod_workspace_path', path);
    setWorkspacePath(path);
    loadWorkspaceTree(path);
    toast.success('Ruta maestra vinculada');
  };

  const handleCreateNode = async (parentPath: string, folderName: string, subfolders: string[]) => {
    try {
      await ControladorClient.createFolder(parentPath, folderName, subfolders);
      if (workspacePath) {
        loadWorkspaceTree(workspacePath);
      }
    } catch (error) {
      alert("Error al crear carpeta");
    }
  };

  const handleCreateChannel = async (basePath: string, channelName: string, folders: string[]) => {
    const toastId = toast.loading('Creando estructura...');
    try {
      await ControladorClient.initVideoWorkspace(basePath, channelName, "Estructura_Base", folders);
      toast.success('Estructura de canal creada correctamente', { id: toastId });
      if (workspacePath) loadWorkspaceTree(workspacePath);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      let role = 'USER';
      let maxChannels = 1;
      try {
        const res = await fetch('/api/auth/sync', { method: 'POST' });
        if (res.ok && active) {
          const syncData = await res.json();
          role = syncData?.role ?? 'USER';
          maxChannels = syncData?.user?.maxChannels ?? 1;
        }
      } catch { /* non-fatal */ }
      if (active) {
        setUserProfile({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          role,
          maxChannels,
        });
      }
    };
    init();
    return () => { active = false; };
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

  // ── Navigation State ──
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'editor'>('home');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeEditorPath, setActiveEditorPath] = useState<string | null>(null);

  // ── Data State ──
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<any[]>([]);
  const [geminiKey, setGeminiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [loadedConversations, setLoadedConversations] = useState<Record<string, boolean>>({});

  // ── Derived Variables ──
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages ?? [];
  const channels = workspaceTree.map(node => ({ id: node.name, name: node.name }));

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) { setGeminiKey(saved); setIsKeySaved(true); }
  }, []);

  useEffect(() => {
    if (!userProfile) return;
    let active = true;
    const load = async () => {
      try {
        const [pr, co] = await Promise.all([
          fetch('/api/prompts'),
          fetch('/api/conversations'),
        ]);
        if (!active) return;
        if (pr.ok) setPromptTemplates(await pr.json());
        if (co.ok) {
          const raw = await co.json();
          const formatted: Conversation[] = raw.map((c: any) => ({
            ...c,
            messages: [], // Initialize empty for lazy loading
          }));
          setConversations(formatted);
          if (formatted.length > 0) {
            setActiveConversationId(formatted[0].id);
          } else {
            await createInitialConversation();
          }
        }
      } catch (e) { console.error('load error', e); }
    };
    load();
    return () => { active = false; };
  }, [userProfile]);

  // ── Lazy Load Messages Effect ──
  useEffect(() => {
    if (!activeConversationId) return;

    // Check if we already loaded or are currently loading this conversation
    if (loadedConversations[activeConversationId]) return;

    const fetchMessages = async () => {
      // Mark as loaded before fetching to prevent concurrent requests for the same ID
      setLoadedConversations(prev => ({ ...prev, [activeConversationId]: true }));
      try {
        const res = await fetch(`/api/conversations/${activeConversationId}/messages`);
        if (res.ok) {
          const rawMessages = await res.json();
          const formatted = formatMessages(rawMessages);
          setConversations(prev => prev.map(c =>
            c.id === activeConversationId ? { ...c, messages: formatted } : c
          ));
        } else {
          // If failed, reset state so it can be retried if clicked again
          setLoadedConversations(prev => ({ ...prev, [activeConversationId]: false }));
        }
      } catch (err) {
        console.error('Error lazy loading messages:', err);
        setLoadedConversations(prev => ({ ...prev, [activeConversationId]: false }));
      }
    };
    fetchMessages();
  }, [activeConversationId]);

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

  const confirmDeleteConversation = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setActiveView('home');
        }
        toast.success(lang === 'es' ? 'Conversación eliminada' : 'Conversation deleted');
      } else {
        toast.error('Error al eliminar conversación');
      }
    } catch {
      toast.error('Error al eliminar conversación');
    }
    setDeleteTargetId(null);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
        toast.success(lang === 'es' ? 'Nombre actualizado' : 'Name updated');
      } else {
        toast.error('Error al renombrar');
      }
    } catch {
      toast.error('Error al renombrar');
    }
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
  const [isGeneratingGlobal, setIsGeneratingGlobal] = useState(false);
  const [messageQueue, setMessageQueue] = useState<{text: string, conversationId: string, agentSlug?: string}[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Estado para el Preview del Arnés
  const [actionPreview, setActionPreview] = useState<{
    endpoint: string;
    content: string;
    agent: string;
    stepName: string;
  } | null>(null);

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // ── Credit Confirmation State ──
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [pendingChatMessage, setPendingChatMessage] = useState<{ customText?: string, agentSlug?: string } | null>(null);
  const [dontAskCreditAgain, setDontAskCreditAgain] = useState(false);


  const [inputPrompt, setInputPrompt] = useState('');
  const [checklist, setChecklist] = useState({ cta: true, timestamps: false, tags: true, saveThumbnail: true });
  const [seoOutput, setSeoOutput] = useState({
    title: 'Aprende Next.js 15 en 10 Minutos - Guía Definitiva de App Router',
    tags: 'nextjs 15, react 19, web development, typescript, tutorial nextjs',
    description: 'En este tutorial aprenderás a dominar Next.js 15 utilizando el App Router.\n\n⏱️ Marcas de tiempo:\n0:00 - Introducción\n2:15 - Configuración inicial\n5:40 - Rutas Dinámicas',
  });

  const handleSendMessage = async (customText?: string, agentSlug?: string) => {
    const textToSend = customText ?? inputPrompt;
    const conversationId = activeConversationId;
    
    if (!textToSend.trim() || !conversationId) return;

    if (!customText) {
      setInputPrompt('');
    }

    if (isGeneratingGlobal) {
      const tempMsg: Message = { sender: 'user', text: textToSend, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isTemp: true, isQueued: true };
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, tempMsg] } : c));
      setMessageQueue(prev => [...prev, { text: textToSend, conversationId, agentSlug }]);
      return;
    }

    setIsGeneratingGlobal(true);
    const text = textToSend;
    const tempMsg: Message = { sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isTemp: true };
    
    try {
      // 1. Obtener el modelo y deducir el proveedor seleccionado
      const model = typeof window !== 'undefined' ? localStorage.getItem('autoprod_ai_model') || 'default' : 'default';
      
      let provider = 'gemini';
      let actualModel = model;
      let friendlyModelName = 'AI Model';
      const firstColonIndex = model.indexOf(':');
      if (firstColonIndex !== -1) {
        provider = model.substring(0, firstColonIndex);
        actualModel = model.substring(firstColonIndex + 1);
      } else {
        if (model.includes('gpt')) provider = 'openai';
        else if (model.includes('claude')) provider = 'anthropic';
        else if (model.includes('llama')) provider = 'ollama';
      }

      if (provider === 'gemini') {
        const versionMatch = actualModel.match(/gemini-(\d+\.?\d*)/);
        const version = versionMatch ? versionMatch[1] : '';
        if (actualModel.includes('lite')) friendlyModelName = `Gemini ${version} Flash Lite`;
        else if (actualModel.includes('flash')) friendlyModelName = `Gemini ${version} Flash`;
        else if (actualModel.includes('pro')) friendlyModelName = `Gemini ${version} Pro`;
        else friendlyModelName = `Gemini ${actualModel}`;
      }
      if (provider === 'openai') friendlyModelName = actualModel.includes('mini') ? 'GPT-4o Mini' : 'GPT-4o';
      if (provider === 'anthropic') friendlyModelName = 'Claude 3.5 Sonnet';
      if (provider === 'ollama') friendlyModelName = `${actualModel} (Local)`;
      if (provider === 'imagen3') friendlyModelName = 'Imagen 3';
      
      const startTime = Date.now();
      const tempAiMsg: Message = { sender: 'gemini', text: 'Pensando...', timestamp: '', modelName: friendlyModelName, isGenerating: true, isTemp: true };
      
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, tempMsg, tempAiMsg] } : c));

      // 2. Mapear a comando CLI o llamar a API REST Cloud
      let aiResponseText = '';

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        if (provider === 'imagen3') {
          // Motor Local (Imágenes)
          const commandTemplate = 'gemini-cli image "{prompt}"';
          aiResponseText = await ControladorClient.askConsoleAI(text, commandTemplate);
        } else {
          // Motor Texto (Nube o Ollama Local) usando Vercel AI SDK
          // Build history, skipping the first assistant message which is a static UI greeting
          // and should not be sent to the model as it incorrectly primes its behavior.
          const allMessages = activeConversation?.messages || [];
          const firstUserIndex = allMessages.findIndex(m => m.sender === 'user');
          const messagesForApi = firstUserIndex >= 0 ? allMessages.slice(firstUserIndex) : allMessages;
          
          const chatHistory = messagesForApi.map(m => ({
             role: m.sender === 'user' ? 'user' : 'assistant',
             content: m.text
          }));

          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: [...chatHistory, { role: 'user', content: text }], 
              provider,
              model: actualModel,
              workspacePath: workspacePath || '',
              agentSlug,
              confirmCreditUsage: typeof window !== 'undefined' ? localStorage.getItem('autoprod_always_confirm_credits') === 'true' : false
            }),
            signal: abortController.signal
          });

          if (res.status === 402) {
            setIsGeneratingGlobal(false);
            setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, messages: c.messages.filter(m => !m.isTemp) } : c));
            setPendingChatMessage({ customText: textToSend, agentSlug });
            setIsCreditModalOpen(true);
            return;
          }

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error conectando con la IA');
          }

          // Leer headers para el Arnés
          const reqPreview = res.headers.get('X-AutoProd-Requires-Preview') === 'true';
          const agentNameHeader = decodeURIComponent(res.headers.get('X-AutoProd-Agent') || '');
          const stepNameHeader = decodeURIComponent(res.headers.get('X-AutoProd-Step-Name') || '');
          const endpointHeader = decodeURIComponent(res.headers.get('X-AutoProd-Action-Endpoint') || '');

          // Read the JSON response from the AI (non-streaming)
          const data = await res.json();
          aiResponseText = data.text || '';
          
          if (reqPreview) {
            setActionPreview({
              content: aiResponseText,
              agent: agentNameHeader,
              stepName: stepNameHeader,
              endpoint: endpointHeader
            });
          }

          // Update UI with AI response
          setConversations(prev => prev.map(c => {
            if (c.id !== conversationId) return c;
            const newMsgs = [...c.messages];
            newMsgs[newMsgs.length - 1] = { ...tempAiMsg, text: aiResponseText };
            return { ...c, messages: newMsgs };
          }));
        }
      } catch (e: any) {
        if (e.name === 'AbortError') {
          aiResponseText += `\n\n🛑 Proceso cancelado por el usuario.`;
        } else {
          aiResponseText = `❌ Error de IA: ${e.message}. Verifica tus API Keys en Ajustes o si tu motor local está encendido.`;
        }
      }

      const generationTimeMs = Date.now() - startTime;

      // 4. Guardar en Base de Datos (Next.js)
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, checklist, aiResponseText }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const userMsg: Message = { sender: 'user', text: data.userMessage.text, timestamp: new Date(data.userMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const geminiMsg: Message = { 
          sender: 'gemini', 
          text: data.geminiMessage.text, 
          timestamp: new Date(data.geminiMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelName: friendlyModelName,
          generationTimeMs,
          isGenerating: false
        };
        setConversations(prev => prev.map(c => {
          if (c.id !== conversationId) return c;
          // Filtramos los temporales usando isTemp y ponemos los reales
          return { ...c, title: data.conversationTitle, messages: [...c.messages.filter(m => !m.isTemp), userMsg, geminiMsg] };
        }));
        
        // Simular SEO Update si era chat de texto
        if (provider !== 'imagen3') {
          setSeoOutput({
            title: `Optimizado: ${text.substring(0, 45)}...`,
            tags: 'seo, gemini, autoprod, youtube automation',
            description: `Metadatos generados para: "${text}".\n\n📌 SEO aplicado.${checklist.cta ? '\n\n¡Dale Like y Suscríbete! 👍' : ''}`,
          });
        }
      }
    } catch { 
      toast.error('Error al enviar mensaje'); 
      // Revertir mensajes temporales en caso de error fatal
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, messages: c.messages.filter(m => !m.isTemp) } : c));
    } finally {
      setIsGeneratingGlobal(false);
    }
  };

  const handleConfirmCreditUsage = () => {
    if (dontAskCreditAgain) {
      localStorage.setItem('autoprod_always_confirm_credits', 'true');
    }
    setIsCreditModalOpen(false);
    if (pendingChatMessage) {
      handleSendMessage(pendingChatMessage.customText, pendingChatMessage.agentSlug);
      setPendingChatMessage(null);
    }
  };

  useEffect(() => {
    if (!isGeneratingGlobal && messageQueue.length > 0) {
      const nextMsg = messageQueue[0];
      setMessageQueue(prev => prev.slice(1));
      
      // Eliminar el mensaje en cola visualmente antes de enviarlo de verdad
      setConversations(prev => prev.map(c => {
        if (c.id === nextMsg.conversationId) {
          return { ...c, messages: c.messages.filter(m => !(m.isTemp && m.isQueued && m.text === nextMsg.text)) };
        }
        return c;
      }));
      
      handleSendMessage(nextMsg.text, nextMsg.agentSlug);
    }
  }, [isGeneratingGlobal, messageQueue]);

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

  const handleExecutePreview = async () => {
    if (!actionPreview) return;
    
    // Convertir el Súper Prompt a los parámetros requeridos por la ruta simplificada
    let channelName = "Nuevo_Canal";
    const nameMatch = actionPreview.content.match(/Canal[:\-]\s*(.+)/i);
    if (nameMatch && nameMatch[1]) channelName = nameMatch[1].trim().replace(/\s+/g, '_');
    
    toast.loading("Ejecutando switch en la nube...", { id: 'exec-switch' });
    try {
      const res = await fetch(actionPreview.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspacePath,
          channelName,
          superPrompt: actionPreview.content
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("¡Operación completada con éxito!", { id: 'exec-switch' });
        setActionPreview(null);
        if (workspacePath) loadWorkspaceTree(workspacePath);
      } else {
        throw new Error(data.error || "Error al ejecutar");
      }
    } catch (e: any) {
      toast.error(e.message, { id: 'exec-switch' });
    }
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
            <CreditCounter />
            <span className="text-zinc-400 border-l border-zinc-700 pl-3">{userProfile?.email || 'demo@autoprod.io'}</span>

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
            conversations={conversations}
            activeConversationId={activeConversationId}
            activeView={activeView}
            workspacePath={workspacePath}
            workspaceTree={workspaceTree}
            motorStatus={motorStatus}
            onNewConversation={handleNewConversation}
            onSelectConversation={(id) => { setActiveConversationId(id); setActiveView('chat'); }}
            onDeleteConversation={(id) => setDeleteTargetId(id)}
            onRenameConversation={handleRenameConversation}
            onLinkWorkspace={() => {
              setModalParentPath(null);
              setCreationMode(null);
              setIsWorkspaceModalOpen(true);
            }}
            onAddNode={(parentPath, type) => {
              const maxChannels = userProfile?.maxChannels ?? 1;
              if (type === 'channel' && userProfile?.role !== 'ADMIN' && workspaceTree.length >= maxChannels) {
                toast.error(lang === 'es'
                  ? `Límite alcanzado. Tu plan permite un máximo de ${maxChannels} canal(es).`
                  : `Limit reached. Your plan allows a maximum of ${maxChannels} channel(s).`);
                return;
              }
              setModalParentPath(parentPath);
              setCreationMode(type);
              setIsWorkspaceModalOpen(true);
            }}
            onOpenFile={(path) => {
              setActiveEditorPath(path);
              // Do NOT change activeView, just set the path to open the right panel
            }}
          />
        </aside>

        {/* Resize handle left */}
        <div
          onMouseDown={makeDragHandler(leftWidth, setLeftWidth, 180, 450)}
          className="w-[3px] hover:w-[5px] hover:bg-purple-500/40 active:bg-purple-500 cursor-col-resize h-full transition-all shrink-0 bg-zinc-800/40 relative z-30"
        />

        {/* Center — Launchpad or Chat */}
        <main className="flex-1 flex flex-col bg-[#121214] overflow-hidden relative">
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
              isGenerating={isGeneratingGlobal}
              onCancel={cancelGeneration}
              workspacePath={workspacePath}
              onSuccess={() => {
                if (workspacePath) {
                  loadWorkspaceTree(workspacePath);
                }
              }}
            />
          )}

          {/* Action Preview Floating Panel */}
          {actionPreview && (
            <div className="absolute top-4 right-4 w-96 bg-[#18181b] border border-purple-500/50 shadow-2xl rounded-xl flex flex-col overflow-hidden z-40 animate-in slide-in-from-right-8 fade-in">
              <div className="bg-purple-900/30 border-b border-purple-800/40 px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-purple-200">🔍 {actionPreview.agent}</h3>
                  <p className="text-[10px] text-purple-400 font-mono uppercase mt-0.5">{actionPreview.stepName}</p>
                </div>
                <button onClick={() => setActionPreview(null)} className="text-zinc-500 hover:text-white transition-colors">
                  ✕
                </button>
              </div>
              
              <div className="p-4 bg-black/40">
                <p className="text-xs text-zinc-400 mb-2 font-semibold tracking-wide uppercase">Previsualización de Estructura:</p>
                <div className="bg-[#0f0f12] border border-zinc-800 p-3 rounded-lg text-xs font-mono text-zinc-300 h-48 overflow-y-auto whitespace-pre-wrap">
                  {actionPreview.content}
                </div>
              </div>
              
              <div className="p-4 border-t border-zinc-800 bg-[#18181b] flex flex-col gap-2">
                <button 
                  onClick={handleExecutePreview}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all"
                >
                  🚀 Aprobar y Ejecutar en la Nube
                </button>
                <p className="text-[9px] text-center text-zinc-500 leading-tight">
                  Al ejecutar, el orquestador llamará a <strong>{actionPreview.endpoint}</strong> para construir el proyecto y consumirá tokens de Gemini.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Resize handle right + Previewer — only when activeEditorPath is set */}
        {activeEditorPath && (
          <>
            <div
              onMouseDown={makeDragHandler(rightWidth, setRightWidth, 300, 800, true)}
              className="w-[3px] hover:w-[5px] hover:bg-purple-500/40 active:bg-purple-500 cursor-col-resize h-full transition-all shrink-0 bg-zinc-800/40 relative z-30"
            />
            <aside style={{ width: `${rightWidth}px` }} className="bg-[#0f0f12] shrink-0 overflow-hidden flex flex-col">
              <FilePreviewer 
                filePath={activeEditorPath} 
                onClose={() => setActiveEditorPath(null)} 
              />
            </aside>
          </>
        )}
      </div>

      {/* Credit Confirmation Modal */}
      {isCreditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#18181b] border border-purple-500/30 w-[400px] rounded-xl shadow-2xl p-6 relative flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🪙</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {lang === 'es' ? 'Consumo de Créditos AutoProd' : 'AutoProd Credits Usage'}
            </h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              {lang === 'es' 
                ? 'No tienes una API Key personal configurada (BYOK). Esta acción consumirá créditos de la plataforma AutoProd. ¿Deseas continuar?' 
                : "You don't have a personal API Key (BYOK) configured. This action will consume AutoProd platform credits. Do you want to continue?"}
            </p>
            
            <label className="flex items-center gap-2 mb-6 text-sm text-zinc-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={dontAskCreditAgain} 
                onChange={(e) => setDontAskCreditAgain(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-black text-purple-500 focus:ring-purple-500 focus:ring-offset-black"
              />
              {lang === 'es' ? 'No volver a preguntar' : "Don't ask again"}
            </label>

            <div className="flex w-full gap-3">
              <button 
                onClick={() => {
                  setIsCreditModalOpen(false);
                  setPendingChatMessage(null);
                }}
                className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button 
                onClick={handleConfirmCreditUsage}
                className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors shadow-lg shadow-purple-500/20"
              >
                {lang === 'es' ? 'Aceptar' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      <UserSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        lang={lang}
        user={userProfile}
      />

      {/* Workspace Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onLinkWorkspace={handleLinkWorkspace}
        onCreateNode={handleCreateNode}
        parentPath={modalParentPath}
        creationMode={creationMode}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteConversation}
        title={lang === 'es' ? '¿Eliminar conversación?' : 'Delete conversation?'}
        description={lang === 'es'
          ? 'Esta acción no se puede deshacer. Se borrarán todos los mensajes asociados a este chat.'
          : 'This action cannot be undone. All messages associated with this chat will be deleted.'}
      />
    </div>
  );
}
