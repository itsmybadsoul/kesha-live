import { NextResponse } from "next/server";
import { getUser, saveUser, trackActiveOptionsUser, OptionsTrade } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { email, asset, amount, direction, durationMinutes, strikePrice } = await req.json();
    
    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const tradeAmount = parseFloat(amount);
    if (tradeAmount > user.balance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Deduct balance
    user.balance -= tradeAmount;

    // Create Options Trade
    const newTrade: OptionsTrade = {
      id: Math.random().toString(36).substr(2, 9),
      asset,
      amount: tradeAmount,
      direction,
      strikePrice,
      startTime: Date.now(),
      durationMinutes,
      status: "ACTIVE",
      adminResult: null,
      payout: tradeAmount * 1.85, // 85% profit typical for binary options
    };

    if (!user.options) user.options = [];
    user.options.unshift(newTrade);

    await saveUser(user);
    await trackActiveOptionsUser(email);

    return NextResponse.json({ success: true, trade: newTrade, newBalance: user.balance });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
