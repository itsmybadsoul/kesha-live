import { NextResponse } from "next/server";
import { getP2PRequests, saveP2PRequests, P2PRequest, getUser, saveUser } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const requests = await getP2PRequests();
  const userRequests = requests.filter(r => r.email === email);
  return NextResponse.json({ requests: userRequests });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, type, amount, advertiserName, price, paymentMethods, action, currency, minLimit, maxLimit } = body;
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Handle confirming block acknowledgement
    if (action === "confirm_block") {
      const updatedUser = { ...user, p2pBlockedConfirmed: true };
      await saveUser(updatedUser);
      return NextResponse.json({ success: true });
    }

    // Check if user is currently in a 12-hour block
    const blockedUntil = (user as any).p2pBlockedUntil || 0;
    if (blockedUntil > Date.now()) {
      return NextResponse.json({
        error: "BLOCKED",
        blockedUntil,
        confirmed: (user as any).p2pBlockedConfirmed || false
      }, { status: 403 });
    }

    // CHECK_BLOCK: verify incomplete trade count without creating a record
    if (action === "check_block") {
      const requests = await getP2PRequests();
      const userIncomplete = requests.filter((r: any) => r.email === email && r.status !== "COMPLETED");
      if (userIncomplete.length >= 3) {
        const blockTime = Date.now() + 12 * 60 * 60 * 1000;
        const updatedUser = { ...user, p2pBlockedUntil: blockTime, p2pBlockedConfirmed: false };
        await saveUser(updatedUser);
        return NextResponse.json({ error: "BLOCKED", blockedUntil: blockTime, confirmed: false }, { status: 403 });
      }
      return NextResponse.json({ ok: true });
    }

    if (!type || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check how many incomplete trades they started
    const requests = await getP2PRequests();
    const userIncomplete = requests.filter(r => r.email === email && r.status !== "COMPLETED");

    if (userIncomplete.length >= 3) {
      // Trigger the 12-hour block!
      const blockTime = Date.now() + 12 * 60 * 60 * 1000;
      const updatedUser = {
        ...user,
        p2pBlockedUntil: blockTime,
        p2pBlockedConfirmed: false
      };
      await saveUser(updatedUser);
      return NextResponse.json({
        error: "BLOCKED",
        blockedUntil: blockTime,
        confirmed: false
      }, { status: 403 });
    }

    // Create the trade request
    const newRequest: P2PRequest = {
      id: `p2p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      type,
      amount: Number(amount),
      status: "APPROVED", // Go directly to chat
      createdAt: Date.now(),
      sellerName: advertiserName || "UEA_EXCHANGE",
      usdPrice: price ? Number(price) : 1.00,
      banks: paymentMethods ? (Array.isArray(paymentMethods) ? paymentMethods.join(", ") : paymentMethods) : "Bank Transfer",
      trustRate: "99.3% completion",
      currency: currency || "USD",
      minLimit: minLimit ? Number(minLimit) : 0,
      maxLimit: maxLimit ? Number(maxLimit) : 0,
      banksConfirmed: false
    };
    
    requests.push(newRequest);
    await saveP2PRequests(requests);

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, action } = await req.json();
    if (!id || !action) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const requests = await getP2PRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const reqData = requests[index];

    if (action === "complete") {
      requests[index].status = "COMPLETED";
      
      const user = await getUser(reqData.email);
      if (user) {
        if (reqData.type === "BUY") {
          user.balance += reqData.amount;
          const notifications = user.notifications || [];
          notifications.unshift({
            id: `notif_${Date.now()}`,
            title: "P2P Transaction Completed",
            body: `Your P2P buy transaction has been completed. $${reqData.amount} USDT has been credited to your account.`,
            type: "deposit",
            read: false,
            timestamp: Date.now()
          });
          user.notifications = notifications;
        } else if (reqData.type === "SELL") {
          user.balance = Math.max(0, user.balance - reqData.amount);
          const notifications = user.notifications || [];
          notifications.unshift({
            id: `notif_${Date.now()}`,
            title: "P2P Transaction Completed",
            body: `Your P2P sell transaction has been completed. $${reqData.amount} USDT has been deducted from your account.`,
            type: "withdraw",
            read: false,
            timestamp: Date.now()
          });
          user.notifications = notifications;
        }
        await saveUser(user);
      }
    } else if (action === "cancel") {
      // Mark as completed to clear the queue
      requests[index].status = "COMPLETED";
    }

    await saveP2PRequests(requests);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
