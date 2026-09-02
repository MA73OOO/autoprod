'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Language } from "../translations";
import ProfileDropdown from '@/components/dashboard/ProfileDropdown';
import UserSettingsModal from '@/components/dashboard/UserSettingsModal';

interface UserAdmin {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED';
}

interface AccessKey {
  id: string;
  code: string;
  planToGrant: 'PRO' | 'ENTERPRISE';
  status: 'UNUSED' | 'USED';
  usedBy?: string;
  createdAt: string;
}

interface ToolAdmin {
  id: string;
  name: string;
  description: string;
  apiEndpoint: string;
  method: string;
  schema: any;
  createdAt: string;
}

interface ActiveProcess {
  id: string;
  userEmail: string;
  projectTitle: string;
  progress: number;
  status: 'RENDERING' | 'COMPLETED' | 'FAILED';
  source: 'LOCAL' | 'CLOUD';
}

const adminTranslations = {
  es: {
    title: "Consola de Administración",
    statsUsers: "Usuarios Registrados",
    statsSubs: "Suscripciones Activas",
    statsRenders: "Procesos de Render",
    tabUsers: "Usuarios & Suscripciones",
    tabKeys: "Llaves de Acceso (Invitaciones)",
    tabTools: "Herramientas de Agentes",
    tabMonitor: "Monitoreo en Vivo",
    tabPricing: "Tarifas y Capacidades",
    tabLedger: "Libro Mayor",
    newUser: "Crear Usuario",
    generateKey: "Generar Llave",
    code: "Código",
    planToGrant: "Plan a Otorgar",
    status: "Estado",
    actions: "Acciones",
    unused: "Disponible",
    used: "Usado",
    role: "Rol",
    plan: "Plan",
    name: "Nombre",
    active: "Activo",
    suspended: "Suspendido",
    editPlan: "Editar Plan",
    toggleStatus: "Cambiar Estado",
    changeRole: "Cambiar Rol",
    rendering: "Renderizando",
    completed: "Completado",
    failed: "Fallido",
    close: "Cerrar",
    save: "Guardar",
    generateBtn: "Generar Nueva Llave",
    selectPlan: "Seleccionar Plan",
    modalEditUser: "Editar Usuario",
    modalCreateUser: "Crear Nuevo Usuario",
    liveQueue: "Cola de Procesamiento en Tiempo Real",
    progress: "Progreso",
    host: "Servidor",
  },
  en: {
    title: "Admin Console",
    statsUsers: "Registered Users",
    statsSubs: "Active Subscriptions",
    statsRenders: "Rendering Processes",
    tabUsers: "Users & Subscriptions",
    tabKeys: "Access Keys (Invites)",
    tabTools: "Agent Tools",
    tabMonitor: "Live Monitoring",
    tabPricing: "Pricing & Capacities",
    tabLedger: "Ledger",
    newUser: "Create User",
    generateKey: "Generate Key",
    code: "Code",
    planToGrant: "Plan to Grant",
    status: "Status",
    actions: "Actions",
    unused: "Unused",
    used: "Used",
    role: "Role",
    plan: "Plan",
    name: "Name",
    active: "Active",
    suspended: "Suspended",
    editPlan: "Edit Plan",
    toggleStatus: "Toggle Status",
    changeRole: "Change Role",
    rendering: "Rendering",
    completed: "Completed",
    failed: "Failed",
    close: "Close",
    save: "Save",
    generateBtn: "Generate New Key",
    selectPlan: "Select Plan",
    modalEditUser: "Edit User",
    modalCreateUser: "Create New User",
    liveQueue: "Real-time Processing Queue",
    progress: "Progress",
    host: "Host",
  }
};

