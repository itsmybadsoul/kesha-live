"use client";

import { Users, TrendingUp, Search, Activity, HeartHandshake } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useState } from "react";

const mockTraders = [
  { id: 1, name: "WhaleHunter", type: "High Risk", roi: "+245.5%", winRate: "68%", copiers: 1250, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Whale", color: "text-rose-500", border: "border-rose-500/20" },
  { id: 2, name: "SteadyHands", type: "Low Risk", roi: "+45.2%", winRate: "92%", copiers: 8400, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Steady", color: "text-emerald-500", border: "border-emerald-500/20" },
  { id: 3, name: "AlphaBot AI", type: "Algorithmic", roi: "+112.8%", winRate: "81%", copiers: 4320, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alpha", color: "text-indigo-500", border: "border-indigo-500/20" },
  { id: 4, name: "DeFi Degen", type: "Extreme", roi: "+890.1%", winRate: "42%", copiers: 890, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Degen", color: "text-orange-500", border: "border-orange-500/20" },
  { id: 5, name: "MacroTrend", type: "Moderate", roi: "+88.4%", winRate: "75%", copiers: 3100, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Macro", color: "text-cyan-500", border: "border-cyan-500/20" }
];

export function CopyTrading() {
  const { addTrade, updateBalance, completeQuest, balance } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const handleCopy = (trader: any) => {
    if (balance < 100) {
      alert("Insufficient balance to start copying!");
      return;
    }

    const newTrade = {
      id: Date.now(),
      trader: trader.name,
      pair: "BTC/USDT",
      type: (Math.random() > 0.5 ? "LONG" : "SHORT") as "LONG" | "SHORT",
      leverage: "10x",
      entry: 64000 + Math.random() * 1000,
      current: 64000 + Math.random() * 1000,
      pnl: "+1.2%",
      time: "Just now",
      isProfit: true
    };

    updateBalance(-100);
    addTrade(newTrade);
    completeQuest(2); // Complete "Social Butterfly"
    alert(`Started copying ${trader.name}! $100 allocated.`);
  };

  const filteredTraders = mockTraders.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Social Copy Trading <Users className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-sm text-gray-400 mt-1">Mirror the trades of elite performers automatically.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search traders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 text-white w-full sm:w-64 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTraders.map((trader) => (
          <div key={trader.id} className="group bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-2xl p-5 transition-all duration-300 relative cursor-pointer">
             <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                 <div className="relative">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-gray-700 to-gray-600 group-hover:from-indigo-500 group-hover:to-cyan-400 transition-colors">
                      <img src={trader.avatar} alt={trader.name} className="w-full h-full rounded-full bg-gray-900" />
                    </div>
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-base">{trader.name}</h3>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full border ${trader.border} ${trader.color} font-medium tracking-wide uppercase mt-1 inline-block`}>
                     {trader.type}
                   </span>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-lg font-black text-emerald-400">{trader.roi}</p>
                 <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Total ROI</p>
               </div>
             </div>

             <div className="flex items-center justify-between text-xs text-gray-400 mt-4 bg-gray-900/50 rounded-xl p-3 border border-gray-800">
               <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-400" /> {trader.copiers.toLocaleString()}</span>
               <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-cyan-400" /> WR: <span className="text-white font-medium">{trader.winRate}</span></span>
             </div>

             <div className="mt-4 pt-4 border-t border-gray-700/50">
               <button 
                 onClick={() => handleCopy(trader)}
                 className="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(79,70,229,0.2)]"
               >
                 <HeartHandshake className="w-4 h-4" /> Copy Trader
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
