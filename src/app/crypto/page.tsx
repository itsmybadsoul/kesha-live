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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
              All Crypto <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
            </h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm">
              Live prices for{" "}
              <span className="font-bold text-indigo-400">{prices.length}</span>{" "}
              cryptocurrencies
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by symbol…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Grid — 2 cols on mobile, scales up on larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {visible.map((p) => (
            <div
              key={p.symbol}
              onClick={() => setSelectedSymbol(p.symbol)}
              className="bg-white dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col justify-between group cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-slate-500 dark:text-gray-400 uppercase tracking-wide group-hover:text-indigo-400 transition-colors truncate pr-1">
                    {p.symbol}
                  </span>
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500/30 group-hover:text-emerald-500 transition-colors animate-pulse shrink-0" />
                </div>
                <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white tabular-nums truncate">
                  ${p.price}
                </div>
                <div className="flex items-center justify-between mt-1">
                   <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500/70">
                     <ArrowUpRight className="w-2.5 h-2.5" /> LIVE
                   </div>
                   <div className={`text-[10px] font-black ${p.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}%
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-5">
                <button
                  onClick={(e) => handleTrade(e, p.symbol, "UP")}
                  className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-0.5 sm:gap-1"
                >
                  <TrendingUp className="w-3 h-3 shrink-0" /> CALL
                </button>
                <button
                  onClick={(e) => handleTrade(e, p.symbol, "DOWN")}
                  className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-600 dark:text-red-400 hover:text-white text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-0.5 sm:gap-1"
                >
                  <TrendingDown className="w-3 h-3 shrink-0" /> PUT
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Modal */}
        {selectedSymbol && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setSelectedSymbol(null)}></div>
             <div className="relative bg-white dark:bg-gray-900 w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-slate-300 dark:border-gray-800 shadow-2xl flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-gray-800">
                   <h3 className="font-black text-xl flex items-center gap-2">
                     {selectedSymbol} <span className="text-slate-400 text-sm font-normal">/ USDT</span>
                   </h3>
                   <button onClick={() => setSelectedSymbol(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                     <Activity className="w-6 h-6 rotate-45" />
                   </button>
                </div>
                <div className="flex-1 bg-gray-900">
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
          <div className="py-20 text-center text-slate-400 dark:text-gray-500 text-sm">
            No results for &ldquo;<span className="font-bold">{search}</span>&rdquo;
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-2 text-sm font-bold text-indigo-500 dark:text-indigo-400 bg-white dark:bg-indigo-500/10 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 border border-slate-200 dark:border-indigo-500/20 px-6 py-3 rounded-xl transition-all"
            >
              Load more <ChevronDown className="w-4 h-4" />
              <span className="text-slate-400 dark:text-gray-500 font-normal">
                ({filtered.length - visible.length} remaining)
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
