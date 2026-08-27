"use client";

// Practice tab (owner decision #23, 2026-08-27): replay the actual items she
// previously missed — Pip frames it as a rematch with tricky puzzles, never
// as fixing failures. Untimed on purpose (no clock pressure; the point is
// learning, not measurement) and saved as SessionRecord{level: 0, part: "P",
// practice: true}, which computeProfile drops entirely — practice can never
// inflate her ability data (see lib/engine/practice.ts / profile.ts).
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GENRES } from "@/lib/genres";
import { VIEWS } from "@/components/genres";
import type { PracticeRef } from "@/lib/engine/practice";
import { practiceQueue } from "@/lib/engine/practice";
import type { ItemRecord, SessionRecord, BlockRecord, GenreId } from "@/lib/engine/types";
import { summarize } from "@/lib/engine/types";
import { loadSessions, saveSessionLocal, enqueue, flushOutbox, ulid, fetchServerState, mergeSessions } from "@/lib/engine/storage";
import { makeRng } from "@/lib/engine/rng";
import { pickPraise } from "@/lib/engine/praise";
import { KID_NAME } from "@/lib/engine/kid";
import { warmUpSpeech } from "@/lib/engine/speech";
import { BigButton } from "@/components/BigButton";
import { PraiseScreen } from "@/components/PraiseScreen";
import { Pip } from "@/components/Pip";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

type Phase = "loading" | "empty" | "intro" | "item" | "praise" | "reveal" | "done";

async function loadQueue(): Promise<PracticeRef[]> {
  try {
    const res = await fetch("/api/practice", { cache: "no-store" });
    if (res.ok) {
      const body = (await res.json()) as { ok?: boolean; pending?: PracticeRef[] };
      if (body.ok && Array.isArray(body.pending)) return body.pending;
    }
  } catch {
    // fall through to local
  }
  // Offline / KV-down fallback: compute from the local mirror (plus any
  // server-known completions we merged earlier this visit).
  const state = await fetchServerState();
  const sessions = state ? mergeSessions(loadSessions(), state.completed) : loadSessions();
  return practiceQueue(sessions);
}

