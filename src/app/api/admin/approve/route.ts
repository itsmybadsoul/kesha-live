import { NextResponse } from "next/server";
import { getUser, saveUser, untrackPendingDeposit } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json(); // action: "approve" or "reject"
    
    const user = await getUser(email);
    if (!user || !user.pendingDeposit) {
      return NextResponse.json({ error: "No pending deposit found" }, { status: 404 });
    }

    if (action === "approve") {
      user.balance += user.pendingDeposit.amount;
    }

    user.pendingDeposit = null;
    await saveUser(user);
    await untrackPendingDeposit(email);

    return NextResponse.json({ success: true, newBalance: user.balance });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
