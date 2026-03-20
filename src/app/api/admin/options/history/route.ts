import { NextResponse } from "next/server";
import { getGlobalOptionsHistory } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const history = await getGlobalOptionsHistory();
    
    // Retroactive Data Mining Hook (If history is empty because of the new Phase 18 release)
    if (history.length === 0) {
      const db = (globalThis as any).DATABASE || (process.env as any).DATABASE;
      if (db && typeof db.list === 'function') {
        try {
          const list = await db.list({ prefix: "user:" });
          for (const key of list.keys) {
             const userDataStr = await db.get(key.name);
             if (userDataStr) {
                const user = JSON.parse(userDataStr);
                if (user.options) {
                  const completed = user.options.filter((o: any) => o.status === "COMPLETED");
                  completed.forEach((c: any) => {
                    history.push({ ...c, email: user.email, resolvedAt: c.startTime + c.durationMinutes * 60000 });
                  });
                }
             }
          }
          // Sort extracted history
          history.sort((a: any, b: any) => b.resolvedAt - a.resolvedAt);
        } catch(e) {}
      }
    }

    return NextResponse.json({ success: true, history });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

