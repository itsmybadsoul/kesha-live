"use client";

import { useEffect, useState } from "react";

export interface PriceData {
  symbol: string;
  price: string;
  rawPrice: number;
}

const SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", 
  "ADAUSDT", "DOGEUSDT", "DOTUSDT", "MATICUSDT", "TRXUSDT",
  "LTCUSDT", "LINKUSDT", "AVAXUSDT", "TONUSDT", "SHIBUSDT"
];

export function useCryptoPrices() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/price");
      const allPrices = await response.json();
      
      const filtered = allPrices.filter((p: any) => SYMBOLS.includes(p.symbol))
        .map((p: any) => ({
          symbol: p.symbol.replace("USDT", ""),
          price: parseFloat(p.price).toLocaleString(undefined, { 
            minimumFractionDigits: p.price < 1 ? 4 : 2,
            maximumFractionDigits: p.price < 1 ? 6 : 2
          }),
          rawPrice: parseFloat(p.price)
        }));
      
      setPrices(filtered);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  return { prices, loading };
}
