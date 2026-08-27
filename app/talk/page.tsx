"use client";

// Talk with Pip (owner decision #22, 2026-08-27): the separate with-a-grown-up
// tab. Pip ASKS an open-ended question out loud; Aoife answers WITH HER VOICE;
// the grown-up judges the answer's quality against the model strip and taps
// 2 / 1 / 0. HARD RULE: no speech recognition, ever — a misheard answer would
// fabricate a false weakness (decision #14). Items scored under 2 resurface
// first next sitting ("we will chat about that one again"). Results post to
// /api/talk and never touch computeProfile.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TALK_AREAS, pickTalkSession, type TalkItem, type TalkBest } from "@/lib/talk/items";
import type { TalkRecord, TalkResult } from "@/lib/talk/record";
import { ulid } from "@/lib/engine/storage";
import { speak, warmUpSpeech } from "@/lib/engine/speech";
import { KID_NAME } from "@/lib/engine/kid";
import { BigButton } from "@/components/BigButton";
import { Pip } from "@/components/Pip";

const BEST_KEY = "aoife-puzzles:talk-best";
const OUTBOX_KEY = "aoife-puzzles:talk-outbox";

function loadBest(): TalkBest {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) ?? "{}") as TalkBest; } catch { return {}; }
}
function saveBest(best: TalkBest) {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* storage full or blocked: session still posts */ }
}
async function postRecord(record: TalkRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/talk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean };
    return res.ok && body.ok === true;
  } catch { return false; }
}
async function flushTalkOutbox() {
  let queued: TalkRecord[] = [];
  try { queued = JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? "[]") as TalkRecord[]; } catch { queued = []; }
  if (!queued.length) return;
  const remaining: TalkRecord[] = [];
  for (const r of queued) if (!(await postRecord(r))) remaining.push(r);
  try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(remaining)); } catch { /* best effort */ }
}

// Warm lines for the grown-up's verdicts. A 0 must still feel like growth,
// never like being wrong (same rules as lib/engine/praise.ts: no dashes, no
// banned words).
const LINES_2 = [
  "That was a BIG idea answer!",
  "Wow, you said it like a professor fox.",
  "Pip is writing that answer down to remember it.",
  "That was the whole big idea, {name}!",
];
const LINES_1 = [
  "So close to the big idea! Pip loves it.",
  "Great thinking! There is an even bigger idea hiding in there.",
  "Halfway up the idea mountain already!",
  "Nice one. Next time we grab the whole idea!",
];
const LINES_0 = [
  "Great talking, {name}! That one grows bigger every time we chat.",
  "Pip loves hearing you think out loud.",
  "That is a tricky one. We will chat about it again soon!",
  "Thinking out loud is how brains grow. Keep going!",
];

type Phase = "intro" | "item" | "between" | "done";

