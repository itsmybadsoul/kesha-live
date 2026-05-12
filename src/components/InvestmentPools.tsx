"use client";

import { Flame, ArrowRight } from "lucide-react";

export function InvestmentPools() {
  return (
    <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 lg:p-8 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-[40px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
          Exclusive Pools <Flame className="w-5 h-5 text-orange-500 animate-pulse" fill="currentColor" />
        </h2>
        <a href="/deposit" className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-2 transition-colors">
          Expand Allocation <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Pool Card 1 */}
        <a 
          href="/deposit"
          className="bg-slate-900 border border-orange-500/30 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-500/60 transition-all cursor-pointer block shadow-xl shadow-orange-500/5 active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 bg-orange-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest z-10 shadow-lg shadow-orange-600/20">
            Closing Soon
          </div>
          
          <div className="flex justify-between items-start mb-5">
            <div>
              <h3 className="text-white font-black text-lg mb-1 tracking-tight">Institutional Yield V3</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Lock: 30D • Daily Settlement</p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 tracking-tighter">
                2.5%
              </span>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Daily ROI</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-orange-400">85% Aggregate Fill</span>
              <span className="text-slate-500">Cap: $500K</span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div className="h-full bg-gradient-to-r from-orange-600 to-amber-400 rounded-full w-[85%] relative shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 font-bold text-center mt-2 uppercase tracking-tight">Only $45,000 remaining until vault closure</p>
          </div>
        </a>

        {/* Pool Card 2 */}
        <a 
          href="/deposit"
          className="bg-slate-50 dark:bg-gray-950/50 border border-slate-100 dark:border-gray-800 rounded-3xl p-6 hover:border-indigo-500/30 transition-all cursor-pointer shadow-inner active:scale-[0.98] block"
        >
          <div className="flex justify-between items-start mb-5">
            <div>
              <h3 className="text-slate-900 dark:text-white font-black text-lg mb-1 tracking-tight">Stable Alpha V1</h3>
              <p className="text-slate-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">Lock: Flex • Weekly Payout</p>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-black text-indigo-500 dark:text-indigo-400 tracking-tighter">
                0.8%
              </span>
              <span className="text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-widest">Daily ROI</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-indigo-500 dark:text-indigo-400">42% Aggregate Fill</span>
              <span className="text-slate-400 dark:text-gray-500 font-bold">Cap: $1M</span>
            </div>
            <div className="h-2 w-full bg-white dark:bg-gray-900 rounded-full overflow-hidden border border-slate-200 dark:border-gray-800 p-0.5">
              <div className="h-full bg-indigo-500 dark:bg-indigo-600 rounded-full w-[42%] shadow-[0_0_10px_rgba(99,102,241,0.2)]"></div>
            </div>
          </div>
        </a>

      </div>
    </div>
  );
}
