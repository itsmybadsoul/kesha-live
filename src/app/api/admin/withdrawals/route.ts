import { NextResponse } from "next/server";
import { getPendingWithdrawals } from "@/lib/db";



export async function GET(req: Request) {
  try {
    const env = (req as any).context?.env || process.env;
    const withdrawals = await getPendingWithdrawals(env);
    return NextResponse.json({ success: true, withdrawals });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
