import { NextResponse } from "next/server";
import { kvReady, kvSet, kvGet, kvExists, kvLpush, kvLrange } from "@/lib/engine/kv";
import { isParent } from "@/lib/engine/gate";
import type { TalkRecord } from "@/lib/talk/record";
import { TALK_ITEMS } from "@/lib/talk/items";

const ID = /^[0-9A-HJKMNP-TV-Z]{26}$/; // ulid
const ITEM_IDS = new Set(TALK_ITEMS.map((i) => i.id));

// POST is public like /api/sessions (her own device saves during the
// grown-up sitting); GET is parent-gated like /api/profile.
export async function POST(req: Request) {
  if (!kvReady()) return NextResponse.json({ error: "no-kv" }, { status: 200 });
  const raw = await req.text();
  if (raw.length > 50_000) return NextResponse.json({ error: "too-large" }, { status: 413 });
  const r = JSON.parse(raw) as TalkRecord;
  const valid =
    ID.test(r.id) &&
    Array.isArray(r.results) &&
    r.results.every((x) => ITEM_IDS.has(x.itemId) && [0, 1, 2].includes(x.score));
  if (!valid) return NextResponse.json({ error: "bad-record" }, { status: 400 });

  const existed = await kvExists(`talk:${r.id}`);
  await kvSet(`talk:${r.id}`, r);
  if (!existed) await kvLpush("talkIndex", r.id);
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  if (!isParent(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!kvReady()) return NextResponse.json({ error: "no-kv" }, { status: 200 });
  const ids = await kvLrange("talkIndex");
  const records = (await Promise.all(ids.map((id) => kvGet<TalkRecord>(`talk:${id}`)))).filter(Boolean);
  return NextResponse.json(records);
}
