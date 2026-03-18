"use client";

import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { TrendingUp, Activity } from "lucide-react";

export function LivePriceTicker() {
  const { prices, loading } = useCryptoPrices();

  if (loading) return (
    <div className="h-10 bg-gray-900/50 border-b border-gray-800 flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest animate-pulse">
        <Activity className="w-3 h-3" /> Syncing Real-Time Market Data...
      </div>
    </div>
  );

  return (
    <div className="sticky top-0 z-[100] bg-[#0A0A0B] border-b border-gray-800 overflow-hidden h-10 flex items-center group shadow-xl">
      <div className="flex animate-marquee whitespace-nowrap py-2 hover:pause-marquee">
        {/* Double the list for seamless looping */}
        {[...prices, ...prices].map((p, i) => (
          <div key={`${p.symbol}-${i}`} className="inline-flex items-center gap-2 px-6 border-r border-gray-800/50">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{p.symbol}</span>
            <span className="text-xs font-bold text-white tabular-nums">${p.price}</span>
            <TrendingUp className="w-3 h-3 text-emerald-500/50" />
          </div>
        ))}
      </div>
      
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10 pointer-events-none"></div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
