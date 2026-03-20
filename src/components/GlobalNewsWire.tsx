"use client";
import { Globe, TrendingUp, AlertTriangle } from "lucide-react";

const NEWS_HEADLINES = [
  "SEC accelerates review of spot Ethereum ETF applications ahead of May deadline.",
  "Institutional inflows into Bitcoin spot ETFs surpass $10B mark this quarter.",
  "Global regulatory framework for stablecoins reaches advanced draft stages in EU.",
  "Major investment bank sets BTC year-end target at $150,000 amid supply shock.",
  "Whale addresses accumulate aggressively as open interest in futures hits all-time high.",
  "Tether (USDT) circulating supply reaches record numbers as emerging markets adopt stablecoins."
];

export function GlobalNewsWire() {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 border-b border-indigo-500/30 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-blue-900 to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-blue-900 to-transparent z-10"></div>
      
      <div className="flex items-center">
        <div className="px-4 py-1.5 bg-blue-600 flex items-center gap-2 relative z-20 shadow-[4px_0_15px_rgba(0,0,0,0.5)]">
          <Globe className="w-4 h-4 text-white animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">Global Wire</span>
        </div>
        
        <div className="flex-1 whitespace-nowrap overflow-hidden py-1.5 flex items-center">
          <div className="animate-[marquee_60s_linear_infinite] flex items-center gap-12">
            {[...NEWS_HEADLINES, ...NEWS_HEADLINES].map((headline, i) => (
               <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-200">
                 {i % 3 === 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                 {headline}
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