export default function AdminDashboard() {
  const [lang, setLang] = useState<Language>('es');
  const [activeTab, setActiveTab] = useState<'users' | 'keys' | 'tools' | 'monitor' | 'pricing' | 'ledger'>('tools');

  // Load language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('autoprod_lang') as Language;
    if (savedLang === 'es' || savedLang === 'en') {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'es' ? 'en' : 'es';
    setLang(nextLang);
    localStorage.setItem('autoprod_lang', nextLang);
  };

  const t = adminTranslations[lang];

  // 1. Users State
  const [users, setUsers] = useState<UserAdmin[]>([
    { id: 'u1', name: 'Mateo Orangél', email: 'mateo@autoprod.io', role: 'ADMIN', plan: 'ENTERPRISE', status: 'ACTIVE' },
    { id: 'u2', name: 'Juan Pérez', email: 'juan@gmail.com', role: 'USER', plan: 'PRO', status: 'ACTIVE' },
    { id: 'u3', name: 'Sofia Rodríguez', email: 'sofia@demo.com', role: 'USER', plan: 'FREE', status: 'ACTIVE' },
    { id: 'u4', name: 'Carlos López', email: 'carlos@blocked.com', role: 'USER', plan: 'FREE', status: 'SUSPENDED' },
  ]);

  // 2. Access Keys State
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([
    { id: 'k1', code: 'PRO-77A2-99F5', planToGrant: 'PRO', status: 'UNUSED', createdAt: '2026-08-25' },
    { id: 'k2', code: 'ENT-90B1-12C8', planToGrant: 'ENTERPRISE', status: 'USED', usedBy: 'juan@gmail.com', createdAt: '2026-08-24' },
    { id: 'k3', code: 'PRO-1234-ABCD', planToGrant: 'PRO', status: 'UNUSED', createdAt: '2026-08-25' },
  ]);

  // 2.5. Tools State
  const [tools, setTools] = useState<ToolAdmin[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolAdmin | null>(null);
  const [toolForm, setToolForm] = useState({ name: '', description: '', apiEndpoint: '', method: 'POST', schema: '{}' });

  useEffect(() => {
    if (activeTab === 'tools') {
      fetchTools();
    }
  }, [activeTab]);

  const fetchTools = async () => {
    setIsLoadingTools(true);
    try {
      const res = await fetch('/api/admin/tools');
      const data = await res.json();
      if (data.tools) setTools(data.tools);
    } catch (error) {
      console.error("Failed to load tools", error);
    } finally {
      setIsLoadingTools(false);
    }
  };

  const handleSaveTool = async () => {
    try {
      const method = selectedTool ? 'PUT' : 'POST';
      const body = {
        ...toolForm,
        id: selectedTool?.id,
        schema: toolForm.schema
      };
      
      const res = await fetch('/api/admin/tools', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setIsToolModalOpen(false);
        fetchTools();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save tool");
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    try {
      const res = await fetch(`/api/admin/tools?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchTools();
    } catch (e) {
      console.error(e);
    }
  };

  const openToolModal = (tool?: ToolAdmin) => {
    if (tool) {
      setSelectedTool(tool);
      setToolForm({
        name: tool.name,
        description: tool.description || '',
        apiEndpoint: tool.apiEndpoint,
        method: tool.method,
        schema: JSON.stringify(tool.schema, null, 2)
      });
    } else {
      setSelectedTool(null);
      setToolForm({ name: '', description: '', apiEndpoint: 'http://localhost:3000/api/', method: 'POST', schema: '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}' });
    }
    setIsToolModalOpen(true);
  };

  // 3. Active Processes State
  const [renders, setRenders] = useState<ActiveProcess[]>([
    { id: 'r1', userEmail: 'juan@gmail.com', projectTitle: 'Prueba de Rendimiento Next.js 15', progress: 45, status: 'RENDERING', source: 'LOCAL' },
    { id: 'r2', userEmail: 'sofia@demo.com', projectTitle: 'Receta de Tarta de Manzana PWA', progress: 100, status: 'COMPLETED', source: 'LOCAL' },
  ]);

  // Modals controllers
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);

  // New user form state
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', plan: 'FREE' as 'FREE'|'PRO'|'ENTERPRISE', role: 'USER' as 'USER'|'ADMIN' });

  // Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');

  // Simulated User Profile for Admin Panel
  const userProfile = { name: 'Mateo', email: 'mateo@autoprod.io', role: 'ADMIN' };

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) { setGeminiKey(saved); }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setGeminiKey(key);
  };

  // Simulate progress updates for renders
  useEffect(() => {
    const interval = setInterval(() => {
      setRenders(prev =>
        prev.map(r => {
          if (r.status === 'RENDERING') {
            const nextProgress = r.progress + 5;
            return {
              ...r,
              progress: nextProgress >= 100 ? 100 : nextProgress,
              status: nextProgress >= 100 ? 'COMPLETED' : 'RENDERING',
            };
          }
          return r;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // CRUD Actions
  const handleToggleStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u))
    );
  };

  const handleToggleRole = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: u.role === 'USER' ? 'ADMIN' : 'USER' } : u))
    );
  };

  const handleSaveUserEdit = () => {
    if (selectedUser) {
      setUsers(prev => prev.map(u => (u.id === selectedUser.id ? selectedUser : u)));
      setIsEditUserOpen(false);
      setSelectedUser(null);
    }
  };

  const handleCreateUser = () => {
    if (!newUserForm.name || !newUserForm.email) return;
    const created: UserAdmin = {
      id: `u${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      plan: newUserForm.plan,
      status: 'ACTIVE'
    };
    setUsers(prev => [...prev, created]);
    setIsCreateUserOpen(false);
    setNewUserForm({ name: '', email: '', plan: 'FREE', role: 'USER' });
  };

  const handleGenerateKey = (plan: 'PRO' | 'ENTERPRISE') => {
    const prefix = plan === 'PRO' ? 'PRO' : 'ENT';
    const rand = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `${prefix}-${rand()}-${rand()}`;
    const newKey: AccessKey = {
      id: `k${Date.now()}`,
      code: newCode,
      planToGrant: plan,
      status: 'UNUSED',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAccessKeys(prev => [newKey, ...prev]);
  };

  return (
    <div className="h-screen w-screen bg-[#09090b] text-zinc-200 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-zinc-800 bg-[#0f0f12] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              A
            </div>
            <span className="font-bold tracking-tight text-sm text-white">AutoProd Admin</span>
          </Link>
          <span className="h-4 w-[1px] bg-zinc-800" />
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20 uppercase tracking-widest">
            SuperAdmin
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="text-xs font-semibold px-2 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 transition-colors text-zinc-400 hover:text-white"
          >
            {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
          </button>
          
          <div className="flex items-center gap-3 text-xs relative">
            <span className="text-zinc-500">{userProfile.email}</span>
            <ProfileDropdown 
              userProfile={userProfile}
              lang={lang}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              isAdminPage={true}
            />
          </div>
        </div>
      </header>


      {/* Navigation tabs */}
      <div className="flex bg-[#0f0f12] border-b border-zinc-900 px-6 shrink-0">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-xs font-bold transition-all relative ${
            activeTab === 'users' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t.tabUsers}
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-3 text-xs font-bold transition-all relative ${
            activeTab === 'keys' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t.tabKeys}
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'tools' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="h-4 w-4 bg-indigo-500/10 rounded flex items-center justify-center text-[10px]">🤖</span>
          {lang === 'es' ? 'Tools' : 'Tools'}
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-3 text-xs font-bold transition-all relative ${
            activeTab === 'pricing' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t.tabPricing}
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-3 text-xs font-bold transition-all relative ${
            activeTab === 'ledger' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t.tabLedger}
        </button>
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-4 py-3 text-xs font-bold transition-all relative ${
            activeTab === 'monitor' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t.tabMonitor}
        </button>
      </div>

      {/* Main content grid */}
      <main className="flex-1 overflow-y-auto minimal-scrollbar p-6 bg-[#121214]">
        
        {/* Tab 1: Users & Subscriptions List */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-6">
            {/* Main Stats Banner */}
            <section className="bg-[#0c0c0e] border border-zinc-900 rounded-xl px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 shadow-xl">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.statsUsers}</p>
                  <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xl">👤</div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.statsSubs}</p>
                  <p className="text-2xl font-bold text-white mt-1">{users.filter(u => u.plan !== 'FREE').length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xl">💳</div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.statsRenders}</p>
                  <p className="text-2xl font-bold text-white mt-1">{renders.filter(r => r.status === 'RENDERING').length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xl">🎬</div>
              </div>
            </section>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">{t.tabUsers}</h3>
              <button 
                onClick={() => setIsCreateUserOpen(true)}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                + {t.newUser}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-semibold bg-zinc-950">
                    <th className="p-4">{t.name}</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">{t.role}</th>
                    <th className="p-4">{t.plan}</th>
                    <th className="p-4">{t.status}</th>
                    <th className="p-4 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                      <td className="p-4 font-semibold text-white">{u.name}</td>
                      <td className="p-4 text-zinc-400">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.plan === 'ENTERPRISE' ? 'bg-blue-500/10 text-blue-400' :
                          u.plan === 'PRO' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`h-2 w-2 rounded-full inline-block mr-1.5 ${
                          u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        {u.status === 'ACTIVE' ? t.active : t.suspended}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => { setSelectedUser(u); setIsEditUserOpen(true); }}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-semibold transition-colors"
                        >
                          ✏️ {t.editPlan}
                        </button>
                        <button 
                          onClick={() => handleToggleRole(u.id)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-semibold transition-colors"
                        >
                          👤 {t.changeRole}
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-2 py-1 rounded font-semibold transition-colors ${
                            u.status === 'ACTIVE' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          🛑 {t.toggleStatus}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

        {/* Tab 2: Access Keys List & Generator */}
        {activeTab === 'keys' && (
          <div className="grid md:grid-cols-3 gap-8 items-start">
            
            {/* Generate Key Control Panel */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">{t.generateKey}</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleGenerateKey('PRO')}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 rounded-lg text-xs font-bold text-white shadow-md transition-opacity"
                >
                  🚀 {t.generateBtn} (PRO)
                </button>
                <button
                  onClick={() => handleGenerateKey('ENTERPRISE')}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-200 shadow-md transition-colors"
                >
                  👑 {t.generateBtn} (ENTERPRISE)
                </button>
              </div>
            </div>

            {/* Keys Table list */}
            <div className="md:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-zinc-900">
                <h3 className="text-sm font-bold text-white">{t.tabKeys}</h3>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-semibold bg-zinc-950">
                    <th className="p-4">{t.code}</th>
                    <th className="p-4">{t.planToGrant}</th>
                    <th className="p-4">{t.status}</th>
                    <th className="p-4">Info</th>
                  </tr>
                </thead>
                <tbody>
                  {accessKeys.map(k => (
                    <tr key={k.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-white tracking-wider select-all">{k.code}</td>
                      <td className="p-4 text-zinc-400">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          k.planToGrant === 'ENTERPRISE' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {k.planToGrant}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          k.status === 'UNUSED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-850 text-zinc-500'
                        }`}>
                          {k.status === 'UNUSED' ? t.unused : t.used}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500">
                        {k.status === 'USED' ? `Por: ${k.usedBy}` : `Creado: ${k.createdAt}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2.5: Tools Management */}
        {activeTab === 'tools' && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-[#0c0c0e]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-indigo-400">🤖</span> {lang === 'es' ? 'Gestión de Herramientas (Function Calling)' : 'Tool Management (Function Calling)'}
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {lang === 'es' ? 'Estas herramientas se auto-asocian al Orquestador y están disponibles dinámicamente.' : 'These tools auto-link to the Orchestrator and are dynamically available.'}
                </p>
              </div>
              <button 
                onClick={() => openToolModal()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20"
              >
                + {lang === 'es' ? 'Nueva Tool' : 'New Tool'}
              </button>
            </div>
            
            {isLoadingTools ? (
              <div className="p-12 text-center text-zinc-500 text-xs font-mono animate-pulse">Cargando herramientas...</div>
            ) : tools.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs">No hay herramientas registradas.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 font-semibold bg-zinc-950">
                      <th className="p-4 w-48">Tool Name</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 w-32">Method</th>
                      <th className="p-4 w-64">Endpoint</th>
                      <th className="p-4 text-right w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools.map(tool => (
                      <tr key={tool.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-400">{tool.name}</td>
                        <td className="p-4 text-zinc-400 truncate max-w-[300px]" title={tool.description}>{tool.description || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tool.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            {tool.method}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500 font-mono text-[10px] truncate max-w-[200px]" title={tool.apiEndpoint}>
                          {tool.apiEndpoint}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => openToolModal(tool)}
                            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-semibold transition-colors"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteTool(tool.id)}
                            className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded font-semibold transition-colors"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Live Process Monitor */}
        {activeTab === 'monitor' && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-900">
              <h3 className="text-sm font-bold text-white">{t.liveQueue}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-semibold bg-zinc-950">
                    <th className="p-4">User</th>
                    <th className="p-4">Video / Project</th>
                    <th className="p-4">{t.host}</th>
                    <th className="p-4">{t.status}</th>
                    <th className="p-4 w-60">{t.progress}</th>
                  </tr>
                </thead>
                <tbody>
                  {renders.map(r => (
                    <tr key={r.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                      <td className="p-4 font-semibold text-white">{r.userEmail}</td>
                      <td className="p-4 text-zinc-300">{r.projectTitle}</td>
                      <td className="p-4">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
                          {r.source === 'LOCAL' ? 'LOCALHOST (FFmpeg)' : 'CLOUD SERVER'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'RENDERING' ? 'bg-purple-500/10 text-purple-400' :
                          r.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {r.status === 'RENDERING' ? t.rendering : r.status === 'COMPLETED' ? t.completed : t.failed}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                r.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${r.progress}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-zinc-400 w-8 text-right">{r.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Tab 4: Pricing & Capacities */}
      {activeTab === 'pricing' && (
        <div className="flex-1 overflow-y-auto minimal-scrollbar p-6 bg-[#121214]">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">{t.tabPricing}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">Controla cuánto cuesta usar cada modelo (Créditos).</p>
              </div>
              <button className="px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded text-xs font-bold transition-colors">
                + Nueva Tarifa
              </button>
            </div>
            <div className="p-8 text-center text-zinc-500 text-sm">
              <span className="text-2xl mb-2 block">🚧</span>
              Vista en construcción. Conectando con la tabla <b>ServicePricing</b>...
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Ledger */}
      {activeTab === 'ledger' && (
        <div className="flex-1 overflow-y-auto minimal-scrollbar p-6 bg-[#121214]">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-900">
              <h3 className="text-sm font-bold text-white">{t.tabLedger}</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Registro de entradas de dinero (Lemon Squeezy) y salidas (Consumo de IA).</p>
            </div>
            <div className="p-8 text-center text-zinc-500 text-sm">
              <span className="text-2xl mb-2 block">📊</span>
              Vista en construcción. Conectando con <b>PaymentLedger</b> y <b>CreditConsumption</b>...
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Edit User Plan */}
      {isEditUserOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-zinc-900 pb-2">{t.modalEditUser}</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-zinc-500 mb-1">{t.name}</p>
                <p className="font-bold text-white text-sm">{selectedUser.name}</p>
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">{t.plan}</label>
                <select
                  value={selectedUser.plan}
                  onChange={(e) => setSelectedUser({ ...selectedUser, plan: e.target.value as any })}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                onClick={() => { setIsEditUserOpen(false); setSelectedUser(null); }}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-semibold transition-colors"
              >
                {t.close}
              </button>
              <button
                onClick={handleSaveUserEdit}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create User */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-zinc-900 pb-2">{t.modalCreateUser}</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-500 block mb-1">{t.name}</label>
                <input
                  type="text"
                  placeholder="Carlos López"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="carlos@gmail.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">{t.plan}</label>
                <select
                  value={newUserForm.plan}
                  onChange={(e) => setNewUserForm({ ...newUserForm, plan: e.target.value as any })}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">{t.role}</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                onClick={() => setIsCreateUserOpen(false)}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-semibold transition-colors"
              >
                {t.close}
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2.5: Create/Edit Tool */}
      {isToolModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
              <h3 className="font-bold text-white text-sm">
                {selectedTool ? (lang === 'es' ? 'Editar Herramienta' : 'Edit Tool') : (lang === 'es' ? 'Crear Herramienta' : 'Create Tool')}
              </h3>
              <button onClick={() => setIsToolModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto minimal-scrollbar flex-1 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1 font-semibold">Nombre (slug) *</label>
                  <input
                    type="text"
                    placeholder="ej. buscar_video"
                    value={toolForm.name}
                    onChange={(e) => setToolForm({ ...toolForm, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className="w-full bg-[#121214] border border-zinc-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">Sin espacios ni mayúsculas. Solo letras, números y guiones bajos.</p>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1 font-semibold">Método HTTP</label>
                  <select
                    value={toolForm.method}
                    onChange={(e) => setToolForm({ ...toolForm, method: e.target.value })}
                    className="w-full bg-[#121214] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-semibold">API Endpoint (URL) *</label>
                <input
                  type="text"
                  placeholder="https://tu-backend.com/api/..."
                  value={toolForm.apiEndpoint}
                  onChange={(e) => setToolForm({ ...toolForm, apiEndpoint: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-semibold">Descripción (Instrucciones para la IA) *</label>
                <textarea
                  rows={3}
                  placeholder="Explícale a Gemini cuándo y cómo usar esta herramienta..."
                  value={toolForm.description}
                  onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-semibold flex justify-between items-center">
                  <span>Esquema JSON (Zod-compatible) *</span>
                  <a href="https://json-schema.org/learn/getting-started-step-by-step" target="_blank" rel="noreferrer" className="text-indigo-400 text-[10px] hover:underline">Ver Doc JSON Schema</a>
                </label>
                <textarea
                  rows={8}
                  value={toolForm.schema}
                  onChange={(e) => setToolForm({ ...toolForm, schema: e.target.value })}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg p-3 text-emerald-400 font-mono text-[11px] focus:outline-none focus:border-indigo-500 transition-colors"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-900 flex justify-end gap-3 bg-zinc-950">
              <button
                onClick={() => setIsToolModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTool}
                disabled={!toolForm.name || !toolForm.apiEndpoint}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/20 text-xs"
              >
                Guardar Herramienta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Settings */}
      <UserSettingsModal
        isOpen={isSettingsModalOpen}
        lang={lang}
        user={{ name: userProfile.name, email: userProfile.email }}
        onClose={() => setIsSettingsModalOpen(false)}
        isAdminMode={true}
      />

    </div>
  );
}
