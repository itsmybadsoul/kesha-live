"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { TrendingUp, TrendingDown, Clock, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { OptionsChart } from "@/components/OptionsChart";
import { LoadingScreen } from "@/components/LoadingScreen";

import { Navbar } from "@/components/Navbar";
import { useCrypto } from "@/context/CryptoContext";

const ASSET_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "LINK", "AVAX", "MATIC"];

export default function FuturesOptions() {
  const { user, balance, placeOptionsTrade, resolveOptionsTrade, refreshUser, isLoading } = useUser();
  const { prices: liveMarketPrices } = useCrypto();

  if (isLoading) return <LoadingScreen />;

  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState<number>(3);
  const [placing, setPlacing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [livePrice, setLivePrice] = useState(liveMarketPrices["BTC"] || 64230);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const assetParam = params.get("asset");
      if (assetParam) {
        setSelectedAsset(assetParam);
      }
    }
  }, []);

  // Sync initial live price when asset changes
  useEffect(() => {
    if (liveMarketPrices[selectedAsset]) {
      setLivePrice(liveMarketPrices[selectedAsset]);
    }
  }, [selectedAsset, liveMarketPrices]);

  // Polling loop for active trade resolution & admin intercepts
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      // Background full sync to catch admin intercepts
      if (user?.options?.some(o => o.status === "ACTIVE")) {
        refreshUser();
      }
    }, 2000); 
    return () => clearInterval(timer);
  }, [user]);

  // Handle resolutions locally
  useEffect(() => {
    if (!user?.options) return;
    user.options.forEach(async (trade) => {
      if (trade.status === "ACTIVE") {
        const expiresAt = trade.startTime + trade.durationMinutes * 60 * 1000;
        if (currentTime >= expiresAt) {
          // Time expired! Resolve trade.
          const basePrice = liveMarketPrices[trade.asset] || 100;
          await resolveOptionsTrade(trade.id, basePrice);
        }
      }
    });
  }, [currentTime, user?.options, resolveOptionsTrade]);

  const handlePlaceTrade = async (direction: "UP" | "DOWN") => {
    if (!amount || parseFloat(amount) <= 0) return;
    setPlacing(true);
    try {
      const strike = livePrice;
      await placeOptionsTrade(selectedAsset, amount, direction, duration, strike);
      setAmount("");
      toast(`Trade placed! ${selectedAsset} ${direction} at $${strike.toLocaleString()}`, "success");
    } catch (e: any) {
      toast(e.message || "Failed to place trade", "error");
    } finally {
      setPlacing(false);
    }
  };

  const activeTrade = user?.options?.find(o => o.status === "ACTIVE" && o.asset === selectedAsset);
  const allActiveTrades = user?.options?.filter(o => o.status === "ACTIVE") || [];
  const historyTrades = user?.options?.filter(o => o.status === "COMPLETED") || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      
      <div className="sticky top-0 z-50 w-full flex flex-col">
        <Navbar />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 lg:py-10">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Chart & Asset Selector */}
            <div className="lg:col-span-8 flex flex-col gap-8">
               
               {/* Asset Strip */}
               <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-3xl p-3 flex overflow-x-auto gap-3 scrollbar-none shadow-sm">
                 {ASSET_SYMBOLS.map((sym) => {
                   const price = liveMarketPrices[sym] || 0;
                   const isActive = selectedAsset === sym;
                   return (
                     <button 
                       key={sym}
                       onClick={() => setSelectedAsset(sym)}
                       className={`flex-shrink-0 px-5 py-4 rounded-2xl min-w-[140px] transition-all border ${
                         isActive ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20" : "bg-slate-50 dark:bg-gray-800/40 border-slate-100 dark:border-gray-700 hover:border-slate-200 dark:hover:border-gray-600"
                       }`}
                     >
                       <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? "text-indigo-100" : "text-slate-400 dark:text-gray-500"}`}>{sym}/USDT</div>
                       <div className={`text-base font-black tabular-nums ${isActive ? "text-white" : "text-slate-900 dark:text-white"}`}>
                         ${isActive ? livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : price.toLocaleString()}
                       </div>
                     </button>
                   );
                 })}
               </div>

               {/* Chart Container */}
               <div className="h-[600px] w-full bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-1.5 relative shadow-2xl overflow-hidden">
                  <OptionsChart 
                    asset={selectedAsset} 
                    basePrice={liveMarketPrices[selectedAsset] || livePrice} 
                    activeTrade={activeTrade} 
                    onPriceUpdate={setLivePrice}
                  />
               </div>
            </div>

            {/* Right: Order Entry & Positions */}
            <div className="lg:col-span-4 flex flex-col gap-8">
               
               {/* Trade Panel */}
               <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>

                 <h2 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 mb-8 uppercase tracking-[0.2em] relative z-10">
                   Trade Execution <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                 </h2>
                 
                 {/* Amount */}
                 <div className="space-y-3 mb-6 relative z-10">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Investment Amount</label>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500">MAX: <span className="text-emerald-500 dark:text-emerald-400">${fmt(balance)}</span></span>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-950/50 border border-slate-100 dark:border-gray-800 rounded-2xl p-5 focus-within:border-indigo-500/50 transition-all shadow-inner group">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center border border-slate-200 dark:border-gray-700 shadow-sm group-focus-within:border-indigo-500 transition-colors">
                           <span className="text-sm font-black text-indigo-500">$</span>
                         </div>
                         <input 
                           type="number" 
                           value={amount}
                           onChange={(e) => setAmount(e.target.value)}
                           placeholder="0.00"
                           className="bg-transparent text-2xl font-black text-slate-900 dark:text-white outline-none w-full placeholder:text-slate-300 dark:placeholder:text-gray-800"
                         />
                         <button onClick={() => setAmount(balance.toString())} className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-indigo-500/20 transition-colors">Max</button>
                       </div>
                    </div>
                 </div>

                 {/* Duration */}
                 <div className="mb-8 relative z-10">
                    <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-3 ml-1">Settlement Expiry</label>
                    <div className="flex gap-2">
                       {[3, 5, 10].map(m => (
                          <button
                            key={m}
                            onClick={() => setDuration(m)}
                            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black tracking-widest transition-all border uppercase ${
                              duration === m ? "bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/20" : "bg-slate-50 dark:bg-gray-800/40 text-slate-400 dark:text-gray-500 border-slate-100 dark:border-gray-700 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" /> {m} Min
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                    <button 
                      onClick={() => handlePlaceTrade("UP")}
                      disabled={placing}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1.5 group"
                    >
                      <TrendingUp className="w-7 h-7 group-hover:-translate-y-1 transition-transform" />
                      <span className="tracking-[0.2em] uppercase text-[9px]">Buy / Call</span>
                      <span className="text-emerald-200/60 text-[8px] font-bold">85% Payout</span>
                    </button>
                    <button 
                      onClick={() => handlePlaceTrade("DOWN")}
                      disabled={placing}
                      className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-600/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1.5 group"
                    >
                      <TrendingDown className="w-7 h-7 group-hover:translate-y-1 transition-transform" />
                      <span className="tracking-[0.2em] uppercase text-[9px]">Sell / Put</span>
                      <span className="text-rose-200/60 text-[8px] font-bold">85% Payout</span>
                    </button>
                 </div>

                 <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-gray-950/50 border border-slate-100 dark:border-gray-800 rounded-2xl relative z-10 shadow-inner">
                   <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                   <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 leading-relaxed uppercase tracking-tight">
                     Risk Warning: Positions are settled via smart oracle. Invest only what you can afford to lose.
                   </p>
                 </div>
               </div>

             {/* Active Options Tracker */}
               <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-2xl flex flex-col h-[400px]">
                 <h2 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6 uppercase tracking-[0.2em]">
                   Open Positions <span className="bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-indigo-600/30">{allActiveTrades.length}</span>
                 </h2>
                 <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-none">
                    {allActiveTrades.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-20">
                        <Activity className="w-12 h-12 text-slate-400 dark:text-gray-500 mb-4" />
                        <p className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest">No exposure found</p>
                      </div>
                    ) : (
                      allActiveTrades.map(trade => {
                        const timeLeft = Math.max(0, (trade.startTime + trade.durationMinutes * 60 * 1000) - currentTime);
                        const mins = Math.floor(timeLeft / 60000);
                        const secs = Math.floor((timeLeft % 60000) / 1000);
                        const isUp = trade.direction === "UP";
                        
                        return (
                          <div key={trade.id} className="bg-slate-50 dark:bg-gray-950/50 border border-slate-100 dark:border-gray-800 rounded-2xl p-5 shadow-inner group hover:border-indigo-500/30 transition-all">
                             <div className="flex justify-between items-center mb-3">
                               <div className="flex items-center gap-3">
                                 <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${isUp ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'} animate-pulse`}></div>
                                 <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{trade.asset}</span>
                                 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${isUp ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                                   {trade.direction}
                                 </span>
                               </div>
                               <div className="text-xs font-black tabular-nums text-indigo-500 dark:text-indigo-400">
                                 {mins}:{secs.toString().padStart(2, '0')}
                                </div>
                             </div>
                             <div className="flex justify-between items-end border-t border-slate-100 dark:border-gray-800/50 pt-3">
                               <div>
                                 <div className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Stake</div>
                                 <div className="text-base font-black text-slate-900 dark:text-white tabular-nums">${trade.amount.toLocaleString()}</div>
                               </div>
                               <div className="text-right">
                                 <div className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1.5">Trade Status</div>
                                 {trade.adminResult ? (
                                   <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                                      <Activity className="w-3 h-3" /> Oracle Syncing
                                   </div>
                                 ) : (
                                   <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/20">Active Position</div>
                                 )}
                               </div>
                             </div>
                          </div>
                        )
                      })
                    )}
                 </div>
               </div>

               {/* Recent History Tracker */}
               <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-2xl flex flex-col h-[300px]">
                 <h2 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6 uppercase tracking-[0.2em]">
                   Recent Activity <span className="text-slate-400 dark:text-gray-500 font-black text-[9px] bg-slate-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg shadow-sm">Last 24h</span>
                 </h2>
                 <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-none">
                    {historyTrades.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-10 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-3xl">
                        <Clock className="w-10 h-10 text-slate-400 dark:text-gray-500" />
                      </div>
                    ) : (
                      [...historyTrades].reverse().slice(0, 24).map(trade => {
                        const isUp = trade.direction === "UP";
                        const won = trade.payout && trade.payout > 0;
                        return (
                          <div key={trade.id} className="bg-slate-50 dark:bg-gray-950/50 border border-slate-100 dark:border-gray-800 rounded-2xl p-4 flex justify-between items-center hover:border-indigo-500/20 transition-all group">
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{trade.asset}</span>
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {trade.direction}
                                  </span>
                               </div>
                               <div className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tight">
                                  Strike: ${trade.strikePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} 
                                </div>
                            </div>
                            <div className="text-right">
                               <div className={`text-sm font-black tabular-nums ${won ? 'text-emerald-500' : 'text-slate-300 dark:text-gray-700'}`}>
                                  {won ? `+$${trade.payout.toLocaleString()}` : 'Settled -$0'}
                               </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                 </div>
               </div>

            </div>
         </div>
      </div>
    </div>
  );
}
