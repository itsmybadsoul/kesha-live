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
        {activeTrades.map((trade) => (
          <div key={trade.id} className="relative bg-gradient-to-r from-gray-900/80 to-gray-800 border border-gray-700/50 rounded-xl p-4 hover:border-gray-600 transition-colors group">
            <button 
              onClick={() => removeTrade(trade.id)}
              className="absolute top-4 right-4 p-1.5 bg-gray-900/50 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="flex justify-between items-start mb-3">
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
              <div className="text-right pr-4">
                <div className={`flex items-center justify-end gap-1 font-black text-lg ${trade.isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trade.isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {trade.pnl}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-medium pt-3 border-t border-gray-700/50">
              <div className="text-gray-400 flex flex-col gap-0.5">
                <span>Entry: <span className="text-gray-300">${trade.entry.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></span>
                <span>Mark: <span className="text-gray-300">${trade.current.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" /> {trade.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
