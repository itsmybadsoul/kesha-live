"use client";

import { CountdownBanner } from "@/components/CountdownBanner";
import { VIPProgress } from "@/components/VIPProgress";
import { ROICalculator } from "@/components/ROICalculator";
import { InvestmentPools } from "@/components/InvestmentPools";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";
import { MysteryBox } from "@/components/MysteryBox";
import { PendingDeposit } from "@/components/PendingDeposit";
import { CopyTrading } from "@/components/CopyTrading";
import { ActiveCopiedTrades } from "@/components/ActiveCopiedTrades";
import { MarketEventsTicker } from "@/components/MarketEventsTicker";
import { DailyQuests } from "@/components/DailyQuests";
import { LivePriceTicker } from "@/components/LivePriceTicker";
import { LayoutDashboard, Wallet, ArrowRightLeft, Settings, LogOut, User, TrendingUp } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function Home() {
  const { user, balance, logout } = useUser();
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-indigo-500/30">
      <LivePriceTicker />
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-[#0A0A0B]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Yield<span className="text-indigo-400">Sphere</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                <a href="/" className="flex items-center gap-2 text-white font-bold border-b-2 border-indigo-500 pb-1 translate-y-[2px]"><LayoutDashboard className="w-4 h-4" /> Dashboard</a>
                <a href="/profile" className="flex items-center gap-2 hover:text-white transition-colors"><User className="w-4 h-4" /> Profile</a>
                <a href="/deposit" className="flex items-center gap-2 hover:text-white transition-colors"><ArrowRightLeft className="w-4 h-4" /> Deposit</a>
            </nav>

            <div className="flex items-center gap-4 border-l border-gray-800 pl-6">
               {user ? (
                 <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                     <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Balance</div>
                     <div className="text-sm font-black text-emerald-400">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                   </div>
                   <div className="relative group">
                     <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full bg-gray-900 border border-gray-700 transition-transform group-hover:scale-110 cursor-pointer" />
                     {/* Hidden Admin Link */}
                     <a href="/admin" className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-transparent hover:bg-indigo-500 transition-colors" title="Admin"></a>
                   </div>
                   <button onClick={logout} className="p-2 text-gray-500 hover:text-rose-400 transition-colors" title="Logout">
                     <LogOut className="w-5 h-5" />
                   </button>
                 </div>
               ) : (
                 <div className="flex items-center gap-4">
                   <a href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Login</a>
                   <a href="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">Register</a>
                 </div>
               )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="mb-6">
          <MarketEventsTicker />
        </div>

        {/* Live Chart Section */}
        <div className="mb-8 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Market Analysis (Live BTC/USDT)
            </h3>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">Powered by TradingView</span>
          </div>
          <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-gray-700/30 shadow-2xl">
            <iframe 
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=1&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
              style={{ width: '100%', height: '100%', border: 'none' }}
            ></iframe>
          </div>
        </div>

        <CountdownBanner />
        
        <PendingDeposit />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Main Focus) */}
          <div className="lg:col-span-8 space-y-8">
            <VIPProgress />
            <CopyTrading />
            <DailyQuests />
            <ActiveCopiedTrades />
            <ROICalculator />
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <a href="/deposit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20 active:scale-95">
                <Wallet className="w-4 h-4" /> Deposit
              </a>
              <button disabled className="bg-gray-800/50 cursor-not-allowed border border-gray-700/50 text-gray-500 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <ArrowRightLeft className="w-4 h-4" /> Withdraw
              </button>
            </div>

            <MysteryBox />
            <InvestmentPools />
            <LiveActivityTicker />
          </div>

        </div>
      </main>

    </div>
  );
}
