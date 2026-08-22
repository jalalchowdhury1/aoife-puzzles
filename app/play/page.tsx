"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BlockRecord, ItemRecord, LevelConfig, PartConfig, SessionRecord } from "@/lib/engine/types";
import { summarize } from "@/lib/engine/types";
import { LEVELS } from "@/lib/levels";
import { GENRES } from "@/lib/genres";
import { VIEWS } from "@/components/genres";
import { startStair, stepStair, type StairState } from "@/lib/engine/staircase";
import { randomSeed } from "@/lib/engine/rng";
import {
  ulid,
  loadSessions,
  saveSessionLocal,
  enqueue,
  flushOutbox,
  syncState,
  currentPosition,
  profileStart,
} from "@/lib/engine/storage";
import { SampleScreen } from "@/components/SampleScreen";
import { Countdown } from "@/components/Countdown";
import { PartDone } from "@/components/PartDone";

type Phase = "loading" | "sample" | "item" | "between" | "done";

// How long the "between" transition shows for each feedback style. Only
// `none` is exercised by Level 1; `mark`/`reveal` exist for future levels.
const BETWEEN_MS: Record<LevelConfig["feedback"], number> = { none: 600, mark: 1200, reveal: 2500 };

function minutesBetween(startedAt: string, endedAt?: string): number {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt ?? new Date().toISOString()).getTime();
  return Math.max(0, Math.round((end - start) / 60_000));
}

function ProgressDots({ total, filled }: { total: number; filled: number }) {
  return (
    <div className="flex gap-2" aria-label={`Puzzle ${Math.min(filled + 1, total)} of about ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full ${i < filled ? "bg-teal-400" : "bg-teal-100"}`}
        />
      ))}
    </div>
  );
}

function BetweenScreen({ feedback, lastCorrect }: { feedback: LevelConfig["feedback"]; lastCorrect: boolean | null }) {
  if (feedback === "mark") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-8xl" aria-hidden>
          {lastCorrect ? "✅" : "❌"}
        </span>
      </div>
    );
  }
  if (feedback === "reveal") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <span className="text-7xl" aria-hidden>
          {lastCorrect ? "✅" : "❌"}
        </span>
        <p className="font-bubble text-2xl text-ink">{lastCorrect ? "Nice work!" : "Good try!"}</p>
      </div>
    );
  }
  // feedback === "none": neutral transition, no ticks/crosses/answers.
  return (
    <div className="flex flex-1 items-center justify-center">
      <span className="font-bubble text-4xl text-ink">Next!</span>
    </div>
  );
}

