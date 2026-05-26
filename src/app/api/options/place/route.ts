import { NextResponse } from "next/server";
import { getUser, saveUser, trackActiveOptionsUser, OptionsTrade, logUserAction } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, asset, amount, direction, durationMinutes, strikePrice, status, targetEntryPrice } = await req.json();

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (tradeAmount > user.balance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    user.balance -= tradeAmount;

    const newTrade: OptionsTrade = {
      id: Math.random().toString(36).substr(2, 9),
      asset,
      amount: tradeAmount,
      direction,
      strikePrice,
      startTime: Date.now(),
      durationMinutes,
      status: status || "ACTIVE",
      adminResult: null,
      payout: tradeAmount * 1.85,
      targetEntryPrice: targetEntryPrice || undefined,
    };

    if (!user.options) user.options = [];
    user.options.unshift(newTrade);

    await saveUser(user);
    await trackActiveOptionsUser(email);
    await logUserAction(email, "TRADE_OPENED", `Opened ${direction} contract on ${asset} for $${tradeAmount} @ ${strikePrice}`);

    return NextResponse.json({ success: true, trade: newTrade, newBalance: user.balance });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
