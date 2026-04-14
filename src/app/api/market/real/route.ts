import { NextResponse } from "next/server";

export const revalidate = 60; // Cache this route's response for 60 seconds

const REAL_SYMBOLS = [
  "AAPL","MSFT","NVDA","GOOGL","META","AMZN","TSLA","AMD","INTC","CRM",
  "ORCL","ADBE","CSCO","QCOM","NOW","SNOW","PLTR","UBER","SQ","SHOP",
  "JPM","BAC","GS","MS","WFC","V","MA","AXP","BLK","C",
  "XOM","CVX","COP","SLB","MPC","OXY","PSX","VLO",
  "JNJ","UNH","PFE","ABBV","MRK","BMY","AMGN","LLY","CVS","MDT",
  "WMT","HD","COST","TGT","LOW","MCD","SBUX","NKE",
  "T","VZ","TMUS","CMCSA",
  "DIS","NFLX","SPOT","WBD","PARA",
  "F","GM","TM","RIVN","LCID",
  "CAT","HON","GE","MMM","BA","LMT","RTX","DE","UPS","FDX",
  "COIN","MSTR","HOOD","PYPL","ABNB","LYFT","SNAP","PINS","RBLX","U",
  "DDOG","ZS","CRWD","PANW","MDB","NET","OKTA","GTLB","AI"
];

export async function GET() {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${REAL_SYMBOLS.join(",")}`;
    const res = await fetch(url, { 
      next: { revalidate: 30 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error("Failed to fetch Yahoo Finance Data");
    const data = await res.json();
    
    // Map Yahoo Finance data to our CustomStock-like interface for the frontend
    const stocks = data.quoteResponse.result.map((q: any) => ({
      sym: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      sector: "Real Market", // We can't perfectly map sectors without more data, but this is fine
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePct: q.regularMarketChangePercent,
      vol: q.regularMarketVolume || 0,
      cap: q.marketCap || 0,
      volatility: 1.0 + Math.random(), // slight jitter
      direction: q.regularMarketChange >= 0 ? "up" : "down"
    }));

    return NextResponse.json({ success: true, data: stocks });
  } catch (error) {
    console.error("Error fetching real market data:", error);
    return NextResponse.json({ success: false, error: "Failed to load market data" }, { status: 500 });
  }
}
