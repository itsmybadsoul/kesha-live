"use client";

import { useUser } from "@/context/UserContext";
import { LivePriceTicker } from "@/components/LivePriceTicker";
import { User, Wallet, TrendingUp, History, ArrowUpRight, ArrowDownRight, Award, ShieldCheck } from "lucide-react";
import { KYCPortal } from "@/components/KYCPortal";
import { DigitalMembershipCard } from "@/components/DigitalMembershipCard";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function ProfilePage() {
  const { user, balance, transactions, activeTrades, isLoading } = useUser();

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
        <div className="text-center bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-10 rounded-3xl shadow-2xl max-w-sm w-full">
           <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-indigo-400" />
           </div>
           <h1 className="text-xl font-bold text-white mb-2">Login Required</h1>
           <p className="text-gray-400 text-sm mb-8">Accessing your profile and trading history requires a secure session.</p>
           <a href="/login" className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
             Go to Login
           </a>
        </div>
      </div>
    );
  }

  const totalProfit = activeTrades.reduce((acc, curr) => acc + (curr.isProfit ? 50 : -20), 0); // Mock profit calculation
  const prices: Record<string, number> = { BTC: 64230.50, ETH: 3450.20, BNB: 580.40, SOL: 145.80, XRP: 0.62, ADA: 0.45, DOGE: 0.16, TRX: 0.12, DOT: 7.20, MATIC: 0.72, AVAX: 36.40, LINK: 18.10, UNI: 7.80, NEAR: 6.90, LTC: 88.30, SHIB: 0.000027 };
  const getPrice = (sym: string) => prices[sym] || 1;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-indigo-500/30">
      <LivePriceTicker />
      
      {/* Navbar - Simplified for Profile */}
      <nav className="border-b border-gray-800 bg-[#0A0A0B]/80 backdrop-blur-xl sticky top-10 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Stocks Indicators</a>
          </a>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Dashboard</a>
            <span className="text-gray-700">/</span>
            <span className="text-white">Profile</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: User Card & KYC */}
          <div className="lg:col-span-4 space-y-6">
            <DigitalMembershipCard />
            <KYCPortal />

            {/* Quick Stats */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-gray-400 text-sm font-medium">Available Balance (USD)</span>
                <span className="text-white font-black">${balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-gray-400 text-sm font-medium">Crypto Holdings Value</span>
                <span className="text-emerald-400 font-black">${Object.entries(user?.holdings || {}).reduce((acc, [s, a]) => acc + (a * getPrice(s)), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-gray-400 text-sm font-medium">Active Allocations</span>
                <span className="text-indigo-400 font-black">${activeTrades.reduce((a,c) => a+ (c.allocation || 0), 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right: History & Performance */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Performance Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6">
                 <div className="text-gray-500 text-[10px] font-black uppercase mb-1">Total PnL</div>
                 <div className="text-2xl font-black text-emerald-400">+${totalProfit.toLocaleString()}</div>
                 <div className="text-[10px] text-emerald-500 flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> +12.4% All time</div>
               </div>
               <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6">
                 <div className="text-gray-500 text-[10px] font-black uppercase mb-1">Copied Traders</div>
                 <div className="text-2xl font-black text-white">{activeTrades.length}</div>
                 <div className="text-[10px] text-gray-400 mt-1">Currently following</div>
               </div>
               <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden">
                 <div className="text-gray-500 text-[10px] font-black uppercase mb-1">Total Trading Vol.</div>
                 <div className="text-2xl font-black text-indigo-400">$24,580</div>
                 <div className="text-[10px] text-indigo-500 mt-1">Platform volume</div>
                 <Activity className="absolute -bottom-4 -right-4 w-16 h-16 text-indigo-500/10" />
               </div>
            </div>

            {/* Crypto Portfolio */}
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> Spot Holdings
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(user?.holdings || {}).length === 0 ? (
                   <div className="col-span-full py-8 text-center text-gray-500 italic text-sm border-2 border-dashed border-gray-700/50 rounded-2xl">No assets currently held. Head to Dashboard to trade!</div>
                ) : (
                  Object.entries(user?.holdings || {}).map(([symbol, amount]) => (
                    <div key={symbol} className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-black text-[10px] text-emerald-400">
                           {symbol}
                         </div>
                         <div>
                           <div className="font-bold text-white text-sm">{symbol}</div>
                           <div className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Spot</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="font-black text-white">{Number(amount).toLocaleString(undefined, {maximumFractionDigits: 6})}</div>
                         <div className="text-[10px] text-emerald-400 mt-0.5">${(Number(amount) * getPrice(symbol)).toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" /> Transaction History
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-700/50">
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Description</th>
                      <th className="pb-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-500 italic text-sm">No transactions yet. Start trading to see history!</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="text-sm border-b border-gray-700/20 group hover:bg-white/5 transition-colors">
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                              tx.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-400' :
                              tx.type === 'WITHDRAW' ? 'bg-rose-500/20 text-rose-400' :
                              tx.type === 'REWARD' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-indigo-500/20 text-indigo-400'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-4 font-bold tabular-nums">
                            {tx.type === 'WITHDRAW' || tx.type === 'TRADE' ? '-' : '+'}${tx.amount.toLocaleString()}
                          </td>
                          <td className="py-4 font-medium italic text-gray-400">{tx.status}</td>
                          <td className="py-4 text-xs font-semibold text-gray-400">{tx.description}</td>
                          <td className="py-4 text-right text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</td>
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
