"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { ArrowDownUp, Info, Wallet, RefreshCw, ChevronDown, TrendingUp } from "lucide-react";
import { useCrypto } from "@/context/CryptoContext";

export function SwapTrade() {
  const { balance, user, tradeAsset } = useUser();
  const { prices: rates } = useCrypto();
  const { toast } = useToast();
  const [fromAsset, setFromAsset] = useState("USD");
  const [toAsset, setToAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const availableAssets = ["USD", ...Object.keys(rates)].sort();

  const getPrice = (symbol: string) => rates[symbol] || 1;

  const currentRate = fromAsset === "USD" ? 1 / getPrice(toAsset) : (toAsset === "USD" ? getPrice(fromAsset) : getPrice(fromAsset) / getPrice(toAsset));
  const receiveAmount = amount ? (parseFloat(amount) * currentRate).toFixed(6) : "0.00";

  const handleSwapSelection = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setAmount("");
  };

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      const price = fromAsset === "USD" ? getPrice(toAsset) : (toAsset === "USD" ? getPrice(fromAsset) : getPrice(fromAsset));
      await tradeAsset(fromAsset, toAsset, parseFloat(amount), price);
      setAmount("");
      toast("Trade executed successfully!", "success");
    } catch (e: any) {
      toast(e.message || "Trade failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 opacity-60"></div>
      
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter uppercase italic">
            Instant <span className="text-indigo-500 not-italic">Exchange</span> <ArrowDownUp className="w-6 h-6 text-indigo-500" />
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-black uppercase tracking-[0.2em] opacity-70">Institutional-grade liquidity & zero-fee swaps</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Real-Time Nodes</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* From */}
        <div className="bg-slate-50 dark:bg-gray-950/50 border-2 border-slate-100 dark:border-gray-800 rounded-[2rem] p-6 transition-all focus-within:border-indigo-500/30 shadow-inner group/input">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em]">Source_Asset</span>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest opacity-60">
                Avail: {fromAsset === "USD" ? `$${balance.toLocaleString('en-US')}` : `${(user?.holdings?.[fromAsset] || 0).toFixed(4)} ${fromAsset}`}
              </span>
           </div>
           <div className="flex items-center gap-6">
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-3xl font-black text-slate-900 dark:text-white outline-none w-full tabular-nums tracking-tighter placeholder:text-slate-200 dark:placeholder:text-gray-800"
              />
              <select 
                value={fromAsset}
                onChange={(e) => setFromAsset(e.target.value)}
                className="bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-sm font-black text-slate-900 dark:text-white outline-none cursor-pointer shadow-xl hover:border-indigo-500/50 transition-colors uppercase tracking-widest"
              >
                {availableAssets.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
           </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center -my-3 relative z-10">
           <button 
             onClick={handleSwapSelection}
             className="bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-800 p-4 rounded-2xl text-indigo-500 hover:text-white hover:bg-indigo-600 transition-all shadow-2xl active:scale-90 group/swap"
           >
              <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
           </button>
        </div>

        {/* To */}
        <div className="bg-slate-50 dark:bg-gray-950/50 border-2 border-slate-100 dark:border-gray-800 rounded-[2rem] p-6 transition-all shadow-inner">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em]">Target_Settlement</span>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-3xl font-black text-emerald-500 w-full tabular-nums tracking-tighter">{receiveAmount}</div>
              <select 
                value={toAsset}
                onChange={(e) => setToAsset(e.target.value)}
                className="bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-sm font-black text-slate-900 dark:text-white outline-none cursor-pointer shadow-xl hover:border-indigo-500/50 transition-colors uppercase tracking-widest"
              >
                {availableAssets.filter(a => a !== fromAsset).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
           </div>
        </div>
      </div>

      <div className="mt-10 space-y-6">
         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] px-2">
            <span className="text-slate-400 dark:text-gray-600">Exchange Consensus</span>
            <span className="text-indigo-500 bg-indigo-500/5 px-3 py-1 rounded-lg border border-indigo-500/10">1 {fromAsset} = {currentRate.toFixed(8)} {toAsset}</span>
         </div>
         
         <button 
           onClick={handleTrade}
           disabled={loading || !amount}
           className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
         >
           {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Authorize Settlement"}
           {!loading && <TrendingUp className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
         </button>
  
         <div className="flex gap-4 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-[1.5rem] shadow-inner">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
              Liquidity provided by Stocks Institutional global nodes. Exchange protocol v4.2 active. All trades are final and irreversibly hashed to the secure ledger.
            </p>
         </div>
      </div>
    </div>
  );
}
