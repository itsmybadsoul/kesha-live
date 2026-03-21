export const runtime = "edge";
import { NextResponse } from "next/server";
import { addSupportTicket, getSupportTickets, clearSupportTicket } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const tickets = await getSupportTickets();
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await clearSupportTicket(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, subject, message } = await req.json();
    
    if (!email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ticket = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      subject,
      message,
      timestamp: Date.now()
    };

    await addSupportTicket(ticket);

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
