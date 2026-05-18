"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { LivePriceTicker } from "@/components/LivePriceTicker";
import { User, Wallet, TrendingUp, History, ArrowUpRight, ArrowDownRight, Award, ShieldCheck, Search, MessageSquare, ArrowRightLeft, XCircle } from "lucide-react";
import { KYCPortal } from "@/components/KYCPortal";
import { DigitalMembershipCard } from "@/components/DigitalMembershipCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navbar } from "@/components/Navbar";
import { useCrypto } from "@/context/CryptoContext";

export default function ProfilePage() {
  const { user, balance, transactions, activeTrades, isLoading } = useUser();
  const { prices } = useCrypto();

  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<{ id: string, name: string, email: string, avatar: string } | null>(null);
  const [p2pModalOpen, setP2pModalOpen] = useState(false);
  const [p2pAction, setP2pAction] = useState<"BUY" | "SELL">("BUY");
  const [p2pAmount, setP2pAmount] = useState("");

  const handleSearch = () => {
    if (searchId.trim() === "A7X9B2Q1") {
      setSearchResult({
        id: "A7X9B2Q1",
        name: "Abu_Fares",
        email: "abu_fares@p2p.network",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abu_Fares&backgroundColor=b6e3f4"
      });
    } else {
      setSearchResult(null);
      // Here we would normally query the real DB, but per instructions A7X9B2Q1 is the only hardcoded one right now.
      alert("User not found.");
    }
  };

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white flex items-center justify-center p-6">
        <div className="text-center bg-white/60 dark:bg-gray-900/40 dark:bg-gray-800/40 backdrop-blur-xl border border-slate-300 dark:border-gray-700/50 p-10 rounded-3xl shadow-2xl max-w-sm w-full">
           <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-indigo-400" />
           </div>
           <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Login Required</h1>
           <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">Accessing your profile and trading history requires a secure session.</p>
           <a href="/login" className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
             Go to Login
           </a>
        </div>
      </div>
    );
  }

  const totalProfit = activeTrades.reduce((acc, curr) => acc + (curr.isProfit ? 50 : -20), 0); // Mock profit calculation
  const getPrice = (sym: string) => prices[sym] || 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <LivePriceTicker />
      
      <div className="sticky top-0 z-50 w-full flex flex-col">
        <Navbar />
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left: User Card & KYC */}
          <div className="lg:col-span-4 space-y-8">
            <DigitalMembershipCard />
            <KYCPortal />

            {/* User Search */}
            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
               
               <h3 className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 ml-1 flex items-center gap-2">
                 <Search className="w-4 h-4 text-amber-500" /> Search Users by ID
               </h3>
               
               <div className="relative z-10 space-y-6">
                 <div className="flex gap-3">
                   <input 
                     type="text" 
                     value={searchId}
                     onChange={(e) => setSearchId(e.target.value)}
                     placeholder="Enter User ID (e.g. A7X9B2Q1)"
                     className="flex-1 bg-slate-50 dark:bg-gray-950/50 border-2 border-slate-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-400 font-mono font-medium"
                   />
                   <button 
                     onClick={handleSearch}
                     className="bg-amber-500 hover:bg-amber-400 text-white px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                   >
                     Search
                   </button>
                 </div>

                 {searchResult && (
                   <div className="bg-slate-50 dark:bg-gray-950/50 border-2 border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner animate-in fade-in slide-in-from-bottom-2">
                     <div className="flex items-center gap-4">
                       <img src={searchResult.avatar} alt="Avatar" className="w-14 h-14 rounded-2xl border-2 border-white dark:border-gray-800 shadow-md" />
                       <div>
                         <div className="font-black text-lg text-slate-900 dark:text-white tracking-tighter">{searchResult.name}</div>
                         <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">{searchResult.id}</div>
                       </div>
                     </div>
                     <div className="flex gap-3 w-full sm:w-auto">
                       <button onClick={() => window.location.href = `/chat?user=${searchResult.name}`} className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-400 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2">
                         <MessageSquare className="w-4 h-4" /> Chat
                       </button>
                       <button onClick={() => setP2pModalOpen(true)} className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2">
                         <ArrowRightLeft className="w-4 h-4" /> P2P
                       </button>
                     </div>
                   </div>
                 )}
               </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>
               
               <h3 className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8 ml-1">Asset Allocation Snapshot</h3>
               
               <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-gray-950/50 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-inner">
                  <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Liquid Balance</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">${balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-gray-950/50 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-inner">
                  <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Market Holdings</span>
                  <span className="text-lg font-black text-emerald-500 dark:text-emerald-400 tabular-nums">${Object.entries(user?.holdings || {}).reduce((acc, [s, a]) => acc + (a * getPrice(s)), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-gray-950/50 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-inner">
                  <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Active Exposure</span>
                  <span className="text-lg font-black text-indigo-500 dark:text-indigo-400 tabular-nums">${activeTrades.reduce((a,c) => a+ (c.allocation || 0), 0).toLocaleString()}</span>
                </div>
               </div>
            </div>
          </div>

          {/* Right: History & Performance */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Performance Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl relative group">
                 <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2">Aggregate PnL</div>
                 <div className="text-3xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums">+{totalProfit.toLocaleString()} <span className="text-sm">USDT</span></div>
                 <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-black flex items-center gap-1.5 mt-2 uppercase tracking-tight">
                   <TrendingUp className="w-3.5 h-3.5" /> Growth Curve +12.4%
                 </div>
               </div>
               <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl relative">
                 <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2">Alpha Nodes</div>
                 <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{activeTrades.length}</div>
                 <div className="text-[10px] text-slate-400 dark:text-gray-500 font-bold mt-2 uppercase tracking-tight">Signals currently tracked</div>
               </div>
               <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                 <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2">Platform Volume</div>
                 <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">$24,580</div>
                 <div className="text-[10px] text-indigo-600 dark:text-indigo-500 font-bold mt-2 uppercase tracking-tight">Cumulative execution</div>
                 <Activity className="absolute -bottom-6 -right-6 w-24 h-24 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors" />
               </div>
            </div>

            {/* Crypto Portfolio */}
            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-10 relative z-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                  <Wallet className="w-7 h-7 text-emerald-500 dark:text-emerald-400" /> Multi-Asset Portfolio
                </h3>
                <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Verified Holdings</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {Object.entries(user?.holdings || {}).length === 0 ? (
                   <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[2rem]">
                      <Wallet className="w-16 h-16 mb-4 text-slate-400 dark:text-gray-500" />
                      <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">No assets in custodial storage</p>
                   </div>
                ) : (
                  Object.entries(user?.holdings || {}).map(([symbol, amount]) => (
                    <div key={symbol} className="bg-slate-50 dark:bg-gray-950/50 border border-slate-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-inner">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 flex items-center justify-center font-black text-xs text-indigo-500 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                           {symbol[0]}
                         </div>
                         <div>
                           <div className="font-black text-slate-900 dark:text-white text-base tracking-tighter">{symbol}</div>
                           <div className="text-[9px] text-slate-400 dark:text-gray-600 font-black tracking-widest uppercase">Spot Ticker</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="font-black text-slate-900 dark:text-white tabular-nums">{Number(amount).toLocaleString(undefined, {maximumFractionDigits: 6})}</div>
                         <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-black mt-1 uppercase tracking-tight">${(Number(amount) * getPrice(symbol)).toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="flex justify-between items-center mb-10 relative z-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                  <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" /> Audit Logs
                </h3>
                <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Immutable Record</div>
              </div>
              
              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-gray-800">
                      <th className="pb-6 px-4">Classification</th>
                      <th className="pb-6 px-4">Quantum</th>
                      <th className="pb-6 px-4">Verification</th>
                      <th className="pb-6 px-4">Metadata</th>
                      <th className="pb-6 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-gray-800/50">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-slate-400 dark:text-gray-500 italic text-sm">No ledger entries found on current node.</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="text-sm group hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition-colors">
                          <td className="py-6 px-4">
                            <span className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest border ${
                              tx.type === 'DEPOSIT' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' :
                              tx.type === 'WITHDRAW' ? 'bg-rose-500/5 border-rose-500/10 text-rose-500' :
                              tx.type === 'REWARD' ? 'bg-amber-500/5 border-amber-500/10 text-amber-500' :
                              'bg-indigo-500/5 border-indigo-500/10 text-indigo-500'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-6 px-4 font-black tabular-nums text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <span className={tx.type === 'WITHDRAW' || tx.type === 'TRADE' ? 'text-rose-500' : 'text-emerald-500'}>
                                {tx.type === 'WITHDRAW' || tx.type === 'TRADE' ? '-' : '+'}
                              </span>
                              ${tx.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-6 px-4 font-black uppercase text-[9px] tracking-widest">
                            <div className="flex items-center gap-1.5">
                               <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                               <span className={tx.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}>{tx.status}</span>
                            </div>
                          </td>
                          <td className="py-6 px-4 text-xs font-bold text-slate-500 dark:text-gray-400 truncate max-w-[200px]">{tx.description}</td>
                          <td className="py-6 px-4 text-right text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tabular-nums">
                            {new Date(tx.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* P2P Config Modal */}
      {p2pModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md" onClick={() => setP2pModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-900/80 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 w-full max-w-sm rounded-[3rem] p-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-black mb-6 tracking-tighter uppercase italic text-center">P2P <span className="text-blue-500 not-italic">Trade</span></h3>
            
            <div className="space-y-6">
              <div className="flex bg-slate-50 dark:bg-gray-950/50 p-1.5 rounded-2xl border-2 border-slate-100 dark:border-gray-800">
                <button 
                  onClick={() => setP2pAction("BUY")}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${p2pAction === "BUY" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  Buy
                </button>
                <button 
                  onClick={() => setP2pAction("SELL")}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${p2pAction === "SELL" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  Sell
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 ml-1">Trade Amount (USD)</label>
                <input 
                  type="number"
                  value={p2pAmount}
                  onChange={(e) => setP2pAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-50 dark:bg-gray-950/50 border-2 border-slate-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400 font-mono font-medium text-center"
                />
              </div>

              <button 
                onClick={() => window.location.href = `/chat?user=${searchResult?.name}&type=p2p&action=${p2pAction}&amount=${p2pAmount}`}
                disabled={!p2pAmount}
                className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                Initiate Contract
              </button>
            </div>
            
            <button onClick={() => setP2pModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors">
               <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
