import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache this route's response

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

// Generate statically on module load so it is 100% stable
const STATIC_STOCKS = REAL_SYMBOLS.map((sym, i) => {
  // Deterministic stable prices
  const basePrice = +( (sym.charCodeAt(0) * 3.5 + sym.charCodeAt(sym.length - 1) * 2.1 + (i * 7.7)) % 900 + 15 ).toFixed(2);
  const vol = (sym.charCodeAt(0) * 100000 + i * 50000) % 5000000 + 1000000;
  const cap = (sym.charCodeAt(0) * 500 + i * 150) % 20000 + 5000;
  const volatility = +( (((sym.charCodeAt(0) + i) % 10) / 10) * 2 + 1.0 ).toFixed(2);
  
  return {
    sym,
    name: sym + " Corp",
    sector: "Market", 
    basePrice, // Changed to basePrice so the frontend treats it deterministically
    change: 0,
    changePct: 0,
    vol,
    cap,
    volatility,
    direction: "flat" as const
  };
});

export async function GET() {
  return NextResponse.json({ success: true, data: STATIC_STOCKS });
}
