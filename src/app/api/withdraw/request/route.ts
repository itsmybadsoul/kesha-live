import { NextResponse } from "next/server";
import { getUser, saveUser, trackPendingWithdrawal, logUserAction } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, amount, method, details } = await req.json();

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (withdrawAmount > user.balance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    user.pendingWithdrawal = {
      amount: withdrawAmount,
      method,
      details,
      timestamp: Date.now()
    };

    await saveUser(user);
    await trackPendingWithdrawal(email);
    await logUserAction(email, "WITHDRAW_REQUEST", `Requested withdrawal of $${amount} via ${method}`);

    return NextResponse.json({ success: true, pendingWithdrawal: user.pendingWithdrawal });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
