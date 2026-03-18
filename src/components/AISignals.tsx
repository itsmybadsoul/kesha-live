"use client";

import { BrainCircuit, TrendingUp, TrendingDown, Clock, ArrowRight } from "lucide-react";

interface Signal {
  id: string;
  asset: string;
  action: "BUY" | "SELL";
  strength: number;
  price: string;
  time: string;
}

const MOCK_SIGNALS: Signal[] = [
  { id: "1", asset: "BTC/USDT", action: "BUY", strength: 89, price: "$72,845.20", time: "2m ago" },
  { id: "2", asset: "ETH/USDT", action: "SELL", strength: 64, price: "$2,240.45", time: "5m ago" },
  { id: "3", asset: "SOL/USDT", action: "BUY", strength: 94, price: "$142.15", time: "12m ago" },
  { id: "4", asset: "DOGE/USDT", action: "BUY", strength: 71, price: "$0.1450", time: "25m ago" },
];

export function AISignals() {
  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          AI Intelligence <BrainCircuit className="w-5 h-5 text-indigo-400" />
        </h3>
        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">
           Pro Signals
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_SIGNALS.map((signal) => (
          <div key={signal.id} className="bg-black/40 p-4 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all cursor-pointer group">
             <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                   <span className="text-xs font-black text-white">{signal.asset}</span>
                   <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {signal.time}
                   </span>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${
                   signal.action === "BUY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                   {signal.action}
                </div>
             </div>
             
             <div className="flex items-end justify-between">
                <div>
                   <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Confidence</div>
                   <div className="w-24 h-1.5 bg-gray-900 rounded-full overflow-hidden p-0.5">
                      <div 
                         className={`h-full rounded-full transition-all duration-1000 ${
                            signal.action === "BUY" ? "bg-emerald-500" : "bg-rose-500"
                         }`}
                         style={{ width: `${signal.strength}%` }}
                      ></div>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Signal Price</div>
                   <div className="text-sm font-black text-white tabular-nums">{signal.price}</div>
                </div>
             </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-black py-4 rounded-2xl transition-all text-xs border border-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">
         View All Intelligence <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
