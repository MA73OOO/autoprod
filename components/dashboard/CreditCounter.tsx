'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CreditCounter() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
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
    
    // Auto refresh balance every 15s to keep it accurate after generations
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
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
