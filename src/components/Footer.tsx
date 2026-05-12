"use client";

import { UsdtIcon } from "@/components/UsdtIcon";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-gray-800 bg-black/60 py-16 backdrop-blur-xl mt-auto">
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
  );
}
