import { NextResponse } from "next/server";
import { getUser, saveUser, trackPendingDeposit } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, amount, txid } = await req.json();

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.pendingDeposit = {
      amount: parseFloat(amount),
      txid,
      timestamp: Date.now()
    };

    await saveUser(user);
    await trackPendingDeposit(email);

    return NextResponse.json({ success: true, pendingDeposit: user.pendingDeposit });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
