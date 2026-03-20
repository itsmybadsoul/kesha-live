"use client";
import React from "react";
import { Trophy, Medal, Star, TrendingUp, ChevronUp } from "lucide-react";
import { useUser } from "@/context/UserContext";

const TOP_TRADERS = [
  { rank: 1, name: "WhaleHunter99", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=whale", pnl: 145920.50, winRate: 94 },
  { rank: 2, name: "AlphaBot_V2", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=alpha1", pnl: 98450.00, winRate: 88 },
  { rank: 3, name: "CryptoKing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=king", pnl: 67120.75, winRate: 82 },
  { rank: 4, name: "DeFi_Degen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=degen", pnl: 45000.20, winRate: 79 },
  { rank: 5, name: "MacroTrend", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=macro", pnl: 38900.00, winRate: 75 }
];

export function GlobalLeaderboard() {
  const { user, balance } = useUser();

  // Create a realistic-looking PnL for the current user based on balance
  const userPnl = balance ? (balance * 0.15) : 0; // Fake 15% profit
  const userRank = user ? Math.max(50, Math.floor(10000 - balance)) : 15842;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-400" fill="currentColor" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" fill="currentColor" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" fill="currentColor" />;
    return <span className="text-sm font-black text-gray-500 w-5 text-center">#{rank}</span>;
  };

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
            Global Top Earners <Trophy className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Weekly PNL Leaderboard</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 relative z-10">
        {TOP_TRADERS.map((trader) => (
          <div key={trader.rank} className="flex items-center justify-between p-3 bg-black/40 border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center shrink-0">
                {getRankBadge(trader.rank)}
              </div>
              <img src={trader.avatar} alt={trader.name} className="w-10 h-10 rounded-full bg-gray-800 p-0.5" />
              <div>
                <div className="text-sm font-bold text-gray-300 flex items-center gap-1">
                  {trader.name}
                  {trader.rank === 1 && <Star className="w-3 h-3 text-amber-400" fill="currentColor" />}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {trader.winRate}% Win Rate
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-emerald-400">+${trader.pnl.toLocaleString()}</div>
            </div>
          </div>
        ))}

        {user && (
          <div className="mt-6 pt-4 border-t border-gray-800/50">
            <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 animate-translate-x"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 flex justify-center shrink-0">
                  <span className="text-xs font-black text-indigo-400 w-5 text-center">#{userRank.toLocaleString()}</span>
                </div>
                <img src={user.avatar} alt="You" className="w-10 h-10 rounded-full bg-gray-900 p-0.5 border border-indigo-500/50" />
                <div>
                  <div className="text-sm font-black text-white">You</div>
                  <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-1">
                    <ChevronUp className="w-3 h-3" /> Climbing
                  </div>
                </div>
              </div>
              <div className="text-right relative z-10">
                <div className="text-sm font-black text-emerald-400">+${userPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
