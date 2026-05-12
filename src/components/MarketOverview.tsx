"use client";

import { useState } from "react";
import { useCrypto } from "@/context/CryptoContext";
import { TrendingUp, Activity, ArrowUpRight, BarChart3, ChevronDown, ChevronUp } from "lucide-react";

export function MarketOverview() {
  const { rawPrices: prices, loading } = useCrypto();
  const [showAll, setShowAll] = useState(false);

  if (loading) return null;

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Market Overview <BarChart3 className="w-5 h-5 text-indigo-400" />
        </h2>
        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
          Live Global Data
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(showAll ? prices : prices.slice(0, 15)).map((p) => (
          <div key={p.symbol} className="bg-gray-900/50 border border-gray-800 hover:border-indigo-500/30 transition-colors rounded-2xl p-4 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{p.symbol}</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500/30 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="text-lg font-black text-white tabular-nums">${p.price}</div>
            <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-emerald-400/80">
              <ArrowUpRight className="w-2.5 h-2.5" /> LIVE
            </div>
          </div>
        ))}
      </div>
      
      {prices.length > 15 && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-6 py-2.5 rounded-xl transition-all"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>View All {prices.length} Markets <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
      
      <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
        <Activity className="w-3 h-3 animate-pulse" /> Prices update automatically every 15 seconds
      </div>
    </div>
  );
}
