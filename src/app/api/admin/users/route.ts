import { NextResponse } from "next/server";
import { getAllUsers, getUser, saveUser } from "@/lib/db";

export async function GET() {
  try {
    const users = await getAllUsers();
    const adminSafeUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    return NextResponse.json({ success: true, users: adminSafeUsers });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, newBalance, notification } = await req.json();
    const user = await getUser(email);

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

    await saveUser(user);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
