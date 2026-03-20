import { NextResponse } from "next/server";
import { getUser, saveUser, untrackPendingDeposit, untrackPendingWithdrawal } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json(); // action: "approve" or "reject"
    
    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (action === "approve") {
      if (user.pendingDeposit) {
        let depositAmount = user.pendingDeposit.amount;
        
        // First-Time Deposit Bonus (5% on $100+)
        if (depositAmount >= 100 && !user.hasDepositBonus) {
          depositAmount = depositAmount * 1.05;
          user.hasDepositBonus = true;
        }

        user.balance += depositAmount;
        user.pendingDeposit = null;
        await untrackPendingDeposit(email);
      } else if (user.pendingWithdrawal) {
        // Balance already checked at request time
        user.balance -= user.pendingWithdrawal.amount;
        user.pendingWithdrawal = null;
        await untrackPendingWithdrawal(email);
      }
    } else {
      // Reject
      user.pendingDeposit = null;
      user.pendingWithdrawal = null;
      await untrackPendingDeposit(email);
      await untrackPendingWithdrawal(email);
    }

    await saveUser(user);
    return NextResponse.json({ success: true, newBalance: user.balance });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
