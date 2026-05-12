"use client";

import { Wallet, TrendingUp, ShieldCheck, Zap, ArrowRight, BarChart } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export function StakingWidget() {
  const { toast } = useToast();
  return (
    <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden shadow-2xl group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full translate-x-10 -translate-y-10"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
          Yield Protocol <Zap className="w-5 h-5 text-amber-500" fill="currentColor" />
        </h3>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Pool</span>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="bg-slate-50 dark:bg-gray-950/50 p-6 rounded-[2rem] border border-slate-100 dark:border-gray-800 shadow-inner">
           <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest">Aggregate APY</div>
              <div className="text-emerald-500 font-black text-[10px] px-2.5 py-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10 uppercase tracking-widest">+12.4% Est.</div>
           </div>
           <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums flex items-baseline gap-2">
              12.40<span className="text-sm text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest">%</span>
           </div>
           <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold mt-2 uppercase tracking-tight">Variable interest paid daily to your account balance.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2">Principal</div>
              <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">$0.00</div>
           </div>
           <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2">Delta (24h)</div>
              <div className="text-xl font-black text-emerald-500 tabular-nums tracking-tighter">+$0.00</div>
           </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 relative z-10">
         <button onClick={() => toast("Staking Protocol v2 is launching next week. Stay tuned!", "info")} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 group">
            Provision Liquidity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </button>
         <button onClick={() => toast("No active staking history found.", "error")} className="w-full bg-slate-50 dark:bg-gray-900/60 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 dark:text-gray-500 font-black py-4 rounded-2xl transition-all text-[9px] border border-slate-200 dark:border-gray-800 uppercase tracking-widest shadow-sm">
            Audit Staking History
         </button>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-gray-800 flex items-start gap-4">
         <ShieldCheck className="w-6 h-6 text-indigo-500 shrink-0" />
         <div className="text-[9px] text-slate-400 dark:text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
            Assets are protected by our Liquidity Insurance Fund. Staking carries a 0% entry fee for institutional accounts.
         </div>
      </div>
    </div>
  );
}
