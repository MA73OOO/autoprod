'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Language } from "../translations";

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
    tabMonitor: "Monitoreo en Vivo",
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
    tabMonitor: "Live Monitoring",
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
  const [activeTab, setActiveTab] = useState<'users' | 'keys' | 'monitor'>('users');

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
          <span className="text-zinc-500 text-xs">mateo@autoprod.io</span>
          <Link href="/dashboard" className="text-xs font-semibold px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors text-zinc-300">
            {lang === 'es' ? 'Volver a Consola' : 'Back to Console'}
          </Link>
        </div>
      </header>

      {/* Main Stats Banner */}
      <section className="bg-[#0c0c0e] border-b border-zinc-900 px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
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

    </div>
  );
}
