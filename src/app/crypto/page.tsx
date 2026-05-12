"use client";

import { useState } from "react";
import { useCrypto } from "@/context/CryptoContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Search, ArrowUpRight, BarChart3, Activity } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function CryptoOverviewPage() {
  const { rawPrices: prices, loading } = useCrypto();
  const { user } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleTrade = (sym: string, direction: "UP" | "DOWN") => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Redirect to Futures/Pro Options with the asset pre-selected
    // Assuming futures page can take a query param or just navigate there
    router.push(`/futures?asset=${sym}&dir=${direction}`);
  };

  const filtered = prices.filter((p) => p.symbol.toLowerCase().includes(search.toLowerCase()));

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <div className="sticky top-0 z-50 w-full flex flex-col">
        <Navbar />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              Market Overview <BarChart3 className="w-8 h-8 text-indigo-400" />
            </h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1">Live streaming data for over {prices.length} cryptocurrencies.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Search markets..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <div key={p.symbol} className="bg-white/80 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 hover:border-indigo-500/30 transition-all rounded-2xl p-5 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{p.symbol}</span>
                  <Activity className="w-4 h-4 text-emerald-500/30 group-hover:text-emerald-500 transition-colors animate-pulse" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">${p.price}</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-400/80">
                  <ArrowUpRight className="w-3 h-3" /> LIVE DATA
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button 
                  onClick={() => handleTrade(p.symbol, "UP")}
                  className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5" /> CALL
                </button>
                <button 
                  onClick={() => handleTrade(p.symbol, "DOWN")}
                  className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-600 dark:text-red-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  <TrendingDown className="w-3.5 h-3.5" /> PUT
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="py-20 text-center text-slate-400 dark:text-gray-500">
            No cryptocurrencies found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
