'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CreditCounter() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    // 1. Initial fetch via REST to get the starting balance
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/user/wallet');
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch (e) {
        console.warn('Failed to fetch wallet balance', e);
      }
    };
    fetchBalance();

    // 2. Realtime WebSocket subscription instead of polling
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel>;

    const subscribeToWallet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Evitar colisiones en React Strict Mode (doble useEffect) haciendo el nombre del canal único
      const channelName = `wallet-updates-${user.id}-${Date.now()}`;
      channel = supabase.channel(channelName)
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'wallet' 
          }, 
          (payload: any) => {
            // Check if the updated wallet belongs to the current user
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

  if (balance === null) return null;

  return (
    <div 
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors shadow-sm cursor-help"
      title="Tus créditos de AutoProd (Se consumen al usar IA sin tu propia clave)"
    >
      <span className="text-sm">🪙</span>
      <span className="text-xs font-bold text-amber-200 tracking-wide">{balance.toLocaleString()}</span>
    </div>
  );
}
