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
import { TradeActivityToasts } from "@/components/TradeActivityToasts";
import { StakingWidget } from "@/components/StakingWidget";
import { AISignals } from "@/components/AISignals";
import { SwapTrade } from "@/components/SwapTrade";
import { TrendingUp, Wallet, LayoutDashboard, User, ArrowRightLeft, LogOut, Menu, X, Coins, PieChart, ShieldCheck, Gift, Settings, BarChart3, Activity, Blocks, Hexagon, Gem, Network, BlocksIcon } from "lucide-react";
import { UsdtIcon } from "@/components/UsdtIcon";
import { SeedPhraseOnboarding } from "@/components/SeedPhraseOnboarding";
import { GlobalNewsWire } from "@/components/GlobalNewsWire";
import { useUser } from "@/context/UserContext";
import { NotificationBell } from "@/components/NotificationBell";
import { useState } from "react";

import { Navbar } from "@/components/Navbar";
import { useCrypto } from "@/context/CryptoContext";

export default function Home() {
  const { user, balance, logout, activeTrades } = useUser();
  const { prices } = useCrypto();
  
  const totalEquity = balance + (activeTrades.reduce((acc, t) => acc + t.allocation, 0)) +
    Object.entries(user?.holdings || {}).reduce((acc, [symbol, amount]) => {
      return acc + (amount * (prices[symbol] || 0));
    }, 0);
  const [selectedAsset, setSelectedAsset] = useState("BTC");

  const chartAssets = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "MATIC", "TRX", "AVAX"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      <SeedPhraseOnboarding />
      <div className="sticky top-0 z-[60] w-full flex flex-col">
        <GlobalNewsWire />
        <LivePriceTicker />
        <TradeActivityToasts />
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-8">

        <PendingDeposit />

        {user && !user.hasDepositBonus && (
          <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-emerald-500/20 border border-indigo-500/30 rounded-3xl relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl p-0.5 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[22px] flex items-center justify-center">
                    <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-emerald-400">+5%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2">
                    First-Time Deposit Bonus! <Gift className="w-6 h-6 text-emerald-400" />
                  </h3>
                  <p className="text-sm md:text-base text-indigo-200/80 font-medium max-w-xl">Deposit <strong className="text-slate-900 dark:text-white">$100 USDT or more</strong> right now and we will instantly credit your account with a permanent <strong className="text-emerald-400">+5% Cash Bonus</strong>! (One-time only)</p>
                </div>
              </div>
              <a href="/deposit" className="shrink-0 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:scale-105 transition-transform rounded-2xl text-black font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(52,211,153,0.3)] flex items-center justify-center gap-2">
                Claim Bonus Now <ArrowRightLeft className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        <div className="mb-6">
          <MarketEventsTicker />
        </div>

        {/* Live Chart Section */}
        <div className="mb-8 bg-white/60 dark:bg-slate-100 dark:bg-gray-800/40 backdrop-blur-xl border border-slate-300 dark:border-gray-700/50 rounded-3xl p-6 overflow-hidden">
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
                <div className="flex items-center gap-1.5">
                  <UsdtIcon className="w-3 h-3 grayscale opacity-40" />
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">Bespoke Liquidity Infrastructure for USDT Holders</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-gray-800/50">
              {chartAssets.map((asset) => (
                <button
                  key={asset}
                  onClick={() => setSelectedAsset(asset)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all ${selectedAsset === asset
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:text-gray-300 hover:bg-white/5"
                    }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-300 dark:border-gray-700/30 shadow-2xl bg-[#131722] relative">
            <div className="w-full h-full transform scale-[1.1] origin-center translate-y-[-15px]">
              <iframe
                key={selectedAsset}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BINANCE%3A${selectedAsset}USDT&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%22header_symbol_search%22%2C%22widget_logo%22%2C%22header_resolutions%22%2C%22header_chart_type%22%5D&locale=en`}
                style={{ width: '100%', height: '100%', border: 'none' }}
              ></iframe>
            </div>
            {/* Precision Branding Mask (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-[#131722] z-20"></div>
          </div>
        </div>

        <div className="mb-10">
          <MarketOverview />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-7">
            <SwapTrade />
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white/60 dark:bg-slate-100 dark:bg-gray-800/40 backdrop-blur-xl border border-slate-300 dark:border-gray-700/50 rounded-3xl p-6 lg:p-8 h-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-400" /> My Holdings
                </h3>
                <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Live Portfolio</div>
              </div>
              <div className="space-y-4">
                {Object.entries(user?.holdings || {}).length > 0 ? (
                  Object.entries(user?.holdings || {}).map(([symbol, amount]) => (
                    amount > 0 && (
                      <div key={symbol} className="flex items-center justify-between p-4 bg-black/20 border border-slate-200 dark:border-gray-800 rounded-2xl hover:border-slate-300 dark:border-gray-700 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-black text-xs text-indigo-400 group-hover:bg-indigo-600 group-hover:text-slate-900 dark:text-white transition-colors">
                            {symbol[0]}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">{symbol}</div>
                            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tight">Main Wallet</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900 dark:text-white">{amount.toFixed(6)}</div>
                          <div className="text-[10px] text-emerald-400 font-bold">~${(amount * (prices[symbol] || 0)).toLocaleString()}</div>
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="text-center py-10 opacity-40">
                    <Coins className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-sm font-bold text-slate-400 dark:text-gray-500">No assets held yet. Start trading to build your portfolio!</p>
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
              <a href="/withdraw" className="bg-white/70 dark:bg-slate-100 dark:bg-gray-800/50 hover:bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700/50 text-slate-500 dark:text-gray-400 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm uppercase tracking-widest">
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

      {/* Authority Footer */}
      <footer className="border-t border-slate-200 dark:border-gray-800 bg-black/60 py-16 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center space-y-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-[0.3em]">As Seen On & Partners</h4>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-30 grayscale hover:opacity-100 transition-opacity duration-1000">
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">Bloomberg<span className="text-indigo-500">_</span>Terminal</span>
                <span className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-widest">FORBES</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter">REUTERS</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white italic">CoinDesk</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 text-[12px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-800">
                <UsdtIcon className="w-3.5 h-3.5 grayscale opacity-50" />
                <span className="text-[9px]">USDT TRC20 Accepted</span>
              </div>
              <a href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Use</a>
              <a href="/privacy" className="hover:text-indigo-400 transition-colors">Global Compliance</a>
              <a href="/privacy" className="hover:text-indigo-400 transition-colors">Data Privacy</a>
              <div className="hidden md:block w-px h-4 bg-slate-100 dark:bg-gray-800"></div>
              <span className="text-gray-700">© 2026 Stocks Indicators Infrastructure Limited</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
