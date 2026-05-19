import { NextResponse } from "next/server";
import { getUser, saveUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, tradeId } = await req.json();

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

    // Refund the user's balance
    user.balance += trade.amount;
    
    // Remove the trade
    user.options.splice(tradeIndex, 1);

    await saveUser(user);

    return NextResponse.json({ success: true, newBalance: user.balance });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
