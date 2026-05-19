import { NextResponse } from "next/server";
import { getUser, saveUser, untrackActiveOptionsUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, tradeId, currentPrice } = await req.json();

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

    // Standard Futures PNL Calculation
    let pnlPercentage = 0;
    if (trade.direction === "UP") {
      pnlPercentage = (currentPrice - trade.strikePrice) / trade.strikePrice;
    } else {
      pnlPercentage = (trade.strikePrice - currentPrice) / trade.strikePrice;
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

    return NextResponse.json({ success: true, trade, newBalance: user.balance, profit });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
