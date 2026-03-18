"use client";

import { AlertTriangle, TrendingUp, TrendingDown, Gauge } from "lucide-react";

export function MarketSentiment() {
  const sentimentValue = 72; // Greed
  const rotation = (sentimentValue / 100) * 180 - 90;

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Market Sentiment <Gauge className="w-5 h-5 text-indigo-400" />
        </h3>
        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest">
          Live Data
        </div>
      </div>

      <div className="relative flex flex-col items-center pt-4">
        {/* Gauge Background */}
        <div className="w-48 h-24 overflow-hidden relative">
          <div className="w-48 h-48 rounded-full border-[16px] border-gray-800 relative">
             <div className="absolute inset-0 border-[16px] border-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full opacity-20"></div>
          </div>
          {/* Active segments */}
          <div className="absolute top-0 left-0 w-full h-full">
             <div className="w-48 h-48 rounded-full border-[16px] border-emerald-500/40 border-l-transparent border-t-transparent -rotate-45"></div>
          </div>
        </div>

        {/* Needle */}
        <div 
          className="absolute bottom-0 w-1 h-20 bg-white rounded-full origin-bottom transition-transform duration-1000 shadow-lg"
          style={{ transform: `translateX(0px) rotate(${rotation}deg)` }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full shadow-xl"></div>
        </div>
        
        <div className="mt-8 text-center">
           <div className="text-3xl font-black text-white mb-1 uppercase tracking-tighter tabular-nums">{sentimentValue}</div>
           <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Greed</div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-8">
           <div className="bg-black/40 p-3 rounded-2xl border border-gray-700/30">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Buy Momentum</div>
              <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                 <TrendingUp className="w-3.5 h-3.5" /> 68.2%
              </div>
           </div>
           <div className="bg-black/40 p-3 rounded-2xl border border-gray-700/30">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Sell Pressure</div>
              <div className="text-sm font-black text-rose-500 flex items-center gap-1.5">
                 <TrendingDown className="w-3.5 h-3.5" /> 31.8%
              </div>
           </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
         <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0" />
         <p className="text-[10px] text-indigo-300 leading-relaxed font-medium">
            High market greed detected. Ensure your stop-loss positions are correctly configured for high volatility events.
         </p>
      </div>
    </div>
  );
}
