import { NextResponse } from "next/server";
import { getUser, saveUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, amount, adminConfirmed } = await req.json();
    if (!email || amount === undefined) {
      return NextResponse.json({ error: "Missing email or amount" }, { status: 400 });
    }

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Initialize or update frozen balance
    user.frozenBalance = {
      amount: Number(amount),
      adminConfirmed: !!adminConfirmed,
      userConfirmed: false,
    };

    await saveUser(user);
    
    return NextResponse.json({ success: true, frozenBalance: user.frozenBalance });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
