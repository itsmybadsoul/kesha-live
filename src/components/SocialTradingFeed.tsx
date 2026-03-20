"use client";
import React, { useEffect, useState } from "react";
import { Activity, Zap, TrendingUp, TrendingDown, Target } from "lucide-react";
import { useRouter } from "next/navigation";

const TRADERS = [
  { name: "AlphaBot_V2", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=alpha1", vip: true },
  { name: "WhaleHunter99", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=whale", vip: true },
  { name: "DeFi_Degen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=degen", vip: false },
  { name: "MacroTrend", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=macro", vip: true },
  { name: "Sniper_ETH", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sniper", vip: false },
  { name: "CrystalBall", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crystal", vip: true }
];

const ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"];

export function SocialTradingFeed() {
  const router = useRouter();
  const [liveBets, setLiveBets] = useState<any[]>([]);

  useEffect(() => {
    // Generate initial seeds
    const initial = Array.from({ length: 4 }).map((_, i) => generateBet(i));
    setLiveBets(initial);

    // Keep generating new bets every 4-8 seconds
    const interval = setInterval(() => {
      setLiveBets(prev => {
        const newBet = generateBet(Date.now());
        return [newBet, ...prev].slice(0, 10); // Keep last 10 visible
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const generateBet = (id: number) => {
    const trader = TRADERS[Math.floor(Math.random() * TRADERS.length)];
    const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
    const isUp = Math.random() > 0.5;
    const amount = Math.floor(Math.random() * 9500) + 500; // $500 to $10,000
    const duration = [3, 5, 10][Math.floor(Math.random() * 3)];
    
    return {
      id: id.toString(),
      trader,
      asset,
      direction: isUp ? "UP" : "DOWN",
      amount,
      duration,
      timestamp: new Date()
    };
  };

  const handleCopyBet = (asset: string, direction: string, duration: number) => {
    // In a full implementation, this could auto-open a modal.
    // We will route them to futures.
    router.push("/futures");
  };

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
          Live Social Trading <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
        </h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Network</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-none relative z-10 block">
        {liveBets.map((bet) => {
          const isUp = bet.direction === "UP";
          return (
            <div key={bet.id} className="group bg-black/40 border border-gray-800 hover:border-indigo-500/30 rounded-2xl p-4 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={bet.trader.avatar} alt="trader" className="w-10 h-10 rounded-full bg-gray-800 p-0.5" />
                    {bet.trader.vip && (
                      <div className="absolute -bottom-1 -right-1 bg-amber-500 p-0.5 rounded-full border border-gray-900">
                        <Zap className="w-2.5 h-2.5 text-white" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-300 flex items-center gap-1">
                      {bet.trader.name}
                      {bet.trader.vip && <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1 rounded uppercase tracking-wider">Pro</span>}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">Placed a bet</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">${bet.amount.toLocaleString()}</div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{bet.duration}M Lock</div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-3 flex justify-between items-center border border-gray-800/50 group-hover:border-indigo-500/20 transition-colors">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                     {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                   </div>
                   <div>
                     <div className="text-sm font-black text-white">{bet.asset}/USDT</div>
                     <div className={`text-[10px] font-bold uppercase tracking-widest ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {bet.direction} EXPECTED
                     </div>
                   </div>
                </div>
                <button 
                  onClick={() => handleCopyBet(bet.asset, bet.direction, bet.duration)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-lg shadow-indigo-500/20"
                >
                  <Target className="w-3 h-3" /> Copy Bet
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
