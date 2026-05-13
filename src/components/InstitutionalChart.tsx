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
  const smoothedPriceRef = useRef(basePrice);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(height || 400);
  const [width, setWidth] = useState(1000);

  useEffect(() => {
    if (!height && containerRef.current) {
      setSvgHeight(containerRef.current.clientHeight);
    }
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
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

  const hasInitRef = useRef<string | null>(null);

  // Initialize history with a realistic random walk
  useEffect(() => {
    if (basePrice === 0 || hasInitRef.current === asset) return;
    
    const initialPoints = [];
    const initialVolumes = [];
    // Start history slightly offset to show movement, but ensure it ends at basePrice
    let walkingPrice = basePrice * (0.97 + Math.random() * 0.06); 
    
    for (let i = 0; i < 80; i++) {
        const noise = getNoise(i);
        walkingPrice += (noise * walkingPrice * 0.001);
        
        // Progressively pull MUCH harder towards basePrice as we reach the end (i=79)
        const pullStrength = Math.pow(i / 80, 2) * 0.3;
        const pull = (basePrice - walkingPrice) * pullStrength;
        walkingPrice += pull;
        
        initialPoints.push(walkingPrice);
        initialVolumes.push(Math.abs(noise) * 100 + Math.random() * 50);
    }
    
    // Force the last point to be exactly basePrice to eliminate the jump
    initialPoints[initialPoints.length - 1] = basePrice;
    
    setDataPoints(initialPoints);
    setVolumes(initialVolumes);
    currentPriceRef.current = basePrice;
    smoothedPriceRef.current = basePrice;
    hasInitRef.current = asset;
  }, [asset, basePrice > 0]); 


  // Live update with sub-second micro-ticks for "breathing" effect
  useEffect(() => {
    if (basePrice === 0) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const cycleTime = now % 5000; // 5 second pulse cycle
      const isMoving = cycleTime < 1000; // Pulse for 1 second, stay for 4

      if (isMoving) {
        const diff = basePrice - smoothedPriceRef.current;
        // 10x slower glide factor for rock-solid stability
        smoothedPriceRef.current += diff * 0.005;
      }

      const noise = getNoise(now / 1000);
      
      // Near-zero jitter
      const newPoint = smoothedPriceRef.current + (noise * smoothedPriceRef.current * 0.00001);
      
      setDataPoints(prev => {
        const next = [...prev.slice(1), newPoint];
        return next;
      });
      
      setVolumes(prev => [...prev.slice(1), Math.abs(noise) * 100 + Math.random() * 50]);
      currentPriceRef.current = newPoint;
    }, 1000); // 10x slower update frequency (1 second ticks)

    return () => clearInterval(interval);
  }, [asset, basePrice > 0]);

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

  const pathData = useMemo(() => {
    return dataPoints.map((point, index) => {
      const x = (index / (dataPoints.length - 1)) * width;
      const y = svgHeight - ((point - adjustedMin) / adjustedRange) * svgHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");
  }, [dataPoints, adjustedMin, adjustedRange, svgHeight, width]);

  const isUp = dataPoints[dataPoints.length - 1] >= dataPoints[0];
  const strokeColor = isUp ? "#10B981" : "#F43F5E";

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (width === 0 || dataPoints.length === 0) {
    return (
      <div className="w-full bg-[#0B0E14] flex items-center justify-center animate-pulse rounded-[2rem] border border-white/5" style={{ height: height || '100%' }}>
        <div className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs text-center px-4">Connecting to Liquidity Protocol...</div>
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
      <div className="absolute right-1 md:right-4 top-0 bottom-0 flex flex-col justify-between py-12 md:py-20 z-20 pointer-events-none opacity-40 sm:opacity-100">
        <div className="text-[7px] md:text-[10px] font-black text-white/40 bg-black/40 px-1 md:px-2 py-0.5 md:py-1 rounded border border-white/5 backdrop-blur-md">${adjustedMax.toLocaleString(undefined, { maximumFractionDigits: adjustedMax < 1 ? 6 : 2 })}</div>
        <div className="text-[7px] md:text-[10px] font-black text-white/40 bg-black/40 px-1 md:px-2 py-0.5 md:py-1 rounded border border-white/5 backdrop-blur-md">${((adjustedMax + adjustedMin) / 2).toLocaleString(undefined, { maximumFractionDigits: adjustedMax < 1 ? 6 : 2 })}</div>
        <div className="text-[7px] md:text-[10px] font-black text-white/40 bg-black/40 px-1 md:px-2 py-0.5 md:py-1 rounded border border-white/5 backdrop-blur-md">${adjustedMin.toLocaleString(undefined, { maximumFractionDigits: adjustedMax < 1 ? 6 : 2 })}</div>
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
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="transition-all duration-300 ease-linear"
          style={{ 
            filter: 'drop-shadow(0 0 12px ' + strokeColor + '66)',
            vectorEffect: 'non-scaling-stroke'
          }}
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
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex items-start gap-3 md:gap-4 max-w-[90%]">
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg md:text-xl font-black text-white shadow-2xl shadow-indigo-500/20 shrink-0">
          {asset[0]}
        </div>
        <div>
          <div className="text-xl md:text-3xl font-black text-white tracking-tighter tabular-nums flex items-center gap-2 md:gap-3">
            ${basePrice.toLocaleString(undefined, { 
              minimumFractionDigits: basePrice < 0.001 ? 6 : (basePrice < 1 ? 4 : 2),
              maximumFractionDigits: basePrice < 0.001 ? 8 : (basePrice < 1 ? 6 : 2)
            })}
            <div className={`text-[7px] md:text-[9px] px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg font-black uppercase tracking-widest flex items-center gap-1 ${isUp ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/20 text-rose-400 border border-rose-500/20"}`}>
              <div className={`w-1 h-1 rounded-full ${isUp ? "bg-emerald-400 animate-pulse" : "bg-rose-400 animate-pulse"}`}></div> LIVE
            </div>
          </div>
          <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5 md:mt-1">{asset} / Institutional Feed</div>
        </div>
      </div>
      
      {/* HUD Details */}
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-20 flex flex-wrap gap-4 md:gap-10">
        <div className="space-y-0.5 md:space-y-1">
          <div className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">24h Vol</div>
          <div className="text-[9px] md:text-xs font-bold text-white/80">{(basePrice * 1245).toLocaleString()} USDT</div>
        </div>
        <div className="space-y-0.5 md:space-y-1">
          <div className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Liquidity</div>
          <div className="text-[9px] md:text-xs font-bold text-emerald-500 flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> PRO_DEEP
          </div>
        </div>
        <div className="space-y-0.5 md:space-y-1">
          <div className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Source</div>
          <div className="text-[9px] md:text-xs font-bold text-indigo-400 group-hover:text-white transition-colors">STOCKS AI Infrastructure</div>
        </div>
      </div>
    </div>
  );
}
