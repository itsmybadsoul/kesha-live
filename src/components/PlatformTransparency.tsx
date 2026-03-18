"use client";

import { ShieldCheck, BarChart3, Database, Globe, ArrowUpRight } from "lucide-react";

export function PlatformTransparency() {
  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Platform Transparency <ShieldCheck className="w-5 h-5 text-indigo-400" />
        </h3>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
          Verified
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-700/30">
          <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
               <Database className="w-4 h-4 text-indigo-400" /> Asset Reserve Pool
             </div>
             <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">$12,485,000.00</div>
          <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tight">Maintained on-chain liquidity</div>
        </div>

        <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-700/30">
          <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
               <BarChart3 className="w-4 h-4 text-indigo-400" /> Managed Trading Vol.
             </div>
             <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">$4,821,500.24</div>
          <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tight">Real-time across all nodes</div>
        </div>

        <div className="flex items-center gap-4 px-2">
          <div className="flex -space-x-2">
             {[1,2,3,4].map(i => (
               <div key={i} className={`w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-[8px] font-bold`}>
                 <Globe className="w-3 h-3 text-indigo-400" />
               </div>
             ))}
          </div>
          <div className="text-[10px] text-gray-500 font-bold">Secure Global Infrastructure</div>
        </div>
      </div>

      <button className="w-full mt-6 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-black py-4 rounded-2xl transition-all text-xs border border-indigo-500/20 active:scale-95 uppercase tracking-widest">
         View Reserve Audit
      </button>
    </div>
  );
}
