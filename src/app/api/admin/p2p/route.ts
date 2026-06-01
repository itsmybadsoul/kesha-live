import { NextResponse } from "next/server";
import { getP2PRequests, saveP2PRequests } from "@/lib/db";

export async function GET() {
  const requests = await getP2PRequests();
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json(); // action = "approve"
    if (!id || !action) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const requests = await getP2PRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    if (action === "approve") {
      requests[index].status = "APPROVED";
    }

    await saveP2PRequests(requests);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, sellerName, usdPrice, banks, trustRate, amount } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const requests = await getP2PRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    requests[index] = { 
      ...requests[index], 
      sellerName, 
      usdPrice, 
      banks, 
      trustRate, 
      amount: amount !== undefined ? Number(amount) : requests[index].amount,
      banksConfirmed: true 
    };

    await saveP2PRequests(requests);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
