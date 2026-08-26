'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Language, translations } from '@/app/translations';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  user: { name: string; email: string } | null;
}

export default function UserSettingsModal({ isOpen, onClose, lang, user }: UserSettingsModalProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'commands' | 'profile' | 'billing' | 'password'>('general');
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[450px]">
        {/* Modal Sidebar */}
        <div className="w-full md:w-48 bg-[#0f0f12] border-r border-zinc-800 p-4 flex flex-col gap-1 shrink-0">
          <div className="mb-4 px-2">
            <h3 className="font-bold text-white text-sm">{t.configGeneral}</h3>
            <p className="text-[10px] text-zinc-500">{user?.email || 'demo@autoprod.io'}</p>
          </div>

          <button
            onClick={() => setActiveSettingsTab('general')}
            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${activeSettingsTab === 'general'
              ? 'bg-purple-500/10 text-purple-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
          >
            {lang === 'es' ? 'General' : 'General'}
          </button>
          <button
            onClick={() => setActiveSettingsTab('commands')}
            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${activeSettingsTab === 'commands'
              ? 'bg-purple-500/10 text-purple-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
          >
            {lang === 'es' ? 'Comandos' : 'Commands'}
          </button>
          <button
            onClick={() => setActiveSettingsTab('profile')}
            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${activeSettingsTab === 'profile'
              ? 'bg-purple-500/10 text-purple-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
          >
            {t.myInfo}
          </button>
          <button
            onClick={() => setActiveSettingsTab('billing')}
            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${activeSettingsTab === 'billing'
              ? 'bg-purple-500/10 text-purple-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
          >
            {t.billingPlan}
          </button>
          <button
            onClick={() => setActiveSettingsTab('password')}
            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${activeSettingsTab === 'password'
              ? 'bg-purple-500/10 text-purple-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
          >
            {t.changePassword}
          </button>

          <button
            onClick={onClose}
            className="mt-auto w-full py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors text-center cursor-pointer"
          >
            {lang === 'es' ? 'Cerrar' : 'Close'}
          </button>
        </div>

        {/* Modal Content Panel */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col bg-[#121214]">
          {/* General Tab */}
          {activeSettingsTab === 'general' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">
                {lang === 'es' ? 'Configuración General' : 'General Settings'}
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-500 block mb-1">
                    {lang === 'es' ? 'Puerto del Motor (Predeterminado: 8000)' : 'Motor Port (Default: 8000)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      id="motorPortInput"
                      defaultValue={typeof window !== 'undefined' ? localStorage.getItem('autoprod_motor_port') || '8000' : '8000'}
                      placeholder="8000"
                      className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => {
                        const val = (document.getElementById('motorPortInput') as HTMLInputElement)?.value;
                        if (val && typeof window !== 'undefined') {
                          localStorage.setItem('autoprod_motor_port', val);
                          toast.success(lang === 'es' ? 'Puerto guardado' : 'Port saved');
                          // Simple reload to reconnect
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {lang === 'es' ? 'Guardar Puerto' : 'Save Port'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commands Tab */}
          {activeSettingsTab === 'commands' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">
                {lang === 'es' ? 'Comandos y Atajos' : 'Commands & Shortcuts'}
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between bg-[#18181b] border border-zinc-800 rounded p-3">
                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">
                      {lang === 'es' ? 'Atajo Vista Previa (Markdown)' : 'Markdown Preview Shortcut'}
                    </label>
                    <p className="text-zinc-500 text-[10px]">
                      {lang === 'es' ? 'Alterna entre vista previa y edición con Ctrl+Shift+V' : 'Toggle between preview and edit mode with Ctrl+Shift+V'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={typeof window !== 'undefined' ? localStorage.getItem('autoprod_md_shortcuts_enabled') !== 'false' : true}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        const isEnabled = localStorage.getItem('autoprod_md_shortcuts_enabled') !== 'false';
                        localStorage.setItem('autoprod_md_shortcuts_enabled', (!isEnabled).toString());
                        toast.success(lang === 'es' ? 'Atajos actualizados' : 'Shortcuts updated');
                        // Simple re-render trigger by updating local variable or reloading
                        window.location.reload();
                      }
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      (typeof window !== 'undefined' ? localStorage.getItem('autoprod_md_shortcuts_enabled') !== 'false' : true) ? 'bg-purple-600' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        (typeof window !== 'undefined' ? localStorage.getItem('autoprod_md_shortcuts_enabled') !== 'false' : true) ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeSettingsTab === 'profile' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">{t.myInfo}</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-500 block mb-1">
                    {lang === 'es' ? 'Nombre Completo' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    key={user?.name}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1">
                    {lang === 'es' ? 'Correo Electrónico' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-zinc-500 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <button
                  onClick={() =>
                    toast.success(
                      lang === 'es'
                        ? 'Datos guardados correctamente.'
                        : 'Data saved successfully.'
                    )
                  }
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors cursor-pointer"
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
                    <p className="font-bold text-white">
                      {lang === 'es' ? 'Plan Actual: Gratuito' : 'Current Plan: Free'}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {lang === 'es' ? 'Límite de 5 canales integrados' : 'Up to 5 integrated channels'}
                    </p>
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
                    onClick={() => toast.info(lang === 'es' ? 'Próximamente...' : 'Coming Soon...')}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 rounded font-bold text-white transition-opacity cursor-pointer"
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
                  <label className="text-zinc-500 block mb-1">
                    {lang === 'es' ? 'Contraseña Actual' : 'Current Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1">
                    {lang === 'es' ? 'Nueva Contraseña' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1">
                    {lang === 'es' ? 'Confirmar Nueva Contraseña' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#18181b] border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={() =>
                    toast.success(
                      lang === 'es'
                        ? 'Contraseña cambiada correctamente.'
                        : 'Password updated successfully.'
                    )
                  }
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors cursor-pointer"
                >
                  {lang === 'es' ? 'Cambiar Contraseña' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
