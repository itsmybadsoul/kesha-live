"use client";

import { Trophy, ChevronRight } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function VIPProgress() {
  const { balance } = useUser();
  
  // Logic for tiers based on balance/deposit simulation
  let tier = "Bronze";
  let nextTier = "Silver";
  let target = 1000;
  let color = "text-amber-600";
  let bonus = "0%";

  if (balance >= 5000) {
    tier = "Diamond";
    nextTier = "Max";
    target = 10000;
    color = "text-cyan-400";
    bonus = "5%";
  } else if (balance >= 2500) {
    tier = "Gold";
    nextTier = "Diamond";
    target = 5000;
    color = "text-yellow-400";
    bonus = "3%";
  } else if (balance >= 1000) {
    tier = "Silver";
    nextTier = "Gold";
    target = 2500;
    color = "text-gray-300";
    bonus = "1%";
  }

  const progress = Math.min((balance / target) * 100, 100);
  const remaining = Math.max(target - balance, 0);

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Current Tier</h3>
          <div className="flex items-center gap-2">
            <Trophy className={`w-5 h-5 ${color}`} />
            <span className="text-xl font-bold text-white">{tier}</span>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Next Tier</h3>
          <span className="text-xl font-bold text-gray-500">{nextTier}</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
          <span>${balance.toLocaleString()} USDT</span>
          <span>${target.toLocaleString()} USDT</span>
        </div>
        
        <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full relative transition-all duration-700"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        {remaining > 0 ? (
          <p className="text-sm text-gray-400 mt-4 text-center">
            Deposit <span className="text-emerald-400 font-bold">${remaining.toLocaleString()}</span> more to unlock {nextTier} Tier (+{bonus} Bonus)
          </p>
        ) : (
          <p className="text-sm text-emerald-400 mt-4 text-center font-bold">
            All tiers unlocked! Enjoy your {bonus} bonus APY.
          </p>
        )}
      </div>
      
      <button className="w-full mt-4 bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-600/50">
        View VIP Benefits <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
