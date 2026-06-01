"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { NotificationBell } from "@/components/NotificationBell";
import { P2PMessagesBell } from "@/components/P2PMessagesBell";
import { UsdtIcon } from "@/components/UsdtIcon";
import { useTheme } from "next-themes";
import { 
  Wallet, LayoutDashboard, User, ArrowRightLeft, 
  LogOut, Menu, X, BarChart3, Activity, BlocksIcon, ShieldCheck, Moon, Sun 
} from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, balance, logout } = useUser();
  const frozenBalance = user?.frozenBalance;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#0A0A0B]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0">
            <BlocksIcon className="w-5 h-5 text-slate-900 dark:text-white" />
          </div>
          <Link href="/" className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 dark:from-white to-slate-500 dark:to-gray-500 bg-clip-text text-transparent group cursor-pointer hover:scale-105 transition-transform whitespace-nowrap">
            Stocks Indicators
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-gray-400">
            <Link href="/" className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors ${isActive("/") ? "text-slate-900 dark:text-white font-bold border-b-2 border-indigo-500 pb-1 translate-y-[2px]" : ""}`}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/markets" className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors ${isActive("/markets") ? "text-slate-900 dark:text-white font-bold border-b-2 border-indigo-500 pb-1 translate-y-[2px]" : ""}`}>
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Markets
            </Link>
            <Link href="/crypto" className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors ${isActive("/crypto") ? "text-slate-900 dark:text-white font-bold border-b-2 border-indigo-500 pb-1 translate-y-[2px]" : ""}`}>
              <Activity className="w-4 h-4 text-emerald-400" /> All Crypto
            </Link>
            <Link href="/profile" className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors ${isActive("/profile") ? "text-slate-900 dark:text-white font-bold border-b-2 border-indigo-500 pb-1 translate-y-[2px]" : ""}`}>
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link href="/deposit" className={`flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors ${isActive("/deposit") ? "text-slate-900 dark:text-white font-bold border-b-2 border-indigo-500 pb-1 translate-y-[2px]" : ""}`}>
              <Wallet className="w-4 h-4 text-indigo-400" /> Deposit
            </Link>
            <Link href="/withdraw" className={`flex items-center gap-2 text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors font-bold ${isActive("/withdraw") ? "border-b-2 border-amber-500 pb-1 translate-y-[2px]" : ""}`}>
              <ArrowRightLeft className="w-4 h-4" /> Withdraw
            </Link>
            <Link href="/p2p" className={`flex items-center gap-2 text-emerald-555 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-350 transition-colors font-bold ${isActive("/p2p") ? "text-slate-900 dark:text-white font-bold border-b-2 border-indigo-500 pb-1 translate-y-[2px]" : ""}`}>
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" /> P2P Desk
            </Link>
            <Link href="/futures" className={`flex items-center gap-2 text-indigo-500 dark:text-indigo-400 font-black hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors uppercase tracking-widest ${isActive("/futures") ? "border-b-2 border-indigo-500 pb-1 translate-y-[2px]" : ""}`}>
              <Activity className="w-4 h-4 animate-pulse" /> Pro Options
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4 border-l border-slate-200 dark:border-gray-800 lg:pl-6 pl-2">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 dark:text-gray-400 hover:text-white dark:hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tight">Net Equity (USDT)</div>
                  <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5 ml-auto justify-end">
                    <UsdtIcon className="w-3.5 h-3.5" />
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  {frozenBalance && (
                    <div className="text-[10px] font-black text-cyan-400 flex items-center gap-1 justify-end mt-0.5 animate-pulse">
                      <span>❄️</span>
                      +${frozenBalance.amount.toLocaleString()} frozen
                    </div>
                  )}
                </div>
                {/* Mobile Deposit / Withdraw */}
                <Link href="/deposit" className="hidden sm:block lg:hidden p-2.5 bg-indigo-600 rounded-xl text-slate-900 dark:text-white shadow-lg shadow-indigo-500/20 active:scale-90 transition-transform" title="Deposit">
                  <Wallet className="w-5 h-5" />
                </Link>
                
                <div className="relative group">
                  <img src={user.avatar} alt="User" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 transition-transform group-hover:scale-110 cursor-pointer shadow-lg" />
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 p-1 rounded-full border border-gray-900 shadow-lg" title="VIP Status">
                    <ShieldCheck className="w-2.5 h-2.5 text-slate-900 dark:text-white" fill="currentColor" />
                  </div>
                  <Link href="/admin" className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-transparent hover:bg-indigo-500 transition-colors" title="Admin"></Link>
                </div>

                <P2PMessagesBell />
                <NotificationBell />

                <button onClick={logout} className="hidden md:block p-2 text-slate-400 dark:text-gray-500 hover:text-rose-400 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-xs md:text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-white dark:hover:text-white transition-colors hidden sm:block">Login</Link>
                <Link href="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">Register</Link>
              </div>
            )}
            
            {/* Mobile Menu Toggle - Visible to everyone */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1.5 md:p-2 text-slate-500 dark:text-gray-400 hover:text-white dark:hover:text-white shrink-0">
              {mobileMenuOpen ? <X className="w-6 h-6 md:w-7 md:h-7" /> : <Menu className="w-6 h-6 md:w-7 md:h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 p-4 animate-in slide-in-from-top duration-300 absolute w-full left-0 z-40 shadow-2xl">
          <div className="grid grid-cols-1 gap-3">
            <Link href="/" className="flex items-center gap-3 p-4 bg-indigo-600/10 rounded-2xl text-indigo-400 font-bold">
              <LayoutDashboard className="w-5 h-5" /> Home Dashboard
            </Link>
            <Link href="/markets" className="flex items-center gap-3 p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 font-bold">
              <BarChart3 className="w-5 h-5" /> Live Markets
            </Link>
            <Link href="/crypto" className="flex items-center gap-3 p-4 bg-violet-500/10 rounded-2xl text-violet-400 font-bold">
              <Activity className="w-5 h-5" /> All Crypto (400+)
            </Link>
            <Link href="/futures" className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-black uppercase tracking-widest overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 animate-translate-x"></div>
              <Activity className="w-5 h-5 animate-pulse" /> Pro Options
            </Link>
            
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-3 p-4 hover:bg-slate-100 dark:hover:bg-gray-800/50 rounded-2xl text-slate-600 dark:text-gray-300 font-bold transition-colors">
                  <User className="w-5 h-5" /> My Personal Profile
                </Link>
                <Link href="/deposit" className="flex items-center gap-3 p-4 hover:bg-slate-100 dark:hover:bg-gray-800/50 rounded-2xl text-slate-600 dark:text-gray-300 font-bold transition-colors">
                  <Wallet className="w-5 h-5" /> Funds & Deposits
                </Link>
                <Link href="/p2p" className="flex items-center gap-3 p-4 hover:bg-slate-100 dark:hover:bg-gray-800/50 rounded-2xl text-slate-600 dark:text-gray-300 font-bold transition-colors">
                  <ArrowRightLeft className="w-5 h-5" /> P2P Trading Desk
                </Link>
                <div className="border-t border-slate-200 dark:border-gray-800 my-2 pt-4">
                  <button onClick={logout} className="flex items-center gap-3 p-4 text-rose-500 font-bold w-full">
                    <LogOut className="w-5 h-5" /> Sign Out of Platform
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-slate-200 dark:border-gray-800 my-2 pt-4 grid grid-cols-2 gap-3">
                <Link href="/login" className="bg-slate-100 dark:bg-gray-800 hover:bg-gray-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm font-bold transition-all text-center">Login</Link>
                <Link href="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all text-center">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
