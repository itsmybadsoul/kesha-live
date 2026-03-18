"use client";

import { Wallet, TrendingUp, ShieldCheck, Zap, ArrowRight, BarChart } from "lucide-react";

export function StakingWidget() {
  return (
    <div className="bg-gradient-to-br from-indigo-600/20 to-gray-800/40 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Yield Staking <Zap className="w-5 h-5 text-amber-400" fill="currentColor" />
        </h3>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
           <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Pool</span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="bg-black/40 p-5 rounded-2xl border border-indigo-500/10">
           <div className="flex justify-between items-start mb-2">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Current APY</div>
              <div className="text-emerald-400 font-black text-xs px-2 py-0.5 bg-emerald-500/10 rounded-md">+12.4% Est.</div>
           </div>
           <div className="text-3xl font-black text-white tracking-tighter tabular-nums flex items-baseline gap-2">
              12.40<span className="text-sm text-gray-500 font-bold">%</span>
           </div>
           <p className="text-[10px] text-gray-500 font-medium mt-1">Variable interest paid daily to your account balance.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Staked Total</div>
              <div className="text-lg font-black text-white tabular-nums">$0.00</div>
           </div>
           <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Rewards Earned</div>
              <div className="text-lg font-black text-emerald-400 tabular-nums">+$0.00</div>
           </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 relative z-10">
         <a href="/deposit" className="w-full bg-white hover:bg-gray-100 text-gray-900 font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-2 group">
            Stake USDT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </a>
         <button className="w-full bg-gray-900/50 hover:bg-gray-800 text-gray-400 font-bold py-3 rounded-2xl transition-all text-[10px] border border-gray-700/50 uppercase tracking-widest">
            Stake History
         </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700/30 flex items-center gap-3">
         <ShieldCheck className="w-5 h-5 text-indigo-400" />
         <div className="text-[9px] text-gray-500 font-medium leading-relaxed">
            Assets are protected by our Liquidity Insurance Fund. Staking carries a 0% entry fee.
         </div>
      </div>
    </div>
  );
}
