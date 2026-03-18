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
import { MarketOverview } from "@/components/MarketOverview";
import { SocialSentimentFeed } from "@/components/SocialSentimentFeed";
import { PlatformTransparency } from "@/components/PlatformTransparency";
import { ReferralRewards } from "@/components/ReferralRewards";
import { MarketSentiment } from "@/components/MarketSentiment";
import { TradeActivityToasts } from "@/components/TradeActivityToasts";
import { StakingWidget } from "@/components/StakingWidget";
import { AISignals } from "@/components/AISignals";
import { LayoutDashboard, Wallet, ArrowRightLeft, Settings, LogOut, User, TrendingUp, BarChart3, Menu, X, ShieldCheck, Gift } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useState } from "react";

export default function Home() {
  const { user, balance, logout } = useUser();
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const chartAssets = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "MATIC", "TRX", "AVAX"];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-indigo-500/30">
      <LivePriceTicker />
      <TradeActivityToasts />
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-[#0A0A0B]/80 backdrop-blur-xl sticky top-10 z-[60]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group cursor-pointer hover:scale-105 transition-transform">Yield<span className="text-indigo-400">Sphere</span></span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-400">
                <a href="/" className="flex items-center gap-2 text-white font-bold border-b-2 border-indigo-500 pb-1 translate-y-[2px]"><LayoutDashboard className="w-4 h-4" /> Dashboard</a>
                <a href="/profile" className="flex items-center gap-2 hover:text-white transition-colors"><User className="w-4 h-4" /> Profile</a>
                <a href="/deposit" className="flex items-center gap-2 hover:text-white transition-colors"><ArrowRightLeft className="w-4 h-4" /> Deposit</a>
            </nav>

            <div className="flex items-center gap-2 md:gap-4 border-l border-gray-800 lg:pl-6">
               {user ? (
                 <div className="flex items-center gap-2 md:gap-4">
                   <div className="text-right hidden sm:block">
                     <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Available Balance</div>
                     <div className="text-sm font-black text-emerald-400">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                   </div>
                   
                   {/* Mobile Quick Deposit */}
                   <a href="/deposit" className="lg:hidden p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20 active:scale-90 transition-transform">
                      <ArrowRightLeft className="w-5 h-5" />
                   </a>

                   <div className="relative group">
                     <img src={user.avatar} alt="User" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-900 border border-gray-700 transition-transform group-hover:scale-110 cursor-pointer shadow-lg" />
                     {/* VIP Badge */}
                     <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 p-1 rounded-full border border-gray-900 shadow-lg" title="VIP Status">
                        <ShieldCheck className="w-3 h-3 text-white" fill="currentColor" />
                     </div>
                     <a href="/admin" className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-transparent hover:bg-indigo-500 transition-colors" title="Admin"></a>
                   </div>

                   <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
                      {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                   </button>

                   <button onClick={logout} className="hidden md:block p-2 text-gray-500 hover:text-rose-400 transition-colors" title="Logout">
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

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gray-900 border-b border-gray-800 p-4 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-1 gap-4">
              <a href="/" className="flex items-center gap-3 p-4 bg-indigo-600/10 rounded-2xl text-indigo-400 font-bold">
                 <LayoutDashboard className="w-5 h-5" /> Home Dashboard
              </a>
              <a href="/profile" className="flex items-center gap-3 p-4 hover:bg-gray-800/50 rounded-2xl text-gray-300 font-bold transition-colors">
                 <User className="w-5 h-5" /> My Personal Profile
              </a>
              <a href="/deposit" className="flex items-center gap-3 p-4 hover:bg-gray-800/50 rounded-2xl text-gray-300 font-bold transition-colors">
                 <ArrowRightLeft className="w-5 h-5" /> Funds & Deposits
              </a>
              <div className="border-t border-gray-800 my-2 pt-4">
                <button onClick={logout} className="flex items-center gap-3 p-4 text-rose-500 font-bold w-full">
                   <LogOut className="w-5 h-5" /> Sign Out of Platform
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="mb-6">
          <MarketEventsTicker />
        </div>

        {/* Live Chart Section */}
        <div className="mb-8 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-2">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Global Node: Active</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 text-indigo-400" /> Market Intelligence ({selectedAsset}/USDT)
                  </h3>
                  <p className="text-xs text-gray-500">Live technical analysis from our global liquidity network.</p>
                </div>
              </div>
            <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl border border-gray-800/50">
              {chartAssets.map((asset) => (
                <button
                  key={asset}
                  onClick={() => setSelectedAsset(asset)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all ${
                    selectedAsset === asset 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-gray-700/30 shadow-2xl bg-[#0A0A0B] relative">
            {/* Logo Masking Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none border-[12px] border-[#131722] rounded-2xl"></div>
            <div className="w-full h-full transform scale-[1.03] origin-top translate-y-[-8px]">
              <iframe 
                key={selectedAsset}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BINANCE%3A${selectedAsset}USDT&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%22header_symbol_search%22%2C%22widget_logo%22%2C%22header_resolutions%22%5D&locale=en`}
                style={{ width: '100%', height: '100%', border: 'none' }}
              ></iframe>
            </div>
            {/* Branding Mask (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#131722] z-20"></div>
          </div>
        </div>

        <div className="mb-10">
          <MarketOverview />
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
            <ReferralRewards />
            <StakingWidget />
            <AISignals />
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <a href="/deposit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-transform shadow-lg shadow-indigo-500/20 active:scale-95 text-sm uppercase tracking-widest">
                <Wallet className="w-4 h-4" /> Deposit Funds
              </a>
              <button disabled className="bg-gray-800/50 cursor-not-allowed border border-gray-700/50 text-gray-500 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm">
                <ArrowRightLeft className="w-4 h-4" /> Withdraw
              </button>
            </div>

            <MarketSentiment />
            <SocialSentimentFeed />
            <PlatformTransparency />
            <MysteryBox />
            <InvestmentPools />
            <LiveActivityTicker />
          </div>

        </div>
      </main>

      {/* Authority Footer */}
      <footer className="border-t border-gray-800 bg-black/60 py-16 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex flex-col items-center justify-center text-center space-y-12">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">As Seen On & Partners</h4>
                 <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-30 grayscale hover:opacity-100 transition-opacity duration-1000">
                    <span className="text-xl md:text-2xl font-black text-white italic tracking-tighter">Bloomberg<span className="text-indigo-500">_</span>Terminal</span>
                    <span className="text-xl md:text-2xl font-serif font-bold text-white tracking-widest">FORBES</span>
                    <span className="text-xl md:text-2xl font-black text-white tracking-tighter">REUTERS</span>
                    <span className="text-xl md:text-2xl font-black text-white italic">CoinDesk</span>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 text-[12px] text-gray-500 font-bold uppercase tracking-widest">
                 <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Use</a>
                 <a href="#" className="hover:text-indigo-400 transition-colors">Global Compliance</a>
                 <a href="#" className="hover:text-indigo-400 transition-colors">Data Privacy</a>
                 <div className="hidden md:block w-px h-4 bg-gray-800"></div>
                 <span className="text-gray-700">© 2026 YieldSphere Infrastructure Limited</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
