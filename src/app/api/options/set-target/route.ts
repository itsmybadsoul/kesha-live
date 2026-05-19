import { NextResponse } from "next/server";
import { getUser, saveUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, tradeId, targetExitPrice } = await req.json();

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

    trade.targetExitPrice = targetExitPrice;

    await saveUser(user);

    return NextResponse.json({ success: true, trade });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
