import { NextResponse } from "next/server";
import { getUser, saveUser, trackPendingWithdrawal } from "@/lib/db";



export async function POST(req: Request) {
  try {
    const env = (req as any).context?.env || process.env;
    const { email, amount, method, details } = await req.json();
    
    const user = await getUser(email, env);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > user.balance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Set pending withdrawal
    user.pendingWithdrawal = {
      amount: withdrawAmount,
      method,
      details,
      timestamp: Date.now()
    };

    await saveUser(user, env);
    await trackPendingWithdrawal(email, env);

    return NextResponse.json({ success: true, pendingWithdrawal: user.pendingWithdrawal });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
