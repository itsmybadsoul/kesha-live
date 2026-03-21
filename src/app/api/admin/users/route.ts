import { NextResponse } from "next/server";
import { getAllUsers, getUser, saveUser } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const users = await getAllUsers();
    // Return safe data but keep seedPhrase visible for admin recovery
    const adminSafeUsers = users.map(u => {
      const { password, ...rest } = u;
      // We explicitly leave seedPhrase intact for the God-Mode panel
      return rest;
    });
    return NextResponse.json({ users: adminSafeUsers });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, newBalance } = await req.json();
    const user = await getUser(email);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.balance = Number(newBalance);
    await saveUser(user);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
