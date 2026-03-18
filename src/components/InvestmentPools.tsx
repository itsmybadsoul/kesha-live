"use client";

import { Flame, ArrowRight } from "lucide-react";

export function InvestmentPools() {
  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Exclusive Pools <Flame className="w-5 h-5 text-orange-500 animate-pulse" fill="currentColor" />
        </h2>
        <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Pool Card 1 */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-orange-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-orange-500/40 transition-colors cursor-pointer">
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider z-10">
            Closing Soon
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Q3 Premium Yield V2</h3>
              <p className="text-gray-400 text-xs">Lock: 30 Days • Daily Payout</p>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
                2.5%
              </span>
              <span className="text-gray-500 text-xs font-medium uppercase">Daily</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-orange-400">85% Filled</span>
              <span className="text-gray-400">Cap: $500,000</span>
            </div>
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full w-[85%] relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 text-center mt-2">Only $45,000 allocation remaining!</p>
          </div>
        </div>

        {/* Pool Card 2 */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600 transition-colors cursor-pointer opacity-80">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Stable Core V1</h3>
              <p className="text-gray-400 text-xs">Lock: Flex • Weekly Payout</p>
            </div>
            <div className="text-right">
              <span className="block text-xl font-bold text-blue-400">
                0.8%
              </span>
              <span className="text-gray-500 text-xs font-medium uppercase">Daily</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-blue-400">42% Filled</span>
              <span className="text-gray-400">Cap: $1,000,000</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <div className="h-full bg-blue-500 rounded-full w-[42%]"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
