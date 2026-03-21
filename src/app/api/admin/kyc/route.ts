import { NextResponse } from "next/server";
import { getUser, saveUser, getPendingKYCs, untrackPendingKYC } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const kycParams = await getPendingKYCs();
    return NextResponse.json({ pendingKyc: kycParams });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json();
    const user = await getUser(email);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (action === "approve") {
      user.kycStatus = "VERIFIED";
    } else {
      user.kycStatus = "UNVERIFIED";
    }

    // Delete the massive base64 strings to save KV space after validation
    if (user.kycDocuments) {
       user.kycDocuments = undefined;
    }

    await saveUser(user);
    await untrackPendingKYC(email);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
