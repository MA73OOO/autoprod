'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CreditCounterProps {
  onClick?: () => void;
  planName?: string;
}

export default function CreditCounter({ onClick, planName }: CreditCounterProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>(planName || 'FREE');

  useEffect(() => {
    if (planName) {
      setCurrentPlan(planName);
    }
  }, [planName]);

  useEffect(() => {
    // 1. Initial fetch via REST to get starting balance and plan
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/user/wallet');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.balance === 'number') {
            setBalance(data.balance);
          }
          if (data.planName) {
            setCurrentPlan(data.planName);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch wallet balance', e);
      }
    };
    fetchBalance();

    // 2. Realtime WebSocket subscription for balance updates
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel>;

    const subscribeToWallet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channelName = `wallet-updates-${user.id}-${Date.now()}`;
      channel = supabase.channel(channelName)
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'wallet' 
          }, 
          (payload: any) => {
            if (payload.new && payload.new.userId === user.id && typeof payload.new.balance === 'number') {
              setBalance(payload.new.balance);
            }
          }
        )
        .subscribe();
    };
    
    subscribeToWallet();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const displayPlan = (currentPlan || 'FREE').toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {/* Botón de Saldo de Créditos */}
      <button 
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/50 transition-all shadow-sm cursor-pointer group"
        title="Tus créditos de AutoProd. Clic para ver planes o recargar."
      >
        <span className="text-sm group-hover:scale-110 transition-transform">🪙</span>
        <span className="text-xs font-bold text-amber-200 tracking-wide">
          {balance !== null ? balance.toLocaleString() : '...'}
        </span>
        <span className="text-[10px] text-amber-400/80 font-semibold ml-0.5">Créditos</span>
      </button>

      {/* Botón e Indicador de Plan Activo */}
      <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
          displayPlan === 'ENTERPRISE'
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
            : displayPlan === 'PRO'
            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30 shadow-sm shadow-purple-500/20'
            : displayPlan === 'STARTER'
            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25'
            : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-purple-500/50 hover:text-white'
        }`}
        title={`Tu plan actual es ${displayPlan}. Clic para cambiar de plan o gestionar suscripción.`}
      >
        <span>
          {displayPlan === 'ENTERPRISE' ? '👑' : displayPlan === 'PRO' ? '🔥' : displayPlan === 'STARTER' ? '🚀' : '🆓'}
        </span>
        <span className="tracking-wide">
          {displayPlan === 'FREE' ? 'Plan Free' : `Plan ${displayPlan}`}
        </span>
        {displayPlan === 'FREE' && (
          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-purple-600/70 text-white font-extrabold ml-1">
            Upgrade
          </span>
        )}
      </button>
    </div>
  );
}
