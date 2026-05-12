"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface PriceData {
  symbol: string;
  price: string;
  rawPrice: number;
  change: number;
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
      // 1. Fetch live Binance prices (24h ticker for change percent)
      const response = await fetch("https://api.binance.com/api/v3/ticker/24hr").catch(() => null);
      let liveMap: Record<string, number> = { ...FALLBACK };
      let rawArr: PriceData[] = [];
      
      if (response && response.ok) {
        const allPrices = await response.json();
        
        const featuredSymbols = SYMBOLS.map(s => s.replace("USDT", ""));
        let filtered = allPrices.filter((p: any) => p.symbol.endsWith("USDT") && !p.symbol.includes("UPUSDT") && !p.symbol.includes("DOWNUSDT") && !p.symbol.includes("BEAR") && !p.symbol.includes("BULL"));
        
        filtered.sort((a: any, b: any) => {
          const aSym = a.symbol.replace("USDT", "");
          const bSym = b.symbol.replace("USDT", "");
          const aIndex = featuredSymbols.indexOf(aSym);
          const bIndex = featuredSymbols.indexOf(bSym);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.symbol.localeCompare(b.symbol);
        });

        rawArr = filtered.map((p: any) => ({
            symbol: p.symbol.replace("USDT", ""),
            price: parseFloat(p.lastPrice).toLocaleString(undefined, { 
              minimumFractionDigits: p.lastPrice < 1 ? 4 : 2,
              maximumFractionDigits: p.lastPrice < 1 ? 6 : 2
            }),
            rawPrice: parseFloat(p.lastPrice),
            change: parseFloat(p.priceChangePercent)
        }));
          
        rawArr.forEach(p => {
           liveMap[p.symbol] = p.rawPrice;
        });
      } else {
        // Fallback array if Binance fails
        rawArr = Object.entries(FALLBACK).map(([sym, val]) => ({
          symbol: sym,
          price: val.toLocaleString(),
          rawPrice: val,
          change: 0
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
              } else if (m.category === "CRYPTO" && (!m.basePrice || m.basePrice === 0)) {
                 // If basePrice is 0, use the real Binance price
                 if (liveMap[m.sym]) finalPrice = liveMap[m.sym];
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
                      price: finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                      change: 0
                    });
                 }
              }
           });
        }
      }

      // 3. Fetch Private Institutional Assets
      const privateRes = await fetch("/api/admin/private").catch(() => null);
      if (privateRes && privateRes.ok) {
        const pData = await privateRes.json();
        if (pData.assets) {
          pData.assets.forEach((pa: any) => {
            // Add automatic institutional volatility (random walk)
            const vol = pa.volatility || 2.0;
            const seed = Date.now() / 10000;
            const drift = Math.sin(seed * 0.5) * 0.0002;
            const noise = (Math.random() - 0.5) * (vol * 0.0005);
            const livePrice = pa.price * (1 + drift + noise);

            liveMap[pa.sym] = livePrice;
            rawArr.push({
              symbol: pa.sym,
              rawPrice: livePrice,
              price: livePrice.toLocaleString(undefined, { 
                minimumFractionDigits: livePrice < 1 ? 4 : 2,
                maximumFractionDigits: livePrice < 1 ? 6 : 2
              }),
              change: pa.change + (drift * 100)
            });
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
