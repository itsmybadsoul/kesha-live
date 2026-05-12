"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface PriceData {
  symbol: string;
  price: string;
  rawPrice: number;
}

export interface CryptoContextType {
  prices: Record<string, number>; 
  rawPrices: PriceData[]; 
  loading: boolean;
}

const FALLBACK: Record<string, number> = {
  BTC: 64230.50,
  ETH: 3450.20,
  SOL: 145.80,
  BNB: 580.40,
  XRP: 0.62,
  ADA: 0.45,
  DOGE: 0.16,
  LINK: 18.10,
  AVAX: 36.40,
  MATIC: 0.72,
  TRX: 0.12
};

const SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", 
  "ADAUSDT", "DOGEUSDT", "DOTUSDT", "MATICUSDT", "TRXUSDT",
  "LTCUSDT", "LINKUSDT", "AVAXUSDT", "TONUSDT", "SHIBUSDT"
];

const CryptoContext = createContext<CryptoContextType>({ prices: FALLBACK, rawPrices: [], loading: true });

export const useCrypto = () => useContext(CryptoContext);

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<Record<string, number>>(FALLBACK);
  const [rawPrices, setRawPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Fetch live Binance prices
      const response = await fetch("https://api.binance.com/api/v3/ticker/price").catch(() => null);
      let liveMap: Record<string, number> = { ...FALLBACK };
      let rawArr: PriceData[] = [];
      
      if (response && response.ok) {
        const allPrices = await response.json();
        rawArr = allPrices.filter((p: any) => SYMBOLS.includes(p.symbol))
          .map((p: any) => ({
            symbol: p.symbol.replace("USDT", ""),
            price: parseFloat(p.price).toLocaleString(undefined, { 
              minimumFractionDigits: p.price < 1 ? 4 : 2,
              maximumFractionDigits: p.price < 1 ? 6 : 2
            }),
            rawPrice: parseFloat(p.price)
          }));
          
        rawArr.forEach(p => {
           liveMap[p.symbol] = p.rawPrice;
        });
      } else {
        // Fallback array if Binance fails
        rawArr = Object.entries(FALLBACK).map(([sym, val]) => ({
          symbol: sym,
          price: val.toLocaleString(),
          rawPrice: val
        }));
      }

      // 2. Fetch Admin overrides from KV
      const marketRes = await fetch("/api/admin/market").catch(() => null);
      if (marketRes && marketRes.ok) {
        const mData = await marketRes.json();
        if (mData.markets) {
           mData.markets.forEach((m: any) => {
              const hasTarget = m.targetPrice && m.targetEndTime && m.targetStartTime;
              const isFinished = hasTarget && Date.now() > m.targetEndTime;
              
              let finalPrice = m.basePrice;

              if (hasTarget && !isFinished) {
                 const total = m.targetEndTime - m.targetStartTime;
                 const elapsed = Date.now() - m.targetStartTime;
                 const progress = Math.max(0, Math.min(elapsed / total, 1));
                 finalPrice = m.basePrice + (m.targetPrice - m.basePrice) * progress;
              } else if (hasTarget && isFinished) {
                 finalPrice = m.targetPrice;
              }

              if (finalPrice > 0) {
                 liveMap[m.sym] = finalPrice;
                 const existing = rawArr.find(r => r.symbol === m.sym);
                 if (existing) {
                    existing.rawPrice = finalPrice;
                    existing.price = finalPrice.toLocaleString(undefined, {
                      minimumFractionDigits: finalPrice < 1 ? 4 : 2,
                      maximumFractionDigits: finalPrice < 1 ? 6 : 2
                    });
                 } else {
                    // Add synthetic markets if they don't exist in Binance
                    rawArr.push({
                      symbol: m.sym,
                      rawPrice: finalPrice,
                      price: finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })
                    });
                 }
              }
           });
        }
      }

      setPrices(liveMap);
      setRawPrices(rawArr);
      setLoading(false);
    } catch (e) {
      console.error("Crypto fetch error:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s for smooth interpolations
    return () => clearInterval(interval);
  }, []);

  return (
    <CryptoContext.Provider value={{ prices, rawPrices, loading }}>
      {children}
    </CryptoContext.Provider>
  );
};
