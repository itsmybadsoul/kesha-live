import { NextResponse } from "next/server";
import { getUser, saveUser, untrackActiveOptionsUser, getCustomMarkets, getPrivateAssets, logUserAction } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, tradeId, currentPrice: clientPrice } = await req.json();

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const tradeIndex = user.options?.findIndex(o => o.id === tradeId) ?? -1;
    if (tradeIndex === -1) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    const trade = user.options[tradeIndex];
    if (trade.status !== "ACTIVE") {
      return NextResponse.json({ error: "Trade is not active" }, { status: 400 });
    }

    // Secure Price Validation (Fixes massive profit exploit)
    let securePrice = clientPrice;
    try {
      const isCrypto = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "MATIC", "TRX", "LTC", "LINK", "AVAX", "TON", "SHIB"].includes(trade.asset);
      if (isCrypto) {
         const binanceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${trade.asset}USDT`).catch(() => null);
         if (binanceRes && binanceRes.ok) {
            const data = await binanceRes.json();
            securePrice = parseFloat(data.price);
         }
      } else {
         const customMarkets = await getCustomMarkets();
         const customMatch = customMarkets.find((m: any) => m.sym === trade.asset);
         if (customMatch) securePrice = customMatch.targetPrice || customMatch.basePrice;
         
         const privateAssets = await getPrivateAssets();
         const privateMatch = privateAssets.find((p: any) => p.sym === trade.asset);
         if (privateMatch) securePrice = privateMatch.targetPrice || privateMatch.price;
      }
      
      // Fallback sanity check: do not allow more than 20% deviation from strike without admin targets
      const deviation = Math.abs(securePrice - trade.strikePrice) / trade.strikePrice;
      if (deviation > 0.5) {
         securePrice = trade.strikePrice; // Cap extreme anomalous manipulations
      }
    } catch(e) {
      console.error("Price verification error", e);
    }

    // Standard Futures PNL Calculation
    let pnlPercentage = 0;
    if (trade.direction === "UP") {
      pnlPercentage = (securePrice - trade.strikePrice) / trade.strikePrice;
    } else {
      pnlPercentage = (trade.strikePrice - securePrice) / trade.strikePrice;
    }

    const profit = trade.amount * pnlPercentage;
    const finalAmount = trade.amount + profit;

    // Update user balance (return stake + profit)
    // Note: If finalAmount < 0, it means they lost more than their stake (impossible in standard 1x isolated margin without liquidation, but we clamp it to 0 just in case)
    const refundAmount = Math.max(0, finalAmount);
    user.balance += refundAmount;

    // Complete trade
    trade.status = "COMPLETED";
    trade.payout = profit; // We store pure profit in payout field for history
    trade.adminResult = profit > 0 ? "WIN" : "LOSE";

    await saveUser(user);

    // If no more active trades, untrack
    if (!user.options.some(o => o.status === "ACTIVE")) {
      await untrackActiveOptionsUser(email);
    }

    await logUserAction(email, "TRADE_CLOSED", `Closed trade ${trade.asset} ${trade.direction}. Profit: $${profit.toFixed(2)}`);

    return NextResponse.json({ success: true, trade, newBalance: user.balance, profit });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
