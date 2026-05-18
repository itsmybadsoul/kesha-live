import { NextResponse } from "next/server";
import { getKV, putKV } from "@/lib/db";

// GET: return the custom greeting message
export async function GET() {
  const greeting = await getKV("abufares_greeting");
  const defaultGreeting = "مرحباً! أنا أبو فارس. يسعدني مساعدتك في صفقتك. يرجى إرسال تفاصيل الدفع والسكرين شوت لإتمام العملية.";
  return NextResponse.json({ greeting: greeting || defaultGreeting });
}

// POST: update the custom greeting message
export async function POST(req: Request) {
  try {
    const { greeting } = await req.json();
    if (!greeting) return NextResponse.json({ error: "Missing greeting" }, { status: 400 });
    await putKV("abufares_greeting", greeting);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
