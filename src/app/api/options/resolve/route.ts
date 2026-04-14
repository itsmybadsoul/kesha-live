import { NextResponse } from "next/server";
import { getUser, saveUser, untrackActiveOptionsUser, addGlobalOptionsHistory } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, tradeId, currentPrice } = await req.json();

    const user = await getUser(email);
    if (!user || !user.options) return NextResponse.json({ error: "User or options not found" }, { status: 404 });

    const tradeIndex = user.options.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) return NextResponse.json({ error: "Trade not found" }, { status: 404 });

    const trade = user.options[tradeIndex];
    if (trade.status === "COMPLETED") return NextResponse.json({ success: true, user });

    let isWin = false;
    if (trade.adminResult) {
      isWin = trade.adminResult === "WIN";
    } else {
      if (trade.direction === "UP") {
        isWin = currentPrice > trade.strikePrice;
      } else {
        isWin = currentPrice < trade.strikePrice;
      }
    }

    if (isWin) {
      user.balance += trade.payout;
    }

    user.options[tradeIndex] = { ...trade, status: "COMPLETED" };

    await saveUser(user);
    await untrackActiveOptionsUser(email);
    await addGlobalOptionsHistory(user.options[tradeIndex], email);

    return NextResponse.json({ success: true, win: isWin, amount: isWin ? trade.payout : 0, balance: user.balance, options: user.options });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