function PlayRunner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initRef = useRef(false);
  const respondedRef = useRef(false);
  const blockEndedRef = useRef(false);
  const usedBankIdsRef = useRef<string[]>([]);

  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const [levelCfg, setLevelCfg] = useState<LevelConfig | null>(null);
  const [partCfg, setPartCfg] = useState<PartConfig | null>(null);
  const [blockIndex, setBlockIndex] = useState(0);
  const [session, setSession] = useState<SessionRecord | null>(null);

  const [stair, setStair] = useState<StairState | null>(null);
  const [seed, setSeed] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [item, setItem] = useState<any>(null);
  const [itemIdx, setItemIdx] = useState(0);
  // `startedAtMs` (performance.now()) is used to compute each item's elapsed
  // `ms` for its ItemRecord. `startedAtEpoch` (Date.now()) is the *separate*
  // timestamp base Countdown compares itself against internally (it does
  // `Date.now() - startedAt`), so it must never be fed a performance.now()
  // value (that reads as an already-huge elapsed time and fires instantly).
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [startedAtEpoch, setStartedAtEpoch] = useState<number | null>(null);
  const [blockStartMs, setBlockStartMs] = useState<number | null>(null);
  const [blockStartedAtIso, setBlockStartedAtIso] = useState<string | null>(null);
  const [records, setRecords] = useState<ItemRecord[]>([]);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  // Stable across every render so views whose mount effect lists `onReady`
  // as a dependency (ChoiceView, ArithmeticView, PictureSpanView) never
  // re-fire it just because the parent re-rendered.
  const handleReady = useCallback(() => {
    setStartedAtMs(performance.now());
    setStartedAtEpoch(Date.now());
  }, []);

  // ---- Resolve where to start: URL params, else currentPosition; ?replay=1
  // starts a fresh session even if the part is already complete. ----
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // This effect reads browser-only state (localStorage sessions, the URL,
    // navigator/window) that isn't available during SSR and can't be derived
    // during render. Guarded by initRef so it runs exactly once; the several
    // setState calls below are one coherent initialization, not a per-render
    // synchronization, so the lint rule's general "avoid setState in effects"
    // guidance doesn't apply here.
    /* eslint-disable react-hooks/set-state-in-effect */
    void flushOutbox();

    const sessions = loadSessions();
    const replay = searchParams.get("replay") === "1";
    const levelParam = searchParams.get("level");
    const partParam = searchParams.get("part");

    let level: number;
    let part: string;
    if (levelParam !== null && partParam !== null) {
      level = Number(levelParam);
      part = partParam;
    } else {
      const pos = currentPosition(LEVELS, sessions);
      level = pos.level;
      part = pos.part;
    }

    const levelCfgFound = LEVELS.find((l) => l.id === level);
    const partCfgFound = levelCfgFound?.parts.find((p) => p.id === part);
    if (!levelCfgFound || !partCfgFound) {
      router.replace("/");
      return;
    }

    const partSessions = sessions.filter((s) => s.level === level && s.part === part);
    const hasComplete = partSessions.some((s) => s.complete);
    if (hasComplete && !replay) {
      router.replace("/");
      return;
    }

    const device = { ua: navigator.userAgent, w: window.innerWidth, h: window.innerHeight };
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

    let activeSession: SessionRecord;
    let startBlockIndex: number;

    if (replay) {
      activeSession = { id: ulid(), level, part, startedAt: new Date().toISOString(), device, blocks: [], complete: false, appVersion };
      startBlockIndex = 0;
    } else {
      const incomplete = partSessions.filter((s) => !s.complete);
      const latest = incomplete.length ? incomplete.reduce((a, b) => (a.startedAt > b.startedAt ? a : b)) : null;
      if (latest) {
        activeSession = latest;
        startBlockIndex = latest.blocks.length;
      } else {
        activeSession = { id: ulid(), level, part, startedAt: new Date().toISOString(), device, blocks: [], complete: false, appVersion };
        startBlockIndex = 0;
      }
    }

    setLevelCfg(levelCfgFound);
    setPartCfg(partCfgFound);
    setSession(activeSession);
    setBlockIndex(startBlockIndex);

    if (startBlockIndex >= partCfgFound.blocks.length) {
      // Defensive: every block already recorded but the session was never
      // flagged complete (shouldn't normally happen). Finish it now.
      const endedAtIso = activeSession.endedAt ?? new Date().toISOString();
      const doneSession: SessionRecord = { ...activeSession, complete: true, endedAt: endedAtIso };
      saveSessionLocal(doneSession);
      enqueue(doneSession);
      void flushOutbox();
      setSession(doneSession);
      setPhase("done");
    } else {
      setPhase("sample");
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function beginBlockItems() {
    if (!partCfg) return;
    const cfg = partCfg.blocks[blockIndex];
    const genre = GENRES[cfg.genre];

    usedBankIdsRef.current = [];
    respondedRef.current = false;
    blockEndedRef.current = false;
    setRecords([]);
    setLastCorrect(null);
    setBlockStartedAtIso(new Date().toISOString());

    const newSeed = randomSeed();
    setSeed(newSeed);

    if (genre.mode === "staircase") {
      const startCfg =
        cfg.start === "fromProfile" ? { fromProfileCeiling: profileStart(cfg.genre, loadSessions()) } : cfg.start ?? 1;
      const st = startStair(startCfg, cfg.maxItems ?? 8);
      setStair(st);
      setItem(genre.generate(newSeed, st.d, { excludeBankIds: [] }));
      setBlockStartMs(null);
    } else {
      setStair(null);
      setItem(genre.generate(newSeed, 1));
      setBlockStartMs(Date.now());
    }
    setStartedAtMs(null);
    setStartedAtEpoch(null);
    setItemIdx((i) => i + 1);
    setPhase("item");
  }

  function generateNextItem(d: number) {
    if (!partCfg) return;
    const cfg = partCfg.blocks[blockIndex];
    const genre = GENRES[cfg.genre];
    const newSeed = randomSeed();
    respondedRef.current = false;
    setSeed(newSeed);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItem(genre.generate(newSeed, d as any, { excludeBankIds: usedBankIdsRef.current }));
    setStartedAtMs(null);
    setStartedAtEpoch(null);
    setItemIdx((i) => i + 1);
    setPhase("item");
  }

  function endBlock(finalRecords: ItemRecord[]) {
    if (blockEndedRef.current || !partCfg || !session) return;
    blockEndedRef.current = true;

    const cfg = partCfg.blocks[blockIndex];
    const genre = GENRES[cfg.genre];
    const endedAtIso = new Date().toISOString();
    const blockRecord: BlockRecord = {
      genre: cfg.genre,
      mode: genre.mode,
      startedAt: blockStartedAtIso ?? endedAtIso,
      endedAt: endedAtIso,
      items: finalRecords,
      summary: summarize(finalRecords, genre.mode),
    };

    const isLastBlock = blockIndex + 1 >= partCfg.blocks.length;
    const updated: SessionRecord = {
      ...session,
      blocks: [...session.blocks, blockRecord],
      ...(isLastBlock ? { complete: true, endedAt: endedAtIso } : {}),
    };

    setSession(updated);
    saveSessionLocal(updated);
    enqueue(updated);
    void flushOutbox();

    if (isLastBlock) {
      setPhase("done");
    } else {
      setBlockIndex((b) => b + 1);
      setPhase("sample");
    }
  }

  function finishItem(response: unknown, timedOut: boolean, meta?: { replayed?: boolean; audioFallback?: boolean }) {
    if (respondedRef.current || blockEndedRef.current || !partCfg || !levelCfg) return;
    respondedRef.current = true;

    const cfg = partCfg.blocks[blockIndex];
    const genre = GENRES[cfg.genre];
    const ms = startedAtMs !== null ? performance.now() - startedAtMs : 0;
    const finalScore = genre.score(item, timedOut ? null : response);

    let fast: boolean | undefined;
    if (genre.timing.kind === "item") {
      const cap = genre.timing.ms(stair!.d);
      fast = ms < cap * 0.5;
    }
    const bankId: string | undefined = genre.bankId?.(item);

    const record: ItemRecord = {
      idx: records.length,
      seed,
      d: stair ? stair.d : 1,
      points: finalScore.points,
      max: finalScore.max,
      correct: finalScore.correct,
      ms,
      timedOut,
      response: timedOut ? null : response ?? null,
    };
    if (bankId !== undefined) record.bankId = bankId;
    if (fast !== undefined) record.fast = fast;
    if (meta?.replayed !== undefined) record.replayed = meta.replayed;
    if (meta?.audioFallback !== undefined) record.audioFallback = meta.audioFallback;

    const newRecords = [...records, record];
    setRecords(newRecords);
    if (bankId) usedBankIdsRef.current = [...usedBankIdsRef.current, bankId];

    if (genre.mode === "speedBlock") {
      generateNextItem(1);
      return;
    }

    const newStair = stepStair(stair!, finalScore.correct);
    setStair(newStair);
    setLastCorrect(finalScore.correct);
    setPhase("between");

    const delay = BETWEEN_MS[levelCfg.feedback];
    window.setTimeout(() => {
      if (newStair.done) endBlock(newRecords);
      else generateNextItem(newStair.d);
    }, delay);
  }

  // Not memoized: none of the views read `onRespond` inside an effect
  // dependency array (only `onReady` needs a stable identity, see above), so
  // a plain closure recreated every render is simplest and always current.
  function handleRespond(r: unknown, meta?: { replayed?: boolean; audioFallback?: boolean }) {
    finishItem(r, false, meta);
  }

  if (!ready || phase === "loading" || !levelCfg || !partCfg) {
    return <div className="flex flex-1 bg-cream" />;
  }

  if (phase === "done") {
    const minutes = session ? minutesBetween(session.startedAt, session.endedAt) : 0;
    return (
      <PartDone part={partCfg} minutes={minutes} synced={syncState() === "synced"} onHome={() => router.push("/")} />
    );
  }

  const cfg = partCfg.blocks[blockIndex];
  const genre = GENRES[cfg.genre];
  const View = VIEWS[cfg.genre];

  if (phase === "sample") {
    return <SampleScreen genre={genre} View={View} onStart={beginBlockItems} />;
  }

  return (
    <div className="flex flex-1 flex-col bg-cream">
      <div className="flex items-center justify-between gap-4 px-4 pt-4">
        <span className="font-bubble text-lg text-ink/70">{partCfg.title}</span>
        {genre.mode === "staircase" && <ProgressDots total={cfg.maxItems ?? 8} filled={records.length} />}
        <span aria-hidden className="w-0" />
      </div>

      {genre.timing.kind === "block" && (
        <div className="px-4 pt-2">
          <Countdown totalMs={genre.timing.ms} startedAt={blockStartMs} onExpire={() => endBlock(records)} />
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center">
        {phase === "item" ? (
          <>
            {genre.timing.kind === "item" && (
              <div className="w-full max-w-md px-4 pb-2">
                <Countdown
                  totalMs={genre.timing.ms(stair!.d)}
                  startedAt={startedAtEpoch}
                  onExpire={() => finishItem(null, true)}
                />
              </div>
            )}
            <View
              key={`${blockIndex}-${itemIdx}`}
              item={item}
              disabled={false}
              display={cfg.display}
              onReady={handleReady}
              onRespond={handleRespond}
            />
          </>
        ) : (
          <BetweenScreen feedback={levelCfg.feedback} lastCorrect={lastCorrect} />
        )}
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 bg-cream" />}>
      <PlayRunner />
    </Suspense>
  );
}
