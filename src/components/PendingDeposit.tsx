"use client";

import { CheckCircle2, Copy, Wallet } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function PendingDeposit() {
  const { user } = useUser();

  if (!user?.pendingDeposit) return null;

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 lg:p-8 relative overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        <div className="flex items-start gap-4 w-full md:w-auto">
          <div className="bg-yellow-500/20 p-3 rounded-2xl border border-yellow-500/20 mt-1 shrink-0">
            <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-yellow-400">${user.pendingDeposit.amount.toLocaleString()} USDT</span> Pending
            </h3>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              We have received your request. Our system is verifying the transaction on the blockchain. Your funds are safe and will be credited within 5-15 minutes.
            </p>
          </div>
        </div>

        <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-700/50 w-full md:w-72 shrink-0">
          <div className="flex justify-between items-center mb-3">
             <span className="text-xs text-gray-500 uppercase font-medium">Tx Hash</span>
             <span className="bg-gray-800 text-[10px] text-gray-400 px-2 py-0.5 rounded border border-gray-700">TRC20</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
             <span className="text-sm font-mono text-gray-300 truncate">
               {user.pendingDeposit.txid}
             </span>
             <button 
               onClick={() => navigator.clipboard.writeText(user.pendingDeposit?.txid || "")}
               className="text-gray-500 hover:text-white transition-colors block ml-auto shrink-0"
              >
               <Copy className="w-4 h-4" />
             </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
               <CheckCircle2 className="w-3 h-3" /> TX Sent
            </span>
            <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
               <Wallet className="w-3 h-3" /> Verifying...
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