export default function TalkPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [items, setItems] = useState<TalkItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [betweenLine, setBetweenLine] = useState("");
  const [betweenMood, setBetweenMood] = useState<"excited" | "happy" | "thinking">("happy");
  const results = useRef<TalkResult[]>([]);
  const startedAt = useRef("");
  const [bigIdeas, setBigIdeas] = useState(0);
  const lineCounter = useRef(0);

  useEffect(() => { void flushTalkOutbox(); }, []);

  const item = items[idx];

  // Pip speaks each question as it appears (and again on the replay tap).
  useEffect(() => {
    if (phase === "item" && item) void speak(item.prompt);
  }, [phase, item]);

  const begin = useCallback(() => {
    warmUpSpeech();
    setItems(pickTalkSession(loadBest()));
    results.current = [];
    startedAt.current = new Date().toISOString();
    setIdx(0);
    setBigIdeas(0);
    setPhase("item");
  }, []);

  const finish = useCallback(async () => {
    const record: TalkRecord = {
      id: ulid(), startedAt: startedAt.current, endedAt: new Date().toISOString(),
      results: results.current, complete: true,
    };
    const best = loadBest();
    for (const r of results.current) {
      const prev = best[r.itemId];
      if (prev === undefined || r.score > prev) best[r.itemId] = r.score;
    }
    saveBest(best);
    if (!(await postRecord(record))) {
      try {
        const queued = JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? "[]") as TalkRecord[];
        queued.push(record);
        localStorage.setItem(OUTBOX_KEY, JSON.stringify(queued));
      } catch { /* best effort */ }
    }
    setPhase("done");
  }, []);

  const judge = useCallback((score: 0 | 1 | 2) => {
    if (!item) return;
    results.current.push({ itemId: item.id, score });
    const pool = score === 2 ? LINES_2 : score === 1 ? LINES_1 : LINES_0;
    setBetweenLine(pool[lineCounter.current++ % pool.length].replace(/\{name\}/g, KID_NAME));
    setBetweenMood(score === 2 ? "excited" : score === 1 ? "happy" : "thinking");
    if (score === 2) setBigIdeas((n) => n + 1);
    setPhase("between");
  }, [item]);

  const advance = useCallback(() => {
    if (idx + 1 < items.length) { setIdx((i) => i + 1); setPhase("item"); }
    else void finish();
  }, [idx, items.length, finish]);

  if (phase === "intro") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-cream p-8 text-center">
        <h1 className="font-bubble text-4xl text-ink">Talk with Pip 🗣</h1>
        <Pip mood="excited" line={`This is a talking game, ${KID_NAME}! Pip asks, you answer out loud.`} />
        <p className="max-w-md text-lg text-ink/70">A game for {KID_NAME} AND a grown up. Pip asks a question, {KID_NAME} answers in her own words, and the grown up taps the stars.</p>
        <BigButton onClick={begin} tone="teal">Start talking</BigButton>
        <button className="text-sm text-ink/50 underline" onClick={() => router.push("/")}>Back home</button>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-cream p-8 text-center">
        <h1 className="font-bubble text-4xl text-ink">What a chat!</h1>
        <Pip mood="proud" line={bigIdeas > 0 ? `${bigIdeas} big idea answer${bigIdeas === 1 ? "" : "s"} today, ${KID_NAME}! Pip is amazed.` : `Pip loved every single answer, ${KID_NAME}.`} />
        <BigButton onClick={() => router.push("/")} tone="teal">Home</BigButton>
      </main>
    );
  }

  if (phase === "between") {
    // One advance trigger only: a tap on the button. (An onClick on <main>
    // too would receive the button's bubbled click and advance TWICE,
    // skipping an item — caught by e2e/doors.spec.ts on 2026-08-27.)
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-cream p-8 text-center">
        <Pip mood={betweenMood} line={betweenLine} />
        <BigButton onClick={advance} tone="teal">Next</BigButton>
      </main>
    );
  }

  if (!item) return <main className="flex flex-1 bg-cream" />;
  const area = TALK_AREAS[item.area];

  return (
    <main className="flex flex-1 flex-col bg-cream p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink/50">{area.emoji} {area.title}</span>
        <span className="text-sm text-ink/50">{idx + 1} of {items.length}</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <Pip mood="happy" line="Pip is listening with his big fox ears!" />
        <p className="max-w-xl font-bubble text-3xl text-ink" data-testid="talk-prompt">{item.prompt}</p>
        <button
          className="rounded-full bg-white px-5 py-2 text-lg shadow"
          onClick={() => void speak(item.prompt)}
          aria-label="Hear the question again"
        >
          🔊 Say it again
        </button>
      </div>

      {/* Grown-up corner: muted, factual, tap once when she has answered. */}
      <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Grown up corner · tap after she answers out loud</p>
        <div className="mt-2 grid gap-1 text-sm text-ink/70">
          <p><span className="font-semibold">⭐⭐ sounds like:</span> {item.model2}</p>
          <p><span className="font-semibold">⭐ sounds like:</span> {item.model1}</p>
        </div>
        <div className="mt-3 flex gap-3">
          <button className="flex-1 rounded-2xl bg-teal-100 px-3 py-3 text-lg shadow" data-testid="talk-score-2" onClick={() => judge(2)}>⭐⭐ Big idea</button>
          <button className="flex-1 rounded-2xl bg-amber-100 px-3 py-3 text-lg shadow" data-testid="talk-score-1" onClick={() => judge(1)}>⭐ Halfway</button>
          <button className="flex-1 rounded-2xl bg-sky-100 px-3 py-3 text-lg shadow" data-testid="talk-score-0" onClick={() => judge(0)}>🌱 Growing</button>
        </div>
      </div>
    </main>
  );
}
