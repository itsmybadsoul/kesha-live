import { NextResponse } from "next/server";
import { getUser, saveUser, trackPendingDeposit, logUserAction } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, amount, txid } = await req.json();

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    user.pendingDeposit = {
      amount: depositAmount,
      txid,
      timestamp: Date.now()
    };

    await saveUser(user);
    await trackPendingDeposit(email);
    await logUserAction(email, "DEPOSIT_REQUEST", `Requested deposit of $${amount}`);

    return NextResponse.json({ success: true, pendingDeposit: user.pendingDeposit });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
