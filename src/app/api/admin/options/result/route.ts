import { NextResponse } from "next/server";
import { getUser, saveUser } from "@/lib/db";



export async function POST(req: Request) {
  try {
    const env = (req as any).context?.env || process.env;
    const { userEmail, tradeId, adminResult } = await req.json(); // adminResult: "WIN" | "LOSE"
    
    const user = await getUser(userEmail, env);
    if (!user || !user.options) return NextResponse.json({ error: "User or options not found" }, { status: 404 });

    const tradeIndex = user.options.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) return NextResponse.json({ error: "Trade not found" }, { status: 404 });

    // Inject intercept
    user.options[tradeIndex].adminResult = adminResult;

    await saveUser(user, env);

    return NextResponse.json({ success: true, message: `Trade forced to ${adminResult}` });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
