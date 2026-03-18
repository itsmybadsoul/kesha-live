"use client";

import { Activity, ArrowUpRight, ArrowDownRight, Clock, Trash2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function ActiveCopiedTrades() {
  const { activeTrades, removeTrade } = useUser();

  if (activeTrades.length === 0) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 lg:p-8 text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-900/50 border border-gray-700 mb-4">
          <Activity className="w-6 h-6 text-gray-500" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">No Active Trades</h2>
        <p className="text-sm text-gray-400 px-8">Find elite traders in the social leaderboard and start copying their moves automatically.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Live Copied Trades <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
        </h2>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          {activeTrades.length} Active
        </div>
      </div>

      <div className="space-y-3">
        {activeTrades.map((trade) => {
          const now = Date.now();
          const total = (trade.endDate || now) - (trade.startDate || now);
          const elapsed = now - (trade.startDate || now);
          const progress = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;
          const daysLeft = total > 0 ? Math.max(Math.ceil(((trade.endDate || now) - now) / (1000 * 60 * 60 * 24)), 0) : 0;

          return (
            <div key={trade.id} className="relative bg-gradient-to-r from-gray-900/80 to-gray-800 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors group overflow-hidden">
              <div className="absolute top-0 left-0 h-1 bg-indigo-500/20 w-full">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${trade.type === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {trade.type} {trade.leverage}
                    </span>
                    <span className="text-white font-bold text-sm">{trade.pair}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trade.trader.split(' ')[0]}`} alt={trade.trader} className="w-4 h-4 rounded-full bg-gray-700" />
                    {trade.trader}
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Status</div>
                   <div className="text-xs font-bold text-indigo-400 flex items-center gap-1 justify-end">
                     <Clock className="w-3 h-3" /> {daysLeft} Days Remaining
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium pt-3 border-t border-gray-700/50">
                <div className="text-gray-400 space-y-1">
                  <div className="flex justify-between"><span>Entry:</span> <span className="text-gray-300">${trade.entry.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-indigo-300"><span>Allocation:</span> <span>${trade.allocation?.toLocaleString() || "100.00"}</span></div>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Estimated PnL</div>
                  <div className="text-sm font-black text-gray-400 italic">Calculating...</div>
                </div>
              </div>
              
              <div className="mt-4 text-[9px] text-gray-600 uppercase font-black tracking-widest text-center border-t border-gray-700/30 pt-2 italic">
                Locked Maturity: Term Ends {new Date(trade.endDate || 0).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
