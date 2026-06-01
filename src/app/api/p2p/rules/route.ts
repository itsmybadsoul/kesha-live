import { NextRequest, NextResponse } from "next/server";
import { getKV, putKV } from "@/lib/db";

const DEFAULT_RULES = `1. Escrow Lock Policy: All trade digital assets (USDT) are securely held in the platform's escrow locked wallet until the payment is confirmed.
2. Direct Payments Only: You must send payments using details matching the counterpart's registered payment methods. Third-party bank transfers are strictly forbidden.
3. Actual Balance Check: Sellers must verify that funds are fully reflected in their bank account/wallet before releasing assets. Do not trust screenshots or sms alerts alone.
4. Active Support: If any dispute arises during negotiation, you can submit a support ticket via the portal to hold the trade.`;

export async function GET() {
  try {
    const rules = await getKV("p2p_rules_disclaimer");
    return NextResponse.json({ rules: rules || DEFAULT_RULES });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { rules } = await req.json();
    if (rules === undefined) {
      return NextResponse.json({ error: "Rules text is required" }, { status: 400 });
    }
    await putKV("p2p_rules_disclaimer", rules);
    return NextResponse.json({ success: true, rules });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
