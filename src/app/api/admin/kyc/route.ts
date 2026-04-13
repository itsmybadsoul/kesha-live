import { NextResponse } from "next/server";
import { getUser, saveUser, getPendingKYCs, untrackPendingKYC } from "@/lib/db";



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

    const addNotif = (title: string, body: string, type: "kyc" | "system") => {
      const newNotif = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        body,
        type,
        read: false,
        timestamp: Date.now(),
      };
      user.notifications = [newNotif, ...(user.notifications || [])].slice(0, 50);
    };

    if (action === "approve") {
      user.kycStatus = "VERIFIED";
      addNotif("KYC Verified", "Your identity documents have been verified. You now have full access to withdrawals.", "kyc");
    } else {
      user.kycStatus = "UNVERIFIED";
      addNotif("KYC Rejected", "Your identity verification was rejected. Please resubmit valid documentation in the portal.", "system");
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
