import { NextResponse } from "next/server";
import { isParent } from "@/lib/engine/gate";

// Davidson tracker (2026-08-28), achievement-door status. Reads aoife-reads'
// own public /api/state (no auth — same public-position pattern this app's
// /api/state uses) SERVER-SIDE, so the browser never talks cross-origin and
// no secret is needed. aoife-math has no equivalent store yet (its API only
// posts one-shot Telegram summaries — see AGENTS.md), so it's not queried
// here; the Davidson tab renders that composite as a static "not tracked
// yet" row instead.
const READS_STATE_URL = "https://aoife-reads.vercel.app/api/state";
const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET(req: Request) {
  if (!isParent(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const res = await fetch(READS_STATE_URL, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`reads state ${res.status}`);
    const data = (await res.json()) as { completed?: unknown[] };
    const sessionCount = Array.isArray(data.completed) ? data.completed.length : 0;
    return NextResponse.json({ readsStarted: sessionCount > 0, readsSessionCount: sessionCount }, { status: 200, headers: NO_STORE });
  } catch {
    // Unreachable/errored: say so rather than falsely reporting "not started".
    return NextResponse.json({ readsStarted: null, readsSessionCount: null }, { status: 200, headers: NO_STORE });
  }
}
