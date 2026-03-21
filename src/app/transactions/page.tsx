"use client";

import { useUser } from "@/context/UserContext";
import { ArrowDownLeft, ArrowUpRight, Activity, Gift, Wallet, LayoutDashboard, User, ArrowRightLeft, LogOut } from "lucide-react";
import { UsdtIcon } from "@/components/UsdtIcon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/NotificationBell";

const TYPE_CONFIG = {
  DEPOSIT:  { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Deposit" },
  WITHDRAW: { icon: ArrowUpRight,  color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",     label: "Withdrawal" },
  TRADE:    { icon: Activity,      color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20", label: "Trade" },
  REWARD:   { icon: Gift,          color: "text-fuchsia-400", bg: "bg-fuchsia-500/10 border-fuchsia-500/20",label: "Reward" },
};

const STATUS_CONFIG = {
  COMPLETED: { dot: "bg-emerald-500", text: "text-emerald-400", label: "Completed" },
  PENDING:   { dot: "bg-amber-500",   text: "text-amber-400",   label: "Pending"   },
  FAILED:    { dot: "bg-rose-500",    text: "text-rose-400",    label: "Failed"    },
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const FILTERS = ["ALL", "DEPOSIT", "WITHDRAW", "TRADE", "REWARD"] as const;

export default function TransactionsPage() {
  const { user, balance, transactions, logout } = useUser();
  const [filter, setFilter] = useState<typeof FILTERS[number]>("ALL");
  const router = useRouter();

  const filtered = transactions.filter(t => filter === "ALL" || t.type === filter);

  const totals = {
    in:  transactions.filter(t => t.type === "DEPOSIT" || t.type === "REWARD").reduce((a, t) => a + t.amount, 0),
    out: transactions.filter(t => t.type === "WITHDRAW").reduce((a, t) => a + t.amount, 0),
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-[#0A0A0B]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Blockchain</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <a href="/" className="flex items-center gap-2 hover:text-white transition-colors"><LayoutDashboard className="w-4 h-4" /> Dashboard</a>
              <a href="/profile" className="flex items-center gap-2 hover:text-white transition-colors"><User className="w-4 h-4" /> Profile</a>
              <a href="/deposit" className="flex items-center gap-2 hover:text-white transition-colors"><Wallet className="w-4 h-4 text-indigo-400" /> Deposit</a>
              <a href="/withdraw" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold"><ArrowRightLeft className="w-4 h-4" /> Withdraw</a>
            </nav>
            <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
              {user && (
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Net Equity</div>
                  <div className="text-sm font-black text-emerald-400 flex items-center gap-1"><UsdtIcon className="w-3 h-3" />${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              )}
              <NotificationBell />
              {user && <button onClick={logout} className="p-2 text-gray-500 hover:text-rose-400 transition-colors"><LogOut className="w-5 h-5" /></button>}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Transaction History</h1>
          <p className="text-gray-500 text-sm font-medium">A complete log of all account activity</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Transactions</div>
            <div className="text-2xl font-black text-white">{transactions.length}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Total Received</div>
            <div className="text-2xl font-black text-emerald-400">+${totals.in.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5">
            <div className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mb-1">Total Withdrawn</div>
            <div className="text-2xl font-black text-rose-400">-${totals.out.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                filter === f ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-20 opacity-40">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-sm font-bold text-gray-500">No transactions yet</p>
            </div>
          ) : (
            filtered.map(tx => {
              const T = TYPE_CONFIG[tx.type];
              const S = STATUS_CONFIG[tx.status];
              const Icon = T.icon;
              const isPositive = tx.type === "DEPOSIT" || tx.type === "REWARD";
              return (
                <div key={tx.id} className="flex items-center gap-4 bg-gray-800/30 border border-gray-700/40 rounded-2xl px-5 py-4 hover:bg-gray-800/50 transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${T.bg}`}>
                    <Icon className={`w-5 h-5 ${T.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">{tx.description}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${T.bg} ${T.color}`}>{T.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${S.dot}`}></div>
                      <span className={`text-[10px] font-bold ${S.text}`}>{S.label}</span>
                      <span className="text-[10px] text-gray-600 font-medium">· {formatDate(tx.timestamp)}</span>
                    </div>
                  </div>
                  <div className={`text-sm font-black tabular-nums ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {isPositive ? "+" : "-"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <footer className="border-t border-gray-800 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-600 font-bold uppercase tracking-widest">
          <span>© 2026 Blockchain Infrastructure Limited</span>
          <div className="flex items-center gap-6">
            <a href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Use</a>
            <a href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
