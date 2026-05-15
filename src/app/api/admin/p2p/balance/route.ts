import { NextResponse } from "next/server";
import { getP2PRequests, saveP2PRequests, getUser, saveUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, amount } = await req.json();
    if (!id || amount === undefined) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const requests = await getP2PRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const reqData = requests[index];
    const user = await getUser(reqData.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update user balance
    user.balance += Number(amount);
    
    // Add notification
    const notifications = user.notifications || [];
    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: "P2P Transaction Completed",
      body: `Your P2P request has been completed. $${Number(amount).toLocaleString()} USD has been credited to your account.`,
      type: "deposit",
      read: false,
      timestamp: Date.now()
    });
    user.notifications = notifications;

    await saveUser(user);

    // Update P2P request status to COMPLETED
    requests[index].status = "COMPLETED";
    await saveP2PRequests(requests);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
