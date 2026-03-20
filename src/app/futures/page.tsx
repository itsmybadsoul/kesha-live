"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { TrendingUp, TrendingDown, Clock, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { OptionsChart } from "@/components/OptionsChart";

const ASSETS: Record<string, number> = {
  BTC: 64230.50,
  ETH: 3450.20,
  SOL: 145.80,
  BNB: 580.40,
  XRP: 0.62,
  ADA: 0.45,
  DOGE: 0.16,
  LINK: 18.10,
  AVAX: 36.40,
  MATIC: 0.72,
};

export default function FuturesOptions() {
  const { user, balance, placeOptionsTrade, resolveOptionsTrade, refreshUser } = useUser();
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState<number>(3);
  const [placing, setPlacing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [livePrice, setLivePrice] = useState(ASSETS["BTC"]);

  // Sync initial live price when asset changes
  useEffect(() => {
    setLivePrice(ASSETS[selectedAsset]);
  }, [selectedAsset]);

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
          const basePrice = ASSETS[trade.asset] || 100;
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
      alert(`Trade placed: ${selectedAsset} contracts ${direction} at $${strike.toLocaleString()}`);
    } catch (e: any) {
      alert(e.message || "Failed to place trade");
    } finally {
      setPlacing(false);
    }
  };

  const activeTrade = user?.options?.find(o => o.status === "ACTIVE" && o.asset === selectedAsset);
  const allActiveTrades = user?.options?.filter(o => o.status === "ACTIVE") || [];
  const historyTrades = user?.options?.filter(o => o.status === "COMPLETED") || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-indigo-500/30 font-sans pb-20">
      
      {/* Top Banner */}
      <div className="bg-[#12141d] border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <a href="/" className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Blockchain</a>
              <span className="text-gray-700">|</span>
              <span className="text-sm font-black text-indigo-400 tracking-widest uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" /> Pro Options
              </span>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available Margin</div>
                 <div className="text-sm font-black text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <a href="/" className="text-xs font-bold text-gray-400 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-xl">Dashboard</a>
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Chart & Asset Selector */}
            <div className="lg:col-span-8 flex flex-col gap-6">
               
               {/* Asset Strip */}
               <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-2 flex overflow-x-auto gap-2 scrollbar-none">
                 {Object.entries(ASSETS).map(([sym, price]) => (
                   <button 
                     key={sym}
                     onClick={() => setSelectedAsset(sym)}
                     className={`flex-shrink-0 px-4 py-3 rounded-xl min-w-[120px] transition-all ${
                       selectedAsset === sym ? "bg-indigo-600 border border-indigo-500 shadow-xl" : "bg-black/40 border border-gray-800 hover:border-gray-600"
                     }`}
                   >
                     <div className="text-xs font-black text-white mb-1">{sym}/USD</div>
                     <div className={`text-sm font-bold ${selectedAsset === sym ? "text-indigo-100" : "text-gray-400"}`}>
                       ${selectedAsset === sym ? livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : price.toLocaleString()}
                     </div>
                   </button>
                 ))}
               </div>

               {/* Chart Container */}
               <div className="h-[500px] w-full bg-black/40 border border-gray-800 rounded-3xl p-1 relative shadow-2xl">
                  <OptionsChart 
                    asset={selectedAsset} 
                    basePrice={ASSETS[selectedAsset]} 
                    activeTrade={activeTrade} 
                    onPriceUpdate={setLivePrice}
                  />
               </div>
            </div>

            {/* Right: Order Entry & Positions */}
            <div className="lg:col-span-4 flex flex-col gap-6">
               
               {/* Trade Panel */}
               <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 shadow-2xl">
                 <h2 className="text-sm font-black text-white flex items-center gap-2 mb-6 uppercase tracking-widest">
                   Order Entry <ShieldCheck className="w-4 h-4 text-emerald-400" />
                 </h2>
                 
                 {/* Amount */}
                 <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 mb-4 focus-within:border-indigo-500/50 transition-colors">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Investment Amount (USD)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-400">$</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100.00"
                        className="bg-transparent text-2xl font-black text-white outline-none w-full"
                      />
                      <button onClick={() => setAmount(balance.toString())} className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md uppercase">Max</button>
                    </div>
                 </div>

                 {/* Duration */}
                 <div className="mb-6">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Timeframe & Expiry</label>
                    <div className="flex gap-2">
                       {[3, 5, 10].map(m => (
                          <button
                            key={m}
                            onClick={() => setDuration(m)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border ${
                              duration === m ? "bg-white text-black border-transparent shadow-lg" : "bg-black/40 text-gray-400 border-gray-800 hover:border-gray-600"
                            }`}
                          >
                            <Clock className="w-3 h-3 inline-block mr-1 -mt-0.5" /> {m} MIN
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <button 
                      onClick={() => handlePlaceTrade("UP")}
                      disabled={placing}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                      <TrendingUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                      <span className="tracking-widest uppercase text-[10px]">Call (Up)</span>
                      <span className="text-emerald-100 text-[9px] font-bold">85% Payout</span>
                    </button>
                    <button 
                      onClick={() => handlePlaceTrade("DOWN")}
                      disabled={placing}
                      className="bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                      <TrendingDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
                      <span className="tracking-widest uppercase text-[10px]">Put (Down)</span>
                      <span className="text-rose-100 text-[9px] font-bold">85% Payout</span>
                    </button>
                 </div>

                 <div className="flex items-center gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                   <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0" />
                   <p className="text-[9px] font-medium text-indigo-300 leading-relaxed uppercase">
                     Options trading carries significant risk. Capital is locked until contract expiry.
                   </p>
                 </div>
               </div>

               {/* Active Options Tracker */}
               <div className="flex-1 bg-gray-900/80 border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col">
                 <h2 className="text-sm font-black text-white flex items-center gap-2 mb-4 uppercase tracking-widest">
                   Active Positions <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">{allActiveTrades.length}</span>
                 </h2>
                 <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-none">
                    {allActiveTrades.length === 0 ? (
                      <div className="text-center py-10 opacity-30">
                        <Activity className="w-10 h-10 mx-auto text-gray-500 mb-3" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Active Bets</p>
                      </div>
                    ) : (
                      allActiveTrades.map(trade => {
                        const timeLeft = Math.max(0, (trade.startTime + trade.durationMinutes * 60 * 1000) - currentTime);
                        const mins = Math.floor(timeLeft / 60000);
                        const secs = Math.floor((timeLeft % 60000) / 1000);
                        const isUp = trade.direction === "UP";
                        
                        return (
                          <div key={trade.id} className="bg-black/40 border border-gray-800 rounded-xl p-4">
                             <div className="flex justify-between items-center mb-2">
                               <div className="flex items-center gap-2">
                                 <span className={`w-2 h-2 rounded-full animate-pulse ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                 <span className="text-xs font-black text-white">{trade.asset}</span>
                                 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                   {trade.direction}
                                 </span>
                               </div>
                               <div className="text-xs font-mono text-gray-300">
                                 {mins}:{secs.toString().padStart(2, '0')}
                               </div>
                             </div>
                             <div className="flex justify-between items-end border-t border-gray-800 pt-2 mt-2">
                               <div>
                                 <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Stake</div>
                                 <div className="text-sm font-black text-white">${trade.amount.toLocaleString()}</div>
                               </div>
                               <div className="text-right">
                                 <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Status</div>
                                 {trade.adminResult ? (
                                   <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse border-b border-indigo-400/50">Vols Spiking</div>
                                 ) : (
                                   <div className="text-[10px] font-bold text-emerald-400 uppercase">In Play</div>
                                 )}
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
