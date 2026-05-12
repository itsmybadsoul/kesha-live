"use client";

import { useState } from "react";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

export function ROICalculator() {
  const [deposit, setDeposit] = useState(1500);
  
  // Dynamic rate based on deposit amount (gamification)
  const getRate = (amount: number) => {
    if (amount >= 20000) return 0.05; // Platinum
    if (amount >= 5000) return 0.035; // Gold
    if (amount >= 1000) return 0.02;  // Silver
    return 0.01; // Bronze
  };

  const currentRate = getRate(deposit);
  const dailyReturn = (deposit * currentRate).toFixed(2);
  const monthlyReturn = (deposit * currentRate * 30).toFixed(2);

  const getTierColor = () => {
    if (deposit >= 20000) return "text-fuchsia-400";
    if (deposit >= 5000) return "text-amber-400";
    if (deposit >= 1000) return "text-cyan-400";
    return "text-blue-400";
  };

  const getTierName = () => {
    if (deposit >= 20000) return "Platinum (+4% Bonus)";
    if (deposit >= 5000) return "Gold (+2.5% Bonus)";
    if (deposit >= 1000) return "Silver (+1% Bonus)";
    return "Bronze Tier";
  };

  return (
    <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>

      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className="bg-indigo-500/10 p-3.5 rounded-2xl border border-indigo-500/20">
          <Calculator className="w-7 h-7 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Yield Projection</h2>
          <p className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time liquidity earning simulator</p>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        {/* Slider Section */}
        <div className="space-y-5">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Projection Principal</span>
            <div className="flex items-center text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              <span className="text-indigo-500 mr-1">$</span>
              {deposit.toLocaleString()}
            </div>
          </div>
          
          <div className="relative h-6 flex items-center">
            <input 
              type="range" 
              min="100" 
              max="25000" 
              step="100"
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-indigo-600 border border-slate-200 dark:border-gray-700 shadow-inner"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest px-1">
            <span>$100 MIN</span>
            <span>$25,000+ MAX</span>
          </div>
        </div>

        {/* Results Box */}
        <div className="bg-slate-50 dark:bg-gray-950/50 rounded-2xl p-6 border border-slate-100 dark:border-gray-800 shadow-inner relative group">
          <div className="absolute -top-12 -right-12 p-4 opacity-[0.03] group-hover:opacity-5 transition-opacity">
            <TrendingUp className="w-48 h-48" />
          </div>
          
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Protocol Tier</span>
            <span className={`text-[10px] font-black uppercase tracking-widest bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm ${getTierColor()}`}>
              {getTierName()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 relative z-10">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2">Daily Revenue</p>
              <p className={`text-3xl font-black tabular-nums tracking-tighter ${getTierColor()} transition-colors duration-500`}>
                ${dailyReturn}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2">Monthly Delta</p>
              <p className="text-3xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white transition-colors duration-500">
                ${monthlyReturn}
              </p>
            </div>
          </div>
        </div>

        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs">
          Provision ${deposit.toLocaleString()} Now
        </button>
      </div>
    </div>
  );
}
