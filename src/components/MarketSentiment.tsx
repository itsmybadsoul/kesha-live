"use client";

import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export function MarketSentiment() {
  const sentimentValue = 72; // 0-100: 0=Extreme Fear, 100=Extreme Greed
  const label = sentimentValue >= 75 ? "Extreme Greed" : sentimentValue >= 55 ? "Greed" : sentimentValue >= 45 ? "Neutral" : sentimentValue >= 25 ? "Fear" : "Extreme Fear";
  const color = sentimentValue >= 75 ? "#10b981" : sentimentValue >= 55 ? "#f59e0b" : sentimentValue >= 45 ? "#6366f1" : sentimentValue >= 25 ? "#f97316" : "#ef4444";

  // SVG arc gauge parameters
  const radius = 80;
  const cx = 110;
  const cy = 100;
  const strokeWidth = 14;
  const startAngle = 180; // left
  const endAngle = 0; // right
  const totalArc = 180;
  const filled = (sentimentValue / 100) * totalArc;

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const a = (angle - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const s = polarToCartesian(cx, cy, r, startDeg);
    const e = polarToCartesian(cx, cy, r, endDeg);
    const large = endDeg - startDeg <= 180 ? "0" : "1";
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  // Needle tip based on sentiment value (180deg span: 180deg = far left, 0deg = far right)
  const needleAngle = 180 - (sentimentValue / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = 68;
  const nx = cx + needleLen * Math.cos(Math.PI - needleRad);
  const ny = cy - needleLen * Math.sin(needleRad);

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Market Sentiment
        </h3>
        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest">
          Live Data
        </div>
      </div>

      {/* SVG Gauge */}
      <div className="flex justify-center">
        <svg width="220" height="120" viewBox="0 0 220 120">
          {/* Track */}
          <path
            d={describeArc(cx, cy, radius, 180, 360)}
            fill="none"
            stroke="#1f2937"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Colored segments (fear→greed gradient via stops) */}
          <path d={describeArc(cx, cy, radius, 180, 216)} fill="none" stroke="#ef4444" strokeWidth={strokeWidth} strokeOpacity="0.6" />
          <path d={describeArc(cx, cy, radius, 216, 252)} fill="none" stroke="#f97316" strokeWidth={strokeWidth} strokeOpacity="0.6" />
          <path d={describeArc(cx, cy, radius, 252, 288)} fill="none" stroke="#eab308" strokeWidth={strokeWidth} strokeOpacity="0.6" />
          <path d={describeArc(cx, cy, radius, 288, 324)} fill="none" stroke="#84cc16" strokeWidth={strokeWidth} strokeOpacity="0.6" />
          <path d={describeArc(cx, cy, radius, 324, 360)} fill="none" stroke="#10b981" strokeWidth={strokeWidth} strokeOpacity="0.6" />

          {/* Active fill */}
          <path
            d={describeArc(cx, cy, radius, 180, 180 + filled)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Needle */}
          <line
            x1={cx} y1={cy}
            x2={nx} y2={ny}
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Needle base */}
          <circle cx={cx} cy={cy} r="6" fill={color} />
          <circle cx={cx} cy={cy} r="3" fill="white" />

          {/* Labels */}
          <text x="24" y="112" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">FEAR</text>
          <text x="176" y="112" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">GREED</text>
        </svg>
      </div>

      {/* Value */}
      <div className="text-center -mt-2 mb-4">
        <div className="text-4xl font-black tabular-nums" style={{ color }}>{sentimentValue}</div>
        <div className="text-[11px] font-black uppercase tracking-widest mt-1" style={{ color }}>{label}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/40 p-3 rounded-2xl border border-gray-700/30">
          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Buy Momentum</div>
          <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> 68.2%
          </div>
        </div>
        <div className="bg-black/40 p-3 rounded-2xl border border-gray-700/30">
          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Sell Pressure</div>
          <div className="text-sm font-black text-rose-500 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" /> 31.8%
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 bg-amber-500/5 p-3 rounded-2xl border border-amber-500/20">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-300/80 leading-relaxed font-medium">
          High market greed detected. Ensure stop-loss positions are set for high-volatility events.
        </p>
      </div>
    </div>
  );
}
