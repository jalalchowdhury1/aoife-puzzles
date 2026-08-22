import { NextResponse } from "next/server";
import { kvReady, kvGet, kvLrange } from "@/lib/engine/kv";
import { isParent } from "@/lib/engine/gate";
import { computeProfile } from "@/lib/engine/profile";
import type { SessionRecord } from "@/lib/engine/types";

export async function GET(req: Request) {
  if (!isParent(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!kvReady()) return NextResponse.json({ error: "no-kv" }, { status: 200 });
  const ids = (await kvLrange("index")).filter((id): id is string => !!id);
  const sessions = (await Promise.all(ids.map((id) => kvGet<SessionRecord>(`session:${id}`)))).filter(
    (s): s is SessionRecord => !!s
  );
  return NextResponse.json(computeProfile(sessions));
}
