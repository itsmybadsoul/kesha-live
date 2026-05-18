import { NextResponse } from "next/server";
import { getUser, saveUser, getP2PChat, saveP2PChat, ChatMessage } from "@/lib/db";

// Helper: post a system message into the user's Abu_Fares chat
async function postSystemMessage(email: string, text: string) {
  const chatId = `abufares_${email}`;
  const messages = await getP2PChat(chatId);
  const msg: ChatMessage = {
    id: `msg_sys_${Date.now()}`,
    sender: "ADMIN",
    text,
    timestamp: Date.now()
  };
  messages.push(msg);
  await saveP2PChat(chatId, messages);
}

// POST: Admin initiates OR confirms frozen balance
// Body: { email, amount?, adminConfirmed?, userConfirm? }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, amount, adminConfirmed, userConfirm } = body;

    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // --- Case 1: Admin initiates a new frozen balance ---
    if (amount !== undefined && !userConfirm) {
      user.frozenBalance = {
        amount: Number(amount),
        adminConfirmed: !!adminConfirmed,
        userConfirmed: false,
      };
      await saveUser(user);

      await postSystemMessage(email, `[SYSTEM] ❄️ Admin has initiated a frozen transfer of $${amount}. Please send your payment screenshot and click Confirm to release the funds.`);

      return NextResponse.json({ success: true, frozenBalance: user.frozenBalance });
    }

    // --- Case 2: Admin confirms their side ---
    if (adminConfirmed && !userConfirm) {
      if (!user.frozenBalance) return NextResponse.json({ error: "No frozen balance" }, { status: 400 });
      user.frozenBalance = { ...user.frozenBalance, adminConfirmed: true };

      await postSystemMessage(email, `[SYSTEM] ✅ Admin has confirmed the transfer. Waiting for your confirmation.`);

      // If user already confirmed, resolve now
      if (user.frozenBalance.userConfirmed) {
        await resolveBalance(user, email);
        return NextResponse.json({ success: true, resolved: true });
      }

      await saveUser(user);
      return NextResponse.json({ success: true, frozenBalance: user.frozenBalance });
    }

    // --- Case 3: User confirms their side (called from user context) ---
    if (userConfirm) {
      if (!user.frozenBalance) return NextResponse.json({ error: "No frozen balance" }, { status: 400 });
      user.frozenBalance = { ...user.frozenBalance, userConfirmed: true };

      await postSystemMessage(email, `[SYSTEM] ✅ User has confirmed. ${user.frozenBalance.adminConfirmed ? "Both parties confirmed — funds are being released." : "Waiting for admin confirmation."}`);

      if (user.frozenBalance.adminConfirmed) {
        await resolveBalance(user, email);
        return NextResponse.json({ success: true, resolved: true });
      }

      await saveUser(user);
      return NextResponse.json({ success: true, frozenBalance: user.frozenBalance });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function resolveBalance(user: any, email: string) {
  const frozenAmt = user.frozenBalance.amount;
  user.balance = (user.balance || 0) + frozenAmt;
  user.frozenBalance = null;

  // Add transaction record
  const tx = {
    id: Math.random().toString(36).substr(2, 9),
    type: "DEPOSIT",
    amount: frozenAmt,
    status: "COMPLETED",
    description: "P2P Transfer — Abu_Fares",
    timestamp: Date.now()
  };
  user.transactions = [tx, ...(user.transactions || [])];

  // Send notification to user
  const notif = {
    id: Math.random().toString(36).substr(2, 9),
    title: "Balance Released ✅",
    body: `Your frozen balance of $${frozenAmt.toLocaleString()} has been confirmed by both parties and credited to your account.`,
    type: "deposit",
    read: false,
    timestamp: Date.now()
  };
  user.notifications = [notif, ...(user.notifications || [])];

  await saveUser(user);
  await postSystemMessage(email, `[SYSTEM] 🎉 Both parties confirmed! $${frozenAmt.toLocaleString()} has been added to your balance.`);
}

// GET: return current frozen balance state
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  const user = await getUser(email);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ frozenBalance: user.frozenBalance || null });
}
