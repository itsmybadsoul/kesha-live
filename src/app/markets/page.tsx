"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/context/UserContext";
import {
  TrendingUp, TrendingDown, Search, Filter, X, ChevronUp, ChevronDown,
  BarChart3, Activity, Zap, Globe, ArrowUpRight, ArrowDownRight,
  DollarSign, Clock, Target, AlertCircle, CheckCircle, Minus,
  LayoutDashboard, Wallet, ArrowRightLeft, User, BlocksIcon
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { UsdtIcon } from "@/components/UsdtIcon";

// ─── Static Company Data ─────────────────────────────────────────────────────

const SECTORS = ["Tech", "Finance", "Energy", "Healthcare", "Retail", "Automotive", "Telecom", "Media", "Pharma", "Industrial"];



interface Stock {
  sym: string; name: string; sector: string;
  price: number; prevPrice: number;
  change: number; changePct: number;
  vol: number; cap: number;
  volatility: number; direction: "up" | "down" | "flat";
  flash?: "green" | "red";
  isControlled?: boolean;
  params?: any;
}

type SortKey = "sym" | "name" | "price" | "changePct" | "vol" | "cap" | "volatility";
type SortDir = "asc" | "desc";



function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtCap(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}T`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}B`;
  return `$${n}M`;
}
function fmtVol(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarketsPage() {
  const { user, balance } = useUser();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [filter, setFilter] = useState<"all" | "gainers" | "losers" | "hot">("all");
  const [sortKey, setSortKey] = useState<SortKey>("vol");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [betModal, setBetModal] = useState<Stock | null>(null);
  const [betAmount, setBetAmount] = useState("50");
  const [betDir, setBetDir] = useState<"UP" | "DOWN">("UP");
  const [betDuration, setBetDuration] = useState(5);
  const [betLoading, setBetLoading] = useState(false);
  const [betResult, setBetResult] = useState<"success" | "error" | null>(null);
  const [betMsg, setBetMsg] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tickRef = useRef(0);

  // Central synchronized loading
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [realRes, ctrlRes] = await Promise.all([
          fetch("/api/market/real"),
          fetch("/api/market/controlled")
        ]);
        const realData = await realRes.json();
        const ctrlData = await ctrlRes.json();

        if (!mounted) return;

        let newStocks: Stock[] = [];

        if (realData.success && realData.data) {
           const mappedReal = realData.data.map((c: any) => ({
             sym: c.sym,
             name: c.name,
             sector: c.sector,
             price: c.basePrice,
             prevPrice: c.basePrice,
             change: c.change,
             changePct: c.changePct,
             vol: c.vol,
             cap: c.cap,
             volatility: c.volatility,
             direction: c.direction,
             isControlled: true, // Synced deterministic math
             params: c
           }));
           newStocks = [...newStocks, ...mappedReal];
        }

        if (ctrlData.success && ctrlData.data) {
           const mappedCtrl = ctrlData.data.map((c: any) => ({
             sym: c.sym,
             name: c.name,
             sector: c.sector,
             price: c.basePrice,
             prevPrice: c.basePrice,
             change: 0,
             changePct: 0,
             vol: Math.floor(Math.random() * 5000000 + 1000000),
             cap: Math.floor(Math.random() * 50000),
             volatility: c.volatility,
             direction: "flat",
             isControlled: true,
             params: c
           }));
           newStocks = [...newStocks, ...mappedCtrl];
        }

        // Just blindly overlay real/controlled without losing their current prices if possible
        setStocks(prev => {
          // preserve volatile changes for controlled? actually just reset they'll snap to math
           if (prev.length === 0) return newStocks;
           
           return newStocks.map(ns => {
              const existing = prev.find(p => p.sym === ns.sym);
              if (existing) {
                 return { ...ns, price: existing.price, prevPrice: existing.prevPrice, change: existing.change, changePct: existing.changePct };
              }
              return ns;
           });
        });
      } catch (e) {}
    }
    
    loadData();
    const pollInterval = setInterval(loadData, 15000);
    return () => { mounted = false; clearInterval(pollInterval); };
  }, []);

  // Live localized tick renderer (Detroit syncing)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      const now = Date.now();
      setStocks(prev => prev.map(s => {
        if (!s.isControlled) {
           // Real stock subtle jitter
           if (Math.random() > 0.3) return { ...s, flash: undefined };
           const drift = (Math.random() - 0.5) * s.volatility * 0.02;
           const newPrice = +(s.price + drift).toFixed(2);
           const change = newPrice - s.prevPrice;
           if (Math.abs(change) < 0.01) return { ...s, flash: undefined };
           
           return {
             ...s, 
             price: newPrice,
             flash: change > 0 ? "green" : change < 0 ? "red" : undefined,
             direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
             prevPrice: s.price
           };
        } else {
           // Controlled deterministic logic
           const p = s.params;
           let truePrice = p.basePrice;

           if (p.targetPrice !== undefined && p.targetEndTime && p.targetStartTime && p.targetStartPrice !== undefined) {
             if (now < p.targetEndTime) {
               const progress = (now - p.targetStartTime) / (p.targetEndTime - p.targetStartTime);
               truePrice = p.targetStartPrice + (p.targetPrice - p.targetStartPrice) * progress;
             } else {
               truePrice = p.targetPrice;
             }
           }
           
           const t = now / (3000 / p.volatility);
           const noise = (Math.sin(t) + Math.cos(t * 1.5)) * p.volatility * 0.2;
           truePrice += noise;

           truePrice = +(truePrice.toFixed(2));
           const change = truePrice - s.prevPrice;
           
           if (Math.abs(change) < 0.01) return { ...s, flash: undefined };
           
           const changePct = +((change) / (s.prevPrice || 1) * 100).toFixed(2);
           
           return {
             ...s,
             price: truePrice,
             change: +(s.change + change).toFixed(2),
             changePct: +(s.changePct + changePct).toFixed(2),
             flash: change > 0.02 ? "green" : change < -0.02 ? "red" : undefined,
             direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
             prevPrice: truePrice
           };
        }
      }));
    }, 1000);
    return () => clearInterval(tickInterval);
  }, []);

  // Derived stats
  const gainers = stocks.filter(s => s.changePct > 0).length;
  const losers = stocks.filter(s => s.changePct < 0).length;
  const totalMarketCap = stocks.reduce((a, s) => a + s.cap, 0);
  const fearGreed = stocks.length > 0 ? Math.round(50 + (gainers - losers) / stocks.length * 50) : 50;

  // Filtering & sorting
  const visible = stocks
    .filter(s => {
      if (search && !s.sym.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (sector !== "All" && s.sector !== sector) return false;
      if (filter === "gainers" && s.changePct <= 0) return false;
      if (filter === "losers" && s.changePct >= 0) return false;
      if (filter === "hot" && s.volatility < 2) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortKey] as number | string;
      const bVal = b[sortKey] as number | string;
      if (typeof aVal === "string") return sortDir === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => sortKey !== k
    ? <Minus className="w-3 h-3 opacity-30" />
    : sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-indigo-400" /> : <ChevronDown className="w-3 h-3 text-indigo-400" />;

  // Bet placement
  const placeBet = async () => {
    if (!user || !betModal) return;
    if (!betAmount || parseFloat(betAmount) <= 0) { setBetMsg("Enter a valid amount."); setBetResult("error"); return; }
    if (parseFloat(betAmount) > balance) { setBetMsg("Insufficient balance."); setBetResult("error"); return; }
    setBetLoading(true); setBetResult(null);
    try {
      const res = await fetch("/api/options/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          asset: betModal.sym,
          amount: parseFloat(betAmount),
          direction: betDir,
          durationMinutes: betDuration,
          strikePrice: betModal.price,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBetResult("success");
        setBetMsg(`Bet placed! ${betDir === "UP" ? "📈" : "📉"} ${betModal.sym} — expires in ${betDuration}min. Potential payout: $${(parseFloat(betAmount) * 1.85).toFixed(2)}`);
      } else {
        setBetResult("error"); setBetMsg(data.error || "Failed to place bet.");
      }
    } catch { setBetResult("error"); setBetMsg("Network error. Try again."); }
    finally { setBetLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810] text-slate-900 dark:text-white font-sans">
      {/* ── Navbar ── */}
      <div className="sticky top-0 z-50 w-full flex flex-col">
        <Navbar />
      </div>

      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-6 space-y-4">
        {/* ── Market Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Market Cap", value: fmtCap(totalMarketCap * 1000), icon: <Globe className="w-4 h-4 text-indigo-400" />, color: "indigo" },
            { label: "Gainers / Losers", value: `${gainers} / ${losers}`, icon: <BarChart3 className="w-4 h-4 text-emerald-400" />, color: "emerald" },
            { label: "Fear & Greed Index", value: `${fearGreed} — ${fearGreed > 60 ? "Greed" : fearGreed < 40 ? "Fear" : "Neutral"}`, icon: <Zap className="w-4 h-4 text-amber-400" />, color: "amber" },
            { label: "Live Instruments", value: `${stocks.length} Stocks`, icon: <Activity className="w-4 h-4 text-cyan-400" />, color: "cyan" },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-gray-700`}>{stat.icon}</div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-widest font-black">{stat.label}</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ticker or name..."
              className="w-full bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all shadow-sm"
            />
          </div>
          {/* Sector filter */}
          <select
            value={sector} onChange={e => setSector(e.target.value)}
            className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 text-sm text-slate-600 dark:text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all shadow-sm appearance-none cursor-pointer"
          >
            <option value="All">All Sectors</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Quick filters */}
          <div className="flex gap-2 bg-slate-100 dark:bg-gray-900/60 p-1 rounded-2xl border border-slate-200 dark:border-gray-800">
            {(["all", "gainers", "losers", "hot"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${filter === f ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white"}`}>
                {f === "hot" ? "🔥 Hot" : f === "gainers" ? "📈 Gainers" : f === "losers" ? "📉 Losers" : "All"}
              </button>
            ))}
          </div>
          <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600">{visible.length} instruments</div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-3xl border border-slate-200 dark:border-gray-800 overflow-x-auto bg-white dark:bg-gray-950/20 shadow-sm">
          {/* Header */}
          <div className="min-w-[800px] grid grid-cols-[2fr_3fr_1.2fr_1.2fr_1.2fr_1fr_1fr_auto] gap-2 px-6 py-4 bg-slate-50 dark:bg-gray-900/60 border-b border-slate-200 dark:border-gray-800 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-gray-500">
            {([["sym", "Symbol"], ["name", "Company"], ["price", "Price"], ["changePct", "Change %"], ["vol", "Volume"], ["cap", "Mkt Cap"], ["volatility", "Volatility"]] as [SortKey, string][]).map(([k, label]) => (
              <button key={k} onClick={() => toggleSort(k)} className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">
                {label}<SortIcon k={k} />
              </button>
            ))}
            <div className="text-right pr-2">Execution</div>
          </div>

          {/* Rows */}
          <div className="min-w-[800px] divide-y divide-slate-100 dark:divide-gray-800/50 max-h-[calc(100vh-340px)] overflow-y-auto">
            {visible.map(s => {
              const isUp = s.changePct >= 0;
              return (
                <div
                  key={s.sym}
                  className={`grid grid-cols-[2fr_3fr_1.2fr_1.2fr_1.2fr_1fr_1fr_auto] gap-2 px-6 py-4 text-sm items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group
                    ${s.flash === "green" ? "bg-emerald-500/5" : s.flash === "red" ? "bg-red-500/5" : ""}`}
                  style={{ transition: "background-color 0.4s ease" }}
                  onClick={() => { setBetModal(s); setBetResult(null); setBetMsg(""); setBetDir("UP"); }}
                >
                  {/* Symbol */}
                  <div>
                    <div className="font-black text-slate-900 dark:text-white tracking-tight">{s.sym}</div>
                    <div className={`text-[9px] px-2 py-0.5 rounded-lg inline-block mt-1 font-black uppercase tracking-widest
                      ${s.sector === "Tech" ? "bg-indigo-500/10 text-indigo-500" :
                        s.sector === "Finance" ? "bg-cyan-500/10 text-cyan-500" :
                        s.sector === "Energy" ? "bg-amber-500/10 text-amber-500" :
                        s.sector === "Healthcare" || s.sector === "Pharma" ? "bg-emerald-500/10 text-emerald-500" :
                        s.sector === "Automotive" ? "bg-orange-500/10 text-orange-500" :
                        "bg-slate-500/10 text-slate-400 dark:text-gray-500"}`}>
                      {s.sector}
                    </div>
                  </div>
                  {/* Name */}
                  <div className="text-slate-500 dark:text-gray-400 truncate text-xs font-medium">{s.name}</div>
                  {/* Price */}
                  <div className={`font-mono font-black text-base ${s.flash === "green" ? "text-emerald-500" : s.flash === "red" ? "text-red-500" : "text-slate-900 dark:text-white"} transition-colors`}>
                    ${fmt(s.price)}
                  </div>
                  {/* Change % */}
                  <div className={`flex items-center gap-1.5 font-black ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                    {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {isUp ? "+" : ""}{fmt(s.changePct)}%
                    <span className="text-[10px] opacity-40 font-bold">({isUp ? "+" : ""}{fmt(s.change)})</span>
                  </div>
                  {/* Volume */}
                  <div className="text-slate-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-widest">{fmtVol(s.vol)}</div>
                  {/* Market Cap */}
                  <div className="text-slate-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-widest">{fmtCap(s.cap)}</div>
                  {/* Volatility */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-gray-800 max-w-[64px] overflow-hidden">
                      <div className={`h-full rounded-full ${s.volatility > 3 ? "bg-red-500" : s.volatility > 1.5 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(s.volatility / 5 * 100, 100)}%` }} />
                    </div>
                    <span className={`text-[10px] font-black ${s.volatility > 3 ? "text-red-500" : s.volatility > 1.5 ? "text-amber-500" : "text-emerald-500"}`}>{s.volatility}%</span>
                  </div>
                  {/* Bet Button */}
                  <button
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-lg shadow-indigo-600/20"
                    onClick={e => { e.stopPropagation(); setBetModal(s); setBetResult(null); setBetMsg(""); setBetDir("UP"); }}
                  >
                    Trade
                  </button>
                </div>
              );
            })}
            {visible.length === 0 && (
              <div className="py-24 text-center text-slate-400 dark:text-gray-600 font-black uppercase tracking-[0.2em] text-sm">No matching instruments found.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bet Modal ── */}
      {betModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setBetModal(null)}>
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[2rem] shadow-2xl p-6 md:p-8 space-y-6" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{betModal.sym}</div>
                <div className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">{betModal.name}</div>
              </div>
              <button onClick={() => setBetModal(null)} className="p-2 rounded-xl bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"><X className="w-4 h-4" /></button>
            </div>

            {/* Live Price */}
            <div className="bg-slate-50 dark:bg-gray-950/50 rounded-2xl p-5 grid grid-cols-3 gap-4 text-center border border-slate-100 dark:border-gray-800 shadow-inner">
              <div>
                <div className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest">Mark Price</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1.5">${fmt(betModal.price)}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest">24h Delta</div>
                <div className={`text-base font-black mt-1.5 ${betModal.changePct >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {betModal.changePct >= 0 ? "+" : ""}{fmt(betModal.changePct)}%
                </div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest">Volatility</div>
                <div className={`text-base font-black mt-1.5 ${betModal.volatility > 3 ? "text-rose-500" : betModal.volatility > 1.5 ? "text-amber-500" : "text-emerald-500"}`}>
                  {betModal.volatility}%
                </div>
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-3">
              <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest ml-1">Market Sentiment</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setBetDir("UP")}
                  className={`py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest
                    ${betDir === "UP" ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10" : "border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40 text-slate-400 dark:text-gray-500 hover:border-emerald-500/30"}`}>
                  <TrendingUp className="w-5 h-5" /> Buy / Call
                </button>
                <button onClick={() => setBetDir("DOWN")}
                  className={`py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest
                    ${betDir === "DOWN" ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/10" : "border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40 text-slate-400 dark:text-gray-500 hover:border-rose-500/30"}`}>
                  <TrendingDown className="w-5 h-5" /> Sell / Put
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest">Trade Size (USDT)</div>
                <div className="text-[10px] text-slate-400 dark:text-gray-500 font-bold">AVAILABLE: <span className="text-emerald-500 dark:text-emerald-400">${fmt(balance)}</span></div>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                  <UsdtIcon className="w-5 h-5" />
                </div>
                <input type="number" min="1" value={betAmount} onChange={e => setBetAmount(e.target.value)} placeholder="50"
                  className="w-full bg-slate-50 dark:bg-gray-950/50 border border-slate-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white font-black text-lg focus:outline-none focus:border-indigo-500 transition-all shadow-inner" />
              </div>
              <div className="flex gap-2">
                {[50, 100, 500, 1000].map(amt => (
                  <button key={amt} onClick={() => setBetAmount(String(Math.min(amt, balance)))}
                    className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-all border border-slate-100 dark:border-gray-700">
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest ml-1">Settlement Expiry</div>
              <div className="flex gap-2">
                {[1, 5, 15, 30, 60].map(m => (
                  <button key={m} onClick={() => setBetDuration(m)}
                    className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border
                      ${betDuration === m ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white"}`}>
                    {m < 60 ? `${m}m` : "1h"}
                  </button>
                ))}
              </div>
            </div>

            {/* Result message */}
            {betMsg && (
              <div className={`flex items-start gap-3 p-4 rounded-2xl text-xs font-bold ${betResult === "success" ? "bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                {betResult === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                {betMsg}
              </div>
            )}

            {/* Submit */}
            {betResult !== "success" && (
              <button onClick={placeBet} disabled={betLoading || !user}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl
                  ${betDir === "UP"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"}
                  ${(betLoading || !user) ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"}`}>
                {!user ? "Authentication Required" : betLoading ? <span className="animate-pulse">Broadcasting Trade...</span> : `Execute ${betDir} Position`}
              </button>
            )}
            
            {betResult === "success" && (
              <button onClick={() => setBetModal(null)} className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-gray-700 transition-all">
                Close Terminal
              </button>
            )}

            <p className="text-center text-[9px] text-slate-400 dark:text-gray-600 font-bold uppercase tracking-widest">
              High risk investment. Position settlement is automated by the protocol.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
