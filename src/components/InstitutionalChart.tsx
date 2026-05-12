"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useCrypto } from "@/context/CryptoContext";

interface InstitutionalChartProps {
  asset: string;
  height?: number;
}

export function InstitutionalChart({ asset, height }: InstitutionalChartProps) {
  const { prices } = useCrypto();
  const basePrice = prices[asset] || 0;
  
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [volumes, setVolumes] = useState<number[]>([]);
  const currentPriceRef = useRef(basePrice);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(height || 400);

  useEffect(() => {
    if (!height && containerRef.current) {
      setSvgHeight(containerRef.current.clientHeight);
    }
  }, [height]);

  // Generate deterministic noise based on price and time
  const getNoise = (timeSec: number) => {
    const t1 = timeSec * 0.05;
    const t2 = timeSec * 0.015;
    const t3 = timeSec * 0.11;
    const jagged = (Math.sin(timeSec * 12.9898) * 43758.5453) % 1;
    return Math.sin(t1) * 0.4 + Math.sin(t2) * 0.3 + Math.sin(t3) * 0.2 + (jagged - 0.5) * 0.2;
  };

  // Initialize history
  useEffect(() => {
    if (basePrice === 0) return;
    
    const initialPoints = [];
    const initialVolumes = [];
    const nowSec = Math.floor(Date.now() / 1000);
    
    // We want to reconstruct a look of a "live" chart
    for (let i = 80; i >= 0; i--) {
        const noise = getNoise(nowSec - i);
        // We assume the basePrice was roughly the same in the last 80 seconds for history reconstruction
        initialPoints.push(basePrice + (noise * basePrice * 0.0008));
        initialVolumes.push(Math.abs(noise) * 100 + Math.random() * 50);
    }
    
    setDataPoints(initialPoints);
    setVolumes(initialVolumes);
    currentPriceRef.current = basePrice;
  }, [asset, basePrice > 0]); // Only re-init if asset changes or we finally get a price

  // Live update
  useEffect(() => {
    const interval = setInterval(() => {
      if (basePrice === 0) return;
      
      const nowSec = Math.floor(Date.now() / 1000);
      const noise = getNoise(nowSec);
      const newPoint = basePrice + (noise * basePrice * 0.0005);
      const newVol = Math.abs(noise) * 100 + Math.random() * 50;

      setDataPoints(prev => [...prev.slice(1), newPoint]);
      setVolumes(prev => [...prev.slice(1), newVol]);
      currentPriceRef.current = newPoint;
    }, 1000);

    return () => clearInterval(interval);
  }, [basePrice]);

  const { min, max, range, adjustedMin, adjustedMax, adjustedRange } = useMemo(() => {
    if (dataPoints.length === 0) return { min: 0, max: 0, range: 0, adjustedMin: 0, adjustedMax: 0, adjustedRange: 1 };
    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = max - min || 1;
    const padding = range * 0.2;
    const adjustedMin = min - padding;
    const adjustedMax = max + padding;
    return { min, max, range, adjustedMin, adjustedMax, adjustedRange: adjustedMax - adjustedMin };
  }, [dataPoints]);

  const width = 1000;
  const svgHeight = height;

  const pathData = useMemo(() => {
    return dataPoints.map((point, index) => {
      const x = (index / (dataPoints.length - 1)) * width;
      const y = svgHeight - ((point - adjustedMin) / adjustedRange) * svgHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");
  }, [dataPoints, adjustedMin, adjustedRange, svgHeight]);

  const isUp = dataPoints[dataPoints.length - 1] >= dataPoints[0];
  const strokeColor = isUp ? "#10B981" : "#F43F5E";

  if (basePrice === 0) {
    return (
      <div className="w-full bg-[#0B0E14] flex items-center justify-center animate-pulse rounded-[2rem] border border-white/5" style={{ height: height || '100%' }}>
        <div className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Connecting to Liquidity Protocol...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full relative group select-none overflow-hidden rounded-[2rem] bg-[#0B0E14]" style={{ height: height || '100%' }}>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#312e81 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Price Labels */}
      <div className="absolute right-4 top-0 bottom-0 flex flex-col justify-between py-10 z-20 pointer-events-none">
        <div className="text-[10px] font-black text-white/40 bg-black/40 px-2 py-1 rounded border border-white/5 backdrop-blur-md">${adjustedMax.toLocaleString()}</div>
        <div className="text-[10px] font-black text-white/40 bg-black/40 px-2 py-1 rounded border border-white/5 backdrop-blur-md">${((adjustedMax + adjustedMin) / 2).toLocaleString()}</div>
        <div className="text-[10px] font-black text-white/40 bg-black/40 px-2 py-1 rounded border border-white/5 backdrop-blur-md">${adjustedMin.toLocaleString()}</div>
      </div>

      {/* Main SVG */}
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${svgHeight}`} preserveAspectRatio="none" className="relative z-10">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Volumes (Simulated) */}
        {volumes.map((vol, i) => {
          const x = (i / (volumes.length - 1)) * width;
          const barHeight = (vol / 150) * (svgHeight * 0.2);
          return (
            <rect 
              key={i}
              x={x - 2}
              y={svgHeight - barHeight}
              width="4"
              height={barHeight}
              fill={dataPoints[i] >= (dataPoints[i-1] || dataPoints[i]) ? "#10B981" : "#F43F5E"}
              opacity="0.1"
            />
          );
        })}

        {/* Area */}
        <path d={`${pathData} L ${width} ${svgHeight} L 0 ${svgHeight} Z`} fill="url(#chartGradient)" />

        {/* Path */}
        <path 
          d={pathData} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{ filter: 'drop-shadow(0 0 8px ' + strokeColor + '44)' }}
        />

        {/* Current Price Dot */}
        {dataPoints.length > 0 && (
          <g>
            <circle 
              cx={width} 
              cy={svgHeight - ((dataPoints[dataPoints.length - 1] - adjustedMin) / adjustedRange) * svgHeight} 
              r="6" 
              fill={strokeColor} 
              className="animate-pulse"
            />
            <circle 
              cx={width} 
              cy={svgHeight - ((dataPoints[dataPoints.length - 1] - adjustedMin) / adjustedRange) * svgHeight} 
              r="12" 
              fill={strokeColor} 
              opacity="0.2"
              className="animate-ping"
            />
          </g>
        )}
      </svg>

      {/* Floating Info */}
      <div className="absolute top-8 left-8 z-20 flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-2xl shadow-indigo-500/20">
          {asset[0]}
        </div>
        <div>
          <div className="text-3xl font-black text-white tracking-tighter tabular-nums flex items-center gap-3">
            ${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            <span className={`text-xs px-2 py-1 rounded-lg ${isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              {isUp ? "▲" : "▼"} LIVE
            </span>
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{asset} / Tether Perpetual Institutional Feed</div>
        </div>
      </div>
      
      {/* HUD Details */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-8">
        <div className="space-y-1">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">24h Vol</div>
          <div className="text-xs font-bold text-white/80">{(basePrice * 1245).toLocaleString()} USDT</div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Liquidity</div>
          <div className="text-xs font-bold text-emerald-500">DEEP</div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Source</div>
          <div className="text-xs font-bold text-indigo-400">Institutional Aggregator</div>
        </div>
      </div>
    </div>
  );
}
