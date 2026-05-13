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
import { SocialTradingFeed } from "@/components/SocialTradingFeed";
import { PlatformTransparency } from "@/components/PlatformTransparency";
import { ReferralRewards } from "@/components/ReferralRewards";
import { GlobalLeaderboard } from "@/components/GlobalLeaderboard";
import { MarketSentiment } from "@/components/MarketSentiment";
import { AIPredictions } from "@/components/AIPredictions";
import { StakingWidget } from "@/components/StakingWidget";
import { AISignals } from "@/components/AISignals";
import { SwapTrade } from "@/components/SwapTrade";
import { TrendingUp, Wallet, LayoutDashboard, User, ArrowRightLeft, LogOut, Menu, X, Coins, PieChart, ShieldCheck, Gift, Settings, BarChart3, Activity, Blocks, Hexagon, Gem, Network, BlocksIcon } from "lucide-react";
import { UsdtIcon } from "@/components/UsdtIcon";
import { SeedPhraseOnboarding } from "@/components/SeedPhraseOnboarding";
import { GlobalNewsWire } from "@/components/GlobalNewsWire";
import { useUser } from "@/context/UserContext";
import { NotificationBell } from "@/components/NotificationBell";
import { useState, useEffect } from "react";

import { Navbar } from "@/components/Navbar";
import { useCrypto } from "@/context/CryptoContext";
import { InstitutionalChart } from "@/components/InstitutionalChart";

export default function Home() {
  const { user, balance, logout, activeTrades } = useUser();
  const { prices } = useCrypto();
  
  const totalEquity = balance + (activeTrades.reduce((acc, t) => acc + t.allocation, 0)) +
    Object.entries(user?.holdings || {}).reduce((acc, [symbol, amount]) => {
      return acc + (amount * (prices[symbol] || 0));
    }, 0);
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const chartAssets = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "MATIC", "TRX", "AVAX"];
  const [chartHeight, setChartHeight] = useState(600);

  useEffect(() => {
    const handleResize = () => {
      setChartHeight(window.innerWidth < 640 ? 350 : 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      <SeedPhraseOnboarding />
      <div className="sticky top-0 z-[60] w-full flex flex-col">
        <GlobalNewsWire />
        <LivePriceTicker />
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-8">

        <PendingDeposit />

        {user && !user.hasDepositBonus && (
          <div className="mb-8 p-5 sm:p-8 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-emerald-500/20 border border-indigo-500/30 rounded-3xl relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl sm:rounded-3xl p-0.5 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[14px] sm:rounded-[22px] flex items-center justify-center">
                    <span className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-emerald-400">+5%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight flex items-center gap-2">
                    Deposit Bonus! <Gift className="w-5 h-5 text-emerald-400" />
                  </h3>
                  <p className="text-[11px] sm:text-base text-indigo-200/80 font-medium max-w-xl leading-relaxed">Deposit <strong className="text-slate-900 dark:text-white">$100+</strong> and get a permanent <strong className="text-emerald-400">+5% Cash Bonus</strong>!</p>
                </div>
              </div>
              <a href="/deposit" className="shrink-0 w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:scale-105 transition-transform rounded-2xl text-black font-black uppercase tracking-widest text-[10px] sm:text-sm shadow-[0_0_30px_rgba(52,211,153,0.3)] flex items-center justify-center gap-2">
                Claim Bonus Now <ArrowRightLeft className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        <div className="mb-6">
          <MarketEventsTicker />
        </div>

        {/* Live Chart Section */}
        <div className="mb-10 bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-3xl lg:rounded-[2.5rem] p-4 sm:p-8 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-1 sm:px-2 relative z-10">
            <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto">
              <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Live Node</span>
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-black flex items-center gap-2.5 text-slate-900 dark:text-white tracking-tight">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" /> Market Feed <span className="text-slate-400 dark:text-gray-600 font-normal">/ {selectedAsset}USDT</span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <UsdtIcon className="w-3 h-3 grayscale opacity-30" />
                  <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest">Institutional Liquidity Infrastructure</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-gray-950/50 p-1 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-gray-800/50 shadow-inner w-full sm:w-auto">
              {chartAssets.map((asset) => (
                <button
                  key={asset}
                  onClick={() => setSelectedAsset(asset)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest uppercase transition-all ${selectedAsset === asset
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/5"
                    }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 mb-10 sm:mb-20">
            <InstitutionalChart asset={selectedAsset} height={chartHeight} />
          </div>

          <AIPredictions />
        </div>

        <div className="mb-10">
          <MarketOverview />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 mb-12">
          <div className="lg:col-span-7">
            <SwapTrade />
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-10 h-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10">
                <h3 className="text-base sm:text-lg font-black flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
                  <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 dark:text-emerald-400" /> Portfolio Holdings
                </h3>
                <div className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Live Equity</div>
              </div>
              <div className="space-y-3 sm:space-y-4 relative z-10">
                {Object.entries(user?.holdings || {}).length > 0 ? (
                  Object.entries(user?.holdings || {}).map(([symbol, amount]) => (
                    amount > 0 && (
                      <div key={symbol} className="flex items-center justify-between p-3.5 sm:p-5 bg-slate-50 dark:bg-gray-950/40 border border-slate-100 dark:border-gray-800 rounded-xl sm:rounded-2xl hover:border-indigo-500/30 transition-all group shadow-inner">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center font-black text-xs sm:text-sm text-indigo-500 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {symbol[0]}
                          </div>
                          <div>
                            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">{symbol}</div>
                            <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest">Global Asset</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums">{amount.toFixed(6)}</div>
                          <div className="text-[10px] sm:text-[11px] text-emerald-500 dark:text-emerald-400 font-black tracking-tight">~${(amount * (prices[symbol] || 0)).toLocaleString()}</div>
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 sm:py-20 opacity-20">
                    <Coins className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-slate-400 dark:text-gray-500" />
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center max-w-[200px] leading-relaxed">Liquidity Required. Start trading to populate your portfolio.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <CountdownBanner />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column (Main Focus) */}
          <div className="lg:col-span-8 space-y-10">
            <VIPProgress />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MarketSentiment />
              <PlatformTransparency />
            </div>
            <CopyTrading />
            <SocialTradingFeed />
            <GlobalLeaderboard />
            <DailyQuests />
            <ActiveCopiedTrades />
            <ROICalculator />
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-8">

            {/* Quick Actions (Desktop Sidebar only) */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <a href="/deposit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-transform shadow-lg shadow-indigo-500/20 active:scale-95 text-sm uppercase tracking-widest">
                <Wallet className="w-4 h-4" /> Deposit USDT
              </a>
              <a href="/withdraw" className="bg-white/70 dark:bg-gray-900/40 dark:bg-gray-800/50 hover:bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700/50 text-slate-500 dark:text-gray-400 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm uppercase tracking-widest">
                <ArrowRightLeft className="w-4 h-4" /> Withdraw Funds
              </a>
            </div>

            <ReferralRewards />
            <StakingWidget />
            <AISignals />
            <MysteryBox />
            <InvestmentPools />
            <LiveActivityTicker />
          </div>

        </div>
      </main>

    </div>
  );
}
