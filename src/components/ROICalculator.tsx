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
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 lg:p-8 relative">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-500/20 p-3 rounded-xl">
          <Calculator className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Dream ROI Calculator</h2>
          <p className="text-sm text-gray-400">See your potential daily earnings in real-time.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Slider Section */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-400 font-medium">If I deposit...</span>
            <div className="flex items-center text-3xl font-bold text-white">
              <DollarSign className="w-6 h-6 text-gray-500" />
              {deposit.toLocaleString()}
            </div>
          </div>
          
          <input 
            type="range" 
            min="100" 
            max="25000" 
            step="100"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
            <span>$100</span>
            <span>$25,000+</span>
          </div>
        </div>

        {/* Results Box */}
        <div className="bg-gray-900/60 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24" />
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-400">Active Tier:</span>
            <span className={`text-sm font-bold bg-gray-800 px-3 py-1 rounded-full border border-gray-700 ${getTierColor()}`}>
              {getTierName()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Daily Profit</p>
              <p className={`text-3xl font-bold ${getTierColor()} transition-colors duration-300`}>
                ${dailyReturn}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Monthly (30D)</p>
              <p className="text-3xl font-bold text-white transition-colors duration-300">
                ${monthlyReturn}
              </p>
            </div>
          </div>
        </div>

        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]">
          Deposit ${deposit.toLocaleString()} Now
        </button>
      </div>
    </div>
  );
}
