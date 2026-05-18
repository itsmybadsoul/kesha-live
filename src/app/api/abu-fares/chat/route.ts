import { NextResponse } from "next/server";
import { getP2PChat, saveP2PChat, ChatMessage } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  // Use a special prefix to store Abu_Fares chats separately from standard P2P chats
  const chatId = `abufares_${email}`;
  const messages = await getP2PChat(chatId);
  
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  try {
    const { email, sender, text, image, p2pAction, p2pAmount } = await req.json();
    if (!email || !sender) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const chatId = `abufares_${email}`;
    const messages = await getP2PChat(chatId);
    
    // Add an initial system message if it's a new P2P chat and it's the first message
    if (messages.length === 0 && p2pAction && p2pAmount) {
       messages.push({
         id: `msg_sys_${Date.now()}`,
         sender: "ADMIN",
         text: `Hello, I'm Abu_Fares. I see you want to ${p2pAction} $${p2pAmount} via P2P. Please send your payment details and screenshot.`,
         timestamp: Date.now() - 1000
       });
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender,
      text: text || "",
      image: image || "",
      timestamp: Date.now()
    };
    
    messages.push(newMessage);
    await saveP2PChat(chatId, messages);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
