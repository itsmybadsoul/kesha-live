import { NextResponse } from "next/server";
import { getUser, saveUser, untrackPendingDeposit, untrackPendingWithdrawal } from "@/lib/db";



export async function POST(req: Request) {
  try {
    const { email, action } = await req.json(); // action: "approve" or "reject"
    
    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const addNotif = (title: string, body: string, type: "deposit" | "withdraw" | "system") => {
      const newNotif = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        body,
        type,
        read: false,
        timestamp: Date.now(),
      };
      user.notifications = [newNotif, ...(user.notifications || [])].slice(0, 50);
    };

    if (action === "approve") {
      if (user.pendingDeposit) {
        let depositAmount = user.pendingDeposit.amount;
        let bonusBody = "";
        
        // First-Time Deposit Bonus (5% on $100+)
        if (depositAmount >= 100 && !user.hasDepositBonus) {
          depositAmount = depositAmount * 1.05;
          user.hasDepositBonus = true;
          bonusBody = " (Includes +5% First-Time Bonus!)";
        }

        user.balance += depositAmount;
        addNotif("Deposit Approved", `Your deposit of $${depositAmount.toFixed(2)} USDT has been credited to your balance${bonusBody}.`, "deposit");
        user.pendingDeposit = null;
        await untrackPendingDeposit(email);
      } else if (user.pendingWithdrawal) {
        user.balance -= user.pendingWithdrawal.amount;
        addNotif("Withdrawal Successful", `Your withdrawal of $${user.pendingWithdrawal.amount.toFixed(2)} USDT has been processed.`, "withdraw");
        user.pendingWithdrawal = null;
        await untrackPendingWithdrawal(email);
      }
    } else {
      // Reject
      if (user.pendingDeposit) addNotif("Deposit Rejected", "Your deposit request was rejected. Please contact support.", "system");
      if (user.pendingWithdrawal) addNotif("Withdrawal Rejected", "Your withdrawal request was rejected. Funds have been returned to your tradeable balance.", "system");
      
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
