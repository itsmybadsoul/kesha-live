"use client";

import { Users, TrendingUp, Search, Activity, HeartHandshake } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";
import { Portal } from "./Portal";

const mockTraders = [
  { id: 1, name: "WhaleHunter", type: "High Risk", roi: "+245.5%", winRate: "68%", copiers: 1250, avatar: "/trader1.png", color: "text-rose-500", border: "border-rose-500/20" },
  { id: 2, name: "SteadyHands", type: "Low Risk", roi: "+45.2%", winRate: "92%", copiers: 8400, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop", color: "text-emerald-500", border: "border-emerald-500/20" },
  { id: 3, name: "AlphaBot AI", type: "Algorithmic", roi: "+112.8%", winRate: "81%", copiers: 4320, avatar: "/trader3.png", color: "text-indigo-500", border: "border-indigo-500/20" },
  { id: 4, name: "DeFi Degen", type: "Extreme", roi: "+890.1%", winRate: "42%", copiers: 890, avatar: "/trader4.png", color: "text-orange-500", border: "border-orange-500/20" },
  { id: 5, name: "MacroTrend", type: "Moderate", roi: "+88.4%", winRate: "75%", copiers: 3100, avatar: "/trader5.png", color: "text-cyan-500", border: "border-cyan-500/20" }
];

export function CopyTrading() {
  const { addTrade, updateBalance, completeQuest, balance } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [amount, setAmount] = useState<string>("100");

  const handleCopy = (trader: any) => {
    setSelectedTrader(trader);
  };

  const confirmCopy = () => {
    const alloc = parseFloat(amount);
    if (isNaN(alloc) || alloc < 50) {
      toast("Minimum allocation is $50", "warning");
      return;
    }
    if (balance < alloc) {
      toast("Insufficient balance!", "error");
      return;
    }

    const newTrade = {
      id: Date.now(),
      trader: selectedTrader.name,
      pair: "BTC/USDT",
      type: (Math.random() > 0.5 ? "LONG" : "SHORT") as "LONG" | "SHORT",
      leverage: "10x",
      entry: 64000 + Math.random() * 1000,
      current: 64000 + Math.random() * 1000,
      pnl: "Calculated at maturity",
      time: "Just now",
      isProfit: true,
      allocation: alloc
    };

    updateBalance(-alloc);
    addTrade(newTrade);
    completeQuest(2); // Complete "Social Butterfly"
    setSelectedTrader(null);
    toast(`Started copying ${selectedTrader.name}! $${alloc} allocated.`, "success");
  };

  const filteredTraders = mockTraders.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tighter uppercase italic">
            Mirror <span className="text-indigo-500 not-italic">Trading</span> <Users className="w-8 h-8 text-indigo-500" />
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-black uppercase tracking-[0.2em] opacity-70">Synchronize your node with elite institutional operators</p>
        </div>
        <div className="relative w-full xl:w-auto">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600" />
          <input 
            type="text" 
            placeholder="Search Protocol Nodes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-50 dark:bg-gray-950/50 border-2 border-slate-100 dark:border-gray-800 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-indigo-500/30 text-slate-900 dark:text-white w-full xl:w-80 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-gray-800 shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {filteredTraders.map((trader) => (
          <div key={trader.id} className="group bg-slate-50 dark:bg-gray-950/30 border-2 border-slate-100 dark:border-gray-800/50 hover:border-indigo-500/40 rounded-[2rem] p-6 transition-all duration-500 relative cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10">
             <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-5">
                 <div className="relative">
                    <div className="w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-br from-slate-200 to-slate-100 dark:from-gray-800 dark:to-gray-700 group-hover:from-indigo-600 group-hover:to-purple-500 transition-all duration-500 shadow-lg">
                      <img src={trader.avatar} alt={trader.name} className="w-full h-full rounded-[14px] object-cover bg-white dark:bg-gray-950" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-gray-950 rounded-full animate-pulse"></div>
                 </div>
                 <div>
                   <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tighter uppercase italic">{trader.name}</h3>
                   <span className={`text-[9px] px-3 py-1 rounded-lg border ${trader.border} ${trader.color} font-black tracking-[0.15em] uppercase mt-2 inline-block bg-white dark:bg-gray-900 shadow-sm`}>
                     {trader.type}
                   </span>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-2xl font-black text-emerald-500 tabular-nums tracking-tighter">{trader.roi}</p>
                 <p className="text-[9px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest mt-1">Net Yield</p>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 text-xs mt-6 bg-white dark:bg-gray-900/50 rounded-2xl p-4 border border-slate-100 dark:border-gray-800 shadow-inner">
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">Active Mirroring</span>
                 <span className="flex items-center gap-2 font-black text-slate-700 dark:text-gray-300"><Users className="w-3.5 h-3.5 text-indigo-500" /> {trader.copiers.toLocaleString()}</span>
               </div>
               <div className="flex flex-col gap-1 border-l border-slate-100 dark:border-gray-800 pl-4">
                 <span className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">Victory Ratio</span>
                 <span className="flex items-center gap-2 font-black text-slate-700 dark:text-gray-300"><Activity className="w-3.5 h-3.5 text-emerald-500" /> {trader.winRate}</span>
               </div>
             </div>

             <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800/50">
               <button 
                 onClick={() => handleCopy(trader)}
                 className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/10 group-hover:shadow-indigo-600/30 uppercase tracking-[0.2em] text-[10px] active:scale-[0.98]"
               >
                 <HeartHandshake className="w-5 h-5 group-hover:scale-110 transition-transform" /> Sync Protocol
               </button>
             </div>
          </div>
        ))}
      </div>

      {/* Allocation Modal */}
      {selectedTrader && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setSelectedTrader(null)}></div>
            <div className="relative bg-white dark:bg-gray-900/80 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 w-full max-w-lg rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 opacity-60"></div>
              
              <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase italic">
                Mirror <span className="text-indigo-500 not-italic">Protocol</span>
              </h2>
              <p className="text-slate-500 dark:text-gray-500 text-[10px] mb-10 font-black uppercase tracking-widest opacity-70">Synchronizing node with operator: <span className="text-indigo-500">{selectedTrader.name}</span></p>
              
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em] ml-1">Allocation_Quantum (USDT)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-700 font-black text-xl">$</span>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-950/50 border-2 border-slate-100 dark:border-gray-800 rounded-3xl pl-12 pr-8 py-6 text-3xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all tabular-nums tracking-tighter placeholder:text-slate-200 dark:placeholder:text-gray-900 shadow-inner"
                      placeholder="Min 50.00"
                    />
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">Available_Liquidity</p>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-500/5 px-2.5 py-1 rounded-lg border border-indigo-500/10">${balance.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedTrader(null)}
                    className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={confirmCopy}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
                  >
                    Execute Mirror Protocol
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
