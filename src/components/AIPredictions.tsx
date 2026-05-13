"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Zap, ShieldCheck, Activity } from "lucide-react";

export function AIPredictions() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const insights = [
    { title: "Institutional Accumulation", value: "84%", trend: "up", detail: "Significant whale activity detected in BTC/USDT clusters." },
    { title: "Market Volatility Index", value: "Medium", trend: "stable", detail: "Volatility suppressed by major liquidity providers." },
    { title: "AI Price Projection", value: "Bullish", trend: "up", detail: "Stocks AI predicts a 4.2% upside in the next 12 hours." }
  ];

  return (
    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-all duration-1000"></div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4 sm:gap-5">
           <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
              <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
           </div>
           <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Stocks <span className="text-indigo-500 not-italic">AI Intelligence</span></h3>
              <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                 <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> Live_Analysis_Active
              </div>
           </div>
        </div>
        <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 whitespace-nowrap">
           Enterprise Tier Feed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {insights.map((item, i) => (
          <div key={i} className="bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-gray-800 p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] hover:border-indigo-500/30 transition-all hover:-translate-y-1 relative group/card">
            <div className="absolute top-4 right-6 opacity-10 group-hover/card:opacity-30 transition-opacity">
               <Zap className="w-10 h-10 text-indigo-500" />
            </div>
            <div className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-3">{item.title}</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 tabular-nums">{item.value}</div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium leading-relaxed">{item.detail}</p>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
               <ShieldCheck className="w-3.5 h-3.5" /> Verified_Signal
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 pt-8 border-t border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(n => (
                 <img key={n} src={`https://i.pravatar.cc/100?u=ai${n}`} className="w-10 h-10 rounded-full border-4 border-white dark:border-gray-950 shadow-lg" alt="analyst" />
               ))}
               <div className="w-10 h-10 rounded-full bg-indigo-500 border-4 border-white dark:border-gray-950 flex items-center justify-center text-[10px] font-black text-white">+12</div>
            </div>
            <div className="text-xs font-bold text-slate-400 dark:text-gray-600 italic">"Global analytics cluster currently processing 1.4TB/sec of market data."</div>
         </div>
         <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95">
            Full Audit Report
         </button>
      </div>
    </div>
  );
}
