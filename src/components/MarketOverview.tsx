"use client";

import { useCrypto } from "@/context/CryptoContext";
import { TrendingUp, Activity, ArrowUpRight, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

export function MarketOverview() {
  const { rawPrices: prices, loading } = useCrypto();

  if (loading) return null;

  return (
    <div className="bg-white/60 dark:bg-slate-100 dark:bg-gray-800/40 backdrop-blur-xl border border-slate-300 dark:border-gray-700/50 rounded-3xl p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Market Overview <BarChart3 className="w-5 h-5 text-indigo-400" />
        </h2>
        <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest bg-white/80 dark:bg-gray-900/50 px-3 py-1 rounded-full border border-slate-200 dark:border-gray-800">
          Top 10 Assets
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {prices.slice(0, 10).map((p) => (
          <div key={p.symbol} className="bg-white/80 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 hover:border-indigo-500/30 transition-colors rounded-2xl p-4 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{p.symbol}</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500/30 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">${p.price}</div>
            <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-emerald-400/80">
              <ArrowUpRight className="w-2.5 h-2.5" /> LIVE
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <Link href="/crypto" className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-6 py-3 rounded-xl transition-all">
          View All {prices.length} Markets <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
