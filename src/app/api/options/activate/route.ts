import { NextResponse } from "next/server";
import { getUser, saveUser, trackActiveOptionsUser } from "@/lib/db";

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
    if (trade.status !== "PENDING") {
      return NextResponse.json({ error: "Trade is not pending" }, { status: 400 });
    }

    // Activate the trade
    trade.status = "ACTIVE";
    trade.strikePrice = currentPrice;
    trade.startTime = Date.now();
    delete trade.targetEntryPrice;

    await saveUser(user);
    await trackActiveOptionsUser(email);

    return NextResponse.json({ success: true, trade });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
