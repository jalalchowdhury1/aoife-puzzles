import { NextResponse } from "next/server";
import { kvReady } from "@/lib/engine/kv";
import { loadAllSessions } from "@/lib/engine/sessionsStore";
import { isParent } from "@/lib/engine/gate";
import { computeProfile } from "@/lib/engine/profile";

export async function GET(req: Request) {
  if (!isParent(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!kvReady()) return NextResponse.json({ error: "no-kv" }, { status: 200 });
  const sessions = await loadAllSessions();
  return NextResponse.json(computeProfile(sessions));
}
