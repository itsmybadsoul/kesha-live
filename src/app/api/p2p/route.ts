import { NextResponse } from "next/server";
import { getP2PRequests, saveP2PRequests, P2PRequest } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const requests = await getP2PRequests();
  const userRequests = requests.filter(r => r.email === email);
  return NextResponse.json({ requests: userRequests });
}

export async function POST(req: Request) {
  try {
    const { email, type, amount } = await req.json();
    if (!email || !type || !amount) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const requests = await getP2PRequests();
    
    const newRequest: P2PRequest = {
      id: `p2p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      type,
      amount: Number(amount),
      status: "PENDING",
      createdAt: Date.now()
    };
    
    requests.push(newRequest);
    await saveP2PRequests(requests);

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
