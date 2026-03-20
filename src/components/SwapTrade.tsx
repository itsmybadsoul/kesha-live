"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { ArrowDownUp, Info, Wallet, RefreshCw, ChevronDown, TrendingUp } from "lucide-react";

export function SwapTrade() {
  const { balance, user, tradeAsset } = useUser();
  const { toast } = useToast();
  const [fromAsset, setFromAsset] = useState("USD");
  const [toAsset, setToAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({
    BTC: 64230.50,
    ETH: 3450.20,
    BNB: 580.40,
    SOL: 145.80,
    XRP: 0.62,
    ADA: 0.45,
    DOGE: 0.16,
    TRX: 0.12,
    DOT: 7.20,
    MATIC: 0.72,
    AVAX: 36.40,
    LINK: 18.10,
    UNI: 7.80,
    NEAR: 6.90,
    LTC: 88.30,
    SHIB: 0.000027,
    DAI: 1.00,
    BCH: 460.20,
    ICP: 13.40,
    FIL: 8.90,
    APT: 12.10,
    OP: 3.40,
    ARB: 1.65,
  });

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
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-30"></div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Instant Exchange <ArrowDownUp className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-xs text-gray-400 mt-1">Zero-fee swaps at real-time market rates.</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Live Rates</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* From */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 transition-all focus-within:border-indigo-500/50">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pay With</span>
              <span className="text-[10px] font-medium text-gray-400">
                Balance: {fromAsset === "USD" ? `$${balance.toLocaleString()}` : `${(user?.holdings?.[fromAsset] || 0).toFixed(4)} ${fromAsset}`}
              </span>
           </div>
           <div className="flex items-center gap-4">
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-2xl font-black text-white outline-none w-full"
              />
              <select 
                value={fromAsset}
                onChange={(e) => setFromAsset(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none cursor-pointer"
              >
                {availableAssets.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
           </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center -my-2 relative z-10">
           <button 
             onClick={handleSwapSelection}
             className="bg-gray-800 border border-gray-700 p-2.5 rounded-xl text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all shadow-xl active:scale-90"
           >
              <RefreshCw className="w-5 h-5" />
           </button>
        </div>

        {/* To */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 transition-all focus-within:border-indigo-500/50">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Receive Approximately</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-2xl font-black text-emerald-400 w-full">{receiveAmount}</div>
              <select 
                value={toAsset}
                onChange={(e) => setToAsset(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none cursor-pointer"
              >
                {availableAssets.filter(a => a !== fromAsset).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
           </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
         <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest px-1">
            <span className="text-gray-500">Exchange Rate</span>
            <span className="text-indigo-400">1 {fromAsset} = {currentRate.toFixed(8)} {toAsset}</span>
         </div>
         
         <button 
           onClick={handleTrade}
           disabled={loading || !amount}
           className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group active:scale-[0.98] uppercase tracking-widest text-xs"
         >
           {loading ? "Syncing Blockchain..." : "Execute Instant Trade"}
           <TrendingUp className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
         </button>

         <div className="flex gap-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-gray-500 font-medium leading-relaxed uppercase">
              Liquidity provided by global institutional nodes. Trades are final and permanently recorded on the blockchain.
            </p>
         </div>
      </div>
    </div>
  );
}
