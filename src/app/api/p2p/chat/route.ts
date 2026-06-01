import { NextResponse } from "next/server";
import { getP2PChat, saveP2PChat, ChatMessage } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing request id" }, { status: 400 });

  const messages = await getP2PChat(id);
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  try {
    const { id, sender, text, image, isPaymentRequest, paymentRequestAmount, paymentRequestCurrency, paymentRequestStatus, senderName } = await req.json();
    if (!id || !sender) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const messages = await getP2PChat(id);
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender,
      text: text || "",
      image: image || "",
      timestamp: Date.now(),
      isPaymentRequest: !!isPaymentRequest,
      paymentRequestAmount: paymentRequestAmount ? Number(paymentRequestAmount) : undefined,
      paymentRequestCurrency: paymentRequestCurrency || undefined,
      paymentRequestStatus: paymentRequestStatus || undefined,
      senderName: senderName || undefined
    };
    
    messages.push(newMessage);
    await saveP2PChat(id, messages);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
