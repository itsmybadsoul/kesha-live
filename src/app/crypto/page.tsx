"use client";

import { useState } from "react";
import { useCrypto } from "@/context/CryptoContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Search, ArrowUpRight, BarChart3, Activity, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const PAGE_SIZE = 50;

export default function CryptoOverviewPage() {
  const { rawPrices: prices, loading } = useCrypto();
  const { user } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const handleTrade = (e: React.MouseEvent, sym: string, direction: "UP" | "DOWN") => {
    e.stopPropagation(); // Prevent opening chart when clicking buttons
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(`/futures?asset=${sym}&dir=${direction}`);
  };

  const filtered = prices.filter((p) =>
    p.symbol.toLowerCase().includes(search.toLowerCase())
  );
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-400 animate-pulse" />
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Loading live markets…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              Global Markets <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" />
            </h1>
            <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm font-bold uppercase tracking-widest">
              Live Aggregate Liquidity for{" "}
              <span className="text-indigo-500">{prices.length}</span>{" "}
              Instruments
            </p>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search ticker or protocol…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-gray-900/60 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all shadow-sm shadow-black/5 dark:shadow-none"
            />
          </div>
        </div>

        {/* Grid — Optimized for high density */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {visible.map((p) => (
            <div
              key={p.symbol}
              onClick={() => setSelectedSymbol(p.symbol)}
              className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between group cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] group-hover:text-indigo-500 transition-colors truncate pr-2">
                    {p.symbol}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0"></div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums truncate tracking-tighter">
                  ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between mt-2">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                     <Activity className="w-3 h-3" /> Live
                   </div>
                   <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${p.change >= 0 ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-rose-500/5 border-rose-500/20 text-rose-500"}`}>
                      {p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}%
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                  onClick={(e) => handleTrade(e, p.symbol, "UP")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 uppercase tracking-widest shadow-lg shadow-emerald-600/10"
                >
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" /> Call
                </button>
                <button
                  onClick={(e) => handleTrade(e, p.symbol, "DOWN")}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 uppercase tracking-widest shadow-lg shadow-rose-600/10"
                >
                  <TrendingDown className="w-3.5 h-3.5 shrink-0" /> Put
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Modal */}
        {selectedSymbol && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/80 backdrop-blur-md" onClick={() => setSelectedSymbol(null)}>
             <div className="relative bg-[#131722] w-full max-w-6xl aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 flex justify-between items-center border-b border-white/5 bg-black/20">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/20">
                       {selectedSymbol[0]}
                     </div>
                     <h3 className="font-black text-2xl text-white tracking-tight">
                       {selectedSymbol} <span className="text-gray-500 text-sm font-bold uppercase tracking-widest ml-1">/ Tether Perpetual</span>
                     </h3>
                   </div>
                   <button onClick={() => setSelectedSymbol(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                     <X className="w-6 h-6 text-white" />
                   </button>
                </div>
                <div className="flex-1 bg-[#131722]">
                   <iframe 
                     src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selectedSymbol}USDT&theme=dark&interval=60&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=[]&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en`}
                     className="w-full h-full border-0"
                   />
                </div>
             </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Search className="w-16 h-16 mb-4 text-slate-400 dark:text-gray-500" />
            <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">No instruments found matching &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="mt-16 flex justify-center pb-20">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 bg-white dark:bg-indigo-500/10 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 border border-slate-200 dark:border-indigo-500/20 px-10 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/5 active:scale-95"
            >
              Expand Market Depth <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
