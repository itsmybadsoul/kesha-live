"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/context/UserContext";
import {
  TrendingUp, TrendingDown, Search, Filter, X, ChevronUp, ChevronDown,
  BarChart3, Activity, Zap, Globe, ArrowUpRight, ArrowDownRight,
  DollarSign, Clock, Target, AlertCircle, CheckCircle, Minus,
  LayoutDashboard, Wallet, ArrowRightLeft, User, BlocksIcon
} from "lucide-react";

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

;
  });
}

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
           newStocks = [...newStocks, ...realData.data.map((r: any) => ({
             ...r,
             prevPrice: r.price,
             isControlled: false
           }))];
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
    <div className="min-h-screen bg-[#080810] text-white font-sans">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#080810]/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0">
              <BlocksIcon className="w-4 h-4 text-white" />
            </div>
            <a href="/" className="text-base font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hidden sm:block">Stocks Indicators</a>
          </div>
          <div className="hidden lg:flex items-center gap-5 text-sm text-gray-400 font-medium">
            <a href="/" className="flex items-center gap-1.5 hover:text-white transition-colors"><LayoutDashboard className="w-4 h-4" />Dashboard</a>
            <a href="/markets" className="flex items-center gap-1.5 text-white border-b border-indigo-500 pb-0.5"><BarChart3 className="w-4 h-4 text-indigo-400" />Markets</a>
            <a href="/profile" className="flex items-center gap-1.5 hover:text-white transition-colors"><User className="w-4 h-4" />Profile</a>
            <a href="/deposit" className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"><Wallet className="w-4 h-4" />Deposit</a>
            <a href="/withdraw" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"><ArrowRightLeft className="w-4 h-4" />Withdraw</a>
            <a href="/futures" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-bold uppercase tracking-wide text-xs"><Activity className="w-4 h-4 animate-pulse" />Pro Options</a>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-gray-500 uppercase tracking-tight">Balance</div>
                <div className="text-sm font-black text-emerald-400">${fmt(balance)}</div>
              </div>
            )}
            {!user && <a href="/login" className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg font-semibold transition-colors">Sign In</a>}
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-6 space-y-4">
        {/* ── Market Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Market Cap", value: fmtCap(totalMarketCap * 1000), icon: <Globe className="w-4 h-4 text-indigo-400" />, color: "indigo" },
            { label: "Gainers / Losers", value: `${gainers} / ${losers}`, icon: <BarChart3 className="w-4 h-4 text-emerald-400" />, color: "emerald" },
            { label: "Fear & Greed Index", value: `${fearGreed} — ${fearGreed > 60 ? "Greed" : fearGreed < 40 ? "Fear" : "Neutral"}`, icon: <Zap className="w-4 h-4 text-amber-400" />, color: "amber" },
            { label: "Live Instruments", value: `${stocks.length} Stocks`, icon: <Activity className="w-4 h-4 text-cyan-400" />, color: "cyan" },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center shrink-0`}>{stat.icon}</div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
                <div className="text-sm font-bold text-white mt-0.5">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ticker or name..."
              className="w-full bg-white/[0.04] border border-white/8 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          {/* Sector filter */}
          <select
            value={sector} onChange={e => setSector(e.target.value)}
            className="bg-white/[0.04] border border-white/8 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="All">All Sectors</option>
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
          {/* Quick filters */}
          {(["all", "gainers", "losers", "hot"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? "bg-indigo-600 text-white" : "bg-white/[0.04] text-gray-400 hover:text-white border border-white/5"}`}>
              {f === "hot" ? "🔥 Hot" : f === "gainers" ? "📈 Gainers" : f === "losers" ? "📉 Losers" : "All"}
            </button>
          ))}
          <div className="ml-auto text-xs text-gray-600">{visible.length} results</div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-white/5 overflow-hidden bg-white/[0.015]">
          {/* Header */}
          <div className="grid grid-cols-[2fr_3fr_1.2fr_1.2fr_1.2fr_1fr_1fr_auto] gap-2 px-4 py-2.5 bg-white/[0.025] border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-500">
            {([["sym", "Symbol"], ["name", "Company"], ["price", "Price"], ["changePct", "Change %"], ["vol", "Volume"], ["cap", "Mkt Cap"], ["volatility", "Volatility"]] as [SortKey, string][]).map(([k, label]) => (
              <button key={k} onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                {label}<SortIcon k={k} />
              </button>
            ))}
            <div className="text-right pr-1">Bet</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.03] max-h-[calc(100vh-340px)] overflow-y-auto">
            {visible.map(s => {
              const isUp = s.changePct >= 0;
              return (
                <div
                  key={s.sym}
                  className={`grid grid-cols-[2fr_3fr_1.2fr_1.2fr_1.2fr_1fr_1fr_auto] gap-2 px-4 py-2.5 text-sm items-center cursor-pointer hover:bg-white/[0.03] transition-all group
                    ${s.flash === "green" ? "bg-emerald-500/5" : s.flash === "red" ? "bg-red-500/5" : ""}`}
                  style={{ transition: "background-color 0.4s ease" }}
                  onClick={() => { setBetModal(s); setBetResult(null); setBetMsg(""); setBetDir("UP"); }}
                >
                  {/* Symbol */}
                  <div>
                    <div className="font-bold text-white">{s.sym}</div>
                    <div className={`text-[10px] px-1.5 py-0.5 rounded inline-block mt-0.5 font-medium
                      ${s.sector === "Tech" ? "bg-indigo-500/15 text-indigo-400" :
                        s.sector === "Finance" ? "bg-cyan-500/15 text-cyan-400" :
                        s.sector === "Energy" ? "bg-amber-500/15 text-amber-400" :
                        s.sector === "Healthcare" || s.sector === "Pharma" ? "bg-emerald-500/15 text-emerald-400" :
                        s.sector === "Automotive" ? "bg-orange-500/15 text-orange-400" :
                        "bg-gray-500/15 text-gray-400"}`}>
                      {s.sector}
                    </div>
                  </div>
                  {/* Name */}
                  <div className="text-gray-300 truncate text-xs">{s.name}</div>
                  {/* Price */}
                  <div className={`font-mono font-bold ${s.flash === "green" ? "text-emerald-300" : s.flash === "red" ? "text-red-300" : "text-white"} transition-colors`}>
                    ${fmt(s.price)}
                  </div>
                  {/* Change % */}
                  <div className={`flex items-center gap-1 font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                    {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {isUp ? "+" : ""}{fmt(s.changePct)}%
                    <span className="text-[10px] opacity-60">({isUp ? "+" : ""}{fmt(s.change)})</span>
                  </div>
                  {/* Volume */}
                  <div className="text-gray-400 text-xs font-mono">{fmtVol(s.vol)}</div>
                  {/* Market Cap */}
                  <div className="text-gray-400 text-xs font-mono">{fmtCap(s.cap)}</div>
                  {/* Volatility */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1 rounded-full bg-white/5 max-w-[48px]">
                      <div className={`h-1 rounded-full ${s.volatility > 3 ? "bg-red-400" : s.volatility > 1.5 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.min(s.volatility / 5 * 100, 100)}%` }} />
                    </div>
                    <span className={`text-[10px] font-mono ${s.volatility > 3 ? "text-red-400" : s.volatility > 1.5 ? "text-amber-400" : "text-emerald-400"}`}>{s.volatility}%</span>
                  </div>
                  {/* Bet Button */}
                  <button
                    className="bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap"
                    onClick={e => { e.stopPropagation(); setBetModal(s); setBetResult(null); setBetMsg(""); setBetDir("UP"); }}
                  >
                    Bet
                  </button>
                </div>
              );
            })}
            {visible.length === 0 && (
              <div className="py-16 text-center text-gray-600">No matching stocks found.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bet Modal ── */}
      {betModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setBetModal(null)}>
          <div className="w-full max-w-md bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-black text-white">{betModal.sym}</div>
                <div className="text-xs text-gray-500 mt-0.5">{betModal.name}</div>
              </div>
              <button onClick={() => setBetModal(null)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
            </div>

            {/* Live Price */}
            <div className="bg-white/[0.025] rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Price</div>
                <div className="text-lg font-black text-white mt-1">${fmt(betModal.price)}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">24h Change</div>
                <div className={`text-base font-bold mt-1 ${betModal.changePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {betModal.changePct >= 0 ? "+" : ""}{fmt(betModal.changePct)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Volatility</div>
                <div className={`text-base font-bold mt-1 ${betModal.volatility > 3 ? "text-red-400" : betModal.volatility > 1.5 ? "text-amber-400" : "text-emerald-400"}`}>
                  {betModal.volatility}%
                </div>
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-1.5">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Your Prediction</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setBetDir("UP")}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold
                    ${betDir === "UP" ? "border-emerald-500 bg-emerald-500/15 text-emerald-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-emerald-500/30"}`}>
                  <TrendingUp className="w-4 h-4" /> UP / BUY
                </button>
                <button onClick={() => setBetDir("DOWN")}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold
                    ${betDir === "DOWN" ? "border-red-500 bg-red-500/15 text-red-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-red-500/30"}`}>
                  <TrendingDown className="w-4 h-4" /> DOWN / SELL
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Bet Amount (USDT)</div>
                <div className="text-xs text-gray-600">Balance: <span className="text-emerald-400 font-semibold">${fmt(balance)}</span></div>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="number" min="1" value={betAmount} onChange={e => setBetAmount(e.target.value)} placeholder="50"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white font-mono focus:outline-none focus:border-indigo-500/50 transition-colors" />
              </div>
              <div className="flex gap-2">
                {[25, 50, 100, 250].map(amt => (
                  <button key={amt} onClick={() => setBetAmount(String(Math.min(amt, balance)))}
                    className="flex-1 py-1 text-xs text-gray-400 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors border border-white/5">
                    ${amt}
                  </button>
                ))}
                <button onClick={() => setBetAmount(String(Math.floor(balance)))}
                  className="flex-1 py-1 text-xs text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20">
                  MAX
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Expiry Duration</div>
              <div className="flex gap-2">
                {[1, 5, 15, 30, 60].map(m => (
                  <button key={m} onClick={() => setBetDuration(m)}
                    className={`flex-1 py-2 text-xs rounded-lg font-semibold transition-all border
                      ${betDuration === m ? "border-indigo-500 bg-indigo-500/20 text-indigo-300" : "border-white/5 bg-white/[0.03] text-gray-500 hover:text-gray-300"}`}>
                    {m < 60 ? `${m}m` : "1h"}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Preview */}
            <div className="bg-white/[0.025] rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Target className="w-3.5 h-3.5" /> Potential Payout
              </div>
              <div className="text-base font-black text-emerald-400">
                ${fmt(parseFloat(betAmount || "0") * 1.85)}
                <span className="text-xs text-gray-600 ml-1 font-normal">(85% profit)</span>
              </div>
            </div>

            {/* Result message */}
            {betMsg && (
              <div className={`flex items-start gap-2.5 p-3 rounded-xl text-sm ${betResult === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border border-red-500/20 text-red-300"}`}>
                {betResult === "success" ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                {betMsg}
              </div>
            )}

            {/* Submit */}
            {betResult !== "success" && (
              <button onClick={placeBet} disabled={betLoading || !user}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all
                  ${betDir === "UP"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white"
                    : "bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white"}
                  ${(betLoading || !user) ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!user ? "Sign in to place bets" : betLoading ? "Placing Bet..." : `Place ${betDir} Bet on ${betModal.sym}`}
              </button>
            )}
            {betResult === "success" && (
              <button onClick={() => setBetModal(null)} className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 hover:text-white font-semibold transition-colors text-sm">
                Close & Continue Trading
              </button>
            )}

            <p className="text-center text-[10px] text-gray-700">
              By placing a bet, you agree to the platform terms. Options expire at strike time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
