"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { TrendingUp, TrendingDown, Clock, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { OptionsChart } from "@/components/OptionsChart";
import { LoadingScreen } from "@/components/LoadingScreen";

import { Navbar } from "@/components/Navbar";
import { useCrypto } from "@/context/CryptoContext";

const BASE_ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "LINK", "AVAX", "MATIC"];

const fmt = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
  
  const [showEntryPopup, setShowEntryPopup] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<"UP" | "DOWN" | null>(null);
  const [entryPriceInput, setEntryPriceInput] = useState("");
  
  // Sell popup state
  const [showSellPopup, setShowSellPopup] = useState(false);

  // Dynamic Private Assets
  const [privateAssets, setPrivateAssets] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/private")
      .then(r => r.json())
      .then(data => {
        if (data.assets) {
          setPrivateAssets(data.assets.map((a: any) => a.sym));
        }
      })
      .catch(console.error);
  }, []);

  const ASSET_SYMBOLS = [...BASE_ASSETS, ...privateAssets];

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

  const { activatePendingOptionsTrade, cancelPendingOptionsTrade, closeOptionsTrade, setOptionsTradeTarget } = useUser();

  // Target popup state
  const [showTargetPopup, setShowTargetPopup] = useState(false);
  const [targetTradeId, setTargetTradeId] = useState("");
  const [targetPriceInput, setTargetPriceInput] = useState("");

  // Polling loop for background resolution & expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      if (user?.options?.some(o => o.status === "ACTIVE" || o.status === "PENDING")) {
        refreshUser();
      }
    }, 2000); 
    return () => clearInterval(timer);
  }, [user, refreshUser]);

  // Check pending trades against live market prices and handle pending expiry / active targets
  useEffect(() => {
    if (!user?.options) return;
    user.options.forEach(async (trade) => {
      const currentPrice = liveMarketPrices[trade.asset] || 0;

      // Pending Trades
      if (trade.status === "PENDING") {
        const expiresAt = trade.startTime + trade.durationMinutes * 60 * 1000;
        if (currentTime >= expiresAt) {
          // Time expired! Cancel pending trade.
          await cancelPendingOptionsTrade(trade.id);
          toast(`Pending trade for ${trade.asset} expired and was cancelled.`, "error");
          return;
        }

        if (trade.targetEntryPrice) {
          let triggered = false;
          if (trade.direction === "UP" && currentPrice <= trade.targetEntryPrice) triggered = true;
          if (trade.direction === "DOWN" && currentPrice >= trade.targetEntryPrice) triggered = true;
          
          if (triggered) {
            await activatePendingOptionsTrade(trade.id, currentPrice);
            toast(`Pending trade for ${trade.asset} triggered at $${currentPrice.toLocaleString()}!`, "success");
          }
        }
      }

      // Active Trades - Check Target Exits
      if (trade.status === "ACTIVE" && trade.targetExitPrice) {
        let triggered = false;
        if (trade.direction === "UP" && currentPrice >= trade.targetExitPrice) triggered = true;
        if (trade.direction === "DOWN" && currentPrice <= trade.targetExitPrice) triggered = true;
        
        if (triggered) {
          const res = await closeOptionsTrade(trade.id, currentPrice);
          if (res) {
            toast(`Take Profit hit! Trade closed for $${res.profit > 0 ? "+" : ""}${res.profit.toLocaleString()} profit.`, res.profit > 0 ? "success" : "error");
          }
        }
      }
    });
  }, [liveMarketPrices, currentTime, user?.options, activatePendingOptionsTrade, cancelPendingOptionsTrade, closeOptionsTrade, toast]);

  // Removed old time-based auto-resolution for active trades

  const handleInitialClick = (direction: "UP" | "DOWN") => {
    if (!amount || parseFloat(amount) <= 0) {
      toast("Please enter a valid amount", "error");
      return;
    }
    if (parseFloat(amount) > balance) {
      toast("Insufficient balance", "error");
      return;
    }
    setPendingDirection(direction);
    setEntryPriceInput(livePrice.toString());
    setShowEntryPopup(true);
  };

  const handlePlaceTrade = async () => {
    if (!amount || parseFloat(amount) <= 0 || !pendingDirection) return;
    setPlacing(true);
    try {
      const targetPrice = parseFloat(entryPriceInput);
      if (isNaN(targetPrice) || targetPrice <= 0) {
        throw new Error("Invalid entry price");
      }

      let status: "ACTIVE" | "PENDING" = "ACTIVE";
      if (pendingDirection === "UP" && targetPrice < livePrice) {
        status = "PENDING";
      } else if (pendingDirection === "DOWN" && targetPrice > livePrice) {
        status = "PENDING";
      }

      const strikeToUse = status === "ACTIVE" ? livePrice : targetPrice;

      await placeOptionsTrade(selectedAsset, amount, pendingDirection, duration, strikeToUse, status, status === "PENDING" ? targetPrice : undefined);
      
      setAmount("");
      setShowEntryPopup(false);
      setPendingDirection(null);
      setEntryPriceInput("");
      
      if (status === "PENDING") {
        toast(`Pending trade placed! Waiting for ${selectedAsset} to reach $${targetPrice.toLocaleString()}`, "success");
      } else {
        toast(`Trade placed! ${selectedAsset} ${pendingDirection} at $${strikeToUse.toLocaleString()}`, "success");
      }
    } catch (e: any) {
      toast(e.message || "Failed to place trade", "error");
    } finally {
      setPlacing(false);
    }
  };

  const handleSetTarget = async () => {
    if (!targetTradeId || !targetPriceInput) return;
    const target = parseFloat(targetPriceInput);
    if (isNaN(target) || target <= 0) {
      toast("Invalid target price", "error");
      return;
    }
    await setOptionsTradeTarget(targetTradeId, target);
    setShowTargetPopup(false);
    setTargetTradeId("");
    setTargetPriceInput("");
    toast(`Target exit price set to $${target.toLocaleString()}`, "success");
  };

  const activeTrade = user?.options?.find(o => o.status === "ACTIVE" && o.asset === selectedAsset);
  const allActiveTrades = user?.options?.filter(o => o.status === "ACTIVE" || o.status === "PENDING") || [];
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
                      onClick={() => handleInitialClick("UP")}
                      disabled={placing}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1.5 group"
                    >
                      <TrendingUp className="w-7 h-7 group-hover:-translate-y-1 transition-transform" />
                      <span className="tracking-[0.2em] uppercase text-[9px]">Buy / Call</span>
                      <span className="text-emerald-200/60 text-[8px] font-bold">85% Payout</span>
                    </button>
                    <button 
                      onClick={() => setShowSellPopup(true)}
                      disabled={placing}
                      className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-600/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1.5 group"
                    >
                      <TrendingDown className="w-7 h-7 group-hover:translate-y-1 transition-transform" />
                      <span className="tracking-[0.2em] uppercase text-[9px]">Sell / Put</span>
                      <span className="text-rose-200/60 text-[8px] font-bold">Manage Positions</span>
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
                        const isUp = trade.direction === "UP";
                        const currentPrice = liveMarketPrices[trade.asset] || trade.strikePrice;
                        
                        let pnl = 0;
                        let pnlPercent = 0;
                        if (trade.status === "ACTIVE") {
                          if (isUp) pnlPercent = (currentPrice - trade.strikePrice) / trade.strikePrice;
                          else pnlPercent = (trade.strikePrice - currentPrice) / trade.strikePrice;
                          pnl = trade.amount * pnlPercent;
                        }

                        // Pending expiry calculation
                        let pendingMins = 0;
                        let pendingSecs = 0;
                        if (trade.status === "PENDING") {
                           const timeLeft = Math.max(0, (trade.startTime + trade.durationMinutes * 60 * 1000) - currentTime);
                           pendingMins = Math.floor(timeLeft / 60000);
                           pendingSecs = Math.floor((timeLeft % 60000) / 1000);
                        }
                        
                        return (
                          <div key={trade.id} className="bg-slate-50 dark:bg-gray-950/50 border border-slate-100 dark:border-gray-800 rounded-2xl p-5 shadow-inner group hover:border-indigo-500/30 transition-all flex flex-col gap-4">
                             <div className="flex justify-between items-center">
                               <div className="flex items-center gap-3">
                                 <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${isUp ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'} animate-pulse`}></div>
                                 <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{trade.asset}</span>
                                 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${isUp ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                                   {trade.direction}
                                 </span>
                               </div>
                               {trade.status === "PENDING" && (
                                 <div className="text-xs font-black tabular-nums text-indigo-500 dark:text-indigo-400">
                                   {pendingMins}:{pendingSecs.toString().padStart(2, '0')}
                                 </div>
                               )}
                               {trade.status === "ACTIVE" && (
                                 <div className={`text-xs font-black tabular-nums ${pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                   {pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({(pnlPercent * 100).toFixed(2)}%)
                                 </div>
                               )}
                             </div>

                             <div className="flex justify-between items-end border-t border-slate-100 dark:border-gray-800/50 pt-3">
                               <div>
                                 <div className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Entry Price</div>
                                 <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                                   ${trade.status === "PENDING" ? trade.targetEntryPrice?.toLocaleString() : trade.strikePrice.toLocaleString()}
                                 </div>
                                 <div className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest mt-1">Stake: ${trade.amount.toLocaleString()}</div>
                               </div>

                               <div className="text-right">
                                 {trade.status === "PENDING" ? (
                                    <div className="flex flex-col items-end gap-2">
                                      <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/20">Pending Execution</div>
                                      <button 
                                        onClick={() => cancelPendingOptionsTrade(trade.id)}
                                        className="text-[9px] font-black text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-500/50 px-3 py-1 rounded-lg transition-colors uppercase tracking-widest"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                 ) : trade.adminResult ? (
                                   <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                                      <Activity className="w-3 h-3" /> Oracle Syncing
                                   </div>
                                 ) : (
                                   <div className="flex flex-col items-end gap-2">
                                     <div className="flex gap-2">
                                       <button 
                                         onClick={() => {
                                           setTargetTradeId(trade.id);
                                           setTargetPriceInput("");
                                           setShowTargetPopup(true);
                                         }}
                                         className="text-[8px] font-black text-indigo-500 hover:text-white hover:bg-indigo-500 border border-indigo-500/50 px-2 py-1 rounded-md transition-colors uppercase tracking-widest"
                                       >
                                         Set Target
                                       </button>
                                       <button 
                                         onClick={async () => {
                                           const res = await closeOptionsTrade(trade.id, currentPrice);
                                           if (res) toast(`Trade closed for $${res.profit > 0 ? "+" : ""}${res.profit.toLocaleString()} profit.`, res.profit > 0 ? "success" : "error");
                                         }}
                                         className="text-[8px] font-black text-white hover:text-white bg-rose-600 hover:bg-rose-500 px-2 py-1 rounded-md transition-colors uppercase tracking-widest"
                                       >
                                         Sell / Put
                                       </button>
                                     </div>
                                     {trade.targetExitPrice && (
                                       <div className="text-[8px] font-black text-amber-500 uppercase tracking-widest">
                                         Target: ${trade.targetExitPrice.toLocaleString()}
                                       </div>
                                     )}
                                   </div>
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

      {/* Entry Price Popup */}
      {showEntryPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-1 uppercase tracking-tight">Confirm Entry Point</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 text-center mb-6 font-bold uppercase tracking-widest">
              Current Price: <span className="text-indigo-500">${livePrice.toLocaleString()}</span>
            </p>
            
            <div className="mb-6">
              <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Target Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">$</span>
                <input
                  type="number"
                  value={entryPriceInput}
                  onChange={(e) => setEntryPriceInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-2xl py-4 pl-8 pr-4 text-lg font-black outline-none focus:border-indigo-500 transition-colors tabular-nums"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-2 font-medium">
                {pendingDirection === "UP" 
                  ? "If price is lower than current, order will pend until it drops."
                  : "If price is higher than current, order will pend until it rises."
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowEntryPopup(false);
                  setPendingDirection(null);
                }} 
                className="flex-1 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-900 dark:text-white px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePlaceTrade} 
                disabled={placing}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {placing ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Set Target Popup */}
      {showTargetPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-6 uppercase tracking-tight">Set Exit Target</h3>
            
            <div className="mb-6">
              <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Target Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">$</span>
                <input
                  type="number"
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-2xl py-4 pl-8 pr-4 text-lg font-black outline-none focus:border-indigo-500 transition-colors tabular-nums"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowTargetPopup(false);
                  setTargetTradeId("");
                  setTargetPriceInput("");
                }} 
                className="flex-1 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-900 dark:text-white px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSetTarget} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-indigo-600/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sell/Put Popup (List Active Trades) */}
      {showSellPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Positions</h3>
              <button onClick={() => setShowSellPopup(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-none mb-6">
               {allActiveTrades.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <Activity className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">No positions to sell</p>
                  </div>
               ) : (
                  allActiveTrades.map(trade => {
                    const isUp = trade.direction === "UP";
                    const currentPrice = liveMarketPrices[trade.asset] || trade.strikePrice;
                    
                    let pnl = 0;
                    if (trade.status === "ACTIVE") {
                      const pnlPercent = isUp ? (currentPrice - trade.strikePrice) / trade.strikePrice : (trade.strikePrice - currentPrice) / trade.strikePrice;
                      pnl = trade.amount * pnlPercent;
                    }

                    return (
                      <div key={trade.id} className="bg-slate-50 dark:bg-gray-950/50 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 flex justify-between items-center group">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-black text-slate-900 dark:text-white">{trade.asset}</span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              {trade.direction}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            Stake: ${trade.amount.toLocaleString()}
                          </div>
                          {trade.status === "ACTIVE" && (
                            <div className={`text-xs font-black mt-1 ${pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                              {pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                          )}
                          {trade.status === "PENDING" && (
                            <div className="text-xs font-black text-amber-500 mt-1 uppercase tracking-widest">
                              Pending
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={async () => {
                            if (trade.status === "PENDING") {
                              await cancelPendingOptionsTrade(trade.id);
                              toast(`Pending order for ${trade.asset} cancelled.`, "error");
                            } else {
                              const res = await closeOptionsTrade(trade.id, currentPrice);
                              if (res) toast(`Trade closed for $${res.profit > 0 ? "+" : ""}${res.profit.toLocaleString()} profit.`, res.profit > 0 ? "success" : "error");
                            }
                            if (allActiveTrades.length === 1) setShowSellPopup(false);
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-rose-600/20"
                        >
                          {trade.status === "PENDING" ? "Cancel" : "Sell / Put"}
                        </button>
                      </div>
                    )
                  })
               )}
            </div>

            <button 
              onClick={() => setShowSellPopup(false)} 
              className="w-full bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-900 dark:text-white px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
