import { NextResponse } from "next/server";
import { getUser, saveUser, untrackActiveOptionsUser } from "@/lib/db";



export async function POST(req: Request) {
  try {
    const { email, tradeId, currentPrice } = await req.json();
    
    const user = await getUser(email);
    if (!user || !user.options) return NextResponse.json({ error: "User or options not found" }, { status: 404 });

    const tradeIndex = user.options.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) return NextResponse.json({ error: "Trade not found" }, { status: 404 });

    const trade = user.options[tradeIndex];
    if (trade.status === "COMPLETED") return NextResponse.json({ success: true, user });

    // Determine Result
    let isWin = false;
    
    // If admin intercepted, honor the admin result completely
    if (trade.adminResult) {
      isWin = trade.adminResult === "WIN";
    } else {
      // Natural resolution if no admin intervention
      if (trade.direction === "UP") {
        isWin = currentPrice > trade.strikePrice;
      } else {
        isWin = currentPrice < trade.strikePrice;
      }
    }

    // Apply PnL
    if (isWin) {
      user.balance += trade.payout;
    }

    // Mark as completed
    user.options[tradeIndex] = { ...trade, status: "COMPLETED" };

    await saveUser(user);
    await untrackActiveOptionsUser(email); // Removes from active tracking if no active left
    
    // Stamp to global history ledger
    import("@/lib/db").then((db) => {
       db.addGlobalOptionsHistory(user.options[tradeIndex], email);
    });

    return NextResponse.json({ success: true, win: isWin, amount: isWin ? trade.payout : 0, balance: user.balance, options: user.options });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
