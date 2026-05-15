import { NextResponse } from "next/server";
import { getP2PRequests, saveP2PRequests, deleteP2PChat } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing request id" }, { status: 400 });

    let requests = await getP2PRequests();
    requests = requests.filter(r => r.id !== id);
    
    await saveP2PRequests(requests);
    await deleteP2PChat(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
