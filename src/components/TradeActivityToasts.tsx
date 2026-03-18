"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, Award, User, X } from "lucide-react";

interface Toast {
  id: string;
  user: string;
  profit: string;
  strategy: string;
}

export function TradeActivityToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const names = ["user_99", "CryptoKing", "Sarah_W", "MoonWalker", "WhaleHunter_Fans", "TraderPro"];
    const strategies = ["BTC Master", "ETH Whale", "SOL Scalper", "Aggressive ROI"];

    const addToast = () => {
      const id = Math.random().toString();
      const newToast: Toast = {
        id,
        user: names[Math.floor(Math.random() * names.length)],
        profit: "+" + (Math.random() * 200).toFixed(1) + "%",
        strategy: strategies[Math.floor(Math.random() * strategies.length)]
      };
      
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => removeToast(id), 5000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) addToast();
    }, 10000);
    
    // Initial toast after 3s
    setTimeout(addToast, 3000);

    return () => clearInterval(interval);
  }, [removeToast]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto bg-gray-900/90 backdrop-blur-xl border border-indigo-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 min-w-[280px]"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-black text-white">{toast.user}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-black">WINNER</span>
             </div>
             <p className="text-[10px] text-gray-400 leading-tight">
                Just closed <span className="text-indigo-400 font-bold">{toast.strategy}</span> with <span className="text-emerald-400 font-bold">{toast.profit} ROI</span>.
             </p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-gray-600 hover:text-white transition-colors">
             <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