export default function PracticePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [queue, setQueue] = useState<PracticeRef[]>([]);
  const [idx, setIdx] = useState(0);
  const [praiseLine, setPraiseLine] = useState("");
  const [lastResponse, setLastResponse] = useState<unknown>(null);
  const [missLine, setMissLine] = useState("");
  const [wins, setWins] = useState(0);
  const records = useRef<Map<GenreId, ItemRecord[]>>(new Map());
  const itemStart = useRef(0);
  // Lazily seeded on first use (React Compiler forbids impure calls in render).
  const rngRef = useRef<ReturnType<typeof makeRng> | null>(null);
  const rng = () => (rngRef.current ??= makeRng(Date.now() % 2147483647));
  const usedPraise = useRef(new Set<string>());
  const usedMiss = useRef(new Set<string>());
  const saved = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void flushOutbox().then(loadQueue).then((q) => {
      if (cancelled) return;
      setQueue(q);
      setPhase(q.length ? "intro" : "empty");
    });
    return () => { cancelled = true; };
  }, []);

  const ref = queue[idx];
  const genre = ref ? GENRES[ref.genre] : null;
  const item = ref && genre ? genre.generate(ref.seed, ref.d) : null;

  const handleReady = useCallback(() => { itemStart.current = Date.now(); }, []);

  const advance = useCallback(() => {
    if (idx + 1 < queue.length) {
      setLastResponse(null);
      setIdx((i) => i + 1);
      setPhase("item");
    } else {
      setPhase("done");
    }
  }, [idx, queue.length]);

  const saveSession = useCallback(() => {
    if (saved.current || records.current.size === 0) return;
    saved.current = true;
    const now = new Date().toISOString();
    const blocks: BlockRecord[] = [...records.current.entries()].map(([g, items]) => ({
      genre: g, mode: "staircase" as const, startedAt: now, endedAt: now,
      items, summary: summarize(items, "staircase"),
    }));
    const session: SessionRecord = {
      id: ulid(), level: 0, part: "P", startedAt: now, endedAt: now,
      device: { ua: navigator.userAgent, w: window.innerWidth, h: window.innerHeight },
      blocks, complete: true, appVersion: APP_VERSION, practice: true,
    };
    saveSessionLocal(session);
    enqueue(session);
    void flushOutbox();
  }, []);

  useEffect(() => {
    if (phase === "done") saveSession();
  }, [phase, saveSession]);

  const handleRespond = useCallback((r: unknown) => {
    if (!ref || !genre || !item) return;
    const result = genre.score(item, r);
    const rec: ItemRecord = {
      idx: (records.current.get(ref.genre)?.length ?? 0),
      seed: ref.seed, d: ref.d, points: result.points, max: result.max,
      correct: result.correct, ms: Date.now() - itemStart.current,
      timedOut: false, response: r,
    };
    const list = records.current.get(ref.genre) ?? [];
    list.push(rec);
    records.current.set(ref.genre, list);
    setLastResponse(r);
    if (result.correct) {
      setWins((w) => w + 1);
      setPraiseLine(pickPraise({ kind: "correct", name: KID_NAME, hard: ref.d >= 7 }, rng(), usedPraise.current));
      setPhase("praise");
    } else {
      setMissLine(pickPraise({ kind: "miss", name: KID_NAME }, rng(), usedMiss.current));
      setPhase("reveal");
    }
  }, [ref, genre, item]);

  if (phase === "loading") return <main className="flex flex-1 bg-cream" />;

  if (phase === "empty") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-cream p-8 text-center">
        <Pip mood="happy" line="No rematches waiting! Every tricky puzzle is beaten." />
        <p className="max-w-md text-xl text-ink">Play some levels and new challenges will show up here.</p>
        <BigButton onClick={() => router.push("/")} tone="teal">Home</BigButton>
      </main>
    );
  }

  if (phase === "intro") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-cream p-8 text-center">
        <h1 className="font-bubble text-4xl text-ink">Rematch Time!</h1>
        <Pip mood="excited" line={`Some sneaky puzzles tricked us before, ${KID_NAME}. Today we win them back!`} />
        <p className="text-lg text-ink/70">{queue.length} puzzle{queue.length === 1 ? "" : "s"} ready for a rematch. No clocks today!</p>
        <BigButton onClick={() => { warmUpSpeech(); setPhase("item"); }} tone="teal">Start</BigButton>
        <button className="text-sm text-ink/50 underline" onClick={() => router.push("/")}>Back home</button>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-cream p-8 text-center">
        <h1 className="font-bubble text-4xl text-ink">Rematch done!</h1>
        <Pip mood="proud" line={wins > 0 ? `You won ${wins} rematch${wins === 1 ? "" : "es"} today, ${KID_NAME}!` : "Those puzzles are still sneaky. We will get them next time!"} />
        <BigButton onClick={() => router.push("/")} tone="teal">Home</BigButton>
      </main>
    );
  }

  if (!ref || !genre || !item) return <main className="flex flex-1 bg-cream" />;
  const View = VIEWS[ref.genre];

  if (phase === "praise") {
    // Single advance trigger (the timer). A tap handler here too would race
    // the timer and double-advance, skipping an item — same bubbled-click
    // class of bug e2e caught on the Talk page's between screen.
    return (
      <main className="flex flex-1 flex-col bg-cream p-4">
        <PraiseScreen mood="excited" line={praiseLine} celebrate={false} />
        <AutoAdvance ms={1800} onDone={advance} />
      </main>
    );
  }

  if (phase === "reveal") {
    return (
      <main className="flex flex-1 flex-col items-center gap-4 bg-cream p-4">
        <Pip mood="thinking" line={missLine} />
        <div className="w-full flex-1">
          <View item={item} disabled reveal lastResponse={lastResponse} onReady={() => {}} onRespond={() => {}} />
        </div>
        <BigButton onClick={advance} tone="teal">Got it!</BigButton>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-cream p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink/50">Rematch {idx + 1} of {queue.length}</span>
        <span className="text-sm text-ink/50">{genre.kidTitle}</span>
      </div>
      <div className="flex-1" key={`${ref.genre}:${ref.seed}:${ref.d}`}>
        <View item={item} disabled={false} onReady={handleReady} onRespond={handleRespond} />
      </div>
    </main>
  );
}

/** Auto-advances a praise screen after `ms` (tap advances sooner via the parent onClick). */
function AutoAdvance({ ms, onDone }: { ms: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, ms);
    return () => clearTimeout(t);
  }, [ms, onDone]);
  return null;
}
