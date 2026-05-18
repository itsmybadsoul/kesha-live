import { NextResponse } from "next/server";
import { getUser, saveUser, getP2PChat, saveP2PChat, ChatMessage } from "@/lib/db";

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

/**
 * 3-step flow:
 * 1. Admin initiates: { email, amount } → adminConfirmed=false, userConfirmed=false, status="INITIATED"
 * 2. User confirms:   { email, userConfirm: true } → userConfirmed=true, status="USER_CONFIRMED"
 * 3. Admin releases:  { email, adminRelease: true } → adminConfirmed=true → balance added
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, amount, userConfirm, adminRelease } = body;

    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // ── STEP 1: Admin initiates a frozen balance ─────────────────────────────
    if (amount !== undefined && !userConfirm && !adminRelease) {
      user.frozenBalance = {
        amount: Number(amount),
        adminConfirmed: false,  // admin's final release not yet given
        userConfirmed: false,
      };
      await saveUser(user);
      await postSystemMessage(email,
        `[SYSTEM] ❄️ تم تجميد مبلغ $${Number(amount).toLocaleString()} من قِبَل الطرف الثاني. يرجى إرسال سكرين شوت التحويل ثم الضغط على "تأكيد".`
      );
      return NextResponse.json({ success: true, frozenBalance: user.frozenBalance });
    }

    // ── STEP 2: User confirms ─────────────────────────────────────────────────
    if (userConfirm) {
      if (!user.frozenBalance) return NextResponse.json({ error: "No frozen balance" }, { status: 400 });
      user.frozenBalance = { ...user.frozenBalance, userConfirmed: true };
      await saveUser(user);
      await postSystemMessage(email,
        `[SYSTEM] ✅ تم تأكيد العملية من طرفك. بانتظار الموافقة النهائية من الطرف الثاني لإتمام الإيداع.`
      );
      return NextResponse.json({ success: true, frozenBalance: user.frozenBalance });
    }

    // ── STEP 3: Admin final release (after user confirmed) ───────────────────
    if (adminRelease) {
      if (!user.frozenBalance) return NextResponse.json({ error: "No frozen balance" }, { status: 400 });
      if (!user.frozenBalance.userConfirmed) {
        return NextResponse.json({ error: "User has not confirmed yet" }, { status: 400 });
      }
      await resolveBalance(user, email);
      return NextResponse.json({ success: true, resolved: true });
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

  const tx = {
    id: Math.random().toString(36).substr(2, 9),
    type: "DEPOSIT",
    amount: frozenAmt,
    status: "COMPLETED",
    description: "P2P Transfer — Abu_Fares",
    timestamp: Date.now()
  };
  user.transactions = [tx, ...(user.transactions || [])];

  const notif = {
    id: Math.random().toString(36).substr(2, 9),
    title: "تم إيداع الرصيد ✅",
    body: `تم تأكيد العملية من كلا الطرفين. تم إضافة $${frozenAmt.toLocaleString()} إلى رصيدك بنجاح.`,
    type: "deposit",
    read: false,
    timestamp: Date.now()
  };
  user.notifications = [notif, ...(user.notifications || [])];

  await saveUser(user);
  await postSystemMessage(email,
    `[SYSTEM] 🎉 تمت الصفقة بنجاح! تم إضافة $${frozenAmt.toLocaleString()} إلى رصيدك.`
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  const user = await getUser(email);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ frozenBalance: user.frozenBalance || null });
}
