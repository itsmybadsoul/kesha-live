import { NextResponse } from "next/server";
import { saveUser, getUser, trackUserRegistration } from "@/lib/db";



export async function POST(req: Request) {
  try {
    // In OpenNext/Cloudflare, bindings can be found in req.context.env or process.env
    const env = (req as any).context?.env || process.env;
    const { firstName, lastName, email, password } = await req.json();
    
    // Check if user exists
    const existing = await getUser(email, env);
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const newUser = {
      firstName,
      lastName,
      email,
      password, // In a real app, hash this!
      balance: 0, // NEW: Initial balance 0
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      quests: [],
      trades: [],
      pendingDeposit: null,
      holdings: {},
      options: []
    };

    await saveUser(newUser, env);
    await trackUserRegistration(email, env);

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
