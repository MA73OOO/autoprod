'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { translations, Language } from '@/app/translations';

interface ProfileDropdownProps {
  userProfile: { name: string; email: string; role: string } | null;
  lang: Language;
  onOpenSettings: () => void;
  onOpenPlans?: () => void;
  isAdminPage?: boolean;
}

export default function ProfileDropdown({ userProfile, lang, onOpenSettings, onOpenPlans, isAdminPage = false }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const t = translations[lang];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success(lang === 'es' ? 'Sesión cerrada' : 'Logged out', { description: lang === 'es' ? 'Vuelve pronto.' : 'See you soon.' });
      setTimeout(() => { router.push('/'); router.refresh(); }, 1200);
    } catch (err: any) {
      toast.error(err.message || (lang === 'es' ? 'Error al cerrar sesión' : 'Error logging out'));
    }
  };

  const initial = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U';
  const displayEmail = userProfile?.email || 'demo@autoprod.io';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all"
      >
        {initial}
      </button>
      {userProfile?.role === 'ADMIN' && (
        <span className="absolute -top-1.5 -right-1.5 text-[10px] leading-none" title="Admin">👑</span>
      )}

      {isOpen && (
        <div className="absolute right-0 top-10 w-56 rounded-lg bg-[#18181b] border border-zinc-800 p-2 shadow-2xl z-50 text-xs">
          <div className="px-3 py-2 border-b border-zinc-800 mb-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">{t.myAccount || 'Mi Cuenta'}</p>
              {userProfile?.role === 'ADMIN' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">👑 Admin</span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">{displayEmail}</p>
          </div>
          
          {userProfile?.role === 'ADMIN' && !isAdminPage && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="w-full text-left px-3 py-2 hover:bg-amber-500/10 rounded transition-colors text-amber-400 flex items-center gap-2">
              🛡️ Panel de Admin
            </Link>
          )}

          {isAdminPage && (
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded transition-colors text-zinc-300 hover:text-white flex items-center gap-2">
              🛡️ {lang === 'es' ? 'Volver a Consola' : 'Back to Console'}
            </Link>
          )}

          {onOpenPlans && (
            <button 
              onClick={() => { onOpenPlans(); setIsOpen(false); }} 
              className="w-full text-left px-3 py-2 hover:bg-purple-500/10 text-purple-300 hover:text-purple-200 rounded transition-colors flex items-center gap-2 font-medium"
            >
              ⚡ {lang === 'es' ? 'Planes & Suscripción' : 'Plans & Subscription'}
            </button>
          )}

          <button 
            onClick={() => { onOpenSettings(); setIsOpen(false); }} 
            className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded transition-colors text-zinc-300 hover:text-white flex items-center gap-2"
          >
            ⚙️ {t.configGeneral || 'Configuración General'}
          </button>
          
          <div className="border-t border-zinc-800 mt-1 pt-1">
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded transition-colors flex items-center gap-2">
              🚪 {t.logout || 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
