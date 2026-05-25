import { NextResponse } from "next/server";
import { getUser, saveUser, untrackActiveOptionsUser, addGlobalOptionsHistory, getCustomMarkets, getPrivateAssets, logUserAction } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, tradeId, currentPrice: clientPrice } = await req.json();

    const user = await getUser(email);
    if (!user || !user.options) return NextResponse.json({ error: "User or options not found" }, { status: 404 });

    const tradeIndex = user.options.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) return NextResponse.json({ error: "Trade not found" }, { status: 404 });

    const trade = user.options[tradeIndex];
    if (trade.status === "COMPLETED") return NextResponse.json({ success: true, user });

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
    } catch(e) {
      console.error("Price verification error", e);
    }

    let isWin = false;
    if (trade.adminResult) {
      isWin = trade.adminResult === "WIN";
    } else {
      if (trade.direction === "UP") {
        isWin = securePrice > trade.strikePrice;
      } else {
        isWin = securePrice < trade.strikePrice;
      }
    }

    if (isWin) {
      user.balance += trade.payout;
    }

    user.options[tradeIndex] = { ...trade, status: "COMPLETED" };

    await saveUser(user);
    await untrackActiveOptionsUser(email);
    await addGlobalOptionsHistory(user.options[tradeIndex], email);
    await logUserAction(email, "TRADE_RESOLVED", `Resolved trade ${trade.asset} ${trade.direction}. Result: ${isWin ? "WIN" : "LOSS"}`);


    return NextResponse.json({ success: true, win: isWin, amount: isWin ? trade.payout : 0, balance: user.balance, options: user.options });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
