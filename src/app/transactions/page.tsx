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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <div className="mb-12 relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Settlement Ledger</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base font-bold uppercase tracking-widest opacity-60">Cryptographic audit log of institutional activity</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-3">Audit Entries</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{transactions.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <ArrowDownLeft className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-black uppercase tracking-[0.2em] mb-3">Cumulative Inflow</div>
            <div className="text-4xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums tracking-tighter">+${totals.in.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <ArrowUpRight className="w-24 h-24 text-rose-500" />
            </div>
            <div className="text-[10px] text-rose-500 dark:text-rose-400 font-black uppercase tracking-[0.2em] mb-3">Cumulative Outflow</div>
            <div className="text-4xl font-black text-rose-500 dark:text-rose-400 tabular-nums tracking-tighter">-${totals.out.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 bg-slate-100/50 dark:bg-gray-950/40 p-2 rounded-[1.5rem] border border-slate-200 dark:border-gray-800 w-fit shadow-inner">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                filter === f ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="text-center py-40 bg-white/40 dark:bg-gray-950/20 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[3rem]">
              <Activity className="w-20 h-20 mx-auto mb-6 text-slate-200 dark:text-gray-800 opacity-20" />
              <p className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.3em]">Node Search: No Records Found</p>
            </div>
          ) : (
            filtered.map(tx => {
              const T = TYPE_CONFIG[tx.type];
              const S = STATUS_CONFIG[tx.status];
              const Icon = T.icon;
              const isPositive = tx.type === "DEPOSIT" || tx.type === "REWARD";
              return (
                <div key={tx.id} className="flex items-center gap-6 bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] px-8 py-6 hover:border-indigo-500/40 transition-all group shadow-sm hover:shadow-2xl active:scale-[0.99] cursor-default">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 ${T.bg} shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                    <Icon className={`w-8 h-8 ${T.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap mb-2">
                      <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{tx.description}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 ${T.bg} ${T.color} shadow-sm`}>{T.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${S.dot} shadow-[0_0_10px_rgba(0,0,0,0.1)] animate-pulse`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${S.text}`}>{S.label}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 dark:bg-gray-700 rounded-full"></div>
                      <span className="text-[10px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest tabular-nums">{formatDate(tx.timestamp)}</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-black tabular-nums tracking-tighter ${isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                    <span className="mr-1">{isPositive ? "+" : "-"}</span>
                    <span className="text-sm opacity-60 mr-0.5">$</span>
                    {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-gray-800 py-16 mt-32 bg-white/40 dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10 text-[10px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-[0.25em]">
          <span>© 2026 Kesha Institutional Infrastructure</span>
          <div className="flex items-center gap-12">
            <a href="/terms" className="hover:text-indigo-500 transition-colors">Framework</a>
            <a href="/privacy" className="hover:text-indigo-500 transition-colors">Privacy</a>
            <a href="/support" className="hover:text-indigo-500 transition-colors">Terminal</a>
          </div>
        </div>
      </footer>
    </div>>
  );
}
